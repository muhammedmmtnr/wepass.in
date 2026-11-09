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
    sm: { img: 'h-7 w-7 sm:h-8 sm:w-8', text: 'text-xl sm:text-2xl' },
    md: { img: 'h-8 w-8 sm:h-10 sm:w-10', text: 'text-2xl sm:text-3xl' },
    lg: { img: 'h-10 w-10 sm:h-12 sm:w-12', text: 'text-3xl sm:text-4xl' },
  };

  const current = sizeMap[size];

  return (
    <Link href="/" className={`group inline-flex min-w-0 items-center gap-2 sm:gap-3 ${className}`}>
      <div className={`relative shrink-0 overflow-hidden rounded-lg transition-transform group-hover:scale-[1.02] ${current.img}`}>
        <Image
          src="/brand/wepass-icon.png"
          alt=""
          fill
          sizes="(max-width: 640px) 32px, 48px"
          className="object-cover"
          priority
        />
      </div>

      <div className="flex min-w-0 flex-col leading-none">
        <span className={`whitespace-nowrap lowercase font-black tracking-[-0.08em] ${tone === 'light' ? 'text-white' : 'text-[#0F172A]'} ${current.text}`}>
          wepass
        </span>
        {showSubtitle && (
          <span className={`mt-1 whitespace-nowrap text-[9px] font-medium sm:text-[11px] ${tone === 'light' ? 'text-white/60' : 'text-slate-400'}`}>
            Your Queue. Your Time. Your Table.
          </span>
        )}
      </div>
    </Link>
  );
}
