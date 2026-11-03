'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, ScrollText, AlertTriangle, Users, Clock, ShieldCheck } from 'lucide-react';

export default function AdminAuditTrailPage() {
  const [fairnessAudits, setFairnessAudits] = useState<any[]>([]);
  const [queueEvents, setQueueEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAudit() {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/audit-logs');
        const data = await res.json();
        if (data.success) {
          setFairnessAudits(data.fairnessAudits || []);
          setQueueEvents(data.queueEvents || []);
        }
      } catch (e) {
      } finally {
        setLoading(false);
      }
    }
    loadAudit();
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
      <div className="bg-white p-6 rounded-3xl shadow-subtle border border-slate-200">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Global Platform Audit Trail</h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete compliance logs of queue fairness exceptions, staff overrides, and event traces.
        </p>
      </div>

      {/* Fairness Exceptions Audit Log */}
      <div className="rounded-3xl bg-white p-6 shadow-subtle border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Queue Fairness Exceptions &amp; Early-Call Log
              </h3>
              <p className="text-xs text-slate-500">
                Mandatory audit entries captured whenever staff called a party ahead of earlier eligible guests.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            {fairnessAudits.length} Audited Events
          </span>
        </div>

        {fairnessAudits.length > 0 ? (
          <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
            {fairnessAudits.map((a) => (
              <div key={a.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white hover:bg-slate-50/60 transition">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-slate-900 text-sm">
                      {a.restaurant?.name}
                    </span>
                    <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                      Token {a.targetQueueEntry?.token}
                    </span>
                    <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-800">
                      {a.reason.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {a.customNotes && (
                    <p className="text-xs text-slate-600 mt-1 italic">
                      &quot;{a.customNotes}&quot;
                    </p>
                  )}

                  <p className="text-[11px] text-slate-400 mt-1">
                    Staff: <strong className="text-slate-700">{a.staffUser?.name || 'Staff User'}</strong> •{' '}
                    {new Date(a.createdAt).toLocaleString()}
                  </p>
                </div>

                <div>
                  {a.managerApproved ? (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                      <ShieldCheck className="h-3.5 w-3.5" /> Manager Approved
                    </span>
                  ) : (
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                      Standard Exception
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-xs text-slate-500 font-semibold">
              No fairness exceptions recorded. All restaurants are adhering to standard sequential queue order.
            </p>
          </div>
        )}
      </div>

      {/* Global Queue Events */}
      <div className="overflow-hidden rounded-3xl bg-white shadow-subtle border border-slate-200">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-base font-extrabold text-slate-900">System Event Trace</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Restaurant</th>
                <th className="px-6 py-4">Token</th>
                <th className="px-6 py-4">Event Type</th>
                <th className="px-6 py-4">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {queueEvents.slice(0, 30).map((ev) => (
                <tr key={ev.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-6 py-3 text-slate-400 font-mono text-[11px]">
                    {new Date(ev.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="px-6 py-3 font-bold text-slate-800">
                    {ev.restaurant?.name}
                  </td>
                  <td className="px-6 py-3 font-mono font-bold text-wepass-700">
                    {ev.queueEntry?.token || '-'}
                  </td>
                  <td className="px-6 py-3">
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-700">
                      {ev.eventType}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-600">
                    {ev.description || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
