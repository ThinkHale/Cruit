'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Layers, Briefcase, Star, User } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '@/context/AuthContext';
import { BrandMark } from '@/components/Brand';

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
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto flex h-16 max-w-md items-center justify-around border-t border-zinc-800 bg-zinc-950/95 safe-bottom backdrop-blur lg:inset-x-auto lg:bottom-auto lg:left-6 lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-20 lg:max-w-none lg:flex-col lg:justify-start lg:gap-3 lg:rounded-3xl lg:border lg:py-5">
      <div className="hidden lg:mb-4 lg:block">
        <BrandMark className="h-11 w-11 rounded-2xl" />
      </div>
      {tabs.map(({ href, icon: Icon, label }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            className={clsx(
              'flex min-w-16 flex-col items-center gap-0.5 rounded-2xl px-3 py-2 text-xs font-semibold transition-colors lg:min-w-0 lg:gap-1.5 lg:px-2 lg:py-3',
              active ? 'bg-orange-500/10 text-orange-300 lg:bg-orange-500 lg:text-white' : 'text-zinc-500 hover:text-zinc-200'
            )}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
