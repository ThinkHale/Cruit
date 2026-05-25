import { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { CandidateProfile } from '@/lib/types';

const AVAIL = [
  { value: 'immediate', label: 'Available now' },
  { value: '2_weeks', label: '2 weeks notice' },
  { value: '1_month', label: '1 month notice' },
  { value: 'flexible', label: 'Flexible' },
] as const;

const TEXT_FIELDS: Array<{
  label: string;
  key: 'full_name' | 'title' | 'location';
  placeholder: string;
}> = [
  { label: 'Full name *', key: 'full_name', placeholder: 'Jane Smith' },
  { label: 'Job title', key: 'title', placeholder: 'Maintenance Technician' },
  { label: 'Location', key: 'location', placeholder: 'St. Louis, MO' },
];

export default function CandidateProfileScreen() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Partial<CandidateProfile> & { skills: string[] }>({ skills: [] });
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from('candidate_profiles').select('*').eq('id', user.id).single().then(({ data }) => {
      if (data) setProfile({ ...data, skills: data.skills ?? [] });
      setLoading(false);
    });
  }, [user]);

  function addSkill() {
    const t = skillInput.trim();
    if (t && !profile.skills.includes(t)) setProfile(p => ({ ...p, skills: [...p.skills, t] }));
    setSkillInput('');
  }

  async function save() {
    if (!user || !profile.full_name?.trim()) { Alert.alert('Name required'); return; }
    setSaving(true);
    await supabase.from('candidate_profiles').upsert({
      id: user.id,
      full_name: profile.full_name,
      title: profile.title ?? null,
      location: profile.location ?? null,
      bio: profile.bio ?? null,
      skills: profile.skills,
      experience_years: profile.experience_years ?? 0,
      availability: profile.availability ?? 'flexible',
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    Alert.alert('Saved!');
  }

  if (loading) return <View style={styles.container} />;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Text style={styles.title}>My Profile</Text>
          <TouchableOpacity onPress={() => supabase.auth.signOut()}>
            <Text style={{ color: '#64748b' }}>Sign out</Text>
          </TouchableOpacity>
        </View>

        {TEXT_FIELDS.map(f => (
          <View key={f.key} style={{ marginBottom: 14 }}>
            <Text style={styles.label}>{f.label}</Text>
            <TextInput
              style={styles.input}
              value={profile[f.key] ?? ''}
              onChangeText={v => setProfile(p => ({ ...p, [f.key]: v }))}
              placeholder={f.placeholder}
              placeholderTextColor="#64748b"
            />
          </View>
        ))}

        <View style={{ marginBottom: 14 }}>
          <Text style={styles.label}>Years of experience</Text>
          <TextInput
            style={styles.input}
            value={String(profile.experience_years ?? 0)}
            onChangeText={v => setProfile(p => ({ ...p, experience_years: parseInt(v) || 0 }))}
            keyboardType="number-pad"
          />
        </View>

        <View style={{ marginBottom: 14 }}>
          <Text style={styles.label}>Availability</Text>
          <View style={styles.availGrid}>
            {AVAIL.map(a => (
              <TouchableOpacity key={a.value} style={[styles.availBtn, profile.availability === a.value && styles.availBtnActive]} onPress={() => setProfile(p => ({ ...p, availability: a.value }))}>
                <Text style={[styles.availTxt, profile.availability === a.value && { color: '#fff' }]}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ marginBottom: 14 }}>
          <Text style={styles.label}>Skills</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
            <TextInput style={[styles.input, { flex: 1 }]} value={skillInput} onChangeText={setSkillInput} placeholder="e.g. TLC" placeholderTextColor="#64748b" onSubmitEditing={addSkill} returnKeyType="done" />
            <TouchableOpacity style={styles.addSkillBtn} onPress={addSkill}><Text style={{ color: '#fff', fontWeight: '700', fontSize: 18 }}>+</Text></TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {profile.skills.map(s => (
              <TouchableOpacity key={s} onPress={() => setProfile(p => ({ ...p, skills: p.skills.filter(x => x !== s) }))} style={styles.skillTag}>
                <Text style={{ color: '#e2e8f0', fontSize: 13 }}>{s} ×</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
            value={profile.bio ?? ''}
            onChangeText={v => setProfile(p => ({ ...p, bio: v }))}
            placeholder="Tell employers about yourself…"
            placeholderTextColor="#64748b"
            multiline
          />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={save} disabled={saving}>
          <Text style={styles.saveBtnTxt}>{saving ? 'Saving…' : 'Save Profile'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b' },
  title: { color: '#fff', fontSize: 22, fontWeight: '900' },
  label: { color: '#94a3b8', fontSize: 13, marginBottom: 6 },
  input: { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, color: '#fff', fontSize: 15 },
  availGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  availBtn: { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  availBtnActive: { backgroundColor: '#f97316', borderColor: '#f97316' },
  availTxt: { color: '#64748b', fontWeight: '600', fontSize: 13 },
  addSkillBtn: { backgroundColor: '#334155', width: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  skillTag: { backgroundColor: '#334155', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  saveBtn: { backgroundColor: '#f97316', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  saveBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
