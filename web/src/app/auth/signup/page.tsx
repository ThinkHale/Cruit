'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { BrandLockup } from '@/components/Brand';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { UserRole } from '@/lib/types';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = (searchParams.get('role') as UserRole) || 'candidate';

  const [role, setRole] = useState<UserRole>(defaultRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!isSupabaseConfigured) {
      setError('Supabase env vars are required before sign-up can be tested.');
      return;
    }
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError || !data.user) {
      setError(signUpError?.message ?? 'Sign-up failed');
      setLoading(false);
      return;
    }

    const userId = data.user.id;

    const { error: profileError } = await supabase.from('user_profiles').insert({ id: userId, role });
    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    if (role === 'employer') {
      const { error } = await supabase.from('employer_profiles').insert({ id: userId, company_name: name });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      router.push('/employer/profile?onboarding=1');
    } else {
      const { error } = await supabase.from('candidate_profiles').insert({ id: userId, full_name: name });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      router.push('/candidate/profile?onboarding=1');
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 py-10">
      <div className="mb-10"><BrandLockup /></div>
      <div className="w-full max-w-sm rounded-3xl border border-zinc-800 bg-zinc-900/80 p-7 shadow-2xl">
        <h1 className="text-2xl font-black mb-2">Create account</h1>
        <p className="text-zinc-400 text-sm mb-6">Free for candidates. Employers get a 7-day trial.</p>

        <div className="grid grid-cols-2 gap-2 mb-6">
          {(['candidate', 'employer'] as UserRole[]).map(r => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`rounded-2xl py-3 text-sm font-bold transition-colors capitalize ${
                role === r
                  ? 'bg-orange-500 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {r === 'employer' ? 'Employer' : 'Job Seeker'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
              <label className="block text-sm text-zinc-400 mb-1">
              {role === 'employer' ? 'Company name' : 'Your name'}
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white placeholder-zinc-600 transition-colors focus:border-orange-500 focus:outline-none"
              placeholder={role === 'employer' ? 'Acme Corp' : 'Jane Smith'}
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white placeholder-zinc-600 transition-colors focus:border-orange-500 focus:outline-none"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white placeholder-zinc-600 transition-colors focus:border-orange-500 focus:outline-none"
              placeholder="Password"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-orange-500 py-3 font-black text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="text-zinc-400 text-sm text-center mt-5">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-orange-400 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
