'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  Users,
  Clock,
  Armchair,
  TrendingUp,
  AlertTriangle,
  FileSpreadsheet,
  Printer,
  ShieldAlert,
} from 'lucide-react';
import { useDashboardRestaurant } from '@/components/DashboardRestaurantContext';

export default function ReportsAnalyticsPage() {
  const restaurant = useDashboardRestaurant();
  const restaurantId = restaurant.id;
  const [range, setRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    async function loadReports() {
      try {
        setLoading(true);
        setLoadError('');
        const res = await fetch(`/api/restaurants/${restaurantId}/reports?range=${range}`);
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Unable to load reports.');
        }
        setReportData(data);
      } catch (error) {
        console.error('Restaurant reports request failed:', error);
        setLoadError(error instanceof Error ? error.message : 'Unable to load reports.');
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, [range, restaurantId]);

  const handleExportCsv = () => {
    if (!reportData?.metrics) return;
    const m = reportData.metrics;
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Metric,Value\n' +
      `Report Period,${range.toUpperCase()}\n` +
      `Total Parties,${m.totalParties}\n` +
      `Total Guests,${m.totalGuests}\n` +
      `Completed Dining,${m.completed}\n` +
      `Currently Seated,${m.seated}\n` +
      `Cancellations,${m.cancelled}\n` +
      `No-Shows,${m.noShows}\n` +
      `Cancellation Rate,${m.cancellationRate}%\n` +
      `No-Show Rate,${m.noShowRate}%\n` +
      `Average Wait Minutes,${m.avgWaitMinutes} mins\n` +
      `Table Utilization,${m.tableUtilisation}%\n` +
      `Peak Service Hours,${m.peakHour}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `wepass-report-${range}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const m = reportData?.metrics;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-subtle border border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Reports & Analytics</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real database audit and operational insights for table turnover and guest satisfaction.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period Selector */}
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            {(['daily', 'weekly', 'monthly'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition capitalize ${
                  range === r ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCsv}
            disabled={!reportData?.metrics || loading}
            className="flex min-h-11 items-center gap-1.5 rounded-xl bg-wepass-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-wepass-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>
      {loadError && (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {loadError}
        </p>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-3xl bg-white p-5 shadow-subtle border border-slate-200">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Guests</p>
          <p className="text-3xl font-black text-slate-900 mt-1">{m?.totalGuests ?? '—'}</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">{m?.totalParties ?? '—'} registered parties</p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-subtle border border-amber-100">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Average Wait</p>
          <p className="text-3xl font-black text-slate-900 mt-1">
            {m?.avgWaitMinutes == null ? '—' : `~${m.avgWaitMinutes}m`}
          </p>
          <p className="text-xs text-amber-700 mt-1 font-medium">Peak: {m?.peakHour ?? '—'}</p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-subtle border border-purple-100">
          <p className="text-[11px] font-bold uppercase tracking-wider text-purple-700">Table Turnover</p>
          <p className="text-3xl font-black text-slate-900 mt-1">
            {m?.tableUtilisation == null ? '—' : `${m.tableUtilisation}%`}
          </p>
          <p className="text-xs text-purple-700 mt-1 font-medium">
            {m?.tablesOccupied ?? '—'} of {m?.totalTables ?? '—'} tables in use
          </p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-subtle border border-rose-100">
          <p className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Drop-off Rates</p>
          <p className="text-3xl font-black text-slate-900 mt-1">
            {m?.cancellationRate == null ? '—' : `${m.cancellationRate}%`}
          </p>
          <p className="text-xs text-rose-600 mt-1 font-medium">
            No-show rate: {m?.noShowRate == null ? '—' : `${m.noShowRate}%`}
          </p>
        </div>
      </div>

      {/* Queue Fairness System Audit Log */}
      <div className="rounded-3xl bg-white p-6 shadow-subtle border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Queue Fairness Audit Log</h3>
              <p className="text-xs text-slate-500">
                Transparent record of every early guest call exception and staff authorization.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            {reportData?.fairnessAudits?.length ?? '—'} Audited Exceptions
          </span>
        </div>

        {reportData?.fairnessAudits && reportData.fairnessAudits.length > 0 ? (
          <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
            {reportData.fairnessAudits.map((audit: any) => (
              <div key={audit.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white hover:bg-slate-50/60 transition">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-900">
                      Token {audit.targetQueueEntry?.token} ({audit.targetQueueEntry?.guestName})
                    </span>
                    <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-800">
                      {audit.reason.replace(/_/g, ' ')}
                    </span>
                  </div>
                  {audit.customNotes && (
                    <p className="text-xs text-slate-600 mt-1 italic">
                      &quot;{audit.customNotes}&quot;
                    </p>
                  )}
                  <p className="text-[11px] text-slate-400 mt-1">
                    Staff: <strong className="text-slate-600">{audit.staffUser?.name}</strong> •{' '}
                    {new Date(audit.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="self-end md:self-center">
                  {audit.managerApproved && (
                    <span className="rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                      Manager Approved
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-xs text-slate-500 font-semibold">
              {loading ? 'Loading queue fairness activity…' : 'No queue fairness exceptions recorded in this period.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
