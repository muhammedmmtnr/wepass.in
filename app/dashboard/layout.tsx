'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Armchair,
  QrCode,
  Utensils,
  BarChart3,
  UserCog,
  Settings,
  CreditCard,
  LogOut,
  ChevronRight,
  ExternalLink,
  Store,
} from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
          setRestaurant(data.user.currentRestaurant);
        } else {
          // If not authenticated, load demo restaurant details so the owner dashboard can be previewed
          const demoRes = await fetch('/api/restaurants/by-slug/olive-bistro');
          const demoData = await demoRes.json();
          setRestaurant(demoData.restaurant);
        }
      } catch (e) {}
    }
    loadUser();
  }, []);

  const handleSignOut = async () => {
    await fetch('/api/auth/sign-out', { method: 'POST' });
    router.push('/login');
  };

  const navLinks = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Staff Queue Desk', href: '/staff', icon: Users, external: false },
    { label: 'Tables & Sections', href: '/dashboard/tables', icon: Armchair },
    { label: 'QR Management', href: '/dashboard/qr', icon: QrCode },
    { label: 'Digital Menu', href: '/dashboard/menu', icon: Utensils },
    { label: 'Analytics & Reports', href: '/dashboard/reports', icon: BarChart3 },
    { label: 'Staff & Roles', href: '/dashboard/staff', icon: UserCog },
    { label: 'Restaurant Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAF9] text-slate-800">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="space-y-6">
          <BrandLogo size="md" showSubtitle />

          {/* Restaurant identity pill */}
          <div className="rounded-2xl bg-wepass-50/80 border border-wepass-200/60 p-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-wepass-600 text-white font-extrabold text-sm">
                <Store className="h-5 w-5" />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {restaurant?.name || 'The Olive Bistro'}
                </p>
                <p className="text-[10px] text-slate-500 font-medium">Owner Portal</p>
              </div>
            </div>
            {restaurant?.slug && (
              <a
                href={`/r/${restaurant.slug}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2.5 flex items-center justify-between rounded-lg bg-white px-2 py-1 text-[11px] font-semibold text-wepass-700 border border-wepass-200/60 hover:bg-wepass-100/50 transition"
              >
                <span>Guest QR Link</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>

          {/* Nav List */}
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
                      ? 'bg-wepass-600 text-white shadow-sm shadow-wepass-600/20'
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

        {/* Bottom Profile & Sign out */}
        <div className="border-t border-slate-100 pt-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="truncate">
              <p className="font-bold text-slate-800 truncate">
                {currentUser?.name || 'Marco Rossi'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {currentUser?.email || 'owner@olivebistro.com'}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600 transition"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <div className="flex items-center justify-between">
            <BrandLogo size="sm" />
            <button
              onClick={handleSignOut}
              aria-label="Sign out"
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-rose-600"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
          <nav aria-label="Owner navigation" className="-mx-1 mt-3 flex gap-1 overflow-x-auto px-1 pb-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    isActive
                      ? 'bg-wepass-600 text-white'
                      : 'bg-slate-50 text-slate-600 hover:bg-wepass-50 hover:text-wepass-700'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
