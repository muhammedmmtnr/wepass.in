'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Store,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Utensils,
  AlertCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [category, setCategory] = useState('Casual Dining');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !restaurantName) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone.trim(),
          restaurantName: restaurantName.trim(),
          category,
          city: city.trim(),
          address: address.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-[#E8F3EC] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-lg">
        <div className="mb-6 text-center">
          <BrandLogo size="lg" showSubtitle />
        </div>

        <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-premium border border-white/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Register Your Restaurant
              </h2>
              <p className="text-xs text-slate-500">
                Receive one permanent static QR code and start managing your waitlist today.
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-wepass-100 text-wepass-700">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Owner Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-3 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-wepass-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-wepass-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-3 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-wepass-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-wepass-500 transition"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="owner@restaurant.com"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-3 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-wepass-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-wepass-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-3 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-wepass-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-wepass-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Restaurant Info */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Restaurant Brand Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  placeholder="Your restaurant name"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-3 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-wepass-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-wepass-500 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Dining Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs font-medium text-slate-900 focus:border-wepass-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-wepass-500 transition"
                >
                  <option value="Casual Dining">Casual Dining</option>
                  <option value="Fine Dining">Fine Dining</option>
                  <option value="Cafe & Bistro">Cafe &amp; Bistro</option>
                  <option value="Brewery & Pub">Brewery &amp; Pub</option>
                  <option value="Fast Casual">Fast Casual</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Bengaluru, Mumbai"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-wepass-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-wepass-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Street Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="142 Indiranagar 100ft Road"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-wepass-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-wepass-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-wepass-600 to-wepass-500 py-3.5 text-xs font-black text-white shadow-premium hover:from-wepass-700 hover:to-wepass-600 active:scale-[0.99] transition disabled:opacity-50"
            >
              {loading ? 'Creating Your Account...' : 'Complete Registration & Get QR Code →'}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-wepass-600" />
            <span>Includes 7-day Free Trial of WePass PRO</span>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-wepass-700 hover:underline">
            Sign In →
          </Link>
        </p>
      </div>
    </div>
  );
}
