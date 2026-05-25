import Link from 'next/link';
import { ArrowRight, BadgeDollarSign, Clock3, MessageCircle, Sparkles, UsersRound, Zap, type LucideIcon } from 'lucide-react';
import { BrandLockup } from '@/components/Brand';
import { assetPath } from '@/lib/paths';

const stats = [
  ['20', 'dollars per post'],
  ['7', 'day employer trial'],
  ['0', 'candidate fees'],
];

const steps = [
  { title: 'Post or profile', desc: 'Compact job cards and candidate snapshots keep every decision scannable.', icon: UsersRound },
  { title: 'Swipe with intent', desc: 'Right means interested. Left is saved to history, so nothing is lost.', icon: Zap },
  { title: 'Match and message', desc: 'Mutual interest opens a chat thread for quick interview scheduling.', icon: MessageCircle },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section
        className="relative min-h-[92vh] overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `linear-gradient(90deg, rgba(9,9,11,.96) 0%, rgba(9,9,11,.82) 42%, rgba(9,9,11,.4) 100%), url('${assetPath('/brand/hero-preview.png')}')` }}
      >
        <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <BrandLockup />
          <div className="flex items-center gap-2">
            <Link href="/auth/login" className="rounded-xl px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:text-white">
              Log in
            </Link>
            <Link href="/auth/signup" className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-zinc-950 transition hover:bg-orange-100">
              Start
            </Link>
          </div>
        </nav>

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col px-5 pb-10 pt-20 md:pt-28">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-orange-200">
              <Sparkles size={14} /> Built for fast hourly hiring
            </div>
            <h1 className="max-w-2xl text-5xl font-black leading-[0.95] tracking-normal text-white md:text-7xl">
              Swipe-to-match recruiting.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-300">
              Cruit turns jobs and candidates into clean, quick cards so both sides can move from interest to interview without bloated job boards or application drag.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/auth/signup?role=employer" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-4 text-base font-black text-white shadow-xl shadow-orange-500/20 transition hover:bg-orange-600">
                Post a job <ArrowRight size={18} />
              </Link>
              <Link href="/auth/signup?role=candidate" className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-6 py-4 text-base font-bold text-white backdrop-blur transition hover:bg-white/15">
                Find work
              </Link>
            </div>
          </div>

          <div className="mt-16 grid max-w-2xl grid-cols-3 gap-3">
            {stats.map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
                <div className="text-3xl font-black text-white">{value}</div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-5 py-16 md:grid-cols-3">
        {steps.map(({ title, desc, icon: Icon }) => (
          <article key={title} className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6">
            <Icon className="mb-5 text-teal-400" size={28} />
            <h2 className="text-xl font-black">{title}</h2>
            <p className="mt-3 leading-7 text-zinc-400">{desc}</p>
          </article>
        ))}
      </section>

      <section className="border-y border-zinc-800 bg-zinc-900/50">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 md:grid-cols-[1fr_1.1fr] md:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-teal-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-teal-300">
              <Clock3 size={14} /> Less waiting
            </div>
            <h2 className="text-3xl font-black md:text-5xl">A hiring loop small teams can actually keep up with.</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <PricingCard title="Pay per post" price="$20" label="/ post" icon={BadgeDollarSign} features={['One active job posting', 'Candidate swipe feed', 'Match notifications', 'Saved swipe history']} />
            <PricingCard title="Unlimited" price="$175" label="/ month" icon={Zap} featured features={['Unlimited job postings', 'Candidate swipe feed', 'Priority placement', 'Saved swipe history']} />
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
        <BrandLockup compact />
        <span>Candidate accounts are free. Employer plans can be changed anytime.</span>
      </footer>
    </main>
  );
}

function PricingCard({
  title,
  price,
  label,
  icon: Icon,
  features,
  featured,
}: {
  title: string;
  price: string;
  label: string;
  icon: LucideIcon;
  features: string[];
  featured?: boolean;
}) {
  return (
    <article className={`rounded-2xl border p-5 ${featured ? 'border-orange-400 bg-orange-500 text-white' : 'border-zinc-800 bg-zinc-950 text-white'}`}>
      <div className="mb-4 flex items-center gap-2 font-black">
        <Icon size={20} />
        {title}
      </div>
      <div className="text-4xl font-black">
        {price} <span className={`text-base font-semibold ${featured ? 'text-orange-100' : 'text-zinc-500'}`}>{label}</span>
      </div>
      <ul className={`mt-5 space-y-2 text-sm ${featured ? 'text-orange-50' : 'text-zinc-400'}`}>
        {features.map(feature => (
          <li key={feature}>✓ {feature}</li>
        ))}
      </ul>
    </article>
  );
}
