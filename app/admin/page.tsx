'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Store,
  Users,
  Activity,
  CreditCard,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  Layers,
  CheckCircle2,
} from 'lucide-react';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminAnalytics() {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/analytics');
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
          setPlans(data.planDistribution || []);
          setRecentEvents(data.recentEvents || []);
        }
      } catch (e) {
      } finally {
        setLoading(false);
      }
    }
    loadAdminAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-wepass-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div className="bg-white p-6 rounded-3xl shadow-subtle border border-slate-200">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Platform Operations Overview</h1>
        <p className="text-xs text-slate-500 mt-1">
          Global WePass metrics across all registered restaurant tenants, queues, and subscriptions.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl bg-white p-5 shadow-subtle border border-slate-200">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Restaurants
            </span>
            <Store className="h-5 w-5 text-wepass-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">{stats?.totalRestaurants || 1}</p>
          <p className="text-[11px] text-emerald-700 mt-1 font-semibold">
            {stats?.activeRestaurants || 1} active &amp; running
          </p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-subtle border border-emerald-100">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Active Queues Today
            </span>
            <Activity className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-slate-900">{stats?.activeQueuesToday || 3}</p>
          <p className="text-[11px] text-emerald-700 mt-1 font-semibold">
            Parties currently waiting
          </p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-subtle border border-purple-100">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-800">
              Total Guests Served
            </span>
            <Users className="h-5 w-5 text-purple-500" />
          </div>
          <p className="text-3xl font-black text-slate-900">{stats?.totalGuestsServed || 24}</p>
          <p className="text-[11px] text-purple-700 mt-1 font-semibold">
            All-time seated dining guests
          </p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-subtle border border-amber-100">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Estimated MRR
            </span>
            <CreditCard className="h-5 w-5 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-slate-900">₹{stats?.mrr?.toLocaleString() || '3,499'}</p>
          <p className="text-[11px] text-amber-700 mt-1 font-semibold">
            Active paid subscriptions
          </p>
        </div>
      </div>

      {/* Plan Distribution and Recent Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription Plan Distribution */}
        <div className="rounded-3xl bg-white p-6 shadow-subtle border border-slate-200">
          <h3 className="text-base font-extrabold text-slate-900 mb-4">Subscription Tiers</h3>
          <div className="space-y-3">
            {plans.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-2xl bg-slate-50 border border-slate-100 p-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-extrabold text-slate-900">{p.name}</h4>
                    <span className="text-xs font-mono font-bold text-slate-500">
                      ₹{p.priceMonthly}/mo
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Tier: {p.tier}</p>
                </div>

                <div className="text-right">
                  <span className="text-lg font-black text-slate-900">
                    {p.activeSubscriptions}
                  </span>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Restaurants</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Activity Feed */}
        <div className="rounded-3xl bg-white p-6 shadow-subtle border border-slate-200">
          <h3 className="text-base font-extrabold text-slate-900 mb-4">Live Platform Activity Feed</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {recentEvents.length > 0 ? (
              recentEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="flex items-start justify-between rounded-xl bg-slate-50/70 p-3 text-xs border border-slate-100"
                >
                  <div>
                    <span className="font-bold text-slate-900">{ev.restaurant?.name}: </span>
                    <span className="text-slate-600">{ev.description || ev.eventType}</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(ev.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </p>
                  </div>
                  <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[9px] font-mono font-bold text-slate-700">
                    {ev.eventType}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">No events logged yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
