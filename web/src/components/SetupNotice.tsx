'use client';

import { AlertCircle } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';

export function SetupNotice() {
  if (isSupabaseConfigured) return null;

  return (
    <div className="fixed inset-x-3 top-3 z-[60] mx-auto max-w-xl rounded-2xl border border-amber-400/40 bg-amber-950/95 px-4 py-3 text-sm text-amber-50 shadow-2xl">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 shrink-0 text-amber-300" size={18} />
        <p>
          Supabase is not configured. Add `NEXT_PUBLIC_SUPABASE_URL` and
          `NEXT_PUBLIC_SUPABASE_ANON_KEY` before testing sign-up, swipes, matches, or chat.
        </p>
      </div>
    </div>
  );
}
