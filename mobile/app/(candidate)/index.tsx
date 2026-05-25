import { useCallback, useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { JobPosting, Match } from '@/lib/types';
import { SwipeCard } from '@/components/SwipeCard';
import { MatchModal } from '@/components/MatchModal';

const { width: W, height: H } = Dimensions.get('window');

export default function CandidateSwipeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMatch, setNewMatch] = useState<Match | null>(null);

  useEffect(() => {
    if (!user) return;
    loadJobs();
  }, [user]);

  async function loadJobs() {
    const { data: swiped } = await supabase
      .from('swipes').select('target_id').eq('swiper_id', user!.id).eq('target_type', 'job');
    const ids = (swiped ?? []).map(s => s.target_id);

    let query = supabase
      .from('job_postings')
      .select('*, employer_profiles(company_name, industry, company_size)')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (ids.length > 0) query = query.not('id', 'in', `(${ids.join(',')})`);

    const { data } = await query;
    setJobs(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel('candidate-match')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'matches', filter: `candidate_id=eq.${user.id}` },
        async payload => {
          const { data } = await supabase.from('matches')
            .select('*, employer_profiles(company_name), job_postings(title)')
            .eq('id', payload.new.id).single();
          if (data) setNewMatch(data as Match);
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleSwipe = useCallback(async (dir: 'left' | 'right', job: JobPosting) => {
    setJobs(prev => prev.filter(j => j.id !== job.id));
    await supabase.from('swipes').insert({ swiper_id: user!.id, target_id: job.id, target_type: 'job', direction: dir });
  }, [user]);

  if (loading) return <View style={styles.center}><ActivityIndicator color="#f97316" size="large" /></View>;

  if (jobs.length === 0) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={{ fontSize: 40, marginBottom: 12 }}>✓</Text>
        <Text style={styles.emptyTitle}>All caught up!</Text>
        <Text style={styles.emptyText}>Check back later for new job postings.</Text>
      </SafeAreaView>
    );
  }

  const visible = jobs.slice(0, 3);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>CRUIT</Text>
        <Text style={styles.count}>{jobs.length} jobs</Text>
      </View>

      <View style={styles.stack}>
        {[...visible].reverse().map((job, revIdx) => {
          const stackIndex = visible.length - 1 - revIdx;
          return (
            <SwipeCard key={job.id} stackIndex={stackIndex} onSwipe={dir => handleSwipe(dir, job)}>
              <JobCard job={job} />
            </SwipeCard>
          );
        })}
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.nopeBtn} onPress={() => handleSwipe('left', jobs[0])}>
          <Text style={styles.nopeTxt}>✗</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.likeBtn} onPress={() => handleSwipe('right', jobs[0])}>
          <Text style={styles.likeTxt}>♥</Text>
        </TouchableOpacity>
      </View>

      <MatchModal
        visible={!!newMatch}
        employerName={newMatch?.employer_profiles?.company_name ?? 'Employer'}
        candidateName="You"
        jobTitle={newMatch?.job_postings?.title ?? 'Position'}
        onKeepSwiping={() => setNewMatch(null)}
        onMessage={() => { setNewMatch(null); router.push('/(candidate)/matches'); }}
      />
    </SafeAreaView>
  );
}

function JobCard({ job }: { job: JobPosting }) {
  const emp = job.employer_profiles;
  const initials = emp?.company_name?.slice(0, 2).toUpperCase() ?? '??';
  return (
    <View style={cardStyles.card}>
      <View style={cardStyles.header}>
        <View style={cardStyles.avatar}><Text style={cardStyles.avatarTxt}>{initials}</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={cardStyles.company}>{emp?.company_name}</Text>
          <Text style={cardStyles.title}>{job.title}</Text>
        </View>
      </View>
      <View style={cardStyles.body}>
        <View style={cardStyles.row}>
          {job.pay_rate && <View style={cardStyles.chip}><Text style={cardStyles.chipLabel}>💰</Text><Text style={cardStyles.chipTxt}>{job.pay_rate}</Text></View>}
          {job.shift && <View style={cardStyles.chip}><Text style={cardStyles.chipLabel}>🌙</Text><Text style={cardStyles.chipTxt}>{job.shift}</Text></View>}
        </View>
        {job.location && <Text style={cardStyles.location}>📍 {job.location}</Text>}
        {job.requirements.length > 0 && (
          <View style={{ marginTop: 12 }}>
            <Text style={cardStyles.reqLabel}>Requirements</Text>
            <View style={cardStyles.tags}>
              {job.requirements.map(r => <Text key={r} style={cardStyles.tag}>{r}</Text>)}
            </View>
          </View>
        )}
        {job.description && <Text style={cardStyles.desc}>{job.description}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  center: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' },
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
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#ea580c', padding: 20 },
  avatar: { width: 52, height: 52, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  avatarTxt: { color: '#fff', fontSize: 18, fontWeight: '900' },
  company: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  title: { color: '#fff', fontSize: 20, fontWeight: '900' },
  body: { padding: 16, gap: 8 },
  row: { flexDirection: 'row', gap: 10 },
  chip: { flex: 1, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: 12 },
  chipLabel: { fontSize: 14, marginBottom: 2 },
  chipTxt: { color: '#fff', fontWeight: '700' },
  location: { color: '#94a3b8', fontSize: 14 },
  reqLabel: { color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: '#334155', color: '#e2e8f0', fontSize: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  desc: { color: '#94a3b8', fontSize: 13, lineHeight: 18 },
});
