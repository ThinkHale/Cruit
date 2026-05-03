'use client';

import { useCallback, useEffect, useState } from 'react';
import { X, Heart, RotateCcw, MapPin, DollarSign, Moon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { JobPosting, Match } from '@/lib/types';
import { SwipeCard } from '@/components/SwipeCard';
import { MatchModal } from '@/components/MatchModal';

export default function CandidateSwipePage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMatch, setNewMatch] = useState<Match | null>(null);

  useEffect(() => {
    if (!user) return;
    async function loadJobs() {
      // Get jobs candidate hasn't swiped on yet
      const { data: swiped } = await supabase
        .from('swipes')
        .select('target_id')
        .eq('swiper_id', user!.id)
        .eq('target_type', 'job');

      const swipedIds = (swiped ?? []).map(s => s.target_id);

      const query = supabase
        .from('job_postings')
        .select('*, employer_profiles(company_name, industry, company_size)')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (swipedIds.length > 0) {
        query.not('id', 'in', `(${swipedIds.join(',')})`);
      }

      const { data } = await query;
      setJobs(data ?? []);
      setLoading(false);
    }
    loadJobs();
  }, [user]);

  // Subscribe to new matches
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('candidate-matches')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'matches', filter: `candidate_id=eq.${user.id}` },
        async payload => {
          const { data } = await supabase
            .from('matches')
            .select('*, employer_profiles(company_name), candidate_profiles(full_name), job_postings(title, pay_rate, location)')
            .eq('id', payload.new.id)
            .single();
          if (data) setNewMatch(data as Match);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleSwipe = useCallback(
    async (direction: 'left' | 'right', job: JobPosting) => {
      setJobs(prev => prev.filter(j => j.id !== job.id));
      if (!user) return;
      await supabase.from('swipes').insert({
        swiper_id: user.id,
        target_id: job.id,
        target_type: 'job',
        direction,
      });
    },
    [user]
  );

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center px-6 text-center gap-4">
        <RotateCcw className="text-slate-600" size={48} />
        <h2 className="text-xl font-bold">All caught up!</h2>
        <p className="text-slate-400">Check back later for new job postings.</p>
      </div>
    );
  }

  const visibleJobs = jobs.slice(0, 3);

  return (
    <>
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-10 pb-4 shrink-0">
          <span className="text-2xl font-black text-orange-400">CRUIT</span>
          <span className="text-slate-500 text-xs">{jobs.length} jobs near you</span>
        </div>

        {/* Card stack */}
        <div className="flex-1 relative mx-4 mb-4">
          {[...visibleJobs].reverse().map((job, reverseIdx) => {
            const stackIndex = visibleJobs.length - 1 - reverseIdx;
            return (
              <SwipeCard key={job.id} stackIndex={stackIndex} onSwipe={dir => handleSwipe(dir, job)}>
                <JobCard job={job} />
              </SwipeCard>
            );
          })}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-8 pb-24 shrink-0">
          <button
            onClick={() => handleSwipe('left', jobs[0])}
            className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-red-400 hover:border-red-400 hover:bg-red-400/10 transition-all shadow-lg"
          >
            <X size={28} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => handleSwipe('right', jobs[0])}
            className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center text-white hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/30"
          >
            <Heart size={26} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {newMatch && (
        <MatchModal
          employerName={newMatch.employer_profiles?.company_name ?? 'Employer'}
          candidateName="You"
          jobTitle={newMatch.job_postings?.title ?? 'Position'}
          onKeepSwiping={() => setNewMatch(null)}
          onMessage={() => { setNewMatch(null); window.location.href = '/candidate/matches'; }}
        />
      )}
    </>
  );
}

function JobCard({ job }: { job: JobPosting }) {
  const employer = job.employer_profiles;
  const initials = employer?.company_name?.slice(0, 2).toUpperCase() ?? '??';

  return (
    <div className="h-full bg-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl cursor-grab active:cursor-grabbing">
      {/* Color band */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-700 p-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white font-black text-lg flex-shrink-0">
          {initials}
        </div>
        <div>
          <p className="text-white/80 text-sm">{employer?.company_name}</p>
          <h2 className="text-white font-black text-xl leading-tight">{job.title}</h2>
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {job.pay_rate && (
            <div className="bg-slate-700/60 rounded-xl p-3">
              <DollarSign className="text-green-400 mb-1" size={16} />
              <p className="text-white font-bold">{job.pay_rate}</p>
            </div>
          )}
          {job.shift && (
            <div className="bg-slate-700/60 rounded-xl p-3">
              <Moon className="text-blue-400 mb-1" size={16} />
              <p className="text-white font-bold">{job.shift}</p>
            </div>
          )}
        </div>

        {job.location && (
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <MapPin size={14} />
            <span>{job.location}</span>
          </div>
        )}

        {job.requirements.length > 0 && (
          <div>
            <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Requirements</p>
            <div className="flex flex-wrap gap-2">
              {job.requirements.map(req => (
                <span key={req} className="bg-slate-700 text-slate-200 text-xs px-3 py-1 rounded-full">
                  {req}
                </span>
              ))}
            </div>
          </div>
        )}

        {job.description && (
          <p className="text-slate-400 text-sm leading-relaxed">{job.description}</p>
        )}

        {employer && (
          <div className="pt-2 border-t border-slate-700 flex items-center gap-3 text-xs text-slate-500">
            {employer.industry && <span>{employer.industry}</span>}
            {employer.company_size && <span>· {employer.company_size}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
