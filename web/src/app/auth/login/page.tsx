'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BrandLockup } from '@/components/Brand';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!isSupabaseConfigured) {
      setError('Supabase env vars are required before sign-in can be tested.');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    // Get role and redirect
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (profile?.role === 'employer') router.push('/employer/swipe');
    else router.push('/candidate/swipe');
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 py-10">
      <div className="mb-10"><BrandLockup /></div>
      <div className="w-full max-w-sm rounded-3xl border border-zinc-800 bg-zinc-900/80 p-7 shadow-2xl">
        <h1 className="text-2xl font-black mb-2">Welcome back</h1>
        <p className="mb-6 text-sm leading-6 text-zinc-400">Sign in to keep swiping, matching, and scheduling.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="text-zinc-400 text-sm text-center mt-5">
          No account?{' '}
          <Link href="/auth/signup" className="text-orange-400 hover:underline">Sign up free</Link>
        </p>
      </div>
    </div>
  );
}
