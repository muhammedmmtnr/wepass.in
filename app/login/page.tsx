'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    } catch {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F3F6F4] px-4 py-8 sm:px-6 sm:py-12">
      <main className="mx-auto w-full max-w-[460px] overflow-hidden rounded-[28px] border border-[#E1E9E3] bg-white shadow-[0_24px_70px_rgba(17,58,39,0.12)]">
        <section className="relative isolate overflow-hidden bg-[#0B3829] px-6 pb-8 pt-7 text-white sm:px-9 sm:pb-10 sm:pt-8">
          <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-32 -z-10 h-80 w-80 rounded-full border border-white/[0.08]" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-24 -z-10 h-[26rem] w-[26rem] rounded-full border border-white/[0.05]" />
          <BrandLogo size="sm" tone="light" className="mb-7" />
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-200">Restaurant portal</p>
          <h1 className="max-w-sm text-[clamp(1.7rem,7vw,2.1rem)] font-semibold leading-tight tracking-[-0.045em]">
            One account for your restaurant.
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-6 text-emerald-50/75">
            Use one secure sign-in for your restaurant account. We’ll open the right workspace for your access.
          </p>
        </section>

        <section className="px-6 py-7 sm:px-9 sm:py-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold tracking-tight text-[#102A20] sm:text-2xl">Welcome to WePass</h2>
            <p className="mt-1 text-sm text-[#69766F]">Sign in to continue to your account.</p>
          </div>

          {error && (
            <div role="alert" className="mb-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-sm font-semibold text-[#34443B]">
                Email address
              </label>
              <div className="relative rounded-xl border border-[#DDE6E0] bg-white transition focus-within:border-[#237A50] focus-within:ring-4 focus-within:ring-[#237A50]/10">
                <Mail aria-hidden="true" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#89958E]" />
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@restaurant.com"
                  className="h-12 w-full rounded-xl bg-transparent pl-10 pr-3 text-base text-[#17231D] outline-none placeholder:text-[#9AA69F]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="mb-1.5 block text-sm font-semibold text-[#34443B]">
                Password
              </label>
              <div className="relative rounded-xl border border-[#DDE6E0] bg-white transition focus-within:border-[#237A50] focus-within:ring-4 focus-within:ring-[#237A50]/10">
                <Lock aria-hidden="true" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#89958E]" />
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-12 w-full rounded-xl bg-transparent py-2 pl-10 pr-12 text-base text-[#17231D] outline-none placeholder:text-[#9AA69F]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-[#69766F] transition hover:bg-[#F3F6F4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#237A50]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#087C50] px-4 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(8,124,80,0.18)] transition hover:bg-[#066641] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in…' : <>Sign in <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          <p className="mt-6 border-t border-[#E9EFEB] pt-5 text-center text-sm text-[#69766F]">
            New to WePass?{' '}
            <Link href="/register" className="font-bold text-[#087C50] hover:underline">
              Register your restaurant
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
