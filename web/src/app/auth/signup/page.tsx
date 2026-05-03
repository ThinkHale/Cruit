'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
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
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError || !data.user) {
      setError(signUpError?.message ?? 'Sign-up failed');
      setLoading(false);
      return;
    }

    const userId = data.user.id;

    // Insert base profile
    await supabase.from('user_profiles').insert({ id: userId, role });

    // Insert role-specific profile
    if (role === 'employer') {
      await supabase.from('employer_profiles').insert({ id: userId, company_name: name });
      router.push('/employer/profile?onboarding=1');
    } else {
      await supabase.from('candidate_profiles').insert({ id: userId, full_name: name });
      router.push('/candidate/profile?onboarding=1');
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4">
      <Link href="/" className="text-3xl font-black text-orange-400 mb-10">CRUIT</Link>
      <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-2">Create account</h1>
        <p className="text-slate-400 text-sm mb-6">Free for candidates. Employers get 7-day trial.</p>

        {/* Role selector */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          {(['candidate', 'employer'] as UserRole[]).map(r => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`py-3 rounded-xl text-sm font-semibold transition-colors capitalize ${
                role === r
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              {r === 'employer' ? 'Employer' : 'Job Seeker'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">
              {role === 'employer' ? 'Company name' : 'Your name'}
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
              placeholder={role === 'employer' ? 'Acme Corp' : 'Jane Smith'}
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="text-slate-400 text-sm text-center mt-4">
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
