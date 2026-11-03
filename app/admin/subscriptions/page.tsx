'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Calendar,
  Layers,
  Shield,
  Clock,
} from 'lucide-react';

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSubs() {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/subscriptions');
        const data = await res.json();
        if (data.success) {
          setSubscriptions(data.subscriptions || []);
          setPlans(data.plans || []);
        }
      } catch (e) {
      } finally {
        setLoading(false);
      }
    }
    loadSubs();
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
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Plans &amp; Subscriptions</h1>
        <p className="text-xs text-slate-500 mt-1">
          Subscription tiers, restaurant billing cycles, and feature access configurations.
        </p>
      </div>

      {/* Available Plans Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((p) => {
          let features: string[] = [];
          try {
            features = JSON.parse(p.features);
          } catch {}

          return (
            <div
              key={p.id}
              className={`rounded-3xl p-6 border shadow-subtle flex flex-col justify-between ${
                p.tier === 'pro'
                  ? 'bg-gradient-to-b from-wepass-50/50 to-white border-wepass-300'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-wepass-800">
                    {p.name}
                  </span>
                  {p.tier === 'pro' && (
                    <span className="rounded-full bg-wepass-100 px-2 py-0.5 text-[9px] font-extrabold text-wepass-800">
                      POPULAR
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-black text-slate-900 font-mono">
                    ₹{p.priceMonthly.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">/mo</span>
                </div>

                <p className="text-xs text-slate-500 mb-4">{p.description}</p>

                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <p className="text-[11px] font-bold text-slate-700">Limits &amp; Capacity:</p>
                  <p className="text-xs text-slate-600">• Up to {p.maxTables} Tables</p>
                  <p className="text-xs text-slate-600">• {p.maxDailyQueue} Daily Guests</p>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100">
                <span className="text-[10px] font-mono text-slate-400">Tier ID: {p.tier}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Subscriptions Table */}
      <div className="overflow-hidden rounded-3xl bg-white shadow-subtle border border-slate-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900">Active Tenant Subscriptions</h3>
          <span className="text-xs text-slate-500 font-semibold">
            {subscriptions.length} Total Subscriptions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4">Restaurant</th>
                <th className="px-6 py-4">Plan Tier</th>
                <th className="px-6 py-4">Billing Cycle</th>
                <th className="px-6 py-4">Expires</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-6 py-4">
                    <p className="font-extrabold text-slate-900 text-sm">
                      {sub.restaurant?.name}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Owner: {sub.restaurant?.owner?.name} ({sub.restaurant?.owner?.email})
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-wepass-800 bg-wepass-50 border border-wepass-200 px-2 py-0.5 rounded-lg">
                      {sub.plan?.name} (₹{sub.plan?.priceMonthly}/mo)
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-700">
                    {sub.billingCycle}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {new Date(sub.expiresAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                      {sub.status}
                    </span>
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
