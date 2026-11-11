'use client';

import React, { useEffect, useState } from 'react';
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
  LogOut,
  ChevronRight,
  ExternalLink,
  Store,
  Menu,
  X,
} from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import { DashboardRestaurantProvider } from '@/components/DashboardRestaurantContext';

type RestaurantSummary = {
  id: string;
  name: string;
  slug: string;
};

type CurrentUser = {
  name: string;
  email: string;
  currentRestaurant: RestaurantSummary | null;
};

type AuthStatus = 'loading' | 'ready' | 'error';

const navLinks = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Staff Queue Desk', href: '/staff', icon: Users },
  { label: 'Tables & Sections', href: '/dashboard/tables', icon: Armchair },
  { label: 'QR Management', href: '/dashboard/qr', icon: QrCode },
  { label: 'Digital Menu', href: '/dashboard/menu', icon: Utensils },
  { label: 'Analytics & Reports', href: '/dashboard/reports', icon: BarChart3 },
  { label: 'Staff & Roles', href: '/dashboard/staff', icon: UserCog },
  { label: 'Restaurant Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<RestaurantSummary | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function loadUser() {
      try {
        const response = await fetch('/api/auth/me', { signal: controller.signal });
        const data = await response.json();
        if (!response.ok || !data.authenticated || !data.user) {
          router.replace('/login');
          return;
        }

        setCurrentUser(data.user);
        setRestaurant(data.user.currentRestaurant ?? null);
        setAuthStatus('ready');
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
        console.error('Dashboard session request failed:', error);
        setAuthStatus('error');
      }
    }

    loadUser();
    return () => controller.abort();
  }, [router]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    setActionError('');
    try {
      const response = await fetch('/api/auth/sign-out', { method: 'POST' });
      if (!response.ok) throw new Error('Unable to sign out.');
      router.replace('/login');
      router.refresh();
    } catch (error) {
      console.error('Dashboard sign-out failed:', error);
      setActionError('We could not sign you out. Please try again.');
    }
  };

  if (authStatus === 'loading') {
    return (
      <div role="status" className="flex min-h-screen items-center justify-center bg-[#F8FAF9]">
        <span className="sr-only">Checking your account</span>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-wepass-500 border-t-transparent" />
      </div>
    );
  }

  if (authStatus === 'error') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8FAF9] px-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-subtle">
          <h1 className="text-xl font-bold text-slate-900">Dashboard unavailable</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            We could not verify your account. Check your connection and try again.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 min-h-11 rounded-full bg-wepass-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-wepass-600"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  if (!restaurant) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8FAF9] px-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-subtle">
          <Store className="mx-auto h-9 w-9 text-wepass-600" aria-hidden="true" />
          <h1 className="mt-4 text-xl font-bold text-slate-900">No restaurant connected</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            This account is not associated with a restaurant yet. Register your restaurant to continue.
          </p>
          <Link
            href="/business-registration"
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-wepass-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-wepass-600"
          >
            Register a restaurant
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAF9] text-slate-800">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between overflow-y-auto border-r border-slate-200/80 bg-white p-5 shadow-sm lg:flex">
        <div className="space-y-6">
          <BrandLogo size="md" showSubtitle />

          <div className="rounded-2xl border border-wepass-200/60 bg-wepass-50/80 p-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-wepass-600 text-sm font-extrabold text-white">
                <Store className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 truncate">
                <p className="truncate text-xs font-bold text-slate-900">{restaurant.name}</p>
                <p className="text-[10px] font-medium text-slate-500">Restaurant Portal</p>
              </div>
            </div>
            <a
              href={`/r/${restaurant.slug}`}
              target="_blank"
              rel="noreferrer"
              className="mt-2.5 flex min-h-9 items-center justify-between rounded-lg border border-wepass-200/60 bg-white px-2 py-1 text-[11px] font-semibold text-wepass-700 transition hover:bg-wepass-100/50"
            >
              <span>Guest QR Link</span>
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          </div>

          <nav aria-label="Owner navigation" className="space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex min-h-11 items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition ${
                    isActive
                      ? 'bg-wepass-600 text-white shadow-sm shadow-wepass-600/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </span>
                  {isActive && <ChevronRight className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-3 border-t border-slate-100 pt-4">
          {actionError && <p role="alert" className="text-xs text-rose-700">{actionError}</p>}
          <div className="flex items-center justify-between gap-2 text-xs">
            <div className="min-w-0 truncate">
              <p className="truncate font-bold text-slate-800">{currentUser?.name}</p>
              <p className="truncate text-[10px] text-slate-400">{currentUser?.email}</p>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              title="Sign out"
              aria-label="Sign out"
              className="min-h-10 min-w-10 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-rose-600"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <div className="flex min-h-10 items-center justify-between gap-3">
            <BrandLogo size="sm" />
            <span className="min-w-0 flex-1 truncate text-right text-xs font-semibold text-slate-600 sm:text-left">
              {restaurant.name}
            </span>
            <button
              type="button"
              aria-label={mobileNavOpen ? 'Close owner navigation' : 'Open owner navigation'}
              aria-expanded={mobileNavOpen}
              aria-controls="mobile-owner-navigation"
              onClick={() => setMobileNavOpen((open) => !open)}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 focus-visible:outline"
            >
              {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              aria-label="Sign out"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-rose-600"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          {mobileNavOpen && (
            <nav
              id="mobile-owner-navigation"
              aria-label="Owner navigation"
              className="mobile-menu-panel absolute inset-x-0 top-full max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-slate-200 bg-white p-3 shadow-lg"
            >
              <div className="mx-auto grid max-w-3xl gap-1 sm:grid-cols-2">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={isActive ? 'page' : undefined}
                      className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                        isActive
                          ? 'bg-wepass-600 text-white'
                          : 'text-slate-700 hover:bg-wepass-50 hover:text-wepass-800'
                      }`}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {item.label}
                    </Link>
                  );
                })}
                <a
                  href={`/r/${restaurant.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-wepass-50 hover:text-wepass-800"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  Guest QR Link
                </a>
              </div>
            </nav>
          )}
        </header>

        {actionError && (
          <p role="alert" className="bg-rose-50 px-4 py-2 text-center text-xs text-rose-700 lg:hidden">
            {actionError}
          </p>
        )}
        <main className="min-w-0 flex-1">
          <DashboardRestaurantProvider restaurant={restaurant}>{children}</DashboardRestaurantProvider>
        </main>
      </div>
    </div>
  );
}
