import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView,
  Platform, Alert, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

type Role = 'employer' | 'candidate';

export default function SignupScreen() {
  const router = useRouter();
  const [role, setRole] = useState<Role>('candidate');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!name.trim()) { Alert.alert('Name required'); return; }
    if (!isSupabaseConfigured) {
      Alert.alert('Supabase required', 'Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY before testing sign-up.');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error || !data.user) {
      Alert.alert('Sign up failed', error?.message ?? 'Unknown error');
      setLoading(false);
      return;
    }
    const userId = data.user.id;
    await supabase.from('user_profiles').insert({ id: userId, role });
    if (role === 'employer') {
      await supabase.from('employer_profiles').insert({ id: userId, company_name: name });
      router.replace('/(employer)/profile');
    } else {
      await supabase.from('candidate_profiles').insert({ id: userId, full_name: name });
      router.replace('/(candidate)/profile');
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: '#09090b' }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>CRUIT</Text>
        <Text style={styles.heading}>Create account</Text>

        {/* Role toggle */}
        <View style={styles.roleRow}>
          {(['candidate', 'employer'] as Role[]).map(r => (
            <TouchableOpacity
              key={r}
              style={[styles.roleBtn, role === r && styles.roleBtnActive]}
              onPress={() => setRole(r)}
            >
              <Text style={[styles.roleTxt, role === r && styles.roleTxtActive]}>
                {r === 'candidate' ? 'Job Seeker' : 'Employer'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={styles.input}
          placeholder={role === 'employer' ? 'Company name' : 'Your name'}
          placeholderTextColor="#64748b"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#64748b"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password (6+ characters)"
          placeholderTextColor="#64748b"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.btn} onPress={handleSignup} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'Creating…' : 'Create Account'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/auth/login')}>
          <Text style={styles.link}>Already have an account? <Text style={styles.linkAccent}>Sign in</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 80 },
  logo: { color: '#f97316', fontSize: 36, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  heading: { color: '#fff', fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 28 },
  roleRow: { flexDirection: 'row', backgroundColor: '#1e293b', borderRadius: 14, padding: 4, marginBottom: 24 },
  roleBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  roleBtnActive: { backgroundColor: '#f97316' },
  roleTxt: { color: '#64748b', fontWeight: '600' },
  roleTxtActive: { color: '#fff' },
  input: {
    backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155',
    borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14,
    color: '#fff', fontSize: 16, marginBottom: 12,
  },
  btn: { backgroundColor: '#f97316', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  link: { color: '#64748b', textAlign: 'center', marginTop: 24 },
  linkAccent: { color: '#f97316' },
});
