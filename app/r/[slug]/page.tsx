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
  const [customPartyOpen, setCustomPartyOpen] = useState(false);
  const [customPartySize, setCustomPartySize] = useState('');
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
          setPartySize(Math.min(2, data.restaurant.maxPartySize || 12));
        }
      } catch {
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

      if (!res.ok) {
        setFormError(data.error || 'Unable to join queue right now.');
      } else {
        localStorage.setItem(`wepass_active_token_${slug}`, data.token);
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

  const maxPartySize = restaurant.maxPartySize || 12;

  return (
    <div className="min-h-screen bg-[#F4F6F5] text-slate-800 pb-12">
      {/* Top WePass Header */}
      <header className="sticky top-0 z-40 border-b border-[#E1E9E3] bg-white/90 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <BrandLogo size="sm" />
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-[#237A50]">Live waitlist</span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg px-4 pb-8 pt-4 sm:px-5 sm:pt-6">
        {/* Active Ticket Banner if already joined */}
        {existingToken && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#0B3829] p-4 text-white">
            <div>
              <p className="text-[11px] font-semibold text-wepass-100 uppercase tracking-wider">
                Active Ticket Detected
              </p>
              <p className="text-lg font-extrabold tracking-tight">Token {existingToken}</p>
            </div>
            <Link
              href={`/queue/${existingToken}?slug=${slug}`}
              className="inline-flex min-h-11 items-center rounded-xl bg-white px-4 py-2 text-xs font-bold text-[#087C50] transition hover:bg-[#E8F3EC]"
            >
              View My Spot →
            </Link>
          </div>
        )}

        {/* Restaurant Card */}
        <section className="mb-4 overflow-hidden rounded-2xl border border-[#E2E9E4] bg-white">
          <div className="flex items-center gap-3.5 p-4 sm:p-5">
            {restaurant.bannerUrl ? (
              <img
                src={restaurant.bannerUrl}
                alt=""
                className="h-14 w-14 shrink-0 rounded-2xl object-cover"
              />
            ) : (
              <div aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#E8F3EC] text-sm font-bold text-[#237A50]">
                {restaurant.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#237A50]">You’re joining</p>
              <h1 className="mt-0.5 truncate text-base font-bold text-[#17231D] sm:text-lg">{restaurant.name}</h1>
              {restaurant.category && <p className="mt-0.5 truncate text-xs text-[#69766F]">{restaurant.category}</p>}
              {(restaurant.address || restaurant.city) && (
                <p className="mt-1 flex min-w-0 items-center gap-1 text-[11px] text-[#89958E]">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{[restaurant.address, restaurant.city].filter(Boolean).join(', ')}</span>
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-[#E9EFEB] bg-[#FAFCFA] p-3 sm:p-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8F3EC] text-[#237A50]">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#69766F]">
                    In queue
                  </p>
                  <p className="text-sm font-bold text-[#17231D] sm:text-base">
                    {restaurant.waitingCount} {restaurant.waitingCount === 1 ? 'party' : 'parties'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 border-l border-[#E1E9E3] pl-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F7F1E3] text-[#AD8C43]">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#69766F]">
                    Est. wait
                  </p>
                  <p className="text-sm font-bold text-[#17231D] sm:text-base">
                    ~{restaurant.estimatedWaitMinutes} min
                  </p>
                </div>
              </div>
          </div>

          {restaurant.menuCategories && restaurant.menuCategories.length > 0 && (
            <Link
              href={`/menu/${slug}`}
              className="flex min-h-11 items-center justify-between border-t border-[#E9EFEB] px-4 text-xs font-semibold text-[#34443B] transition hover:bg-[#FAFCFA]"
            >
              <span className="flex items-center gap-2"><Utensils className="h-4 w-4 text-[#237A50]" /> Browse digital menu</span>
              <span className="flex items-center gap-1 text-[#087C50]">View menu <ChevronRight className="h-3.5 w-3.5" /></span>
            </Link>
          )}
        </section>

        {/* Join Queue Form Card */}
        {restaurant.isQueueOpen ? (
          <section className="rounded-2xl border border-[#E2E9E4] bg-white p-4 shadow-[0_8px_24px_rgba(23,35,29,0.04)] sm:p-6">
            <div className="mb-5 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8F3EC] text-[#237A50]">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-[#17231D]">Join the Queue</h2>
                <p className="mt-1 text-xs leading-5 text-[#69766F]">
                  Share a few details to join {restaurant.name}’s live waitlist.
                </p>
              </div>
            </div>

            {formError && (
              <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleJoinQueue} className="space-y-4">
              {/* Name */}
              <div>
                <label htmlFor="guest-name" className="mb-1.5 block text-sm font-semibold text-[#34443B]">
                  Your name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="guest-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Enter your name"
                  className="h-12 w-full rounded-xl border border-[#DDE6E0] bg-white px-3.5 text-base font-medium text-[#17231D] outline-none transition placeholder:text-[#9AA69F] focus:border-[#237A50] focus:ring-4 focus:ring-[#237A50]/10"
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label htmlFor="guest-phone" className="mb-1.5 block text-sm font-semibold text-[#34443B]">
                  Mobile number <span className="text-rose-500">*</span>
                </label>
                <div className="flex h-12 items-center rounded-xl border border-[#DDE6E0] bg-white px-3.5 transition focus-within:border-[#237A50] focus-within:ring-4 focus-within:ring-[#237A50]/10">
                  <span className="mr-3 border-r border-[#E1E9E3] pr-3 text-sm font-semibold text-[#69766F]">+91</span>
                  <input
                    id="guest-phone"
                    name="tel"
                    type="tel"
                    autoComplete="tel-national"
                    inputMode="tel"
                    required
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    maxLength={14}
                    className="h-full min-w-0 flex-1 bg-transparent text-base font-medium text-[#17231D] outline-none placeholder:text-[#9AA69F]"
                  />
                </div>
                <p className="mt-1.5 text-[11px] leading-4 text-[#89958E]">
                  Used for your queue ticket and table updates.
                </p>
              </div>

              {/* Party size */}
              <div>
                <div className="mb-2 flex items-baseline justify-between gap-2">
                  <label className="block text-sm font-semibold text-[#34443B]">
                    Party size <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-[#89958E]">Up to {maxPartySize} guests</span>
                </div>
                <p className="mb-2 text-xs text-[#89958E]">How many people are in your party?</p>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((size) => (
                    <button
                      key={size}
                      type="button"
                      aria-pressed={!customPartyOpen && partySize === size}
                      disabled={size > maxPartySize}
                      onClick={() => {
                        setPartySize(size);
                        setCustomPartyOpen(false);
                      }}
                      className={`min-h-11 rounded-xl border text-sm font-semibold transition ${
                        !customPartyOpen && partySize === size
                          ? 'border-[#087C50] bg-[#087C50] text-white'
                          : 'border-[#DDE6E0] bg-white text-[#34443B] hover:bg-[#F7FAF8]'
                      } disabled:cursor-not-allowed disabled:opacity-40`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {maxPartySize > 4 && (
                  <div className="mt-2">
                    <button
                      type="button"
                      aria-expanded={customPartyOpen}
                      onClick={() => {
                        setCustomPartyOpen((open) => {
                          if (!open) setCustomPartySize(partySize > 4 ? String(partySize) : '');
                          return !open;
                        });
                      }}
                      className={`min-h-10 rounded-xl border px-3.5 text-xs font-semibold transition ${
                        customPartyOpen
                          ? 'border-[#237A50] bg-[#E8F3EC] text-[#087C50]'
                          : 'border-[#DDE6E0] text-[#34443B] hover:bg-[#F7FAF8]'
                      }`}
                    >
                      Custom party size
                    </button>
                    {customPartyOpen && (
                      <input
                        type="number"
                        inputMode="numeric"
                        min={5}
                        max={maxPartySize}
                        value={customPartySize}
                        onChange={(event) => {
                          const value = event.target.value;
                          setCustomPartySize(value);
                          const parsed = Number(value);
                          if (Number.isInteger(parsed) && parsed >= 5 && parsed <= maxPartySize) {
                            setPartySize(parsed);
                          }
                        }}
                        aria-label="Custom party size"
                        placeholder={`5–${maxPartySize} guests`}
                        className="mt-2 h-12 w-full rounded-xl border border-[#DDE6E0] px-3.5 text-base text-[#17231D] outline-none focus:border-[#237A50] focus:ring-4 focus:ring-[#237A50]/10"
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Special Requests */}
              <div>
                <label htmlFor="guest-request" className="mb-1.5 block text-sm font-semibold text-[#34443B]">
                  Special request <span className="font-normal text-[#89958E]">(optional)</span>
                </label>
                <input
                  id="guest-request"
                  name="special-request"
                  type="text"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Add a note for the restaurant"
                  className="h-12 w-full rounded-xl border border-[#DDE6E0] bg-white px-3.5 text-base text-[#17231D] outline-none transition placeholder:text-[#9AA69F] focus:border-[#237A50] focus:ring-4 focus:ring-[#237A50]/10"
                />
              </div>

              {/* Accessibility Checkbox */}
              <label className="flex min-h-12 cursor-pointer items-start gap-2.5 rounded-xl border border-[#DDE6E0] bg-[#FAFCFA] p-3 text-xs text-[#34443B]">
                <input
                  type="checkbox"
                  checked={accessibilityNeeds}
                  onChange={(e) => setAccessibilityNeeds(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded accent-[#087C50] focus:ring-[#237A50]"
                />
                <span className="font-medium leading-5">
                  I need an accessibility accommodation
                </span>
              </label>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full min-h-12 rounded-xl bg-[#087C50] px-4 py-3.5 text-sm font-bold text-white transition hover:bg-[#066641] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? 'Joining the queue…' : 'Confirm & Join Queue'}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#89958E]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#237A50]" />
                <span>Fair queue ordering, powered by WePass</span>
              </div>
            </form>
          </section>
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
