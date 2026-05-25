'use client';

import { useEffect, useState, useRef } from 'react';
import { Send, MessageCircle, History, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Match, Message, Swipe, CandidateProfile } from '@/lib/types';

export default function EmployerMatchesPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'matches' | 'history'>('matches');

  return (
    <div className="mx-auto max-w-4xl px-4 pt-10 lg:px-8">
      <h1 className="text-2xl font-black mb-4">Activity</h1>
      <div className="flex bg-slate-800 rounded-xl p-1 mb-6">
        <button
          onClick={() => setTab('matches')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${tab === 'matches' ? 'bg-orange-500 text-white' : 'text-slate-400'}`}
        >
          <MessageCircle size={15} /> Matches
        </button>
        <button
          onClick={() => setTab('history')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${tab === 'history' ? 'bg-orange-500 text-white' : 'text-slate-400'}`}
        >
          <History size={15} /> History
        </button>
      </div>
      {tab === 'matches' ? <MatchesList userId={user?.id} /> : <SwipeHistory userId={user?.id} />}
    </div>
  );
}

function MatchesList({ userId }: { userId?: string }) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from('matches')
      .select('*, employer_profiles(company_name), candidate_profiles(full_name, title), job_postings(title, pay_rate, location)')
      .eq('employer_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setMatches((data ?? []) as Match[]);
        setLoading(false);
      });
  }, [userId]);

  if (loading) return <Spinner />;
  if (matches.length === 0)
    return <Empty message="No matches yet. Keep swiping on candidates!" />;

  return (
    <div className="space-y-3">
      {matches.map(match => (
        <div key={match.id} className="bg-slate-800 rounded-2xl overflow-hidden">
          <button
            className="w-full flex items-center justify-between p-4"
            onClick={() => setExpanded(expanded === match.id ? null : match.id)}
          >
            <div className="text-left">
              <p className="font-bold">{match.candidate_profiles?.full_name}</p>
              <p className="text-slate-400 text-sm">{match.job_postings?.title}</p>
              <p className="text-orange-400 text-xs font-medium mt-0.5">
                {new Date(match.created_at).toLocaleDateString()}
              </p>
            </div>
            {expanded === match.id ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
          </button>
          {expanded === match.id && userId && (
            <MessageThread matchId={match.id} userId={userId} />
          )}
        </div>
      ))}
    </div>
  );
}

function MessageThread({ matchId, userId }: { matchId: string; userId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase
      .from('messages')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at')
      .then(({ data }) => setMessages(data ?? []));

    const channel = supabase
      .channel(`messages-${matchId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `match_id=eq.${matchId}` },
        payload => setMessages(prev => [...prev, payload.new as Message]))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [matchId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function send() {
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput('');
    await supabase.from('messages').insert({ match_id: matchId, sender_id: userId, content: trimmed });
  }

  const defaultMsg = "Hi! Let's schedule an interview. When are you available?";

  return (
    <div className="border-t border-slate-700 px-4 pb-4">
      {messages.length === 0 && (
        <button
          onClick={() => setInput(defaultMsg)}
          className="text-xs text-orange-400 mt-3 hover:underline"
        >
          Use suggested message
        </button>
      )}
      <div className="max-h-48 overflow-y-auto py-2 space-y-2">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}>
            <span className={`text-sm px-3 py-1.5 rounded-2xl max-w-[75%] ${msg.sender_id === userId ? 'bg-orange-500 text-white' : 'bg-slate-700 text-white'}`}>
              {msg.content}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2 mt-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') send(); }}
          placeholder="Send a message…"
          className="flex-1 bg-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none"
        />
        <button onClick={send} className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-xl transition-colors">
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

function SwipeHistory({ userId }: { userId?: string }) {
  const [passed, setPassed] = useState<CandidateProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from('swipes')
      .select('target_id')
      .eq('swiper_id', userId)
      .eq('target_type', 'candidate')
      .eq('direction', 'left')
      .then(async ({ data }) => {
        const ids = (data ?? []).map(s => s.target_id);
        if (ids.length === 0) { setLoading(false); return; }
        const { data: candidates } = await supabase
          .from('candidate_profiles')
          .select('*')
          .in('id', ids);
        setPassed((candidates ?? []) as CandidateProfile[]);
        setLoading(false);
      });
  }, [userId]);

  if (loading) return <Spinner />;
  if (passed.length === 0)
    return <Empty message="No passed candidates yet." />;

  return (
    <div className="space-y-2">
      <p className="text-slate-500 text-xs mb-3">Candidates you passed on — you can still reach out via matches if they swipe right on you.</p>
      {passed.map(c => (
        <div key={c.id} className="bg-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="font-medium">{c.full_name}</p>
            <p className="text-slate-400 text-sm">{c.title ?? 'Job Seeker'} · {c.location ?? '—'}</p>
          </div>
          <span className="text-slate-600 text-xs">Passed</span>
        </div>
      ))}
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex justify-center py-12">
      <div className="w-7 h-7 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function Empty({ message }: { message: string }) {
  return (
    <div className="text-center py-16">
      <p className="text-slate-400">{message}</p>
    </div>
  );
}
