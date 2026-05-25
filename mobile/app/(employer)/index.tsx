import { useCallback, useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { CandidateProfile, Match } from '@/lib/types';
import { SwipeCard } from '@/components/SwipeCard';
import { MatchModal } from '@/components/MatchModal';

export default function EmployerSwipeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMatch, setNewMatch] = useState<Match | null>(null);

  useEffect(() => {
    if (!user) return;
    loadCandidates();
  }, [user]);

  async function loadCandidates() {
    const { data: swiped } = await supabase
      .from('swipes').select('target_id').eq('swiper_id', user!.id).eq('target_type', 'candidate');
    const ids = (swiped ?? []).map(s => s.target_id);

    let query = supabase.from('candidate_profiles').select('*').neq('id', user!.id).order('updated_at', { ascending: false });
    if (ids.length > 0) query = query.not('id', 'in', `(${ids.join(',')})`);

    const { data } = await query;
    setCandidates(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel('employer-match')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'matches', filter: `employer_id=eq.${user.id}` },
        async payload => {
          const { data } = await supabase.from('matches')
            .select('*, candidate_profiles(full_name), job_postings(title)')
            .eq('id', payload.new.id).single();
          if (data) setNewMatch(data as Match);
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleSwipe = useCallback(async (dir: 'left' | 'right', candidate: CandidateProfile) => {
    setCandidates(prev => prev.filter(c => c.id !== candidate.id));
    await supabase.from('swipes').insert({ swiper_id: user!.id, target_id: candidate.id, target_type: 'candidate', direction: dir });
  }, [user]);

  if (loading) return <View style={styles.center}><ActivityIndicator color="#f97316" size="large" /></View>;

  if (candidates.length === 0) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={{ fontSize: 40, marginBottom: 12 }}>👥</Text>
        <Text style={styles.emptyTitle}>No new candidates</Text>
        <Text style={styles.emptyText}>More will appear as candidates sign up.</Text>
      </SafeAreaView>
    );
  }

  const visible = candidates.slice(0, 3);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>CRUIT</Text>
        <Text style={styles.count}>{candidates.length} candidates</Text>
      </View>

      <View style={styles.stack}>
        {[...visible].reverse().map((c, revIdx) => {
          const stackIndex = visible.length - 1 - revIdx;
          return (
            <SwipeCard key={c.id} stackIndex={stackIndex} onSwipe={dir => handleSwipe(dir, c)}>
              <CandidateCard candidate={c} />
            </SwipeCard>
          );
        })}
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.nopeBtn} onPress={() => handleSwipe('left', candidates[0])}>
          <Text style={styles.nopeTxt}>✗</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.likeBtn} onPress={() => handleSwipe('right', candidates[0])}>
          <Text style={styles.likeTxt}>♥</Text>
        </TouchableOpacity>
      </View>

      <MatchModal
        visible={!!newMatch}
        employerName="You"
        candidateName={newMatch?.candidate_profiles?.full_name ?? 'Candidate'}
        jobTitle={newMatch?.job_postings?.title ?? 'Position'}
        onKeepSwiping={() => setNewMatch(null)}
        onMessage={() => { setNewMatch(null); router.push('/(employer)/matches'); }}
      />
    </SafeAreaView>
  );
}

function CandidateCard({ candidate }: { candidate: CandidateProfile }) {
  const initials = candidate.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <View style={cardStyles.card}>
      <View style={cardStyles.header}>
        <View style={cardStyles.avatar}><Text style={cardStyles.avatarTxt}>{initials}</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={cardStyles.name}>{candidate.full_name}</Text>
          <Text style={cardStyles.role}>{candidate.title ?? 'Job Seeker'}</Text>
        </View>
      </View>
      <View style={cardStyles.body}>
        <View style={cardStyles.row}>
          <View style={cardStyles.chip}><Text style={cardStyles.chipTxt}>💼 {candidate.experience_years} yrs exp</Text></View>
          <View style={cardStyles.chip}><Text style={cardStyles.chipTxt}>📍 {candidate.location ?? 'Flexible'}</Text></View>
        </View>
        {candidate.skills.length > 0 && (
          <View style={{ marginTop: 8 }}>
            <Text style={cardStyles.label}>Skills</Text>
            <View style={cardStyles.tags}>
              {candidate.skills.map(s => <Text key={s} style={cardStyles.tag}>{s}</Text>)}
            </View>
          </View>
        )}
        {candidate.bio && <Text style={cardStyles.bio} numberOfLines={3}>{candidate.bio}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b' },
  center: { flex: 1, backgroundColor: '#09090b', justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  logo: { color: '#f97316', fontSize: 24, fontWeight: '900' },
  count: { color: '#64748b', fontSize: 12 },
  stack: { flex: 1, marginHorizontal: 16, position: 'relative' },
  buttons: { flexDirection: 'row', justifyContent: 'center', gap: 40, paddingVertical: 20 },
  nopeBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', justifyContent: 'center', alignItems: 'center' },
  nopeTxt: { fontSize: 26, color: '#f87171' },
  likeBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#f97316', justifyContent: 'center', alignItems: 'center' },
  likeTxt: { fontSize: 26, color: '#fff' },
  emptyTitle: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 8 },
  emptyText: { color: '#64748b', textAlign: 'center' },
});

const cardStyles = StyleSheet.create({
  card: { flex: 1, backgroundColor: '#1e293b', borderRadius: 24, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#4f46e5', padding: 20 },
  avatar: { width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  avatarTxt: { color: '#fff', fontSize: 20, fontWeight: '900' },
  name: { color: '#fff', fontSize: 20, fontWeight: '900' },
  role: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  body: { padding: 16, gap: 8 },
  row: { flexDirection: 'row', gap: 10 },
  chip: { flex: 1, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: 12 },
  chipTxt: { color: '#fff', fontWeight: '600', fontSize: 13 },
  label: { color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: '#334155', color: '#e2e8f0', fontSize: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  bio: { color: '#94a3b8', fontSize: 13, lineHeight: 18, marginTop: 4 },
});
