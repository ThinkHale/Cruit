import Link from 'next/link';
import { Zap, DollarSign, Clock, Users } from 'lucide-react';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-900 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <span className="text-2xl font-black text-orange-400 tracking-tight">CRUIT</span>
        <div className="flex gap-3">
          <Link href="/auth/login" className="text-slate-300 hover:text-white px-4 py-2 text-sm font-medium">
            Log in
          </Link>
          <Link href="/auth/signup" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto text-center px-6 pt-20 pb-16">
        <div className="inline-block bg-orange-500/15 text-orange-400 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
          Recruiting, reinvented
        </div>
        <h1 className="text-5xl md:text-7xl font-black leading-none mb-6">
          Indeed&nbsp;meets
          <br />
          <span className="text-orange-400">Tinder</span>
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-xl mx-auto mb-10">
          Swipe through jobs and candidates in seconds. No bloated postings, no
          $500 fees. Just fast, affordable recruiting.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/auth/signup?role=employer" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-2xl text-lg transition-colors">
            Post Jobs Free Trial
          </Link>
          <Link href="/auth/signup?role=candidate" className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 px-8 rounded-2xl text-lg transition-colors">
            Find a Job
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-black text-center mb-12">How it works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: '01',
              title: 'Create your profile',
              desc: 'Employers post quick job snippets. Candidates upload a resume snapshot.',
              icon: Users,
            },
            {
              step: '02',
              title: 'Swipe to apply or recruit',
              desc: 'Swipe right to say yes, left to pass. No lengthy applications required.',
              icon: Zap,
            },
            {
              step: '03',
              title: 'Match & schedule',
              desc: "When both parties swipe right it's a match — schedule an interview instantly.",
              icon: Clock,
            },
          ].map(({ step, title, desc, icon: Icon }) => (
            <div key={step} className="bg-slate-800 rounded-2xl p-6">
              <div className="text-orange-400 font-black text-xs tracking-widest mb-3">{step}</div>
              <Icon className="text-orange-400 mb-3" size={28} />
              <h3 className="font-bold text-lg mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-black text-center mb-4">Simple pricing</h2>
        <p className="text-slate-400 text-center mb-12">
          A fraction of Indeed or LinkedIn. Candidates always free.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="text-orange-400" size={24} />
              <span className="font-bold text-lg">Pay Per Post</span>
            </div>
            <div className="text-4xl font-black mb-1">$20 <span className="text-slate-400 text-lg font-normal">/post</span></div>
            <p className="text-slate-400 text-sm mb-6">Perfect for occasional hiring needs.</p>
            <ul className="space-y-2 text-sm text-slate-300">
              {['1 active job posting', 'Candidate swipe feed', 'Match notifications', 'Swipe history saved'].map(f => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/auth/signup?role=employer&plan=per_post" className="mt-8 block text-center bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-xl transition-colors">
              Get started
            </Link>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-3 right-3 bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
              POPULAR
            </div>
            <div className="flex items-center gap-3 mb-4">
              <Zap className="text-white" size={24} />
              <span className="font-bold text-lg text-white">Unlimited</span>
            </div>
            <div className="text-4xl font-black mb-1 text-white">$175 <span className="text-orange-100 text-lg font-normal">/month</span></div>
            <p className="text-orange-100 text-sm mb-6">Post as many jobs as you need.</p>
            <ul className="space-y-2 text-sm text-white">
              {['Unlimited job postings', 'Candidate swipe feed', 'Match notifications', 'Swipe history saved', 'Priority placement'].map(f => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-white/70">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/auth/signup?role=employer&plan=unlimited" className="mt-8 block text-center bg-white text-orange-600 font-bold py-3 rounded-xl hover:bg-orange-50 transition-colors">
              Start free trial
            </Link>
          </div>
        </div>
        <p className="text-slate-500 text-center text-xs mt-6">
          Enterprise plans available for large volume hiring. Contact us.
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
        <span className="text-orange-400 font-black">CRUIT</span> &nbsp;·&nbsp; Indeed meets Tinder &nbsp;·&nbsp;
        <span>Made for fast hiring</span>
      </footer>
    </main>
  );
}
