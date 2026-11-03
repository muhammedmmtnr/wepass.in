'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShieldAlert,
  Store,
  CreditCard,
  BarChart3,
  ScrollText,
  LogOut,
  ChevronRight,
  Shield,
  Layers,
} from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await fetch('/api/auth/sign-out', { method: 'POST' });
    router.push('/login');
  };

  const navLinks = [
    { label: 'Platform Analytics', href: '/admin', icon: BarChart3 },
    { label: 'Restaurants Directory', href: '/admin/restaurants', icon: Store },
    { label: 'Plans & Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
    { label: 'Global Audit Trail', href: '/admin/audit', icon: ScrollText },
  ];

  return (
    <div className="flex min-h-screen bg-[#F0F5F2] text-slate-800">
      {/* Super-admin sidebar */}
      <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-slate-200 bg-white p-5 shadow-sm">
        <div className="space-y-6">
          <BrandLogo size="md" />

          {/* Super admin badge */}
          <div className="rounded-2xl bg-amber-50 border border-amber-200/80 p-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-amber-700" />
              <span className="text-xs font-black uppercase tracking-wider text-amber-900">
                Super Admin Panel
              </span>
            </div>
            <p className="text-[10px] text-amber-700 mt-1">Platform Operations Control</p>
          </div>

          <nav className="space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="h-3.5 w-3.5 opacity-70" />}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
          >
            <span>Exit Platform Ops</span>
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* Main pane */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <BrandLogo size="sm" />
          <Link
            href="/admin/restaurants"
            className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1.5 rounded-lg"
          >
            Restaurants
          </Link>
        </header>

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
