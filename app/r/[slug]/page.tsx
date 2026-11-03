'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  Clock,
  MapPin,
  Utensils,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Plus,
  Minus,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

export default function RestaurantLandingPage({
  params,
}: {
  params: { slug: string };
}) {
  const router = useRouter();
  const slug = params.slug;

  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [specialRequests, setSpecialRequests] = useState('');
  const [accessibilityNeeds, setAccessibilityNeeds] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [existingToken, setExistingToken] = useState<string | null>(null);

  // Check if guest already has an active token in localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`wepass_active_token_${slug}`);
      if (saved) {
        setExistingToken(saved);
      }
    } catch {}
  }, [slug]);

  useEffect(() => {
    async function fetchRestaurant() {
      try {
        setLoading(true);
        const res = await fetch(`/api/restaurants/by-slug/${slug}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Failed to load restaurant');
        } else {
          setRestaurant(data.restaurant);
        }
      } catch (err: any) {
        setError('Network error loading restaurant details.');
      } finally {
        setLoading(false);
      }
    }
    fetchRestaurant();
  }, [slug]);

  const handleJoinQueue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!guestPhone.trim() || guestPhone.replace(/[^0-9]/g, '').length < 10) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setFormError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/queue/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: restaurant.id,
          guestName: guestName.trim(),
          guestPhone: guestPhone.trim(),
          partySize,
          specialRequests: specialRequests.trim() || null,
          accessibilityNeeds,
        }),
      });

      const data = await res.json();

      if (res.status === 409) {
        // Duplicate active queue found - save and redirect
        if (data.existingToken) {
          localStorage.setItem(`wepass_active_token_${slug}`, data.existingToken);
          router.push(`/queue/${data.existingToken}?slug=${slug}`);
          return;
        }
      }

      if (!res.ok) {
        setFormError(data.error || 'Unable to join queue right now.');
      } else {
        localStorage.setItem(`wepass_active_token_${slug}`, data.token);
        if (data.sessionSecret) {
          localStorage.setItem(`wepass_secret_${data.token}`, data.sessionSecret);
        }
        router.push(`/queue/${data.token}?slug=${slug}`);
      }
    } catch (err) {
      setFormError('Connection failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#E8F3EC]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-wepass-500 border-t-transparent" />
          <p className="text-sm font-semibold text-wepass-800">Connecting to WePass...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#E8F3EC] p-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-premium border border-slate-100">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Restaurant Not Found</h2>
          <p className="text-sm text-slate-500 mb-6">{error || 'This QR link is inactive or invalid.'}</p>
          <Link
            href="/"
            className="inline-flex rounded-xl bg-wepass-600 px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-wepass-700 transition"
          >
            Go to WePass Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E8F3EC] text-slate-800 pb-16">
      {/* Top WePass Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-wepass-200/50 px-4 py-3">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <BrandLogo size="sm" />
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-wepass-700">Live Waitlist</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pt-4">
        {/* Active Ticket Banner if already joined */}
        {existingToken && (
          <div className="mb-4 flex items-center justify-between rounded-2xl bg-gradient-to-r from-wepass-600 to-wepass-500 p-4 text-white shadow-premium">
            <div>
              <p className="text-[11px] font-semibold text-wepass-100 uppercase tracking-wider">
                Active Ticket Detected
              </p>
              <p className="text-lg font-extrabold tracking-tight">Token {existingToken}</p>
            </div>
            <Link
              href={`/queue/${existingToken}?slug=${slug}`}
              className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-wepass-700 shadow hover:bg-wepass-50 transition"
            >
              View My Spot →
            </Link>
          </div>
        )}

        {/* Restaurant Card */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-premium border border-white/60 mb-5">
          {/* Banner */}
          <div className="relative h-44 w-full bg-slate-100">
            {restaurant.bannerUrl ? (
              <img
                src={restaurant.bannerUrl}
                alt={restaurant.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-wepass-600 to-emerald-800 text-white font-extrabold text-2xl">
                {restaurant.name}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
              <div>
                <span className="rounded-full bg-white/20 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider text-emerald-200">
                  {restaurant.category || 'Dining'}
                </span>
                <h1 className="text-xl font-black tracking-tight drop-shadow-sm mt-0.5">
                  {restaurant.name}
                </h1>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
              <MapPin className="h-4 w-4 text-wepass-600 shrink-0" />
              <span className="truncate">
                {restaurant.address ? `${restaurant.address}, ` : ''}
                {restaurant.city || 'Bengaluru'}
              </span>
            </div>

            {/* Live Queue Status Strip */}
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-wepass-50 border border-wepass-200/60 p-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-wepass-500/10 text-wepass-700">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                    In Queue
                  </p>
                  <p className="text-base font-extrabold text-slate-900">
                    {restaurant.waitingCount} {restaurant.waitingCount === 1 ? 'party' : 'parties'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 border-l border-wepass-200/60 pl-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-weamber-500/10 text-weamber-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                    Est. Wait
                  </p>
                  <p className="text-base font-extrabold text-slate-900">
                    ~{restaurant.estimatedWaitMinutes} mins
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Menu Link */}
            {restaurant.menuCategories && restaurant.menuCategories.length > 0 && (
              <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 p-2.5 text-xs text-slate-600 border border-slate-100 hover:bg-slate-100 transition">
                <span className="flex items-center gap-2 font-medium">
                  <Utensils className="h-4 w-4 text-wepass-600" /> Browse Digital Menu
                </span>
                <Link
                  href={`/menu/${slug}`}
                  className="font-bold text-wepass-700 flex items-center gap-0.5"
                >
                  View Menu <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Join Queue Form Card */}
        {restaurant.isQueueOpen ? (
          <div className="rounded-3xl bg-white p-5 md:p-6 shadow-premium border border-white/60">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Join the Waitlist</h2>
                <p className="text-xs text-slate-500">No need to stand outside. We’ll notify your phone.</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-wepass-100 text-wepass-700">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>

            {formError && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-medium text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleJoinQueue} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Guest Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-wepass-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-wepass-500/20 transition"
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    +91
                  </div>
                  <input
                    type="tel"
                    required
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="98765 43210"
                    maxLength={14}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-12 pr-4 py-3 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-wepass-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-wepass-500/20 transition"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Used exclusively for live queue updates and table notification.
                </p>
              </div>

              {/* Party Size Stepper */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Party Size (Guests) <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/50 p-2">
                  <button
                    type="button"
                    onClick={() => setPartySize(Math.max(1, partySize - 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm text-slate-700 hover:bg-slate-100 active:scale-95 transition"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="text-center">
                    <span className="text-xl font-black text-slate-900">{partySize}</span>
                    <span className="ml-1 text-xs font-semibold text-slate-500">
                      {partySize === 1 ? 'Guest' : 'Guests'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPartySize(Math.min(restaurant.maxPartySize || 12, partySize + 1))
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm text-slate-700 hover:bg-slate-100 active:scale-95 transition"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Special Request (Optional)
                </label>
                <input
                  type="text"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="e.g. High chair, birthday, window seat..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-wepass-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-wepass-500 transition"
                />
              </div>

              {/* Accessibility Checkbox */}
              <label className="flex items-center gap-2.5 rounded-xl bg-wepass-50/50 border border-wepass-200/50 p-3 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={accessibilityNeeds}
                  onChange={(e) => setAccessibilityNeeds(e.target.checked)}
                  className="rounded text-wepass-600 focus:ring-wepass-500"
                />
                <span className="font-medium text-slate-700">
                  Accessibility accommodation needed (wheelchair, ground floor)
                </span>
              </label>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl bg-gradient-to-r from-wepass-600 to-wepass-500 py-3.5 text-sm font-extrabold text-white shadow-premium shadow-wepass-500/25 hover:from-wepass-700 hover:to-wepass-600 active:scale-[0.99] transition disabled:opacity-50"
              >
                {submitting ? 'Securing Your Spot...' : 'Join Waitlist Now'}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5 text-wepass-600" />
                <span>Fair queue ordering powered by WePass</span>
              </div>
            </form>
          </div>
        ) : (
          <div className="rounded-3xl bg-white p-8 text-center shadow-premium border border-slate-100">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <Clock className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Queue Temporarily Closed</h3>
            <p className="text-xs text-slate-500">
              The restaurant host has paused online waitlist registrations for this shift. Please speak directly with the host at the entrance.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
