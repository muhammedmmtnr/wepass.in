'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  QrCode,
  Users,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  Store,
  LayoutDashboard,
  MessageSquare,
  Armchair,
  Check,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'guest' | 'staff' | 'owner' | 'admin'>('guest');

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-slate-800 selection:bg-wepass-100 selection:text-wepass-800">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-wepass-200/50 px-4 md:px-8 py-3.5">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <BrandLogo size="md" showSubtitle />

          <div className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-600">
            <a href="#experiences" className="hover:text-wepass-700 transition">
              Connected Experiences
            </a>
            <a href="#fairness" className="hover:text-wepass-700 transition">
              Fairness Engine
            </a>
            <a href="#live-demo" className="hover:text-wepass-700 transition">
              Live Product Demo
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-wepass-600 px-4 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-wepass-700 transition"
            >
              Register Restaurant
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Soft background ambient gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#E8F3EC] via-[#E8F3EC]/50 to-transparent pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Positioning & Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-white border border-wepass-200 px-3.5 py-1 text-xs font-bold text-wepass-800 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Next-Generation Restaurant Queue &amp; Table Management</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.1]">
                Your Queue. <br />
                Your Time. <br />
                <span className="text-wepass-600">Your Table.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl font-medium">
                Eliminate crowded waiting lines. WePass turns every restaurant queue into a seamless, mobile-first experience with static QR codes, live waiting updates, and verified arrival confirmations.
              </p>

              {/* 4 Connected Portals CTA */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href="/r/olive-bistro"
                  className="flex items-center gap-2 rounded-2xl bg-wepass-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-premium shadow-wepass-500/25 hover:bg-wepass-700 active:scale-[0.99] transition"
                >
                  <Smartphone className="h-4 w-4" /> Guest QR Experience →
                </Link>

                <Link
                  href="/staff"
                  className="flex items-center gap-2 rounded-2xl bg-white border border-slate-200 px-5 py-3.5 text-sm font-bold text-slate-800 shadow-sm hover:bg-slate-50 transition"
                >
                  <Users className="h-4 w-4 text-wepass-600" /> Host Queue Desk
                </Link>

                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-2xl bg-white border border-slate-200 px-5 py-3.5 text-sm font-bold text-slate-800 shadow-sm hover:bg-slate-50 transition"
                >
                  <LayoutDashboard className="h-4 w-4 text-slate-600" /> Owner Portal
                </Link>

                <Link
                  href="/admin"
                  className="flex items-center gap-2 rounded-2xl bg-white border border-slate-200 px-5 py-3.5 text-sm font-bold text-slate-800 shadow-sm hover:bg-slate-50 transition"
                >
                  <ShieldCheck className="h-4 w-4 text-amber-600" /> Super Admin
                </Link>
              </div>

              {/* Value propositions pills */}
              <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-600 font-semibold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-wepass-600 shrink-0" />
                  <span>One Static Reusable QR</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-wepass-600 shrink-0" />
                  <span>Live Queue Tracking PWA</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-wepass-600 shrink-0" />
                  <span>Party-Size Engine (A-D)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-wepass-600 shrink-0" />
                  <span>&quot;I&apos;m Coming&quot; Confirmation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-wepass-600 shrink-0" />
                  <span>Audited Fairness Policy</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-wepass-600 shrink-0" />
                  <span>Zero Demo Fake Data</span>
                </div>
              </div>
            </div>

            {/* Right Column: 3D Mascot & Brand Assets Card */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-sm rounded-4xl bg-gradient-to-b from-white to-[#E8F3EC] p-6 shadow-premium border border-white/80 text-center">
                <div className="relative mx-auto w-64 h-80 overflow-hidden rounded-3xl bg-transparent mb-4 flex items-center justify-center">
                  <img
                    src="/brand/mascot.png"
                    alt="WePass Brand Mascot"
                    className="h-full w-full object-contain drop-shadow-xl"
                  />
                </div>

                <div className="rounded-2xl bg-white p-4 shadow-sm border border-wepass-100 flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Demo Restaurant Live Spot
                    </p>
                    <p className="text-sm font-extrabold text-slate-900">The Olive Bistro</p>
                    <p className="text-xs text-wepass-700 font-semibold">Token A01 • Table Called</p>
                  </div>
                  <Link
                    href="/queue/A01?slug=olive-bistro"
                    className="rounded-xl bg-wepass-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-wepass-700 transition"
                  >
                    Track Spot →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Connected Experiences Interactive Section */}
      <section id="experiences" className="py-16 md:py-24 bg-white border-y border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-wider text-wepass-700 bg-wepass-50 border border-wepass-200 px-3 py-1 rounded-full">
              Single Unified Ecosystem
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3 mb-2">
              Four Connected Experiences. One Real Database.
            </h2>
            <p className="text-sm text-slate-500">
              Guests, hosts, managers, and super-admins all communicate in real-time on the same engine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1. Guest Experience */}
            <div className="rounded-3xl bg-[#F8FAF9] p-6 border border-slate-200/80 flex flex-col justify-between hover:shadow-premium transition">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 mb-4">
                  <Smartphone className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mb-1">Guest Mobile PWA</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Scan static QR, join in seconds, watch position decrease live, get called, and tap &quot;I&apos;m Coming&quot;.
                </p>
                <div className="space-y-1.5 text-xs text-slate-600 font-medium">
                  <p>✓ No app download needed</p>
                  <p>✓ Parties ahead &amp; wait countdown</p>
                  <p>✓ Arrival confirmation timer</p>
                  <p>✓ Seated screen with digital menu</p>
                </div>
              </div>
              <Link
                href="/r/olive-bistro"
                className="mt-6 flex items-center justify-between text-xs font-bold text-wepass-700 bg-white border border-slate-200 p-2.5 rounded-xl hover:bg-slate-50 transition"
              >
                <span>Try Guest Flow</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* 2. Staff Queue Desk */}
            <div className="rounded-3xl bg-[#F8FAF9] p-6 border border-slate-200/80 flex flex-col justify-between hover:shadow-premium transition">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 mb-4">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mb-1">Staff Queue Desk</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Rapid queue handling at entrance, WhatsApp callouts, table assignment, and walk-in registration.
                </p>
                <div className="space-y-1.5 text-xs text-slate-600 font-medium">
                  <p>✓ Pre-filled WhatsApp integration</p>
                  <p>✓ Audited early-call fairness checks</p>
                  <p>✓ Party-compatible table seating</p>
                  <p>✓ Manual walk-in entry support</p>
                </div>
              </div>
              <Link
                href="/staff"
                className="mt-6 flex items-center justify-between text-xs font-bold text-amber-800 bg-white border border-slate-200 p-2.5 rounded-xl hover:bg-slate-50 transition"
              >
                <span>Launch Host Desk</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* 3. Owner Dashboard */}
            <div className="rounded-3xl bg-[#F8FAF9] p-6 border border-slate-200/80 flex flex-col justify-between hover:shadow-premium transition">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-purple-700 mb-4">
                  <LayoutDashboard className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mb-1">Owner Dashboard</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Floor table layout, printable QR stand kits, staff permissions, digital menu, and CSV reports.
                </p>
                <div className="space-y-1.5 text-xs text-slate-600 font-medium">
                  <p>✓ Table capacities &amp; sections</p>
                  <p>✓ High-res printable QR stands</p>
                  <p>✓ Staff role access controls</p>
                  <p>✓ Table turnover &amp; wait time analytics</p>
                </div>
              </div>
              <Link
                href="/dashboard"
                className="mt-6 flex items-center justify-between text-xs font-bold text-purple-800 bg-white border border-slate-200 p-2.5 rounded-xl hover:bg-slate-50 transition"
              >
                <span>Open Owner Portal</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* 4. Super Admin */}
            <div className="rounded-3xl bg-[#F8FAF9] p-6 border border-slate-200/80 flex flex-col justify-between hover:shadow-premium transition">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 mb-4">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mb-1">Super-Admin Panel</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Multi-tenant platform oversight, restaurant directory CRUD, plans &amp; subscriptions, global audit trail.
                </p>
                <div className="space-y-1.5 text-xs text-slate-600 font-medium">
                  <p>✓ Restaurant activation &amp; suspension</p>
                  <p>✓ Subscription plan management</p>
                  <p>✓ Platform-wide MRR &amp; queue stats</p>
                  <p>✓ Global fairness exception logs</p>
                </div>
              </div>
              <Link
                href="/admin"
                className="mt-6 flex items-center justify-between text-xs font-bold text-blue-800 bg-white border border-slate-200 p-2.5 rounded-xl hover:bg-slate-50 transition"
              >
                <span>Open Platform Ops</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Fairness System Spotlight Section */}
      <section id="fairness" className="py-16 md:py-24 bg-[#E8F3EC]/40">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-black uppercase tracking-wider text-amber-800 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full">
                Zero Line-Jumping Fraud
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                The WePass Fairness System
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Guest trust is broken when staff arbitrarily favor friends or jump people in line. WePass enforces a strict fairness engine:
              </p>
              <div className="space-y-3 pt-2 text-xs text-slate-700">
                <div className="flex items-start gap-3 rounded-2xl bg-white p-3.5 shadow-sm border border-amber-100">
                  <div className="h-2 w-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <div>
                    <strong className="text-slate-900">Automatic Bypass Detection:</strong> If staff attempts to call a guest while earlier parties in that party-group are waiting, the system intercepts the call.
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-white p-3.5 shadow-sm border border-amber-100">
                  <div className="h-2 w-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <div>
                    <strong className="text-slate-900">Mandatory Audited Reason:</strong> Staff must select an auditable reason (e.g. Table Compatibility, Earlier Guest Not Present, Accessibility Need, or Manager Exception).
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-white p-3.5 shadow-sm border border-amber-100">
                  <div className="h-2 w-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <div>
                    <strong className="text-slate-900">Permanent Compliance Trail:</strong> Recorded in database audit logs with staff identity, timestamp, and bypassed ticket tokens for restaurant owners &amp; super-admins.
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-3xl bg-white p-6 shadow-float border border-amber-200">
                <div className="flex items-center gap-2.5 text-amber-700 font-bold text-sm mb-3">
                  <ShieldCheck className="h-5 w-5" />
                  <span>Fairness Audit Snapshot</span>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 font-mono text-xs space-y-2 text-slate-700">
                  <p><span className="text-slate-400">Target Guest:</span> Token A03 (Rohan V., 2p)</p>
                  <p><span className="text-slate-400">Bypassed Guests:</span> [Token A01, Token A02]</p>
                  <p><span className="text-slate-400">Audited Reason:</span> TABLE_COMPATIBILITY</p>
                  <p><span className="text-slate-400">Staff Responsible:</span> Alex Chen (Host Desk)</p>
                  <p><span className="text-slate-400">Manager Approved:</span> Elena Gilbert (Shift Mgr)</p>
                  <p className="text-emerald-700 font-bold">✓ Audit Logged to PostgreSQL/SQLite</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Role-Switcher Testing Pills */}
      <section id="live-demo" className="py-12 bg-white border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 md:px-8 text-center space-y-4">
          <h3 className="text-base font-extrabold text-slate-900">
            One-Click Access to All Four Experiences
          </h3>
          <p className="text-xs text-slate-500">
            Click any button below to instantly explore each connected role without typing credentials:
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/r/olive-bistro"
              className="rounded-2xl bg-wepass-50 border border-wepass-200 px-4 py-2.5 text-xs font-bold text-wepass-800 hover:bg-wepass-100 transition shadow-sm"
            >
              📱 Guest QR Join (/r/olive-bistro)
            </Link>

            <Link
              href="/queue/A01?slug=olive-bistro"
              className="rounded-2xl bg-wepass-50 border border-wepass-200 px-4 py-2.5 text-xs font-bold text-wepass-800 hover:bg-wepass-100 transition shadow-sm"
            >
              🔔 Guest Live Tracker (/queue/A01)
            </Link>

            <Link
              href="/staff"
              className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-2.5 text-xs font-bold text-amber-900 hover:bg-amber-100 transition shadow-sm"
            >
              👨‍🍳 Host Staff Desk (/staff)
            </Link>

            <Link
              href="/dashboard"
              className="rounded-2xl bg-purple-50 border border-purple-200 px-4 py-2.5 text-xs font-bold text-purple-900 hover:bg-purple-100 transition shadow-sm"
            >
              📊 Restaurant Owner Portal (/dashboard)
            </Link>

            <Link
              href="/admin"
              className="rounded-2xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition shadow-sm"
            >
              🛡️ Super-Admin Ops (/admin)
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4 md:px-8">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-wepass-600 text-white font-extrabold text-sm">
              W
            </div>
            <div>
              <p className="font-extrabold text-white text-sm">WePass</p>
              <p className="text-[11px] text-slate-400">Your Queue. Your Time. Your Table.</p>
            </div>
          </div>

          <p className="text-center md:text-left">
            Production-ready restaurant queue &amp; table platform. Built with Next.js, Prisma, and Tailwind CSS.
          </p>

          <p className="text-slate-500">© 2026 WePass Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
