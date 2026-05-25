'use client';

import { useEffect } from 'react';
import { MessageCircle, RefreshCcw } from 'lucide-react';

interface MatchModalProps {
  employerName: string;
  candidateName: string;
  jobTitle: string;
  onKeepSwiping: () => void;
  onMessage: () => void;
}

export function MatchModal({
  employerName,
  candidateName,
  jobTitle,
  onKeepSwiping,
  onMessage,
}: MatchModalProps) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-3xl border border-orange-500/30 bg-zinc-900 p-8 text-center shadow-2xl">
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="absolute w-28 h-28 rounded-full bg-orange-500/20 animate-ping" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-teal-500 text-3xl font-black text-white shadow-lg">
            C
          </div>
        </div>

        <h2 className="text-3xl font-black text-white mb-2">Match made</h2>
        <p className="text-zinc-400 text-sm mb-1">
          <span className="text-orange-400 font-semibold">{employerName}</span> and{' '}
          <span className="text-orange-400 font-semibold">{candidateName}</span>
        </p>
        <p className="text-zinc-300 font-medium mb-8">
          Both interested in <span className="text-white">{jobTitle}</span>
        </p>

        <div className="space-y-3">
          <button
            onClick={onMessage}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-2xl transition-colors"
          >
            <MessageCircle size={18} /> Send a Message
          </button>
          <button
            onClick={onKeepSwiping}
            className="w-full flex items-center justify-center gap-2 text-zinc-400 hover:text-white font-medium py-2 transition-colors"
          >
            <RefreshCcw size={16} /> Keep Swiping
          </button>
        </div>
      </div>
    </div>
  );
}
