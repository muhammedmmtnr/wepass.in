'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowDownRight,
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

    return () => controller.abort();
  }, []);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <main className="overflow-hidden bg-white text-[#25352C]">
      <header className="sticky top-0 z-50 border-b border-[#E5EAE6]/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <BrandLogo size="md" />

          <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
            {[
              ['Product', '#product'],
              ['How it works', '#how-it-works'],
              ['Restaurants', '#restaurants'],
              ['FAQ', '#faq'],
            ].map(([label, href]) => (
              <a key={href} href={href} className="text-sm font-medium text-[#77847B] transition hover:text-[#079F61]">
                {label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link href="/login" className="rounded-full px-4 py-2.5 text-sm font-semibold text-[#25352C] transition hover:bg-[#F3F6F3]">
              Sign in
            </Link>
            <Link href="/business-registration" className="rounded-full bg-[#079F61] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#067F4E]">
              Request access
            </Link>
          </div>

          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#25352C] transition hover:bg-[#F3F6F3] md:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <nav aria-label="Mobile navigation" className="border-t border-[#E5EAE6] bg-white px-4 py-4 shadow-lg md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-1">
              {[
                ['Product', '#product'],
                ['How it works', '#how-it-works'],
                ['Restaurants', '#restaurants'],
                ['FAQ', '#faq'],
              ].map(([label, href]) => (
                <a key={href} href={href} onClick={closeMenu} className="rounded-xl px-3 py-3 text-sm font-medium text-[#25352C] hover:bg-[#F3F6F3]">
                  {label}
                </a>
              ))}
              <div className="mt-2 grid grid-cols-2 gap-3 border-t border-[#E5EAE6] pt-4">
                <Link href="/login" onClick={closeMenu} className="rounded-full border border-[#E5EAE6] px-4 py-3 text-center text-sm font-semibold">
                  Sign in
                </Link>
                <Link href="/business-registration" onClick={closeMenu} className="rounded-full bg-[#079F61] px-4 py-3 text-center text-sm font-semibold text-white">
                  Request access
                </Link>
              </div>
            </div>
          </nav>
        )}
      </header>

      <section className="relative isolate bg-[#F8FAF8]">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_72%_38%,rgba(232,243,236,0.9),transparent_42%)]" />
        <div className="mx-auto grid min-h-[680px] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div className="max-w-2xl">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#B8EBD0] bg-white/80 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#067F4E]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#079F61]" />
              The next generation of restaurant queues
            </p>
            <h1 className="text-[clamp(3.1rem,7vw,5.7rem)] font-semibold leading-[0.99] tracking-[-0.065em] text-[#25352C]">
              Good food deserves <span className="font-serif font-medium italic text-[#079F61]">better waiting.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-[#77847B] sm:text-lg sm:leading-8">
              Join the queue in seconds. Follow your place live. Get seated when your table is ready. A calmer experience for every guest and restaurant.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/business-registration" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#079F61] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(7,159,97,0.18)] transition hover:-translate-y-0.5 hover:bg-[#067F4E]">
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#product" className="inline-flex items-center justify-center gap-2 rounded-full border border-[#B8EBD0] bg-white px-6 py-3.5 text-sm font-semibold text-[#067F4E] transition hover:bg-[#EFFAF4]">
                Explore WePass <ArrowDownRight className="h-4 w-4" />
              </a>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-[#77847B]">
              {['No guest app required', 'One permanent QR', 'Live queue updates'].map((item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[#079F61]" /> {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[500px] py-8">
            <div className="absolute left-2 top-20 z-10 hidden -rotate-6 rounded-2xl border border-white/80 bg-white/90 p-4 shadow-[0_18px_48px_rgba(32,57,40,0.12)] backdrop-blur sm:block">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#067F4E]">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#DDF5E8]"><Check className="h-4 w-4" /></span>
                Queue joined
              </div>
              <p className="mt-1 pl-9 text-[11px] text-[#77847B]">Your place is saved</p>
            </div>
            <div className="absolute -right-1 bottom-24 z-10 hidden rotate-3 rounded-2xl border border-white/80 bg-white/90 p-4 shadow-[0_18px_48px_rgba(32,57,40,0.12)] backdrop-blur sm:block">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#25352C]">
                <BellRing className="h-4 w-4 text-[#C9A858]" /> Table almost ready
              </div>
              <p className="mt-1 pl-6 text-[11px] text-[#77847B]">A clear call when it’s your turn</p>
            </div>

            <div className="mx-auto w-[min(100%,310px)] rounded-[2.8rem] border-[7px] border-[#064D33] bg-[#064D33] p-2 shadow-[0_38px_100px_rgba(6,77,51,0.22)]">
              <div className="overflow-hidden rounded-[2.2rem] bg-[#F8FAF8]">
                <div className="flex h-8 items-center justify-center bg-[#064D33]">
                  <div className="h-4 w-20 rounded-full bg-black/70" />
                </div>
                <div className="px-5 pb-6 pt-3">
                  <div className="flex items-center justify-between">
                    <BrandLogo size="sm" />
                    <span className="rounded-full bg-[#DDF5E8] px-2.5 py-1 text-[9px] font-bold text-[#067F4E]">PREVIEW</span>
                  </div>
                  <div className="mt-6 overflow-hidden rounded-2xl bg-[#079F61] p-4 text-white">
                    <p className="text-[10px] font-medium text-white/70">A more relaxed wait</p>
                    <h2 className="mt-1 text-lg font-bold tracking-tight">Your place, in your pocket.</h2>
                    <div className="mt-5 flex items-end justify-between">
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.12em] text-white/60">Queue token</p>
                        <p className="mt-1 font-mono text-3xl font-bold tracking-tight">A— —</p>
                      </div>
                      <div className="rounded-full border border-white/25 px-2.5 py-1 text-[9px] font-semibold text-white/85">Product preview</div>
                    </div>
                  </div>
                  <div className="mt-3 rounded-2xl border border-[#E5EAE6] bg-white p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-semibold text-[#77847B]">LIVE QUEUE</p>
                        <p className="mt-1 text-sm font-bold text-[#25352C]">Follow your place</p>
                      </div>
                      <span className="h-2 w-2 rounded-full bg-[#079F61] shadow-[0_0_0_4px_#DDF5E8]" />
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                      {[0, 1, 2, 3].map((step) => (
                        <div key={step} className={`h-1.5 flex-1 rounded-full ${step === 0 ? 'bg-[#079F61]' : 'bg-[#E5EAE6]'}`} />
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between text-[10px]">
                      <span className="text-[#77847B]">A clear update when it’s your turn</span>
                      <Clock3 className="h-3.5 w-3.5 text-[#079F61]" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-3 rounded-xl bg-[#DDF5E8] p-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#079F61]"><QrCode className="h-4 w-4" /></div>
                    <div>
                      <p className="text-[10px] font-bold text-[#25352C]">Scan. Join. Wander.</p>
                      <p className="mt-0.5 text-[9px] text-[#77847B]">No app download needed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-5 text-center text-[10px] font-medium uppercase tracking-[0.14em] text-[#77847B]">Illustrative product preview</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="india-campaign-heading" className="bg-[#064D33] py-14 text-white sm:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
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
            <Link href="/business-registration" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-[#067F4E] transition hover:bg-[#EFFAF4]">
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

      <section id="how-it-works" className="border-y border-[#E5EAE6] bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#079F61]">A better rhythm, from the first scan</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.045em] text-[#25352C] sm:text-5xl">Four small steps.<br />A much better wait.</h2>
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
                <h3 className="mt-8 text-xl font-semibold tracking-tight text-[#25352C]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#77847B]">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="product" className="bg-[#F8FAF8] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#079F61]">One experience, thoughtfully connected</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.045em] text-[#25352C] sm:text-5xl">Less waiting at the door.<br />More ease all around.</h2>
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
                href: '/r/olive-bistro',
                action: 'Explore guest flow',
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
                <article key={item.id} id={item.id} className={`group flex min-h-[390px] flex-col rounded-[1.75rem] border border-[#E5EAE6] p-7 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(37,53,44,0.08)] sm:p-8 ${item.style}`}>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 text-[#079F61]"><Icon className="h-5 w-5" /></div>
                  <p className="mt-8 text-xs font-bold uppercase tracking-[0.14em] text-[#77847B]">{item.eyebrow}</p>
                  <h3 className="mt-2 text-2xl font-semibold leading-tight tracking-[-0.035em] text-[#25352C]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#66736A]">{item.description}</p>
                  <ul className="mt-6 space-y-2.5">
                    {item.points.map((point) => (
                      <li key={point} className="flex items-center gap-2 text-xs font-medium text-[#425348]"><Check className="h-3.5 w-3.5 text-[#079F61]" />{point}</li>
                    ))}
                  </ul>
                  <Link href={item.href} className="mt-auto inline-flex items-center gap-2 pt-8 text-sm font-semibold text-[#079F61]">
                    {item.action}<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#067F4E] py-20 text-white sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
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
                ['A01', 'Earlier eligible party', 'Waiting'],
                ['A02', 'Next in order', 'Waiting'],
                ['A03', 'Call requested', 'Reason required'],
              ].map(([token, description, status], index) => (
                <div key={token} className={`flex items-center justify-between rounded-xl p-3.5 ${index === 2 ? 'bg-white/10 ring-1 ring-[#DCC684]/40' : 'bg-white/[0.04]'}`}>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-[#DCC684]">{token}</span>
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

      <section id="proof" className="border-b border-[#E5EAE6] bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#079F61]">Real usage. Real operations.</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#25352C] sm:text-4xl">Proof in the queue.</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[#77847B]">Live totals from active, non-demo restaurants, calculated from actual queue records.</p>
          </div>
          {proofError ? (
            <p role="status" className="mt-8 rounded-2xl border border-[#E5EAE6] bg-[#F8FAF8] p-5 text-sm text-[#77847B]">Usage statistics are temporarily unavailable.</p>
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
                    <p className="text-3xl font-semibold tracking-tight text-[#079F61]">{value}</p>
                    <p className="mt-2 text-sm font-semibold text-[#25352C]">{label}</p>
                    <p className="mt-1 text-xs text-[#77847B]">{note}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs leading-5 text-[#77847B]">30-day totals exclude seeded demo activity. Wait time is measured from queue entry to seating.</p>
            </>
          )}
        </div>
      </section>

      <section id="restaurants" className="bg-[#F8FAF8] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] bg-[#DDF5E8] px-6 py-12 sm:px-12 sm:py-16 lg:flex lg:items-center lg:justify-between lg:gap-10">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#079F61]">For restaurants ready for a better flow</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.045em] text-[#25352C] sm:text-5xl">Bring your restaurant into the future.</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-[#66736A]">Tell us about your restaurant and the way your team works. We’ll help you find the right next step.</p>
            </div>
            <div className="mt-8 flex shrink-0 flex-col gap-3 sm:flex-row lg:mt-0 lg:flex-col">
              <Link href="/business-registration" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#079F61] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#067F4E]">
                Request access <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/register" className="inline-flex items-center justify-center rounded-full border border-[#B8EBD0] bg-white/70 px-6 py-3.5 text-sm font-semibold text-[#067F4E] transition hover:bg-white">
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="bg-white py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#079F61]">Frequently asked questions</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.045em] text-[#25352C] sm:text-5xl">Good to know.</h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[#77847B]">Practical answers for guests, hosts and restaurant owners.</p>
          </div>
          <div className="divide-y divide-[#E5EAE6] border-y border-[#E5EAE6]">
            {faqs.map((item) => (
              <details key={item.question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-[#25352C] marker:content-none">
                  {item.question}
                  <ChevronDown className="h-4 w-4 shrink-0 text-[#079F61] transition group-open:rotate-180" />
                </summary>
                <p className="max-w-2xl pr-8 pt-3 text-sm leading-6 text-[#77847B]">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-[#064D33] text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-10 border-b border-white/10 pb-10 md:flex-row">
            <div>
              <BrandLogo size="md" tone="light" />
              <p className="mt-4 max-w-xs text-sm leading-6 text-white/60">Your queue. Your time. Your table.</p>
            </div>
            <div className="grid grid-cols-2 gap-x-14 gap-y-4 text-sm sm:grid-cols-3">
              <a href="#product" className="text-white/70 hover:text-white">Product</a>
              <a href="#how-it-works" className="text-white/70 hover:text-white">How it works</a>
              <a href="#faq" className="text-white/70 hover:text-white">FAQ</a>
              <Link href="/business-registration" className="text-white/70 hover:text-white">Restaurant enquiry</Link>
              <Link href="/login" className="text-white/70 hover:text-white">Sign in</Link>
              <Link href="/register" className="text-white/70 hover:text-white">Create account</Link>
            </div>
          </div>
          <div className="flex flex-col gap-2 pt-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 WePass. Thoughtful queue management for restaurants.</p>
            <p>Built for better guest experiences.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
