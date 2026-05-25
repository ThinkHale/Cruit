import Link from 'next/link';
import clsx from 'clsx';

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={clsx(
        'inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500 text-lg font-black text-white shadow-lg shadow-orange-500/20',
        className
      )}
      aria-hidden="true"
    >
      C
    </span>
  );
}

export function BrandLockup({ href = '/', compact = false }: { href?: string; compact?: boolean }) {
  return (
    <Link href={href} className="inline-flex items-center gap-3">
      <BrandMark className={compact ? 'h-9 w-9 rounded-xl text-base' : undefined} />
      <span className="leading-none">
        <span className="block text-xl font-black tracking-tight text-white">Cruit</span>
        {!compact && <span className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300">Fast hiring</span>}
      </span>
    </Link>
  );
}
