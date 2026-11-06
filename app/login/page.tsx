'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  KeyRound,
  Store,
  Users,
} from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid credentials');
      } else {
        const role = data.user.role;
        if (role === 'RESTAURANT_OWNER') {
          router.push('/dashboard');
        } else {
          router.push('/staff');
        }
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click quick fill demo credentials
  const fillCredentials = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setError('');
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-[#E8F3EC] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-md">
        {/* Logo Card */}
        <div className="mb-6 text-center">
          <BrandLogo size="lg" showSubtitle />
        </div>

        {/* Login Box */}
        <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-premium border border-white/80">
          <h2 className="text-xl font-black text-slate-900 tracking-tight mb-1">
            Sign In to WePass
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Enter your credentials to access your restaurant operations.
          </p>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@restaurant.com"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-wepass-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-wepass-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-wepass-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-wepass-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-wepass-600 py-3 text-xs font-bold text-white shadow-premium hover:bg-wepass-700 active:scale-[0.99] transition disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In →'}
            </button>
          </form>

          {/* Quick Demo Credentials Switcher */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Quick 1-Click Role Login:
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => fillCredentials('owner@olivebistro.com', 'OwnerPassword123!')}
                className="w-full flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-left text-xs text-slate-700 hover:bg-wepass-50 hover:border-wepass-200 transition"
              >
                <div className="flex items-center gap-2">
                  <Store className="h-4 w-4 text-wepass-600" />
                  <span className="font-bold text-slate-900">Restaurant Owner</span>
                </div>
                <span className="text-[10px] text-slate-400">owner@olivebistro.com</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('staff@olivebistro.com', 'StaffPassword123!')}
                className="w-full flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-left text-xs text-slate-700 hover:bg-amber-50 hover:border-amber-200 transition"
              >
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-amber-600" />
                  <span className="font-bold text-slate-900">Host / Staff</span>
                </div>
                <span className="text-[10px] text-slate-400">staff@olivebistro.com</span>
              </button>

            </div>
          </div>
        </div>

        {/* Footer Link */}
        <p className="mt-6 text-center text-xs text-slate-500">
          Want to register your own restaurant?{' '}
          <Link href="/register" className="font-bold text-wepass-700 hover:underline">
            Register for Free →
          </Link>
        </p>
      </div>
    </div>
  );
}
