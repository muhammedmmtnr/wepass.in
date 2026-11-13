'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Armchair,
  BellRing,
  Building2,
  Camera,
  ChartNoAxesColumnIncreasing,
  Check,
  ChevronDown,
  Clock3,
  Gem,
  Handshake,
  Home,
  MessageCircle,
  Menu,
  QrCode,
  Rocket,
  ShieldCheck,
  Smartphone,
  Timer,
  Utensils,
  UsersRound,
  UserRound,
  X,
} from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import BookDemoSection from '@/components/BookDemoSection';

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

const navigationLinks = [
  ['Home', '#top'],
  ['About', '#about'],
  ['Features', '#product'],
  ['How It Works', '#how-it-works'],
  ['Pricing', '#pricing'],
  ['Contact', '#contact'],
] as const;

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('#top');
  const [proofStats, setProofStats] = useState<ProofStats | null>(null);
  const [proofError, setProofError] = useState(false);
  const [activeQueueUrl, setActiveQueueUrl] = useState<string | null>(null);

  useEffect(() => {
    let frame = 0;
    const updateScrollState = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const scrolled = window.scrollY > 12;
        setHeaderScrolled((current) => current === scrolled ? current : scrolled);
      });
    };

    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateScrollState);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const sectionIds = ['home', 'about', 'product', 'how-it-works', 'pricing', 'contact'];
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top);
        const active = visibleSections[0]?.target.id;
        if (active) {
          setActiveSection(active === 'home' ? '#top' : `#${active}`);
        }
      },
      { rootMargin: '-88px 0px -88px 0px', threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);
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

  useEffect(() => {
    const sections = ['#about', '#product'].flatMap((selector) => {
      const section = document.querySelector<HTMLElement>(selector);
      if (!section) return [];

      const elements = Array.from(
        section.querySelectorAll<HTMLElement>(
          selector === '#about' ? '[data-about-reveal]' : '[data-feature-reveal]',
        ),
      );
      return elements.length > 0 ? [{ section, elements }] : [];
    });
    const elements = sections.flatMap(({ elements: sectionElements }) => sectionElements);
    if (elements.length === 0) return;

    const revealImmediately = () => {
      elements.forEach((element) => element.classList.add('is-visible'));
    };

    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !('IntersectionObserver' in window)
    ) {
      revealImmediately();
      return;
    }

    sections.forEach(({ section }) => {
      section.classList.add(
        section.id === 'about' ? 'home-about-motion-ready' : 'home-feature-motion-ready',
      );
    });
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: '0px 0px -36px 0px' },
    );

    elements.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
      sections.forEach(({ section }) => {
        section.classList.remove(
          section.id === 'about' ? 'home-about-motion-ready' : 'home-feature-motion-ready',
        );
      });
    };
  }, []);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <main id="top" className="overflow-clip bg-white text-[#17231D]">
      <header className={`home-header sticky top-0 z-50${headerScrolled ? ' is-scrolled' : ''}`}>
        <div className="home-header-inner page-container mx-auto flex h-[76px] items-center lg:h-[88px]">
          <div className="home-nav-shell mx-auto flex w-full max-w-[1200px] items-center justify-between gap-3 px-4 sm:px-6">
            <BrandLogo size="sm" />

            <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
              {navigationLinks.map(([label, href]) => {
                const isActive = activeSection === href;
                return (
                  <a
                    key={label}
                    href={href}
                    aria-current={isActive ? 'location' : undefined}
                    className={`rounded-full px-3 py-2 text-xs font-semibold transition sm:px-3.5 ${
                      isActive
                        ? 'bg-[#BDF5CF] text-[#17372A]'
                        : 'text-[#3F5147] hover:bg-white/80 hover:text-[#087C50]'
                    }`}
                  >
                    {label}
                  </a>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <a
                href="#book-demo"
                className="home-demo-nav-button inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-[#A6F1B8] px-4 text-xs font-bold text-[#153528] transition hover:-translate-y-0.5 hover:bg-[#8DE8A5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#237A50] focus-visible:ring-offset-2 sm:px-5"
              >
                Book a Demo <ArrowRight className="h-3.5 w-3.5" />
              </a>
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
              {navigationLinks.map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  onClick={closeMenu}
                  aria-current={activeSection === href ? 'location' : undefined}
                  className={`block rounded-xl px-3 py-3 text-sm font-medium transition hover:bg-[#E8F3EC] ${
                    activeSection === href ? 'bg-[#E8F3EC] text-[#087C50]' : 'text-[#263B30]'
                  }`}
                >
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
          <div className="home-hero-copy mx-auto max-w-[900px]">
            <p className="home-hero-eyebrow mb-3 inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/55 px-3.5 py-1.5 text-[11px] font-semibold text-[#244636] backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-[#56D887] shadow-[0_0_0_5px_rgba(86,216,135,0.14)]" aria-hidden="true" />
              Smart Queue Solution
            </p>
            <h1 className="home-hero-heading text-[clamp(2.6rem,6.6vw,4.7rem)] font-bold leading-[0.98] tracking-[-0.065em] text-[#182630]">
              <span className="home-heading-desktop">
                One account
                <br />
                <span className="home-heading-accent">For your restaurant.</span>
              </span>
              <span className="home-heading-mobile">
                One account
                <br />
                <span className="home-heading-accent">For your restaurant.</span>
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-[660px] text-sm font-medium leading-6 text-[#52625A] sm:mt-5 sm:text-base sm:leading-7">
              Join restaurant queues,track your waiting time in real time.
              <br className="hidden sm:block" /> Everything you need.
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

          <div className="home-hero-stage relative mx-auto mt-4 grid w-full max-w-[1180px] items-center gap-4 pb-8 sm:mt-6 sm:pb-10 lg:mt-4 lg:grid-cols-[minmax(0,1fr)_290px_minmax(0,1fr)] lg:gap-7 lg:pb-4">
            <div className="home-hero-side home-hero-side-left">
              <article className="home-float-card home-booking-card">
                <span className="home-booking-thumb">
                  <Image src="/brand/mascot.png" alt="WePass QR scan mascot" width={72} height={72} sizes="72px" />
                </span>
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-sm font-bold text-[#17231D]">Digital Queue Pass</p>
                  <p className="mt-1 text-xs leading-5 text-[#69766F]">Created when you join a restaurant queue.</p>
                  <p className="mt-2 inline-flex rounded-lg bg-[#E8F3EC] px-2.5 py-1 text-[11px] font-semibold text-[#237A50]">No guest app required</p>
                </div>
              </article>
              <article className="home-float-card home-feature-card">
                <span className="home-card-icon"><Armchair className="h-5 w-5" /></span>
                <div className="text-left">
                  <p className="text-sm font-bold text-[#17231D]">Table Availability</p>
                  <p className="mt-1 text-xs leading-5 text-[#69766F]">See table status managed by the restaurant.</p>
                </div>
              </article>
            </div>

            <div className="home-product-preview relative z-10 mx-auto w-full max-w-[290px] text-left" aria-label="Illustrative WePass guest queue pass">
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
                  <span className="home-card-icon"><ChartNoAxesColumnIncreasing className="h-5 w-5" /></span>
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
        <div className="page-container mx-auto">
          <div className="home-about-hero">
            <div className="home-about-copy" data-about-reveal="copy">
              <p className="home-eyebrow"><span /> About WePass</p>
              <h2 className="home-section-title mt-4">
                Smarter Queue Management for a <span>Better Dining Experience.</span>
              </h2>
              <p className="home-about-description">
                WePass helps restaurants manage queue flow and perations, while guests follow their place in line from a mobile browser.
              </p>

              <div className="home-about-stats" role="group" aria-label="Live WePass platform statistics">
                <div className="home-about-stat">
                  <UsersRound aria-hidden="true" />
                  <span><strong>{proofStats?.guestsServed.toLocaleString() ?? '—'}</strong><small>Guests served</small></span>
                </div>
                <div className="home-about-stat">
                  <Building2 aria-hidden="true" />
                  <span><strong>{proofStats?.activeRestaurants.toLocaleString() ?? '—'}</strong><small>Active restaurants</small></span>
                </div>
                <div className="home-about-stat">
                  <Timer aria-hidden="true" />
                  <span>
                    <strong>
                      {proofStats
                        ? proofStats.averageWaitMinutes === null
                          ? 'No data'
                          : `${proofStats.averageWaitMinutes} min`
                        : '—'}
                    </strong>
                    <small>Average wait to seat</small>
                  </span>
                </div>
              </div>
              {proofError && (
                <p className="home-about-stats-status" role="status">
                  Live platform statistics are temporarily unavailable.
                </p>
              )}
              <p className="home-about-stats-note">Live platform activity; guest and wait-time totals cover the last 7 days.</p>

              <Link href="#how-it-works" className="home-outline-button mt-7">
                Learn More <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="home-about-visual" data-about-reveal="visual">
              <div className="home-about-visual-halo" aria-hidden="true" />
              <div className="home-about-visual-grid" aria-hidden="true" />
              <Image
                src="/brand/mascot.png"
                alt="WePass mascot displaying a QR code for joining a restaurant queue"
                width={935}
                height={1199}
                sizes="(max-width: 767px) 90vw, 48vw"
                className="home-about-mascot"
              />
              <div className="home-about-float-card home-about-float-card-top">
                <span><QrCode aria-hidden="true" /></span>
                <p><strong>Join from your phone</strong><small>No guest app required</small></p>
              </div>
              <div className="home-about-float-card home-about-float-card-bottom">
                <span><ChartNoAxesColumnIncreasing aria-hidden="true" /></span>
                <p><strong>Clearer queue flow</strong><small>Live status from the restaurant</small></p>
              </div>
              <span className="home-about-spark home-about-spark-one" aria-hidden="true" />
              <span className="home-about-spark home-about-spark-two" aria-hidden="true" />
              <span className="home-about-spark home-about-spark-three" aria-hidden="true" />
            </div>
          </div>

          <div className="home-purpose-grid">
            {[
              {
                Icon: Rocket,
                title: 'Our Mission',
                description: 'Make restaurant queues easier to manage and easier for guests to follow.',
              },
              {
                Icon: Gem,
                title: 'Our Vision',
                description: 'A more seamless dining experience for guests and restaurant teams.',
              },
              {
                Icon: Handshake,
                title: 'Our Values',
                description: 'Clear communication, thoughtful operations, and guest-first service.',
              },
            ].map(({ Icon, title, description }) => (
              <article
                key={title}
                className="home-purpose-card"
                data-about-reveal="purpose"
              >
                <span className="home-purpose-icon"><Icon aria-hidden="true" /></span>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="home-section home-steps-section">
        <div className="page-container mx-auto">
          <div className="mx-auto max-w-3xl text-center">
            <p className="home-eyebrow justify-center"><span /> How It Works</p>
            <h2 className="home-section-title mt-4">A simple 3-step process <span>for a smoother dining experience.</span></h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#69766F] sm:text-base">Scan, join, and follow your place in the queue—all from your phone.</p>
          </div>
          <div className="home-step-grid">
            {[
              {
                Icon: QrCode,
                title: 'Scan the QR code',
                description: 'Scan the WePass QR code available at the restaurant.',
                visual: 'scan',
              },
              {
                Icon: Smartphone,
                title: 'Join the queue',
                description: 'Enter your details to join and receive your queue pass.',
                visual: 'join',
              },
              {
                Icon: BellRing,
                title: 'Track your turn',
                description: 'Check your live queue status and return when called.',
                visual: 'track',
              },
            ].map(({ Icon, title, description, visual }, index) => (
              <React.Fragment key={title}>
                <article className={`home-step-card home-step-card-${visual}`}>
                  <span className="home-step-number" aria-label={`Step ${index + 1}`}>{index + 1}</span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <div className={`home-step-visual home-step-visual-${visual}`} aria-hidden="true">
                    {visual === 'scan' && (
                      <div className="home-step-qr-art">
                        <span className="home-step-corner home-step-corner-tl" />
                        <span className="home-step-corner home-step-corner-tr" />
                        <span className="home-step-corner home-step-corner-bl" />
                        <div className="home-step-qr-mark"><Icon /></div>
                        <span className="home-step-corner home-step-corner-br" />
                      </div>
                    )}
                    {visual === 'join' && (
                      <div className="home-step-phone">
                        <div className="home-step-phone-camera" />
                        <div className="home-step-phone-brand">
                          <Image src="/brand/wepass-icon.png" alt="" width={18} height={18} />
                          <strong>WePass</strong>
                        </div>
                        <span className="home-step-phone-check"><Check /></span>
                        <strong className="home-step-phone-title">You’re in the queue</strong>
                        <span className="home-step-phone-token">Your queue pass</span>
                        <span className="home-step-phone-status"><i /> Live status</span>
                      </div>
                    )}
                    {visual === 'track' && (
                      <div className="home-step-track-art">
                        <Image
                          src="/brand/queue-table.png"
                          alt=""
                          fill
                          sizes="(max-width: 767px) 90vw, 30vw"
                          className="home-step-table-image"
                        />
                        <div className="home-step-update">
                          <span><Check /></span>
                          <div><strong>Queue status</strong><small>Check your pass for updates</small></div>
                        </div>
                      </div>
                    )}
                  </div>
                </article>
                {index < 2 && (
                  <span className="home-step-connector" aria-hidden="true">
                    <ArrowRight />
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      <section id="product" className="section-padding home-feature-section">
        <div className="page-container mx-auto">
          <div className="home-feature-showcase">
            <div className="home-feature-showcase-copy" data-feature-reveal="copy">
              <p className="home-eyebrow"><span /><ChartNoAxesColumnIncreasing aria-hidden="true" /> Powerful Features</p>
              <h2 className="home-section-title mt-5">Smarter Queue <span>Management</span></h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-[#53665D] sm:text-base">
                Everything your team needs to manage restaurant queues and give guests a clearer dining experience.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="/business-registration" className="home-primary-button">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="#how-it-works" className="home-outline-button">
                  Explore how it works
                </Link>
              </div>
              <div className="home-feature-trust">
                <span><Check aria-hidden="true" /> QR-based queue joining</span>
                <span><Check aria-hidden="true" /> Guest pass in the browser</span>
                <span><Check aria-hidden="true" /> Live queue status</span>
              </div>
            </div>
            <div className="home-dashboard-preview" data-feature-reveal="dashboard" role="region" aria-label="WePass dashboard preview with live platform statistics">
              <div className="home-dashboard-topbar">
                <div className="home-dashboard-brand">
                  <Image src="/brand/wepass-icon.png" alt="" width={24} height={24} className="h-6 w-6 rounded-md object-cover" />
                  <span>WePass</span>
                </div>
                <div className="home-dashboard-topbar-meta">
                  <span className="home-dashboard-preview-label">Restaurant workspace</span>
                  <span className="home-dashboard-preview-scope">Platform overview</span>
                </div>
              </div>
              <div className="home-dashboard-body">
                <aside className="home-dashboard-sidebar" aria-hidden="true">
                  <span className="home-dashboard-nav-item active"><Home /><span>Overview</span></span>
                  <span className="home-dashboard-nav-item"><UsersRound /><span>Queue</span></span>
                  <span className="home-dashboard-nav-item"><ChartNoAxesColumnIncreasing /><span>Reports</span></span>
                  <span className="home-dashboard-nav-item"><Utensils /><span>Restaurant settings</span></span>
                  <span className="home-dashboard-nav-item"><QrCode /><span>QR code</span></span>
                  <span className="home-dashboard-nav-item"><UserRound /><span>Account profile</span></span>
                </aside>
                <div className="home-dashboard-main">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="home-dashboard-heading">Platform overview</p>
                      <p className="home-dashboard-subheading">Live activity from WePass restaurants</p>
                    </div>
                    <Link href="/dashboard" className="home-dashboard-action">Open dashboard <ArrowRight /></Link>
                  </div>
                  <div
                    className={`home-dashboard-status${proofError ? ' is-unavailable' : ''}`}
                    role={proofError ? 'status' : undefined}
                  >
                    <span aria-hidden="true" />
                    {proofError
                      ? 'Current platform statistics are unavailable'
                      : 'Live totals from real, non-demo queue records'}
                  </div>
                  <div className="home-dashboard-metrics">
                    {[
                      { label: 'Active restaurants', note: 'Currently active', value: proofStats?.activeRestaurants.toLocaleString() ?? '—', Icon: Building2, color: 'green' },
                      { label: 'Parties waiting', note: 'Across active restaurants', value: proofStats?.partiesWaiting.toLocaleString() ?? '—', Icon: UsersRound, color: 'blue' },
                      { label: 'Guests served', note: 'Last 30 days', value: proofStats?.guestsServed.toLocaleString() ?? '—', Icon: Check, color: 'purple' },
                      { label: 'Average wait to seat', note: 'Last 30 days', value: proofStats?.averageWaitMinutes == null ? '—' : `${proofStats.averageWaitMinutes} min`, Icon: Timer, color: 'orange' },
                    ].map(({ label, note, value, Icon, color }) => (
                      <div className="home-dashboard-stat-card" key={label}>
                        <span className={`home-dashboard-stat-icon ${color}`}><Icon /></span>
                        <small>{label}</small>
                        <strong>{value}</strong>
                        <span className="home-dashboard-stat-note">{note}</span>
                      </div>
                    ))}
                  </div>
                  <div className="home-dashboard-workspace">
                    <div className="home-dashboard-workspace-panel">
                      <div className="home-dashboard-panel-heading">
                        <div><strong>Queue overview</strong><span>Guest activity across active restaurants</span></div>
                        <span className="home-dashboard-panel-badge">
                          {proofStats ? `${proofStats.partiesWaiting.toLocaleString()} waiting` : 'Live queue'}
                        </span>
                      </div>
                      <div className="home-dashboard-queue-state">
                        <span className="home-dashboard-queue-icon"><UsersRound /></span>
                        <strong>
                          {proofError
                            ? 'Queue activity unavailable'
                            : proofStats
                              ? proofStats.partiesWaiting === 0
                                ? 'No parties waiting right now'
                                : `${proofStats.partiesWaiting.toLocaleString()} parties waiting`
                              : 'Loading live queue activity'}
                        </strong>
                        <span>
                          {proofError
                            ? 'Please try again later.'
                            : 'Guest names and queue details are available to each restaurant in its dashboard.'}
                        </span>
                      </div>
                    </div>
                    <div className="home-dashboard-workspace-panel">
                      <div className="home-dashboard-panel-heading">
                        <div><strong>Restaurant tools</strong><span>Manage operations in your account</span></div>
                        <span className="home-dashboard-workspace-icon"><Armchair /></span>
                      </div>
                      <div className="home-dashboard-tool-links">
                        <Link href="/dashboard/tables"><Armchair />Tables<ArrowRight /></Link>
                        <Link href="/dashboard/reports"><ChartNoAxesColumnIncreasing />Reports<ArrowRight /></Link>
                        <Link href="/dashboard/qr"><QrCode />Restaurant QR<ArrowRight /></Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="home-feature-cards">
            {[
              {
                icon: Clock3,
                title: 'Live Queue Overview',
                description: 'Keep track of queue activity and guest status from your restaurant account.',
              },
              {
                icon: QrCode,
                title: 'Digital Guest Pass',
                description: 'Guests join and follow their queue from a mobile browser—no app download required.',
              },
              {
                icon: BellRing,
                title: 'Guest Status Updates',
                description: 'Guests can check their live queue page as the restaurant updates their status.',
              },
              {
                icon: Armchair,
                title: 'Tables & Operations',
                description: 'Coordinate table availability, queue flow and restaurant details in one account.',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="home-product-feature-card" data-feature-reveal="card">
                  <span><Icon /></span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              );
            })}
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

      <BookDemoSection />

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
                  href="https://www.instagram.com/wepass.offical/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WePass on Instagram"
                >
                  <Camera aria-hidden="true" />
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
              <a href="https://www.instagram.com/wepass.offical/" target="_blank" rel="noopener noreferrer">Instagram</a>
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
