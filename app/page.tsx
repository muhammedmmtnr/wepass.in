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
  Menu,
  QrCode,
  ShieldCheck,
  Smartphone,
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
                ['Pricing', '/business-registration'],
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
                ['Pricing', '/business-registration'],
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

      <section id="about" className="home-hero relative isolate overflow-hidden">
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
                Skip the Queue.
                <br />
                <span className="text-[#07834F]">Enjoy Your Time.</span>
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
                  <p className="text-sm font-bold text-[#17231D]">Restaurant queue</p>
                  <p className="mt-1 text-xs text-[#69766F]">Scan to join from your browser</p>
                  <p className="mt-2 inline-flex rounded-lg bg-[#E8F3EC] px-2.5 py-1 text-[11px] font-semibold text-[#237A50]">No app download</p>
                </div>
                <div className="home-card-ticket"><span>we</span></div>
              </article>
              <article className="home-float-card home-feature-card">
                <span className="home-card-icon"><Clock3 className="h-5 w-5" /></span>
                <div className="text-left">
                  <p className="text-sm font-bold text-[#17231D]">Your time, in your hands</p>
                  <p className="mt-1 text-xs leading-5 text-[#69766F]">Follow your place while you wait.</p>
                </div>
              </article>
            </div>

            <div className="home-product-preview relative z-10 mx-auto w-full max-w-[270px] text-left" aria-label="Preview of the WePass guest queue pass">
              <div className="home-product-status">
                <span className="text-[9px] font-bold tracking-[0.12em] text-[#52635A]">WEPASS QUEUE PASS</span>
                <span className="home-product-preview-label">PREVIEW</span>
              </div>
              <div className="home-product-content">
                <div className="mb-4 flex items-center justify-center gap-2">
                  <Image src="/brand/wepass-icon.png" alt="" width={27} height={27} className="h-7 w-7 rounded-lg object-cover" />
                  <span className="text-base font-bold tracking-tight text-[#17231D]">WePass</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <h2 className="truncate text-sm font-bold text-[#17231D]">Your restaurant</h2>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#DDF5E8] px-2 py-1 text-[9px] font-bold text-[#087C50]"><span className="h-1.5 w-1.5 rounded-full bg-[#27B86F]" /> Queue pass</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="home-ticket-metric">
                    <span>Queue token</span>
                    <strong>Issued on join</strong>
                  </div>
                  <div className="home-ticket-metric">
                    <span>Est. wait</span>
                    <strong>Updates live</strong>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between rounded-xl bg-white px-3 py-2.5">
                  <div>
                    <p className="text-[10px] text-[#69766F]">Your position</p>
                    <p className="mt-0.5 text-sm font-bold text-[#17231D]">Tracked live</p>
                  </div>
                  <UsersRound className="h-5 w-5 text-[#15935C]" />
                </div>
                <div className="mt-2 rounded-full bg-[#43CF83] px-4 py-2.5 text-center text-xs font-bold text-white">Track Live</div>
                <p className="mt-2 text-center text-[9px] leading-4 text-[#77857D]">Your real ticket details appear after joining a restaurant queue.</p>
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
                  <p className="text-sm font-bold text-[#17231D]">Table updates</p>
                  <p className="mt-1 text-xs leading-5 text-[#69766F]">Know when your restaurant calls your party.</p>
                </div>
              </article>
            </div>
          </div>
          <div className="home-mobile-experience">
            {activeQueueUrl ? (
              <div className="home-mobile-live-pass">
                <iframe title="Your live WePass queue pass" src={activeQueueUrl} loading="lazy" />
              </div>
            ) : (
            <section className="home-mobile-pass mx-auto text-left" aria-label="Guest queue pass preview">
              <div className="home-mobile-pass-brand">
                <Image src="/brand/wepass-icon.png" alt="" width={28} height={28} className="h-7 w-7 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#17231D]">Restaurant details</p>
                  <p className="text-[10px] text-[#69766F]">Shown when you join a restaurant queue</p>
                </div>
                <span className="home-mobile-preview-label">Preview</span>
              </div>

              <div className="home-mobile-pass-confirmation">
                <span className="home-mobile-check"><Check className="h-5 w-5" /></span>
                <h2>You’re in the queue!</h2>
                <p>Thanks for joining. Keep this page open to follow your place in line.</p>
              </div>

              <div className="home-mobile-pass-token">
                <span>Queue token</span>
                <strong>Assigned when you join</strong>
                <div><span>Parties ahead</span><strong>Updates live</strong></div>
              </div>

              <div className="home-mobile-pass-details">
                <div><Armchair /><span>Table</span><strong>When ready</strong></div>
                <div><UsersRound /><span>Party size</span><strong>After joining</strong></div>
                <div><Clock3 /><span>Joined at</span><strong>After joining</strong></div>
              </div>

              <button type="button" className="home-mobile-leave-button" disabled aria-disabled="true">
                Leave Queue
              </button>

              <div className="home-mobile-tracking">
                <div className="flex items-center justify-between gap-3">
                  <strong>Queue tracking</strong>
                  <span className="home-mobile-preview-label">Status updates
                  </span>
                </div>
                <p>Your status and estimated wait appear here after you join.</p>
              </div>
              <p className="home-mobile-preview-note">Sample layout only. A real queue pass is created after you join a restaurant queue.</p>
            </section>
            )}

            <div className="home-mobile-cards" aria-label="WePass features">
              <article className="home-mobile-info-card">
                <span className="home-card-icon"><QrCode className="h-5 w-5" /></span>
                <div>
                  <h3>Restaurant Booking</h3>
                  <p>Queue token and estimated wait are shown after joining.</p>
                </div>
              </article>
              <article className="home-mobile-info-card">
                <span className="home-card-icon"><Armchair className="h-5 w-5" /></span>
                <div>
                  <h3>Table Availability</h3>
                  <p>See your table details when the restaurant updates your queue.</p>
                </div>
              </article>
              <article className="home-mobile-info-card home-mobile-stat-card">
                <span className="home-card-icon"><UsersRound className="h-5 w-5" /></span>
                <div className="min-w-0 flex-1">
                  <h3>Live Queue Statistics</h3>
                  <div className="home-mobile-stats">
                    {[
                      ['Restaurants', proofStats?.activeRestaurants.toLocaleString() ?? '—'],
                      ['Waiting', proofStats?.partiesWaiting.toLocaleString() ?? '—'],
                      ['Served', proofStats?.guestsServed.toLocaleString() ?? '—'],
                    ].map(([label, value]) => (
                      <div key={label}><strong>{value}</strong><span>{label}</span></div>
                    ))}
                  </div>
                  {proofError && <p className="mt-2 text-[10px] text-[#69766F]">Live statistics are temporarily unavailable.</p>}
                </div>
              </article>
              <article className="home-mobile-info-card">
                <span className="home-card-icon"><UsersRound className="h-5 w-5" /></span>
                <div>
                  <h3>One Account for Restaurant</h3>
                  <p>Manage queues, book tables &amp; more.</p>
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

      <section aria-labelledby="india-campaign-heading" className="bg-[#064D33] py-14 text-white sm:py-20">
        <div className="page-container mx-auto grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="max-w-xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-[#00D98B] px-4 py-2 text-sm font-bold text-[#032D1D]">
              <span aria-hidden="true">●</span> Restaurant owners · Across India
            </p>
            <h2 id="india-campaign-heading" className="mt-6 text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
              Shorter waits. Happier guests. Coming to restaurants across India.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/75">
              WePass helps restaurants keep guests in the loop while they wait. Bring a calmer queue experience to your restaurant.
            </p>
            <Link href="/business-registration" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-[#087C50] transition hover:bg-[#E8F3EC]">
              Bring WePass to your restaurant <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex items-end justify-center gap-3 sm:gap-6">
            <Image
              src="/brand/mascot.png"
              alt="WePass mascot holding a scan-and-join queue pass"
              width={420}
              height={460}
              className="w-[38%] max-w-[260px] rounded-3xl object-contain"
            />
            <Image
              src="/brand/across-india-campaign.png"
              alt="WePass campaign for restaurant owners across India, coming soon"
              width={384}
              height={512}
              className="w-[50%] max-w-[320px] rounded-3xl object-cover shadow-[0_20px_60px_rgba(0,0,0,0.24)]"
            />
          </div>
        </div>
      </section>

      <section id="how-it-works" className="section-padding border-y border-[#E5ECE7] bg-white">
        <div className="page-container mx-auto">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#237A50]">A better rhythm, from the first scan</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.045em] text-[#17231D] sm:text-5xl">Four small steps.<br />A much better wait.</h2>
          </div>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['01', 'Scan', 'Guests scan the restaurant’s permanent QR code.'],
              ['02', 'Join', 'Add a name, phone number and party size.'],
              ['03', 'Track', 'Follow the queue and estimated wait on a phone.'],
              ['04', 'Get seated', 'Confirm when called, then meet the host.'],
            ].map(([number, title, description]) => (
              <article key={number} className="border-t border-[#B8EBD0] pt-5">
                <span className="font-mono text-xs font-semibold text-[#C9A858]">{number}</span>
                <h3 className="mt-8 text-xl font-semibold tracking-tight text-[#17231D]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#69766F]">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="product" className="section-padding bg-[#F8FAF8]">
        <div className="page-container mx-auto">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#237A50]">One experience, thoughtfully connected</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.045em] text-[#17231D] sm:text-5xl">Less waiting at the door.<br />More ease all around.</h2>
          </div>
          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {[
              {
                id: 'guest',
                icon: Smartphone,
                eyebrow: 'For guests',
                title: 'The freedom to step away.',
                description: 'Scan once, keep your place and get a live update when it’s time to return.',
                points: ['No app to download', 'Live position and wait estimate', 'Simple arrival confirmation'],
                href: '#how-it-works',
                action: 'See how it works',
                style: 'bg-[#DDF5E8]',
              },
              {
                id: 'restaurants',
                icon: UsersRound,
                eyebrow: 'For the host team',
                title: 'A calmer view of the queue.',
                description: 'Keep guests, calls and table assignments organized from the host desk.',
                points: ['Live queue and walk-ins', 'Table assignments at a glance', 'Recorded fairness exceptions'],
                href: '/staff',
                action: 'Sign in to host desk',
                style: 'bg-[#F5EBD1]/60',
              },
              {
                id: 'owners',
                icon: Armchair,
                eyebrow: 'For owners',
                title: 'Operations in one place.',
                description: 'Manage your restaurant setup, QR, team, tables and real operational reports.',
                points: ['Permanent QR and menu', 'Staff roles and table setup', 'Queue analytics and reports'],
                href: '/dashboard',
                action: 'Sign in to owner portal',
                style: 'bg-white',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.id} id={item.id} className={`group flex min-h-[390px] flex-col rounded-[1.75rem] border border-[#E5ECE7] p-7 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(37,53,44,0.08)] sm:p-8 ${item.style}`}>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 text-[#237A50]"><Icon className="h-5 w-5" /></div>
                  <p className="mt-8 text-xs font-bold uppercase tracking-[0.14em] text-[#69766F]">{item.eyebrow}</p>
                  <h3 className="mt-2 text-2xl font-semibold leading-tight tracking-[-0.035em] text-[#17231D]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#66736A]">{item.description}</p>
                  <ul className="mt-6 space-y-2.5">
                    {item.points.map((point) => (
                      <li key={point} className="flex items-center gap-2 text-xs font-medium text-[#425348]"><Check className="h-3.5 w-3.5 text-[#237A50]" />{point}</li>
                    ))}
                  </ul>
                  <Link href={item.href} className="mt-auto inline-flex items-center gap-2 pt-8 text-sm font-semibold text-[#237A50]">
                    {item.action}<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-padding bg-[#087C50] text-white">
        <div className="page-container mx-auto grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#DCC684]">A queue guests can trust</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.045em] sm:text-5xl">Every place matters.<br />Every turn counts.</h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/70">WePass groups parties by size and checks for earlier eligible guests before a later party is called. When a real exception is needed, staff record why.</p>
          </div>
          <div className="rounded-[1.75rem] border border-white/15 bg-white/[0.06] p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-sm font-semibold">Fairness, built into the flow</p>
                <p className="mt-1 text-xs text-white/55">Illustrative process</p>
              </div>
              <ShieldCheck className="h-5 w-5 text-[#DCC684]" />
            </div>
            <div className="mt-5 space-y-3">
              {[
                ['Earlier eligible party', 'Waiting'],
                ['Next eligible party', 'Waiting'],
                ['Call requested', 'Reason required'],
              ].map(([description, status], index) => (
                <div key={description} className={`flex items-center justify-between gap-3 rounded-xl p-3.5 ${index === 2 ? 'bg-white/10 ring-1 ring-[#DCC684]/40' : 'bg-white/[0.04]'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-white/85">{description}</span>
                  </div>
                  <span className="text-[10px] font-medium text-white/55">{status}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs leading-5 text-white/60">An audited reason is required before the later party can be called.</p>
          </div>
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

      <section id="restaurants" className="section-padding bg-[#F8FAF8]">
        <div className="page-container mx-auto">
          <div className="rounded-[2rem] bg-[#DDF5E8] px-6 py-12 sm:px-12 sm:py-16 lg:flex lg:items-center lg:justify-between lg:gap-10">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#237A50]">For restaurants ready for a better flow</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.045em] text-[#17231D] sm:text-5xl">Bring your restaurant into the future.</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-[#66736A]">Tell us about your restaurant and the way your team works. We’ll help you find the right next step.</p>
            </div>
            <div className="mt-8 flex shrink-0 flex-col gap-3 sm:flex-row lg:mt-0 lg:flex-col">
              <Link href="/business-registration" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#237A50] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#087C50]">
                Book Demo <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/register" className="inline-flex items-center justify-center rounded-full border border-[#B8EBD0] bg-white/70 px-6 py-3.5 text-sm font-semibold text-[#087C50] transition hover:bg-white">
                Create an account
              </Link>
            </div>
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

      <footer className="bg-[#080D0A] text-white">
        <div className="page-container mx-auto py-14 sm:py-16">
          <div className="grid gap-10 border-b border-white/10 pb-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr] lg:gap-12">
            <div>
              <BrandLogo size="md" tone="light" />
              <h2 className="mt-6 text-xl font-bold tracking-tight">Your Time Matters.</h2>
              <p className="mt-3 max-w-sm text-sm leading-7 text-white/60">
                Wepass is a smart digital queue management platform that helps businesses manage customer queues efficiently while allowing customers to join queues online and track their waiting position in real time.
              </p>
            </div>

            <nav aria-label="Footer quick links">
              <h3 className="text-sm font-bold text-white">Quick Links</h3>
              <ul className="mt-5 space-y-3 text-sm">
                {[
                  ['Home', '/'],
                  ['About Us', '#about'],
                  ['Features', '#product'],
                  ['For Businesses', '#restaurants'],
                  ['Contact Us', '#contact'],
                ].map(([label, href]) => (
                  <li key={label}>
                    <a href={href} className="text-white/60 transition hover:text-[#6BE3A8]">{label}</a>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <h3 className="text-sm font-bold text-white">Connect With Us</h3>
              <ul className="mt-5 space-y-3 text-sm">
                <li>
                  <a
                    href="https://www.instagram.com/wepass.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/60 transition hover:text-[#6BE3A8]"
                  >
                    Instagram
                  </a>
                </li>
              </ul>
            </div>

            <div id="contact">
              <h3 className="text-sm font-bold text-white">24/7 WhatsApp Support</h3>
              <a
                href="https://wa.me/917406400140?text=Chat%20with%20WE%20PASS%20on%20WhatsApp"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-block text-xl font-bold tracking-tight text-[#6BE3A8] transition hover:text-white"
              >
                +91 74064 00140
              </a>
              <p className="mt-2 text-sm leading-6 text-white/60">We&apos;re here to help you. Contact our support team anytime.</p>
              <a
                href="https://wa.me/917406400140?text=Chat%20with%20WE%20PASS%20on%20WhatsApp"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex text-sm font-semibold text-white transition hover:text-[#6BE3A8]"
              >
                Chat with WE PASS on WhatsApp <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-5 pt-7 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-white/80">Skip the Wait. Enjoy the Moment.</p>
              <p className="mt-2">© 2026 WE PASS. All Rights Reserved. <span className="mx-2 text-white/25">|</span> Website: wepass.in</p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
