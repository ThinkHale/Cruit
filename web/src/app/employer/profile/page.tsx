'use client';

import { useEffect, useState } from 'react';
import { LogOut, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { EmployerProfile } from '@/lib/types';

const INDUSTRIES = ['Manufacturing', 'Technology', 'Healthcare', 'Retail', 'Construction', 'Logistics', 'Finance', 'Education', 'Hospitality', 'Other'];
const SIZES = ['1-10', '11-50', '51-200', '201-500', '500+'];

export default function EmployerProfilePage() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Partial<EmployerProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from('employer_profiles').select('*').eq('id', user.id).single().then(({ data }) => {
      if (data) setProfile(data);
      setLoading(false);
    });
  }, [user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    await supabase.from('employer_profiles').upsert({ id: user.id, ...profile, updated_at: new Date().toISOString() });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) return (
    <div className="flex justify-center pt-20">
      <div className="w-7 h-7 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="px-4 pt-10 pb-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black">Company Profile</h1>
        <button onClick={signOut} className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm">
          <LogOut size={16} /> Sign out
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <Field label="Company name *">
          <input value={profile.company_name ?? ''} onChange={e => setProfile(p => ({ ...p, company_name: e.target.value }))} required className={inputCls} placeholder="Acme Corp" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Industry">
            <select value={profile.industry ?? ''} onChange={e => setProfile(p => ({ ...p, industry: e.target.value }))} className={inputCls}>
              <option value="">Select…</option>
              {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
            </select>
          </Field>
          <Field label="Company size">
            <select value={profile.company_size ?? ''} onChange={e => setProfile(p => ({ ...p, company_size: e.target.value }))} className={inputCls}>
              <option value="">Select…</option>
              {SIZES.map(s => <option key={s}>{s} employees</option>)}
            </select>
          </Field>
        </div>

        <Field label="Location">
          <input value={profile.location ?? ''} onChange={e => setProfile(p => ({ ...p, location: e.target.value }))} className={inputCls} placeholder="St. Louis, MO" />
        </Field>

        <Field label="Website">
          <input value={profile.website ?? ''} onChange={e => setProfile(p => ({ ...p, website: e.target.value }))} className={inputCls} placeholder="https://acmecorp.com" type="url" />
        </Field>

        <Field label="About your company">
          <textarea value={profile.description ?? ''} onChange={e => setProfile(p => ({ ...p, description: e.target.value }))} rows={4} className={inputCls + ' resize-none'} placeholder="What does your company do?" />
        </Field>

        <Field label="Subscription plan">
          <div className="grid grid-cols-2 gap-2">
            {(['per_post', 'unlimited'] as const).map(plan => (
              <button key={plan} type="button" onClick={() => setProfile(p => ({ ...p, plan }))}
                className={`py-3 rounded-xl text-sm font-semibold transition-colors ${profile.plan === plan ? 'bg-orange-500 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}>
                {plan === 'per_post' ? '$20 / Post' : '$175 / Month'}
              </button>
            ))}
          </div>
        </Field>

        <button type="submit" disabled={saving} className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors">
          {saved ? '✓ Saved!' : saving ? 'Saving…' : <><Save size={16} /> Save Profile</>}
        </button>
      </form>
    </div>
  );
}

const inputCls = 'w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm text-slate-400 mb-1">{label}</label>
      {children}
    </div>
  );
}
