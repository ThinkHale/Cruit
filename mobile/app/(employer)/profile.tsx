import { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, Alert,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { EmployerProfile } from '@/lib/types';

export default function EmployerProfileScreen() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Partial<EmployerProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from('employer_profiles').select('*').eq('id', user.id).single().then(({ data }) => {
      if (data) setProfile(data);
      setLoading(false);
    });
  }, [user]);

  async function save() {
    if (!user || !profile.company_name?.trim()) { Alert.alert('Company name required'); return; }
    setSaving(true);
    await supabase.from('employer_profiles').upsert({ id: user.id, ...profile, updated_at: new Date().toISOString() });
    setSaving(false);
    Alert.alert('Saved!');
  }

  if (loading) return <View style={styles.container} />;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Text style={styles.title}>Company Profile</Text>
          <TouchableOpacity onPress={() => supabase.auth.signOut()}>
            <Text style={{ color: '#64748b' }}>Sign out</Text>
          </TouchableOpacity>
        </View>

        {[
          { label: 'Company name *', key: 'company_name', placeholder: 'Acme Corp' },
          { label: 'Industry', key: 'industry', placeholder: 'Manufacturing' },
          { label: 'Company size', key: 'company_size', placeholder: '50-200 employees' },
          { label: 'Location', key: 'location', placeholder: 'St. Louis, MO' },
          { label: 'Website', key: 'website', placeholder: 'https://acme.com' },
        ].map(f => (
          <View key={f.key} style={{ marginBottom: 14 }}>
            <Text style={styles.label}>{f.label}</Text>
            <TextInput
              style={styles.input}
              value={(profile as Record<string, string>)[f.key] ?? ''}
              onChangeText={v => setProfile(p => ({ ...p, [f.key]: v }))}
              placeholder={f.placeholder}
              placeholderTextColor="#64748b"
            />
          </View>
        ))}

        <View style={{ marginBottom: 14 }}>
          <Text style={styles.label}>About</Text>
          <TextInput
            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
            value={profile.description ?? ''}
            onChangeText={v => setProfile(p => ({ ...p, description: v }))}
            placeholder="What does your company do?"
            placeholderTextColor="#64748b"
            multiline
          />
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text style={styles.label}>Plan</Text>
          <View style={styles.planRow}>
            {(['per_post', 'unlimited'] as const).map(plan => (
              <TouchableOpacity key={plan} style={[styles.planBtn, profile.plan === plan && styles.planBtnActive]} onPress={() => setProfile(p => ({ ...p, plan }))}>
                <Text style={[styles.planTxt, profile.plan === plan && { color: '#fff' }]}>
                  {plan === 'per_post' ? '$20/Post' : '$175/Month'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={save} disabled={saving}>
          <Text style={styles.saveBtnTxt}>{saving ? 'Saving…' : 'Save Profile'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  title: { color: '#fff', fontSize: 22, fontWeight: '900' },
  label: { color: '#94a3b8', fontSize: 13, marginBottom: 6 },
  input: { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, color: '#fff', fontSize: 15 },
  planRow: { flexDirection: 'row', gap: 10 },
  planBtn: { flex: 1, backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  planBtnActive: { backgroundColor: '#f97316', borderColor: '#f97316' },
  planTxt: { color: '#64748b', fontWeight: '700' },
  saveBtn: { backgroundColor: '#f97316', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  saveBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
