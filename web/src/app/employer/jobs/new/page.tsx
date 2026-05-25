'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export default function NewJobPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [shift, setShift] = useState('');
  const [payRate, setPayRate] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [reqInput, setReqInput] = useState('');
  const [requirements, setRequirements] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function addRequirement() {
    const trimmed = reqInput.trim();
    if (trimmed && !requirements.includes(trimmed)) {
      setRequirements(prev => [...prev, trimmed]);
    }
    setReqInput('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError('');
    setLoading(true);

    const { error: err } = await supabase.from('job_postings').insert({
      employer_id: user.id,
      title,
      shift: shift || null,
      pay_rate: payRate || null,
      location: location || null,
      requirements,
      description: description || null,
    });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    router.push('/employer/jobs');
  }

  return (
    <div className="px-4 pt-10 pb-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-slate-400 hover:text-white">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-2xl font-black">Post a Job</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-slate-400 mb-1 block">Job title *</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            placeholder="Maintenance Technician"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Shift</label>
            <input
              value={shift}
              onChange={e => setShift(e.target.value)}
              placeholder="2nd Shift"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Pay rate</label>
            <input
              value={payRate}
              onChange={e => setPayRate(e.target.value)}
              placeholder="$35/hr"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-slate-400 mb-1 block">Location</label>
          <input
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="University City, MO"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />
        </div>

        <div>
          <label className="text-sm text-slate-400 mb-1 block">Requirements</label>
          <div className="flex gap-2">
            <input
              value={reqInput}
              onChange={e => setReqInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addRequirement(); } }}
              placeholder="e.g. TLC, CNC"
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
            <button
              type="button"
              onClick={addRequirement}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 rounded-xl transition-colors"
            >
              <Plus size={18} />
            </button>
          </div>
          {requirements.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {requirements.map(r => (
                <span key={r} className="flex items-center gap-1 bg-slate-700 text-slate-200 text-sm px-3 py-1 rounded-full">
                  {r}
                  <button type="button" onClick={() => setRequirements(prev => prev.filter(x => x !== r))}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="text-sm text-slate-400 mb-1 block">Short description (optional)</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            placeholder="Any extra details candidates should know…"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 resize-none"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors"
        >
          {loading ? 'Posting…' : 'Post Job'}
        </button>
      </form>
    </div>
  );
}
