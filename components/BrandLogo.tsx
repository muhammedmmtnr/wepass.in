'use client';

import Link from 'next/link';
import Image from 'next/image';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export default function BrandLogo({ className = '', size = 'md', showSubtitle = false }: BrandLogoProps) {
  const sizeMap = {
    sm: { img: 28, text: 'text-lg', badge: 'text-[9px] px-1.5 py-0.5' },
    md: { img: 36, text: 'text-2xl', badge: 'text-[10px] px-2 py-0.5' },
    lg: { img: 48, text: 'text-3xl', badge: 'text-xs px-2.5 py-1' },
  };

  const current = sizeMap[size];

  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 group ${className}`}>
      <div className="relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-wepass-600 to-wepass-500 shadow-sm shadow-wepass-500/20 p-1.5 transition-transform group-hover:scale-105">
        <svg
          className="text-white"
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
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`font-extrabold tracking-tight text-slate-900 ${current.text}`}>
            We<span className="text-wepass-600">Pass</span>
          </span>
          <span className={`rounded-full bg-wepass-100 font-semibold text-wepass-700 ${current.badge}`}>
            PRO
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[11px] font-medium text-slate-400 -mt-0.5">
            Your Queue. Your Time. Your Table.
          </span>
        )}
      </div>
    </Link>
  );
}
