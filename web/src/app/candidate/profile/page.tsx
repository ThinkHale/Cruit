'use client';

import { useEffect, useState } from 'react';
import { LogOut, Save, Plus, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { CandidateProfile } from '@/lib/types';

const AVAILABILITY_OPTIONS = [
  { value: 'immediate', label: 'Available immediately' },
  { value: '2_weeks', label: '2 weeks notice' },
  { value: '1_month', label: '1 month notice' },
  { value: 'flexible', label: 'Flexible' },
];

export default function CandidateProfilePage() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Partial<CandidateProfile> & { skills: string[] }>({ skills: [] });
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from('candidate_profiles').select('*').eq('id', user.id).single().then(({ data }) => {
      if (data) setProfile({ ...data, skills: data.skills ?? [] });
      setLoading(false);
    });
  }, [user]);

  function addSkill() {
    const trimmed = skillInput.trim();
    if (trimmed && !profile.skills.includes(trimmed)) {
      setProfile(p => ({ ...p, skills: [...p.skills, trimmed] }));
    }
    setSkillInput('');
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    await supabase.from('candidate_profiles').upsert({
      id: user.id,
      full_name: profile.full_name ?? '',
      title: profile.title ?? null,
      location: profile.location ?? null,
      bio: profile.bio ?? null,
      skills: profile.skills,
      experience_years: profile.experience_years ?? 0,
      availability: profile.availability ?? 'flexible',
      updated_at: new Date().toISOString(),
    });
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
    <div className="mx-auto max-w-2xl px-4 pt-10 pb-8 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black">My Profile</h1>
        <button onClick={signOut} className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm">
          <LogOut size={16} /> Sign out
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <Field label="Full name *">
          <input value={profile.full_name ?? ''} onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))} required className={inputCls} placeholder="Jane Smith" />
        </Field>

        <Field label="Job title / role">
          <input value={profile.title ?? ''} onChange={e => setProfile(p => ({ ...p, title: e.target.value }))} className={inputCls} placeholder="Maintenance Technician" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Location">
            <input value={profile.location ?? ''} onChange={e => setProfile(p => ({ ...p, location: e.target.value }))} className={inputCls} placeholder="St. Louis, MO" />
          </Field>
          <Field label="Years experience">
            <input type="number" min={0} max={50} value={profile.experience_years ?? 0} onChange={e => setProfile(p => ({ ...p, experience_years: Number(e.target.value) }))} className={inputCls} />
          </Field>
        </div>

        <Field label="Availability">
          <div className="grid grid-cols-2 gap-2">
            {AVAILABILITY_OPTIONS.map(opt => (
              <button key={opt.value} type="button" onClick={() => setProfile(p => ({ ...p, availability: opt.value as CandidateProfile['availability'] }))}
                className={`py-2.5 rounded-xl text-sm font-medium transition-colors ${profile.availability === opt.value ? 'bg-orange-500 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Skills">
          <div className="flex gap-2 mb-2">
            <input
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
              placeholder="e.g. TLC, CNC, Welding"
              className={inputCls}
            />
            <button type="button" onClick={addSkill} className="bg-slate-700 hover:bg-slate-600 text-white px-4 rounded-xl transition-colors">
              <Plus size={18} />
            </button>
          </div>
          {profile.skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {profile.skills.map(skill => (
                <span key={skill} className="flex items-center gap-1 bg-slate-700 text-slate-200 text-sm px-3 py-1 rounded-full">
                  {skill}
                  <button type="button" onClick={() => setProfile(p => ({ ...p, skills: p.skills.filter(s => s !== skill) }))}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </Field>

        <Field label="Bio">
          <textarea value={profile.bio ?? ''} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} rows={4} className={inputCls + ' resize-none'} placeholder="Tell employers a bit about yourself…" />
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
