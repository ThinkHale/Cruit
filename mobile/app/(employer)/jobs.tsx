import { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView,
  TextInput, Alert, Modal,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { JobPosting } from '@/lib/types';

export default function JobsScreen() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from('job_postings').select('*').eq('employer_id', user.id).order('created_at', { ascending: false }).then(({ data }) => setJobs(data ?? []));
  }, [user]);

  async function toggleActive(job: JobPosting) {
    const { data } = await supabase.from('job_postings').update({ is_active: !job.is_active }).eq('id', job.id).select().single();
    if (data) setJobs(prev => prev.map(j => j.id === job.id ? data : j));
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Jobs</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(true)}>
          <Text style={styles.addBtnTxt}>+ Post Job</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        {jobs.length === 0 && (
          <Text style={styles.empty}>No jobs posted yet. Tap "Post Job" to get started.</Text>
        )}
        {jobs.map(job => (
          <View key={job.id} style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.jobTitle}>{job.title}</Text>
              <Text style={styles.jobMeta}>{[job.pay_rate, job.location].filter(Boolean).join(' · ')}</Text>
            </View>
            <TouchableOpacity onPress={() => toggleActive(job)}>
              <Text style={{ color: job.is_active ? '#4ade80' : '#64748b', fontWeight: '700' }}>
                {job.is_active ? 'Active' : 'Paused'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      <NewJobModal visible={showForm} userId={user?.id} onClose={() => setShowForm(false)} onCreated={job => { setJobs(prev => [job, ...prev]); setShowForm(false); }} />
    </SafeAreaView>
  );
}

function NewJobModal({ visible, userId, onClose, onCreated }: { visible: boolean; userId?: string; onClose: () => void; onCreated: (j: JobPosting) => void }) {
  const [title, setTitle] = useState('');
  const [shift, setShift] = useState('');
  const [pay, setPay] = useState('');
  const [location, setLocation] = useState('');
  const [reqs, setReqs] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!userId || !title.trim()) { Alert.alert('Job title is required'); return; }
    setLoading(true);
    const requirements = reqs.split(',').map(r => r.trim()).filter(Boolean);
    const { data, error } = await supabase.from('job_postings').insert({
      employer_id: userId, title, shift: shift || null, pay_rate: pay || null,
      location: location || null, requirements,
    }).select().single();
    setLoading(false);
    if (error) { Alert.alert('Error', error.message); return; }
    onCreated(data as JobPosting);
    setTitle(''); setShift(''); setPay(''); setLocation(''); setReqs('');
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <ScrollView style={{ flex: 1, backgroundColor: '#0f172a' }} contentContainerStyle={{ padding: 24, paddingTop: 40 }} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { marginBottom: 24 }]}>Post a Job</Text>
        {[
          { label: 'Job title *', value: title, set: setTitle, placeholder: 'Maintenance Technician' },
          { label: 'Shift', value: shift, set: setShift, placeholder: '2nd Shift' },
          { label: 'Pay rate', value: pay, set: setPay, placeholder: '$35/hr' },
          { label: 'Location', value: location, set: setLocation, placeholder: 'University City, MO' },
          { label: 'Requirements (comma-separated)', value: reqs, set: setReqs, placeholder: 'TLC, CNC, 3+ years' },
        ].map(f => (
          <View key={f.label} style={{ marginBottom: 14 }}>
            <Text style={styles.label}>{f.label}</Text>
            <TextInput style={styles.input} value={f.value} onChangeText={f.set} placeholder={f.placeholder} placeholderTextColor="#64748b" />
          </View>
        ))}
        <TouchableOpacity style={styles.addBtn2} onPress={submit} disabled={loading}>
          <Text style={styles.addBtnTxt}>{loading ? 'Posting…' : 'Post Job'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ alignItems: 'center', marginTop: 16 }} onPress={onClose}>
          <Text style={{ color: '#64748b' }}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 12 },
  title: { color: '#fff', fontSize: 24, fontWeight: '900' },
  addBtn: { backgroundColor: '#f97316', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  addBtn2: { backgroundColor: '#f97316', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  addBtnTxt: { color: '#fff', fontWeight: '700' },
  card: { backgroundColor: '#1e293b', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  jobTitle: { color: '#fff', fontWeight: '700', fontSize: 16 },
  jobMeta: { color: '#64748b', fontSize: 13, marginTop: 2 },
  empty: { color: '#64748b', textAlign: 'center', marginTop: 32 },
  label: { color: '#94a3b8', fontSize: 13, marginBottom: 6 },
  input: { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: '#fff', fontSize: 15 },
});
