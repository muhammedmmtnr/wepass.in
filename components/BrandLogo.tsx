'use client';

import Link from 'next/link';
import Image from 'next/image';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  tone?: 'dark' | 'light';
}

export default function BrandLogo({
  className = '',
  size = 'md',
  showSubtitle = false,
  tone = 'dark',
}: BrandLogoProps) {
  const sizeMap = {
    sm: { img: 28, text: 'text-lg' },
    md: { img: 36, text: 'text-2xl' },
    lg: { img: 48, text: 'text-3xl' },
  };

  const current = sizeMap[size];

  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 group ${className}`}>
      <div className="relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-wepass-600 to-wepass-500 shadow-sm shadow-wepass-500/20 p-1.5 transition-transform group-hover:scale-105">
        <svg
          className="hidden"
          width={current.img - 10}
          height={current.img - 10}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
          <path d="M13 5v2" />
          <path d="M13 17v2" />
          <path d="M13 11v2" />
        </svg>
        <Image
          src="/brand/logo-card.png"
          alt="WePass ticket logo"
          width={current.img - 10}
          height={current.img - 10}
          className="rounded-lg object-cover"
        />
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`font-extrabold tracking-tight ${tone === 'light' ? 'text-white' : 'text-slate-900'} ${current.text}`}>
            We<span className={tone === 'light' ? 'text-wepass-200' : 'text-wepass-600'}>Pass</span>
          </span>
        </div>
        {showSubtitle && (
          <span className={`-mt-0.5 text-[11px] font-medium ${tone === 'light' ? 'text-white/60' : 'text-slate-400'}`}>
            Your Queue. Your Time. Your Table.
          </span>
        )}
      </div>
    </Link>
  );
}
