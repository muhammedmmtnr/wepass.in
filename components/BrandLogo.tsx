'use client';

import Link from 'next/link';
import { useId } from 'react';

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
    sm: { img: 32, text: 'text-2xl' },
    md: { img: 44, text: 'text-4xl' },
    lg: { img: 56, text: 'text-5xl' },
  };

  const current = sizeMap[size];
  const gradientId = useId().replace(/:/g, '');
  const edgeId = `${gradientId}-edge`;

  return (
    <Link href="/" className={`inline-flex items-center gap-3 group ${className}`}>
      <div className="relative flex items-center justify-center transition-transform group-hover:scale-[1.02]">
        <svg
          width={current.img}
          height={current.img}
          viewBox="0 0 512 512"
          aria-label="WePass logo"
          role="img"
          className="drop-shadow-[0_12px_18px_rgba(8,158,92,0.15)]"
        >
          <defs>
            <linearGradient id={gradientId} x1="82" y1="78" x2="430" y2="430" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#1EDB8C"/>
              <stop offset="0.55" stopColor="#0BBE72"/>
              <stop offset="1" stopColor="#078F57"/>
            </linearGradient>
            <linearGradient id={edgeId} x1="120" y1="80" x2="430" y2="420" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#1AE481"/>
              <stop offset="1" stopColor="#078652"/>
            </linearGradient>
          </defs>

          <path d="M102 90C102 74.536 114.536 62 130 62H330C360.928 62 386 87.072 386 118V144C405.882 148.504 420 165.773 420 186C420 206.227 405.882 223.496 386 228V254C386 284.928 360.928 310 330 310H130C114.536 310 102 297.464 102 282V254C82.118 249.496 68 232.227 68 212C68 191.773 82.118 174.504 102 170V144C82.118 139.496 68 122.227 68 102C68 81.773 82.118 64.504 102 60V90Z" fill={`url(#${gradientId})`} />
          <path d="M374 90H410C442.032 90 468 115.968 468 148V150C456.5 153.974 448 165.549 448 178.5C448 191.451 456.5 203.026 468 207V210C468 242.032 442.032 268 410 268H374V90Z" fill={`url(#${edgeId})`} opacity="0.72" />
          <path d="M374 266H410C442.032 266 468 291.968 468 324V326C456.5 329.974 448 341.549 448 354.5C448 367.451 456.5 379.026 468 383V385C468 417.032 442.032 443 410 443H374V266Z" fill={`url(#${edgeId})`} opacity="0.72" />
          <path d="M362 118H306C282.804 118 264 136.804 264 160V216C264 238.091 281.909 256 304 256H395V118H362Z" fill="white" opacity="0.08" />
          <path d="M363 253H304C281.909 253 264 270.909 264 293V350C264 372.091 281.909 390 304 390H395V253H363Z" fill="white" opacity="0.08" />
          <path d="M145 170H283C298.464 170 311 182.536 311 198V214C311 229.464 298.464 242 283 242H145C129.536 242 117 229.464 117 214V198C117 182.536 129.536 170 145 170Z" fill="white" opacity="0.06" />
          <text x="272" y="272" textAnchor="middle" fill="white" fontSize="192" fontWeight="800" fontFamily="Arial, Helvetica, sans-serif" letterSpacing="-12">we</text>
        </svg>
      </div>

      <div className="flex flex-col leading-none">
        <span className={`lowercase font-black tracking-[-0.08em] ${tone === 'light' ? 'text-white' : 'text-[#0F172A]'} ${current.text}`}>
          wepass
        </span>
        {showSubtitle && (
          <span className={`-mt-1 text-[11px] font-medium ${tone === 'light' ? 'text-white/60' : 'text-slate-400'}`}>
            Your Queue. Your Time. Your Table.
          </span>
        )}
      </div>
    </Link>
  );
}
