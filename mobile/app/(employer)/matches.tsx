import { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, TextInput,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Match, Message } from '@/lib/types';

export default function EmployerMatchesScreen() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [selected, setSelected] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (!user) return;
    supabase.from('matches')
      .select('*, candidate_profiles(full_name, title), job_postings(title)')
      .eq('employer_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => setMatches((data ?? []) as Match[]));
  }, [user]);

  useEffect(() => {
    if (!selected) return;
    supabase.from('messages').select('*').eq('match_id', selected.id).order('created_at').then(({ data }) => setMessages(data ?? []));
    const ch = supabase.channel(`mob-emp-${selected.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `match_id=eq.${selected.id}` },
        p => setMessages(prev => [...prev, p.new as Message]))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [selected]);

  async function send() {
    if (!input.trim() || !selected || !user) return;
    const content = input.trim();
    setInput('');
    await supabase.from('messages').insert({ match_id: selected.id, sender_id: user.id, content });
  }

  if (selected) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelected(null)}><Text style={{ color: '#f97316', fontSize: 16 }}>← Back</Text></TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.title} numberOfLines={1}>{selected.candidate_profiles?.full_name}</Text>
            <Text style={{ color: '#64748b', fontSize: 12 }}>{selected.job_postings?.title}</Text>
          </View>
        </View>
        <FlatList
          data={messages}
          keyExtractor={m => m.id}
          contentContainerStyle={{ padding: 16, gap: 8 }}
          renderItem={({ item }) => (
            <View style={{ alignItems: item.sender_id === user?.id ? 'flex-end' : 'flex-start' }}>
              <Text style={[styles.bubble, item.sender_id === user?.id ? styles.bubbleMine : styles.bubbleTheirs]}>
                {item.content}
              </Text>
            </View>
          )}
        />
        <View style={styles.inputRow}>
          <TextInput style={styles.msgInput} value={input} onChangeText={setInput} placeholder="Message…" placeholderTextColor="#64748b" onSubmitEditing={send} returnKeyType="send" />
          <TouchableOpacity style={styles.sendBtn} onPress={send}><Text style={{ color: '#fff', fontWeight: '700' }}>Send</Text></TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={[styles.title, { padding: 20, paddingBottom: 8 }]}>Matches</Text>
      <FlatList
        data={matches}
        keyExtractor={m => m.id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        ListEmptyComponent={<Text style={styles.empty}>No matches yet. Keep swiping!</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => setSelected(item)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.candidateName}>{item.candidate_profiles?.full_name}</Text>
              <Text style={styles.jobName}>{item.job_postings?.title}</Text>
            </View>
            <Text style={{ color: '#f97316' }}>→</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 8 },
  title: { color: '#fff', fontSize: 22, fontWeight: '900' },
  card: { backgroundColor: '#1e293b', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center' },
  candidateName: { color: '#fff', fontWeight: '700', fontSize: 16 },
  jobName: { color: '#64748b', fontSize: 13, marginTop: 2 },
  empty: { color: '#64748b', textAlign: 'center', marginTop: 48 },
  bubble: { maxWidth: '75%', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, fontSize: 14 },
  bubbleMine: { backgroundColor: '#f97316', color: '#fff' },
  bubbleTheirs: { backgroundColor: '#1e293b', color: '#fff' },
  inputRow: { flexDirection: 'row', gap: 10, padding: 12, borderTopWidth: 1, borderTopColor: '#1e293b' },
  msgInput: { flex: 1, backgroundColor: '#1e293b', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, color: '#fff' },
  sendBtn: { backgroundColor: '#f97316', paddingHorizontal: 16, borderRadius: 20, justifyContent: 'center' },
});
