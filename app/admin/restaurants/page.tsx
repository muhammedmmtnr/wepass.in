'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Store,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Shield,
  Search,
} from 'lucide-react';

export default function AdminRestaurantsDirectoryPage() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/restaurants');
      const data = await res.json();
      if (data.success) {
        setRestaurants(data.restaurants || []);
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (restaurantId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/restaurants/${restaurantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        loadRestaurants();
      }
    } catch (e) {}
  };

  const handleDeleteRestaurant = async (restaurantId: string) => {
    if (!confirm('Are you sure you want to delete this restaurant? This action cannot be undone.'))
      return;
    try {
      const res = await fetch(`/api/admin/restaurants/${restaurantId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to delete restaurant');
      } else {
        loadRestaurants();
      }
    } catch (e) {
      alert('Network error');
    }
  };

  const filtered = restaurants.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.slug.toLowerCase().includes(search.toLowerCase()) ||
      (r.city && r.city.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-subtle border border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Restaurants Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage partner restaurants, onboarding statuses, and tenant isolation safeguards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search restaurants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-wepass-500 w-48"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white shadow-subtle border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4">Restaurant</th>
                <th className="px-6 py-4">Owner &amp; Contact</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Tables / Queues</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-wepass-600 text-white font-black text-sm">
                        {r.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-extrabold text-slate-900 text-sm">{r.name}</p>
                          <a
                            href={`/r/${r.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-400 hover:text-wepass-600"
                            title="Open Public QR Page"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                        <p className="text-[11px] text-slate-400">/{r.slug} • {r.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">{r.owner?.name || 'Marco Rossi'}</p>
                    <p className="text-[11px] text-slate-400">{r.owner?.email || r.email}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {r.city || 'Bengaluru'}, {r.country || 'India'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-slate-800">
                      {r._count?.tables || 0} Tables • {r._count?.queueEntries || 0} Visits
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        r.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.status === 'SUSPENDED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {r.status === 'ACTIVE' ? (
                        <button
                          onClick={() => handleUpdateStatus(r.id, 'SUSPENDED')}
                          className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-200 transition"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(r.id, 'ACTIVE')}
                          className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 transition"
                        >
                          Activate
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteRestaurant(r.id)}
                        className="rounded-lg p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Delete Restaurant"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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
