'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Clock,
  Armchair,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  QrCode,
  ArrowUpRight,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { useDashboardRestaurant } from '@/components/DashboardRestaurantContext';

export default function DashboardOverviewPage() {
  const currentRestaurant = useDashboardRestaurant();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [hourlyData, setHourlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isQueueOpen, setIsQueueOpen] = useState(true);
  const [togglingQueue, setTogglingQueue] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    async function loadOverview() {
      try {
        setLoading(true);
        const [reportsRes, restDetailsRes] = await Promise.all([
          fetch(`/api/restaurants/${currentRestaurant.id}/reports?range=daily`),
          fetch(`/api/restaurants/${currentRestaurant.id}`),
        ]);

        const reportsData = await reportsRes.json();
        const restDetailsData = await restDetailsRes.json();

        if (!reportsRes.ok || !reportsData.success) {
          throw new Error(reportsData.error || 'Unable to load restaurant reports.');
        }
        if (!restDetailsRes.ok || !restDetailsData.success) {
          throw new Error(restDetailsData.error || 'Unable to load restaurant details.');
        }

        setMetrics(reportsData.metrics);
        setHourlyData(reportsData.hourlyDistribution || []);
        setRestaurant(restDetailsData.restaurant);
        setIsQueueOpen(restDetailsData.restaurant.isQueueOpen);
      } catch (error) {
        console.error('Dashboard overview request failed:', error);
        setLoadError(error instanceof Error ? error.message : 'Unable to load the dashboard.');
      } finally {
        setLoading(false);
      }
    }
    loadOverview();
  }, [currentRestaurant.id]);

  const handleToggleQueue = async () => {
    if (!restaurant?.id) return;
    setTogglingQueue(true);
    setActionError('');
    try {
      const nextState = !isQueueOpen;
      const res = await fetch(`/api/restaurants/${restaurant.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isQueueOpen: nextState }),
      });
      if (res.ok) {
        setIsQueueOpen(nextState);
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Unable to update queue status.');
      }
    } catch (error) {
      console.error('Queue status update failed:', error);
      setActionError(error instanceof Error ? error.message : 'Unable to update queue status.');
    } finally {
      setTogglingQueue(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-wepass-500 border-t-transparent" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-3xl p-4 py-10 md:p-8">
        <div role="alert" className="rounded-2xl border border-rose-200 bg-white p-5 text-sm text-rose-800">
          {loadError}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Welcome header & Queue Toggle Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-subtle border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="break-words text-2xl font-black tracking-tight text-slate-900">
              {restaurant?.name}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Live queue, table turnover and restaurant operational performance today.
          </p>
        </div>

        {/* Master Queue Switch */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-2xl">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Online Waitlist
            </p>
            <p className="text-xs font-black text-slate-800">
              {isQueueOpen ? 'Accepting Guests' : 'Queue Paused'}
            </p>
          </div>
          <button
            onClick={handleToggleQueue}
            disabled={togglingQueue}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              isQueueOpen
                ? 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700'
                : 'bg-slate-300 text-slate-700 hover:bg-slate-400'
            }`}
          >
            {isQueueOpen ? 'Open' : 'Closed'}
          </button>
        </div>
      </div>
      {actionError && (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {actionError}
        </p>
      )}

      {/* 8 Primary Live Metrics Grid */}
      <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Metric 1: Total Guests Today */}
        <div className="min-w-0 rounded-3xl border border-slate-200 bg-white p-3 shadow-subtle sm:p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Guests Today
            </span>
            <Users className="h-5 w-5 text-wepass-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">{metrics?.totalGuests ?? '—'}</p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            Across {metrics?.totalParties ?? '—'} parties
          </p>
        </div>

        {/* Metric 2: Currently Waiting */}
        <div className="min-w-0 rounded-3xl border border-emerald-100 bg-white p-3 shadow-subtle sm:p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Active in Queue
            </span>
            <Activity className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-slate-900">{metrics?.activeWaiting ?? '—'}</p>
          <p className="text-[11px] text-emerald-700 mt-1 font-medium">
            Waiting & called outside
          </p>
        </div>

        {/* Metric 3: Currently Seated */}
        <div className="min-w-0 rounded-3xl border border-purple-100 bg-white p-3 shadow-subtle sm:p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
              Currently Seated
            </span>
            <Armchair className="h-5 w-5 text-purple-500" />
          </div>
          <p className="text-3xl font-black text-slate-900">{metrics?.seated ?? '—'}</p>
          <p className="text-[11px] text-purple-700 mt-1 font-medium">
            Table utilization: {metrics?.tableUtilisation == null ? '—' : `${metrics.tableUtilisation}%`}
          </p>
        </div>

        {/* Metric 4: Avg Wait Time */}
        <div className="min-w-0 rounded-3xl border border-amber-100 bg-white p-3 shadow-subtle sm:p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Avg Waiting Time
            </span>
            <Clock className="h-5 w-5 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-slate-900">
            {metrics?.avgWaitMinutes == null ? '—' : `~${metrics.avgWaitMinutes}m`}
          </p>
          <p className="text-[11px] text-amber-700 mt-1 font-medium">
            Peak period: {metrics?.peakHour ?? '—'}
          </p>
        </div>
      </div>

      {/* Row 2: Secondary Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white p-4 shadow-subtle border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Completed Visits
            </p>
            <p className="text-2xl font-black text-slate-900">{metrics?.completed ?? '—'}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-subtle border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Cancellations
            </p>
            <p className="text-2xl font-black text-slate-900">{metrics?.cancelled ?? '—'}</p>
            <span className="text-[10px] text-slate-400 font-medium">
              Rate: {metrics?.cancellationRate == null ? '—' : `${metrics.cancellationRate}%`}
            </span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <XCircle className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-subtle border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              No-Shows
            </p>
            <p className="text-2xl font-black text-slate-900">{metrics?.noShows ?? '—'}</p>
            <span className="text-[10px] text-slate-400 font-medium">
              Rate: {metrics?.noShowRate == null ? '—' : `${metrics.noShowRate}%`}
            </span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Hourly Service Chart & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Volume Distribution */}
        <div className="lg:col-span-2 rounded-3xl bg-white p-6 shadow-subtle border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-black text-slate-900">Service Hours Activity</h3>
              <p className="text-xs text-slate-500">Number of parties registered per service hour</p>
            </div>
            <span className="flex items-center gap-1.5 rounded-full border border-wepass-200 bg-wepass-50 px-3 py-1 text-xs font-semibold text-wepass-700">
              <TrendingUp className="h-3.5 w-3.5" /> Peak: {metrics?.peakHour ?? '—'}
            </span>
          </div>

          {/* Simple Visual Bars */}
          <div className="grid grid-cols-7 sm:grid-cols-13 gap-2 items-end h-40 pt-4 pb-2 border-b border-slate-100">
            {hourlyData.length === 0 ? (
              <p className="col-span-full self-center text-center text-sm text-slate-500">
                No service activity recorded for this period.
              </p>
            ) : hourlyData.slice(0, 13).map((item) => {
              const maxVal = Math.max(...hourlyData.map((d) => d.count), 5);
              const heightPercent = Math.max(10, Math.round((item.count / maxVal) * 100));
              return (
                <div key={item.hour} className="flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[10px] font-bold text-slate-600">{item.count}</span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-lg transition-all ${
                      item.count > 0
                        ? 'bg-gradient-to-t from-wepass-600 to-wepass-400'
                        : 'bg-slate-100'
                    }`}
                  />
                  <span className="text-[9px] font-semibold text-slate-400 truncate w-full text-center">
                    {item.hour.replace(':00', 'h')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Operational Shortcuts */}
        <div className="rounded-3xl bg-white p-6 shadow-subtle border border-slate-200 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 mb-1">Quick Operations</h3>
            <p className="text-xs text-slate-500 mb-4">Fast actions for dining managers</p>

            <div className="space-y-3">
              <Link
                href="/staff"
                className="flex items-center justify-between rounded-2xl bg-wepass-50 p-3.5 border border-wepass-200 text-xs font-bold text-wepass-900 hover:bg-wepass-100 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="h-4 w-4 text-wepass-600" />
                  <span>Open Staff Host Desk</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-wepass-600" />
              </Link>

              <Link
                href="/dashboard/tables"
                className="flex items-center justify-between rounded-2xl bg-slate-50 p-3.5 border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-100 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Armchair className="h-4 w-4 text-slate-600" />
                  <span>Configure Tables & Seats</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400" />
              </Link>

              <Link
                href="/dashboard/qr"
                className="flex items-center justify-between rounded-2xl bg-slate-50 p-3.5 border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-100 transition"
              >
                <div className="flex items-center gap-2.5">
                  <QrCode className="h-4 w-4 text-slate-600" />
                  <span>Printable QR Stand Kit</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400" />
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Live restaurant data</span>
          </div>
        </div>
      </div>
    </div>
  );
}
