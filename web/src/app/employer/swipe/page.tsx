'use client';

import { useCallback, useEffect, useState } from 'react';
import { X, Heart, RotateCcw, MapPin, Briefcase, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { CandidateProfile, Match } from '@/lib/types';
import { SwipeCard } from '@/components/SwipeCard';
import { MatchModal } from '@/components/MatchModal';

export default function EmployerSwipePage() {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMatch, setNewMatch] = useState<Match | null>(null);

  useEffect(() => {
    if (!user) return;
    async function loadCandidates() {
      const { data: swiped } = await supabase
        .from('swipes')
        .select('target_id')
        .eq('swiper_id', user!.id)
        .eq('target_type', 'candidate');

      const swipedIds = (swiped ?? []).map(s => s.target_id);

      const query = supabase
        .from('candidate_profiles')
        .select('*')
        .neq('id', user!.id)
        .order('updated_at', { ascending: false });

      if (swipedIds.length > 0) {
        query.not('id', 'in', `(${swipedIds.join(',')})`);
      }

      const { data } = await query;
      setCandidates(data ?? []);
      setLoading(false);
    }
    loadCandidates();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('employer-matches')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'matches', filter: `employer_id=eq.${user.id}` },
        async payload => {
          const { data } = await supabase
            .from('matches')
            .select('*, employer_profiles(company_name), candidate_profiles(full_name), job_postings(title)')
            .eq('id', payload.new.id)
            .single();
          if (data) setNewMatch(data as Match);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleSwipe = useCallback(
    async (direction: 'left' | 'right', candidate: CandidateProfile) => {
      setCandidates(prev => prev.filter(c => c.id !== candidate.id));
      if (!user) return;
      await supabase.from('swipes').insert({
        swiper_id: user.id,
        target_id: candidate.id,
        target_type: 'candidate',
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

  if (candidates.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center px-6 text-center gap-4">
        <RotateCcw className="text-slate-600" size={48} />
        <h2 className="text-xl font-bold">No new candidates</h2>
        <p className="text-slate-400">More candidates will appear as they sign up.</p>
      </div>
    );
  }

  const visible = candidates.slice(0, 3);

  return (
    <>
      <div className="h-screen flex flex-col">
        <div className="flex items-center justify-between px-5 pt-10 pb-4 shrink-0">
          <span className="text-2xl font-black text-orange-400">CRUIT</span>
          <span className="text-slate-500 text-xs">{candidates.length} candidates</span>
        </div>

        <div className="flex-1 relative mx-4 mb-4">
          {[...visible].reverse().map((candidate, reverseIdx) => {
            const stackIndex = visible.length - 1 - reverseIdx;
            return (
              <SwipeCard key={candidate.id} stackIndex={stackIndex} onSwipe={dir => handleSwipe(dir, candidate)}>
                <CandidateCard candidate={candidate} />
              </SwipeCard>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-8 pb-24 shrink-0">
          <button
            onClick={() => handleSwipe('left', candidates[0])}
            className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-red-400 hover:border-red-400 hover:bg-red-400/10 transition-all shadow-lg"
          >
            <X size={28} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => handleSwipe('right', candidates[0])}
            className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center text-white hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/30"
          >
            <Heart size={26} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {newMatch && (
        <MatchModal
          employerName="You"
          candidateName={newMatch.candidate_profiles?.full_name ?? 'Candidate'}
          jobTitle={newMatch.job_postings?.title ?? 'Position'}
          onKeepSwiping={() => setNewMatch(null)}
          onMessage={() => { setNewMatch(null); window.location.href = '/employer/matches'; }}
        />
      )}
    </>
  );
}

function CandidateCard({ candidate }: { candidate: CandidateProfile }) {
  const initials = candidate.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const availabilityLabel: Record<string, string> = {
    immediate: 'Available now',
    '2_weeks': '2 weeks notice',
    '1_month': '1 month notice',
    flexible: 'Flexible start',
  };

  return (
    <div className="h-full bg-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl cursor-grab active:cursor-grabbing">
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white font-black text-xl flex-shrink-0">
          {initials}
        </div>
        <div>
          <h2 className="text-white font-black text-xl leading-tight">{candidate.full_name}</h2>
          <p className="text-white/80 text-sm">{candidate.title ?? 'Job Seeker'}</p>
        </div>
      </div>

      <div className="flex-1 p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-700/60 rounded-xl p-3">
            <Briefcase className="text-orange-400 mb-1" size={16} />
            <p className="text-white font-bold text-sm">{candidate.experience_years}yr exp</p>
          </div>
          <div className="bg-slate-700/60 rounded-xl p-3">
            <Clock className="text-blue-400 mb-1" size={16} />
            <p className="text-white font-bold text-sm leading-tight">
              {availabilityLabel[candidate.availability] ?? 'Flexible'}
            </p>
          </div>
        </div>

        {candidate.location && (
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <MapPin size={14} />
            <span>{candidate.location}</span>
          </div>
        )}

        {candidate.skills.length > 0 && (
          <div>
            <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Skills</p>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map(skill => (
                <span key={skill} className="bg-slate-700 text-slate-200 text-xs px-3 py-1 rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {candidate.bio && (
          <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">{candidate.bio}</p>
        )}
      </div>
    </div>
  );
}
