'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Layers, Briefcase, Star, User } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '@/context/AuthContext';

const employerTabs = [
  { href: '/employer/swipe', icon: Layers, label: 'Swipe' },
  { href: '/employer/jobs', icon: Briefcase, label: 'Jobs' },
  { href: '/employer/matches', icon: Star, label: 'Matches' },
  { href: '/employer/profile', icon: User, label: 'Profile' },
];

const candidateTabs = [
  { href: '/candidate/swipe', icon: Layers, label: 'Swipe' },
  { href: '/candidate/matches', icon: Star, label: 'Matches' },
  { href: '/candidate/profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
  const { profile } = useAuth();
  const pathname = usePathname();
  const tabs = profile?.role === 'employer' ? employerTabs : candidateTabs;

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-slate-900 border-t border-slate-800 flex justify-around items-center h-16 z-40 max-w-sm mx-auto">
      {tabs.map(({ href, icon: Icon, label }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={clsx(
              'flex flex-col items-center gap-0.5 text-xs font-medium px-4 py-2 rounded-xl transition-colors',
              active ? 'text-orange-400' : 'text-slate-500 hover:text-slate-300'
            )}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
