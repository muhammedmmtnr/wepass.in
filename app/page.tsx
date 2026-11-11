'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Armchair,
  BellRing,
  Check,
  ChevronDown,
  Clock3,
  CircleCheck,
  Instagram,
  MapPin,
  MessageCircle,
  Menu,
  QrCode,
  ShieldCheck,
  Smartphone,
  TicketCheck,
  Timer,
  UsersRound,
  X,
} from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

type ProofStats = {
  activeRestaurants: number;
  partiesWaiting: number;
  guestsServed: number;
  averageWaitMinutes: number | null;
};

const faqs = [
  {
    question: 'Do guests need to download an app?',
    answer: 'No. Guests scan the restaurant QR code and use a mobile-friendly page in their browser to join and track their place.',
  },
  {
    question: 'How do guests know when their table is ready?',
    answer: 'Their live tracking page updates when staff call them. Guests can confirm they are on the way with the “I’m Coming” action.',
  },
  {
    question: 'Can staff call a party out of order?',
    answer: 'If an earlier eligible party in the same size group is waiting, staff must record a reason before calling a later party. The exception is saved in the audit history.',
  },
  {
    question: 'What if a guest changes their mind?',
    answer: 'Guests can cancel from their live ticket page. Staff can also update a ticket from the queue desk, and the change is recorded.',
  },
  {
    question: 'Does WePass send WhatsApp messages automatically?',
    answer: 'No. The WhatsApp action opens a chat with a prepared message for staff to send. Opening a chat does not mean the message was delivered.',
  },
  {
    question: 'How accurate is the estimated wait?',
    answer: 'It is an estimate based on parties ahead in the guest’s size group and the restaurant’s configured wait-time setting. Actual table availability can change the wait.',
  },
];

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [proofStats, setProofStats] = useState<ProofStats | null>(null);
  const [proofError, setProofError] = useState(false);
  const [activeQueueUrl, setActiveQueueUrl] = useState<string | null>(null);
  const phoneJourney = [
    {
      key: 'join',
      title: 'Join the Queue',
      blurb: 'Tell us a few details and we’ll add you to the queue.',
      accentLabel: 'Queue joined',
      accentText: 'Your place is saved',
      screen: (
        <div className="space-y-5">
          <div className="flex items-center gap-3 rounded-2xl bg-white/80 p-3 shadow-[inset_0_0_0_1px_rgba(15,23,42,0.05)]">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F3EC] text-[#087C50] shadow-inner">
              <Smartphone className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-[0.14em] text-[#4B625A]">WePass guest pass</p>
              <p className="truncate text-sm font-bold text-[#0F172A]">Join from your browser.</p>
            </div>
          </div>

          <div className="space-y-1 border-b border-[#D9E4DE] pb-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#4B625A]">You’re joining</p>
            <h3 className="text-[27px] font-black leading-none tracking-[-0.06em] text-[#0F172A]">Your restaurant</h3>
            <p className="text-base text-[#4B625A]">Join without an app</p>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-[#D9E4DE] bg-white/60 px-3 py-2.5 text-sm text-[#3C4D47]">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#8AA89D] text-[#237A50]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#237A50]" />
            </span>
            Restaurant details and directions
          </div>

          <div className="space-y-3 pt-1">
            <label className="block">
              <span className="mb-2 block text-lg font-bold text-[#0F172A]">Your name <span className="text-[#E57373]">*</span></span>
              <input placeholder="Your name" readOnly tabIndex={-1} className="w-full rounded-2xl border border-[#D8E2DC] bg-white px-4 py-3 text-base text-[#5D6C66] placeholder:text-[#7A8A84]" />
            </label>
            <label className="block">
              <span className="mb-2 block text-lg font-bold text-[#0F172A]">Party size</span>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((size, index) => (
                  <span key={size} className={`rounded-2xl border px-3 py-2.5 text-center text-lg font-bold ${index === 0 ? 'border-[#237A50] bg-[#237A50] text-white' : 'border-[#D8E2DC] bg-white text-[#0F172A]'}`}>
                    {size}
                  </span>
                ))}
              </div>
            </label>
            <div className="mt-1 flex w-full items-center justify-center gap-3 rounded-2xl bg-[#237A50] px-5 py-3.5 text-lg font-bold text-white shadow-[0_12px_28px_rgba(11,111,82,0.28)]">
              <ArrowRight className="h-5 w-5" />
              Confirm & Join Queue
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'confirm',
      title: 'You’re in the queue!',
      blurb: 'Thanks for joining. Keep this page open to follow your place in line.',
      accentLabel: 'Live queue',
      accentText: 'Follow your place',
      screen: (
        <div className="space-y-5 pb-2">
          <div className="mx-auto mt-2 flex h-24 w-24 items-center justify-center rounded-full bg-[#DDF5E8] text-[#237A50] shadow-[inset_0_0_0_1px_rgba(30,119,94,0.12)]">
            <Check className="h-12 w-12" />
          </div>
          <h3 className="text-center text-[30px] font-black tracking-[-0.06em] text-[#0F172A]">You’re in the queue!</h3>
          <p className="text-center text-base text-[#4B625A]">Thanks for joining. Keep this page open to follow your place in line.</p>
          <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-[#D8E2DC] bg-white/60">
            <div className="border-r border-[#D8E2DC] p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#4B625A]">Queue token</p>
              <p className="mt-2 text-lg font-bold tracking-tight text-[#0F172A]">Assigned on join</p>
            </div>
            <div className="p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#4B625A]">Queue position</p>
              <div className="mt-2 text-lg font-bold tracking-tight text-[#0F172A]">Updates live</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 pt-2 text-center">
            <div className="rounded-2xl border border-[#D8E2DC] bg-white/60 p-3">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#E8F3EC] text-[#237A50]">
                <Armchair className="h-5 w-5" />
              </div>
              <p className="text-[10px] uppercase tracking-[0.14em] text-[#4B625A]">Table</p>
              <p className="mt-1 text-sm font-bold text-[#0F172A]">When ready</p>
            </div>
            <div className="rounded-2xl border border-[#D8E2DC] bg-white/60 p-3">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#E8F3EC] text-[#237A50]">
                <UsersRound className="h-5 w-5" />
              </div>
              <p className="text-[10px] uppercase tracking-[0.14em] text-[#4B625A]">Party size</p>
              <p className="mt-1 text-sm font-bold text-[#0F172A]">Your group</p>
            </div>
            <div className="rounded-2xl border border-[#D8E2DC] bg-white/60 p-3">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#E8F3EC] text-[#237A50]">
                <Clock3 className="h-5 w-5" />
              </div>
              <p className="text-[10px] uppercase tracking-[0.14em] text-[#4B625A]">Wait estimate</p>
              <p className="mt-1 text-sm font-bold text-[#0F172A]">Updates live</p>
            </div>
          </div>
          <div className="w-full rounded-2xl border border-[#E7B7B7] bg-[#F5E2E2] px-4 py-3 text-center text-xl font-bold text-[#9B5A5A]">
            Leave queue
          </div>
        </div>
      ),
    },
    {
      key: 'ready',
      title: 'Your table is ready!',
      blurb: 'Please make your way to the restaurant.',
      accentLabel: 'Your table is ready!',
      accentText: 'Head to the restaurant',
      screen: (
        <div className="space-y-5">
          <div className="rounded-2xl border border-[#D8E2DC] bg-[#E1F5EC] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#237A50] text-white">
                <BellRing className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <h3 className="text-[25px] font-black tracking-[-0.05em] text-[#0F172A]">Your table is ready</h3>
                <p className="mt-1 text-base text-[#3C4D47]">Your restaurant will let you know when to return.</p>
              </div>
              <span className="text-xl font-black text-[#0F172A]">×</span>
            </div>
          </div>

          <div className="mx-auto mt-3 flex h-28 w-28 items-center justify-center rounded-full bg-[#DDF5E8] text-[#237A50] shadow-[inset_0_0_0_1px_rgba(30,119,94,0.12)]">
            <Armchair className="h-14 w-14" />
          </div>

          <div className="text-center">
            <h3 className="text-[32px] font-black tracking-[-0.06em] text-[#0F172A]">Your table is ready!</h3>
            <p className="mt-3 text-lg text-[#4B625A]">Great news! Your table is ready. Please make your way to the restaurant and take your seat.</p>
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-2xl border border-[#D8E2DC] bg-white/60 p-3">
            <div className="rounded-xl border border-[#D8E2DC] bg-white/50 p-3">
              <p className="text-[10px] uppercase tracking-[0.14em] text-[#4B625A]">Queue pass</p>
              <p className="mt-2 text-lg font-bold tracking-tight text-[#0F172A]">Assigned on join</p>
            </div>
            <div className="rounded-xl border border-[#D8E2DC] bg-white/50 p-3">
              <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#E8F3EC] text-[#237A50]">
                <UsersRound className="h-5 w-5" />
              </div>
              <p className="text-[10px] uppercase tracking-[0.14em] text-[#4B625A]">Party size</p>
              <p className="mt-1 text-lg font-black text-[#0F172A]">Your group</p>
            </div>
            <div className="rounded-xl border border-[#D8E2DC] bg-white/50 p-3">
              <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#E8F3EC] text-[#237A50]">
                <Clock3 className="h-5 w-5" />
              </div>
              <p className="text-[10px] uppercase tracking-[0.14em] text-[#4B625A]">Status</p>
              <p className="mt-1 text-lg font-black text-[#0F172A]">Called when ready</p>
            </div>
          </div>

          <div className="flex w-full items-center justify-center gap-3 rounded-full bg-[#237A50] px-5 py-4 text-2xl font-black text-white shadow-[0_14px_32px_rgba(11,111,82,0.28)]">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/30 bg-white/10">
              <ArrowRight className="h-5 w-5" />
            </span>
            I’m Coming
          </div>
          <div className="flex items-center justify-center gap-2 text-base text-[#4B625A]">
            <Clock3 className="h-4 w-4 text-[#237A50]" />
            Please arrive within 10 minutes.
          </div>
        </div>
      ),
    },
    {
      key: 'coming',
      title: 'I’m coming',
      blurb: 'Please arrive within 10 minutes.',
      accentLabel: 'It’s your turn',
      accentText: 'Head to the restaurant',
      screen: (
        <div className="space-y-5">
          <div className="rounded-2xl border border-[#D8E2DC] bg-[#EAF5F0] p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#237A50] text-white">
                  <BellRing className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[12px] uppercase tracking-[0.14em] text-[#4B625A]">Your table is ready</p>
                  <p className="text-lg font-bold text-[#0F172A]">Your restaurant will let you know when to return.</p>
                </div>
              </div>
              <span className="text-xl font-black text-[#0F172A]">×</span>
            </div>
          </div>

          <div className="rounded-[30px] border border-[#D8E2DC] bg-white/60 p-4">
            <div className="flex items-center justify-between">
              <div className="inline-block rounded-full border border-[#D8E2DC] bg-[#EAF5F0] px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-[#237A50]">Help</div>
              <div className="inline-block rounded-full border border-[#D8E2DC] bg-[#EAF5F0] px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-[#237A50]">Live</div>
            </div>
            <div className="mt-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-[14px] uppercase tracking-[0.14em] text-[#4B625A]">Need help?</p>
                <p className="mt-2 text-xl font-bold text-[#0F172A]">Chat now</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#237A50] text-white">
                <Smartphone className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="flex w-full items-center justify-center gap-3 rounded-full bg-[#237A50] px-5 py-4 text-2xl font-black text-white shadow-[0_14px_32px_rgba(11,111,82,0.28)]">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/30 bg-white/10">
              <ArrowRight className="h-5 w-5" />
            </span>
            I’m Coming
          </div>
          <div className="flex items-center justify-center gap-2 text-base text-[#4B625A]">
            <Clock3 className="h-4 w-4 text-[#237A50]" />
            Please arrive within 10 minutes.
          </div>
        </div>
      ),
    },
  ];

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/platform/proof', { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Unable to load usage statistics.');
        return result;
      })
      .then((result) => {
        if (result.success) setProofStats(result.stats);
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return;
        console.error('Platform proof metrics request failed:', error);
        setProofError(true);
      });

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const activeQueueKey = Object.keys(window.localStorage).find((key) =>
      key.startsWith('wepass_active_token_'),
    );
    if (!activeQueueKey) return;

    const token = window.localStorage.getItem(activeQueueKey);
    const slug = activeQueueKey.slice('wepass_active_token_'.length);
    if (token && slug) {
      setActiveQueueUrl(`/queue/${encodeURIComponent(token)}?slug=${encodeURIComponent(slug)}`);
    }
  }, []);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <main id="top" className="overflow-hidden bg-white text-[#17231D]">
      <header className="home-header sticky top-0 z-50">
        <div className="page-container mx-auto flex h-[76px] items-center">
          <div className="home-nav-shell mx-auto flex w-full max-w-[1080px] items-center justify-between gap-3 px-4 sm:px-6">
            <BrandLogo size="sm" />

            <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
              {[
                ['Home', '#top'],
                ['About', '#about'],
                ['Features', '#product'],
                ['How It Works', '#how-it-works'],
                ['Pricing', '#pricing'],
                ['Contact', '#contact'],
              ].map(([label, href], index) => (
                <a
                  key={label}
                  href={href}
                  aria-current={index === 0 ? 'page' : undefined}
                  className={`rounded-full px-3 py-2 text-xs font-semibold transition sm:px-3.5 ${
                    index === 0
                      ? 'bg-[#BDF5CF] text-[#17372A]'
                      : 'text-[#3F5147] hover:bg-white/80 hover:text-[#087C50]'
                  }`}
                >
                  {label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Link
                href="/business-registration"
                className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-[#A6F1B8] px-4 text-xs font-bold text-[#153528] transition hover:bg-[#8DE8A5] sm:px-5"
              >
                Get Started <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <button
                type="button"
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={mobileMenuOpen}
                aria-controls="home-mobile-navigation"
                onClick={() => setMobileMenuOpen((open) => !open)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[#17231D] transition hover:bg-white/80 lg:hidden"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
        {mobileMenuOpen && (
          <nav id="home-mobile-navigation" aria-label="Mobile navigation" className="mobile-menu-panel page-container mx-auto pb-3 lg:hidden">
            <div className="rounded-2xl border border-white/80 bg-white/95 p-2 shadow-[0_16px_40px_rgba(20,54,38,0.12)] backdrop-blur-xl">
              {[
                ['Home', '#top'],
                ['About WePass', '#about'],
                ['Features', '#product'],
                ['How It Works', '#how-it-works'],
                ['Pricing', '#pricing'],
                ['Contact', '#contact'],
              ].map(([label, href]) => (
                <a key={label} href={href} onClick={closeMenu} className="block rounded-xl px-3 py-3 text-sm font-medium text-[#263B30] transition hover:bg-[#E8F3EC]">
                  {label}
                </a>
              ))}
              <Link href="/login" onClick={closeMenu} className="mt-1 block rounded-xl border-t border-[#E8EEE9] px-3 py-3 text-sm font-semibold text-[#087C50]">
                Restaurant sign in
              </Link>
            </div>
          </nav>
        )}
      </header>

      <section id="home" className="home-hero relative isolate overflow-hidden">
        <div className="home-hero-glow" aria-hidden="true" />
        <div className="home-hero-rings" aria-hidden="true"><span /><span /></div>
        <div className="page-container relative mx-auto pt-5 text-center sm:pt-8 lg:pt-10">
          <div className="mx-auto max-w-[820px]">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/55 px-3.5 py-1.5 text-[11px] font-semibold text-[#244636] backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-[#56D887] shadow-[0_0_0_5px_rgba(86,216,135,0.14)]" />
              Smart Queue Solution
            </p>
            <h1 className="text-[clamp(2.6rem,6.6vw,4.7rem)] font-bold leading-[0.98] tracking-[-0.065em] text-[#182630]">
              <span className="home-heading-desktop">
                One account
                <br />
                <span className="text-[#07834F]">For your restaurant.</span>
              </span>
              <span className="home-heading-mobile">
                One account
                <br />
                <span>For your restaurant.</span>
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-[660px] text-sm font-medium leading-6 text-[#52625A] sm:mt-5 sm:text-base sm:leading-7">
              Join restaurant queues, reserve your table and track your waiting time in real time.
              <br className="hidden sm:block" /> Everything you need, right from your phone.
            </p>
            <div className="mt-5 flex flex-col justify-center gap-2.5 sm:mt-6 sm:flex-row">
              <a href="#how-it-works" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#087C50] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#066641]">
                Join Queue <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#product" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#168353] bg-white/55 px-6 py-3 text-sm font-bold text-[#17372A] transition hover:bg-white">
                Explore WePass
              </a>
            </div>
          </div>

          <div className="home-hero-stage relative mx-auto mt-4 grid w-full max-w-[1080px] items-center gap-4 pb-8 sm:mt-6 sm:pb-10 lg:mt-2 lg:grid-cols-[1fr_270px_1fr] lg:gap-6 lg:pb-0">
            <div className="home-hero-side home-hero-side-left">
              <article className="home-float-card home-booking-card">
                <span className="home-card-icon"><QrCode className="h-5 w-5" /></span>
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-sm font-bold text-[#17231D]">Restaurant Booking</p>
                  <p className="mt-1 text-xs text-[#69766F]">Queue token is created when you join.</p>
                  <p className="mt-2 inline-flex rounded-lg bg-[#E8F3EC] px-2.5 py-1 text-[11px] font-semibold text-[#237A50]">Wait estimate updates live</p>
                </div>
                <div className="home-card-ticket"><span>we</span></div>
              </article>
              <article className="home-float-card home-feature-card">
                <span className="home-card-icon"><Armchair className="h-5 w-5" /></span>
                <div className="text-left">
                  <p className="text-sm font-bold text-[#17231D]">Table Availability</p>
                  <p className="mt-1 text-xs leading-5 text-[#69766F]">See table status managed by the restaurant.</p>
                </div>
              </article>
            </div>

            <div className="home-product-preview relative z-10 mx-auto w-full max-w-[270px] text-left" aria-label="Illustrative WePass guest queue pass">
              <div className="home-product-status">
                <span className="home-phone-camera" aria-hidden="true" />
                <span className="text-[9px] font-bold tracking-[0.12em] text-[#52635A]">WEPASS QUEUE PASS</span>
                <span className="home-product-preview-label">PREVIEW</span>
              </div>
              <div className="home-product-content">
                {activeQueueUrl ? (
                  <iframe title="Your live WePass queue pass" src={activeQueueUrl} loading="lazy" />
                ) : (
                  <>
                    <div className="home-phone-restaurant">
                      <Image src="/brand/wepass-icon.png" alt="" width={28} height={28} className="h-7 w-7 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-[#17231D]">Your restaurant</p>
                        <p className="text-[9px] text-[#69766F]">Restaurant details appear after joining</p>
                      </div>
                    </div>
                    <div className="home-phone-confirmation">
                      <span className="home-phone-check"><Check className="h-4 w-4" /></span>
                      <h2>You’re in the queue!</h2>
                      <p>Thanks for joining. Keep this page open to follow your place in line.</p>
                    </div>
                    <div className="home-phone-token">
                      <div><span>Queue token</span><strong>Assigned on join</strong></div>
                      <div><span>Parties ahead</span><strong>Updates live</strong></div>
                    </div>
                    <div className="home-phone-details">
                      <div><Armchair /><span>Table</span><strong>When ready</strong></div>
                      <div><UsersRound /><span>Party size</span><strong>Your group</strong></div>
                      <div><Clock3 /><span>Joined at</span><strong>When joined</strong></div>
                    </div>
                    <span className="home-phone-leave">Leave Queue</span>
                    <div className="home-phone-tracking">
                      <strong>Queue tracking</strong>
                      <p>Your live status updates as your turn gets closer.</p>
                      <span><i /> Status updates appear after joining</span>
                    </div>
                    <p className="home-phone-note">Illustrative preview. Real queue details come from your restaurant.</p>
                  </>
                )}
              </div>
            </div>

            <div className="home-hero-side home-hero-side-right">
              <article className="home-float-card home-stats-card">
                <div className="flex items-start gap-3">
                  <span className="home-card-icon"><UsersRound className="h-5 w-5" /></span>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-sm font-bold text-[#17231D]">Live Queue Statistics</p>
                    <div className="mt-4 grid grid-cols-3 divide-x divide-[#E5ECE7]">
                      {[
                        ['Restaurants', proofStats?.activeRestaurants.toLocaleString() ?? '—'],
                        ['Waiting', proofStats?.partiesWaiting.toLocaleString() ?? '—'],
                        ['Served', proofStats?.guestsServed.toLocaleString() ?? '—'],
                      ].map(([label, value]) => (
                        <div key={label} className="px-2 first:pl-0 last:pr-0">
                          <p className="text-lg font-bold leading-none text-[#17231D]">{value}</p>
                          <p className="mt-1.5 text-[10px] text-[#69766F]">{label}</p>
                        </div>
                      ))}
                    </div>
                    {proofError && <p className="mt-2 text-[10px] text-[#69766F]">Live statistics are temporarily unavailable.</p>}
                  </div>
                </div>
              </article>
              <article className="home-float-card home-feature-card">
                <span className="home-card-icon"><BellRing className="h-5 w-5" /></span>
                <div className="text-left">
                  <p className="text-sm font-bold text-[#17231D]">One Account for Restaurant</p>
                  <p className="mt-1 text-xs leading-5 text-[#69766F]">Manage queues, book tables &amp; more.</p>
                </div>
              </article>
            </div>
          </div>
          <div className="home-hero-benefits mx-auto flex max-w-xl flex-wrap justify-center gap-x-5 gap-y-2 pb-7 text-[11px] font-medium text-[#506258] sm:gap-x-7 sm:pb-9 sm:text-xs">
            {['No guest app required', 'One permanent QR', 'Live queue updates'].map((item) => (
              <span key={item} className="inline-flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-[#12834F]" /> {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="home-section home-about-section">
        <div className="page-container mx-auto grid items-center gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
          <div>
            <p className="home-eyebrow"><span /> About WePass</p>
            <h2 className="home-section-title mt-4">Everything your restaurant needs, <span>in one platform.</span></h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-[#66736A] sm:text-base">
              WePass simplifies restaurant operations and improves the customer experience through smart queue management and seamless table management.
            </p>
            <ul className="home-check-list mt-7 grid gap-3 sm:grid-cols-2">
              {[
                'Smart queue management',
                'Real-time queue tracking',
                'Digital queue tokens',
                'Table availability',
                'Restaurant management',
                'Better guest experiences',
              ].map((item) => (
                <li key={item}><Check />{item}</li>
              ))}
            </ul>
            <Link href="/business-registration" className="home-outline-button mt-8">
              Learn about WePass <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="home-dashboard-preview" aria-label="Illustrative WePass restaurant dashboard">
            <div className="home-dashboard-topbar">
              <div className="flex items-center gap-2">
                <Image src="/brand/wepass-icon.png" alt="" width={24} height={24} className="h-6 w-6 rounded-md object-cover" />
                <span>WePass</span>
              </div>
              <span className="home-dashboard-preview-label">Dashboard preview</span>
            </div>
            <div className="home-dashboard-body">
              <div className="home-dashboard-sidebar" aria-hidden="true">
                <span className="active">Overview</span><span>Queue</span><span>Tables</span><span>Reports</span>
              </div>
              <div className="home-dashboard-main">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div><p className="text-sm font-bold text-[#17231D]">Restaurant overview</p><p className="mt-1 text-[10px] text-[#69766F]">Your operations at a glance</p></div>
                  <Link href="/login" className="home-dashboard-action">Open dashboard <ArrowRight /></Link>
                </div>
                <div className="home-dashboard-metrics">
                  {[
                    { label: 'Active restaurants', value: proofStats?.activeRestaurants.toLocaleString() ?? '—', Icon: UsersRound },
                    { label: 'Parties waiting', value: proofStats?.partiesWaiting.toLocaleString() ?? '—', Icon: Clock3 },
                    { label: 'Guests served', value: proofStats?.guestsServed.toLocaleString() ?? '—', Icon: Check },
                  ].map(({ label, value, Icon }) => (
                    <div key={label}><span><Icon /></span><small>{label}</small><strong>{value}</strong></div>
                  ))}
                </div>
                <div className="home-dashboard-empty">
                  <div className="flex items-center justify-between gap-3"><strong>Queue and table management</strong><span>Live in your account</span></div>
                  <div className="home-dashboard-empty-state"><QrCode /><p>Sign in to view your restaurant’s queue, tables and customer details.</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="home-section home-steps-section">
        <div className="page-container mx-auto">
          <div className="mx-auto max-w-3xl text-center">
            <p className="home-eyebrow justify-center"><span /> How It Works</p>
            <h2 className="home-section-title mt-4">A simple 3-step process <span>for a smoother visit.</span></h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#69766F] sm:text-base">Choose a restaurant, join its digital queue and follow your turn from your phone.</p>
          </div>
          <div className="home-step-grid mt-10 grid gap-4 md:grid-cols-3">
            {[
              { Icon: QrCode, title: 'Choose Your Restaurant', description: 'Find and select the restaurant you want to visit.' },
              { Icon: Smartphone, title: 'Join the Queue', description: 'Share your details and receive a unique queue token.' },
              { Icon: Clock3, title: 'Track Your Turn', description: 'Follow your queue position and waiting status in real time.' },
            ].map(({ Icon, title, description }, index) => (
              <article key={title} className="home-step-card">
                <span className="home-step-number">0{index + 1}</span>
                <span className="home-step-icon"><Icon /></span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="product" className="section-padding bg-[#F8FAF8]">
        <div className="page-container mx-auto">
          <div className="mx-auto max-w-2xl text-center">
            <p className="home-eyebrow justify-center"><span /> For every restaurant visit</p>
            <h2 className="home-section-title mt-4">Dining made easier <span>with WePass.</span></h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#69766F] sm:text-base">Simple tools keep guests informed and help restaurant teams stay in control of the queue.</p>
          </div>
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: QrCode,
                title: 'Join Queue',
                description: 'Join a restaurant queue digitally without waiting at the host stand.',
              },
              {
                icon: Clock3,
                title: 'Live Queue Tracking',
                description: 'Follow your queue status as the restaurant updates your place in line.',
              },
              {
                icon: TicketCheck,
                title: 'Digital Queue Token',
                description: 'Receive a unique token when you join a restaurant queue.',
              },
              {
                icon: Timer,
                title: 'Estimated Wait',
                description: 'See an estimated wait when the restaurant has current information available.',
              },
              {
                icon: MapPin,
                title: 'Restaurant Information',
                description: 'Review restaurant details and queue information before your visit.',
              },
              {
                icon: CircleCheck,
                title: 'Easy Queue Management',
                description: 'Keep your queue pass handy and manage your place from your phone.',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="home-customer-feature">
                  <span><Icon /></span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              );
            })}
          </div>
          <div className="home-restaurant-feature">
            <div className="home-restaurant-feature-copy">
              <p className="home-eyebrow"><span /> Built for restaurant teams</p>
              <h3>One powerful account. <span>Complete restaurant control.</span></h3>
              <p>Bring day-to-day queue operations into one place, from guest management to tables and restaurant details.</p>
              <ul className="home-check-list mt-6">
                {['Restaurant dashboard and profile', 'Live queue and customer management', 'Digital token generation', 'Table availability and bookings', 'Waiting-time monitoring and analytics'].map((item) => <li key={item}><Check />{item}</li>)}
              </ul>
              <Link href="/login" className="home-outline-button mt-7">Explore restaurant dashboard <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="home-restaurant-feature-visual" aria-label="Live restaurant queue preview">
              <div className="home-queue-preview-head"><div><strong>Current queue</strong><span>Live restaurant view</span></div><i><span /> Queue active</i></div>
              <div className="home-queue-preview-empty">
                <span><UsersRound /></span>
                <strong>Your queue, at a glance</strong>
                <p>Customer names, tokens and wait times appear here when guests join your live queue.</p>
              </div>
              <div className="home-queue-preview-footer"><span><Armchair /> Table availability</span><strong>Managed in your dashboard</strong></div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section home-benefits-section">
        <div className="page-container mx-auto">
          <div className="mx-auto max-w-3xl text-center">
            <p className="home-eyebrow justify-center"><span /> Why choose WePass</p>
            <h2 className="home-section-title mt-4">Better experiences for customers. <span>Smarter operations for restaurants.</span></h2>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-2">
            <article className="home-benefit-card">
              <span className="home-benefit-icon"><Smartphone /></span>
              <h3>For customers</h3>
              <p>Keep your visit moving without standing by the host desk.</p>
              <ul>
                <li><Check />Join a queue from your phone</li>
                <li><Check />Follow real-time status updates</li>
                <li><Check />Know your queue position and wait estimate</li>
                <li><Check />Enjoy a more informed dining experience</li>
              </ul>
            </article>
            <article className="home-benefit-card home-benefit-card-green">
              <span className="home-benefit-icon"><ShieldCheck /></span>
              <h3>For restaurants</h3>
              <p>Give your team a clearer way to manage the guest flow.</p>
              <ul>
                <li><Check />Organize walk-ins and queue activity</li>
                <li><Check />Manage tables and guest calls</li>
                <li><Check />Keep an eye on table utilization</li>
                <li><Check />Review queue activity and exceptions</li>
              </ul>
            </article>
          </div>
          <p className="mx-auto mt-5 max-w-2xl text-center text-xs leading-5 text-[#69766F]">
            WePass checks earlier eligible parties before a later party can be called. Staff record a reason when a queue exception is needed.
          </p>
        </div>
      </section>

      <section id="proof" className="border-b border-[#E5ECE7] bg-white py-16 sm:py-20">
        <div className="page-container mx-auto">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#237A50]">Real usage. Real operations.</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#17231D] sm:text-4xl">Proof in the queue.</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[#69766F]">Live totals from active, non-demo restaurants, calculated from actual queue records.</p>
          </div>
          {proofError ? (
            <p role="status" className="mt-8 rounded-2xl border border-[#E5ECE7] bg-[#F8FAF8] p-5 text-sm text-[#69766F]">Usage statistics are temporarily unavailable.</p>
          ) : (
            <>
              <div className="mt-9 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                  ['Active restaurants', proofStats?.activeRestaurants.toLocaleString() ?? '—', 'Currently active'],
                  ['Guests served', proofStats?.guestsServed.toLocaleString() ?? '—', 'Last 30 days'],
                  ['Parties waiting', proofStats?.partiesWaiting.toLocaleString() ?? '—', 'Across active restaurants'],
                  ['Average wait to seat', proofStats ? proofStats.averageWaitMinutes == null ? 'No data' : `${proofStats.averageWaitMinutes} min` : '—', 'Last 30 days'],
                ].map(([label, value, note]) => (
                  <div key={label} className="border-t border-[#B8EBD0] py-5">
                    <p className="text-3xl font-semibold tracking-tight text-[#237A50]">{value}</p>
                    <p className="mt-2 text-sm font-semibold text-[#17231D]">{label}</p>
                    <p className="mt-1 text-xs text-[#69766F]">{note}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs leading-5 text-[#69766F]">30-day totals exclude seeded demo activity. Wait time is measured from queue entry to seating.</p>
            </>
          )}
        </div>
      </section>

      <section id="pricing" className="home-section home-pricing-section">
        <div className="page-container mx-auto">
          <div className="mx-auto max-w-3xl text-center">
            <p className="home-eyebrow justify-center"><span /> Pricing</p>
            <h2 className="home-section-title mx-auto mt-4">Simple, transparent pricing <span>for every restaurant.</span></h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#66736A] sm:text-base">Choose the plan that fits your needs. Upgrade anytime.</p>
          </div>
          <div className="home-pricing-grid">
            {[
              {
                name: 'WePass Basic',
                cadence: 'Monthly',
                price: '₹299',
                unit: '/ month',
                features: ['Basic platform functionality', 'No data access', 'Standard features', 'Monthly subscription validity'],
                note: 'Best for customers who need basic functionality.',
                action: 'Get Started',
                href: '/business-registration',
              },
              {
                name: 'WePass Premium',
                cadence: 'Monthly',
                price: '₹599',
                unit: '/ month',
                features: ['All Basic functionality', 'Data access', 'Advanced features', 'Reports and insights', 'Three-month subscription validity'],
                note: 'Best for customers who need data and advanced functionality.',
                action: 'Get Started',
                href: '/business-registration',
                popular: true,
              },
              {
                name: 'WePass Custom',
                cadence: 'Business',
                price: 'Quotation based',
                unit: '',
                features: ['Custom functionality', 'Custom data access', 'Business-specific requirements', 'Flexible validity', 'Individually agreed pricing'],
                note: 'Tailored for your business needs.',
                action: 'Contact Us',
                href: '/business-registration',
              },
            ].map((plan) => (
              <article key={plan.name} className={`home-pricing-plan${plan.popular ? ' home-pricing-plan-popular' : ''}`}>
                {plan.popular && <span className="home-pricing-popular-badge">Most Popular</span>}
                <div className="home-pricing-plan-heading">
                  <h3>{plan.name}</h3>
                  <span>{plan.cadence}</span>
                </div>
                <p className={`home-pricing-price${plan.unit ? '' : ' home-pricing-price-quote'}`}>
                  <strong>{plan.price}</strong>{plan.unit && <span>{plan.unit}</span>}
                </p>
                <ul className="home-pricing-features">
                  {plan.features.map((feature) => (
                    <li key={feature}><Check aria-hidden="true" />{feature}</li>
                  ))}
                </ul>
                <p className="home-pricing-note">{plan.note}</p>
                <Link
                  href={plan.href}
                  className={plan.popular ? 'home-pricing-action home-pricing-action-primary' : 'home-pricing-action'}
                >
                  {plan.action} <ArrowRight aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
          <p className="mt-5 text-center text-xs leading-5 text-[#69766F]">
            Plan setup and subscription details are confirmed with our team when you get started.
          </p>
        </div>
      </section>

      <section id="restaurants" className="home-final-cta">
        <div className="page-container mx-auto">
          <p className="home-eyebrow home-eyebrow-light justify-center"><span /> A better restaurant visit</p>
          <h2>Make every restaurant visit smarter.</h2>
          <p>Experience a simpler way to manage queues and restaurant visits with WePass.</p>
          <div className="home-final-cta-actions">
            <Link href="/business-registration" className="home-final-primary">Get Started <ArrowRight className="h-4 w-4" /></Link>
            <Link href="#how-it-works" className="home-final-secondary">Join Queue</Link>
          </div>
        </div>
      </section>

      <section id="faq" className="section-padding bg-white">
        <div className="page-container mx-auto grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#237A50]">Frequently asked questions</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.045em] text-[#17231D] sm:text-5xl">Good to know.</h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[#69766F]">Practical answers for guests, hosts and restaurant owners.</p>
          </div>
          <div className="divide-y divide-[#E5ECE7] border-y border-[#E5ECE7]">
            {faqs.map((item) => (
              <details key={item.question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-[#17231D] marker:content-none">
                  {item.question}
                  <ChevronDown className="h-4 w-4 shrink-0 text-[#237A50] transition group-open:rotate-180" />
                </summary>
                <p className="max-w-2xl pr-8 pt-3 text-sm leading-6 text-[#69766F]">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <div className="home-footer-orbit home-footer-orbit-left" aria-hidden="true" />
        <div className="home-footer-orbit home-footer-orbit-right" aria-hidden="true" />
        <div className="home-footer-inner page-container mx-auto">
          <div className="home-footer-main">
            <div className="home-footer-brand">
              <BrandLogo size="md" tone="light" />
              <p>One account for your restaurant. Smarter queues and more seamless visits for everyone.</p>
              <a
                href="https://wa.me/917406400140?text=Chat%20with%20WE%20PASS%20on%20WhatsApp"
                target="_blank"
                rel="noopener noreferrer"
                className="home-footer-contact"
              >
                <MessageCircle aria-hidden="true" />
                <span>+91 74064 00140 <small>WhatsApp support</small></span>
              </a>
              <div className="home-footer-socials" aria-label="WePass social media">
                <a
                  href="https://www.instagram.com/wepass.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WePass on Instagram"
                >
                  <Instagram aria-hidden="true" />
                </a>
                <a
                  href="https://wa.me/917406400140?text=Chat%20with%20WE%20PASS%20on%20WhatsApp"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Contact WePass on WhatsApp"
                >
                  <MessageCircle aria-hidden="true" />
                </a>
              </div>
            </div>

            <nav aria-label="Footer quick links" className="home-footer-links">
              <h2>Quick Links</h2>
              <ul>
                {[
                  ['Home', '#top'],
                  ['About', '#about'],
                  ['Features', '#product'],
                  ['How It Works', '#how-it-works'],
                  ['Pricing', '#pricing'],
                  ['Contact', '#contact'],
                ].map(([label, href]) => (
                  <li key={label}><a href={href}>{label}</a></li>
                ))}
              </ul>
            </nav>

            <div id="contact" className="home-footer-connect">
              <h2>Connect</h2>
              <a href="https://www.instagram.com/wepass.in/" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href="https://wa.me/917406400140?text=Chat%20with%20WE%20PASS%20on%20WhatsApp" target="_blank" rel="noopener noreferrer">WhatsApp support</a>
              <p>Questions about WePass? Our team is happy to help.</p>
            </div>
          </div>

          <div className="home-footer-wordmark" aria-hidden="true">WEPASS</div>
          <div className="home-footer-bottom">
            <p>Copyright © 2026 WePass. All Rights Reserved.</p>
            <a href="#top">Back to top <ArrowRight aria-hidden="true" /></a>
          </div>
        </div>
      </footer>
    </main>
  );
}
