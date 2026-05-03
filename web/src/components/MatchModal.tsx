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
      <div className="bg-slate-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-orange-500/30">
        {/* Rings animation */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="absolute w-28 h-28 rounded-full bg-orange-500/20 animate-ping" />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-4xl shadow-lg">
            🎉
          </div>
        </div>

        <h2 className="text-3xl font-black text-white mb-2">It's a Match!</h2>
        <p className="text-slate-400 text-sm mb-1">
          <span className="text-orange-400 font-semibold">{employerName}</span> and{' '}
          <span className="text-orange-400 font-semibold">{candidateName}</span>
        </p>
        <p className="text-slate-300 font-medium mb-8">
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
            className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-white font-medium py-2 transition-colors"
          >
            <RefreshCcw size={16} /> Keep Swiping
          </button>
        </div>
      </div>
    </div>
  );
}
