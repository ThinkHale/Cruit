'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, MapPin, DollarSign, ToggleLeft, ToggleRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { JobPosting } from '@/lib/types';

export default function EmployerJobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('job_postings')
      .select('*')
      .eq('employer_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setJobs(data ?? []);
        setLoading(false);
      });
  }, [user]);

  async function toggleActive(job: JobPosting) {
    const { data } = await supabase
      .from('job_postings')
      .update({ is_active: !job.is_active })
      .eq('id', job.id)
      .select()
      .single();
    if (data) setJobs(prev => prev.map(j => (j.id === job.id ? data : j)));
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pt-10 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black">My Jobs</h1>
        <Link
          href="/employer/jobs/new"
          className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
        >
          <Plus size={16} /> Post Job
        </Link>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-7 h-7 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && jobs.length === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-400 mb-4">No jobs posted yet.</p>
          <Link href="/employer/jobs/new" className="text-orange-400 hover:underline font-medium">
            Post your first job →
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {jobs.map(job => (
          <div key={job.id} className="bg-slate-800 rounded-2xl p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="font-bold text-lg leading-tight">{job.title}</h3>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-sm text-slate-400">
                  {job.pay_rate && (
                    <span className="flex items-center gap-1">
                      <DollarSign size={12} />{job.pay_rate}
                    </span>
                  )}
                  {job.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />{job.location}
                    </span>
                  )}
                </div>
                {job.requirements.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {job.requirements.slice(0, 3).map(r => (
                      <span key={r} className="bg-slate-700 text-xs text-slate-300 px-2 py-0.5 rounded-full">{r}</span>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => toggleActive(job)}
                className={`flex-shrink-0 transition-colors ${job.is_active ? 'text-green-400' : 'text-slate-600'}`}
              >
                {job.is_active ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
              </button>
            </div>
            <p className="text-slate-600 text-xs mt-2">
              {new Date(job.created_at).toLocaleDateString()} · {job.is_active ? 'Active' : 'Paused'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
