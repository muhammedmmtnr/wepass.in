'use client';

import React, { useState, useEffect } from 'react';
import {
  Armchair,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Filter,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useDashboardRestaurant } from '@/components/DashboardRestaurantContext';

export default function TablesManagementPage() {
  const restaurant = useDashboardRestaurant();
  const restaurantId = restaurant.id;
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [sectionFilter, setSectionFilter] = useState('ALL');

  // New table modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [capacity, setCapacity] = useState(4);
  const [section, setSection] = useState('MAIN');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadTables() {
      try {
        setLoading(true);
        setLoadError('');
        const res = await fetch(`/api/restaurants/${restaurantId}/tables`);
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Unable to load restaurant tables.');
        }
        setTables(data.tables || []);
      } catch (error) {
        console.error('Restaurant tables request failed:', error);
        setLoadError(error instanceof Error ? error.message : 'Unable to load restaurant tables.');
      } finally {
        setLoading(false);
      }
    }
    loadTables();
  }, [restaurantId]);

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableNumber.trim()) {
      setFormError('Please enter a table number/label.');
      return;
    }
    setSaving(true);
    setFormError('');

    try {
      const res = await fetch(`/api/restaurants/${restaurantId}/tables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableNumber: tableNumber.trim(), capacity, section }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to create table');
      } else {
        setTables((prev) => [...prev, data.table]);
        setIsAddModalOpen(false);
        setTableNumber('');
        setCapacity(4);
      }
    } catch (e) {
      setFormError('Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    if (!confirm('Are you sure you want to delete this table?')) return;
    try {
      const res = await fetch(`/api/tables/${tableId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to delete table');
      } else {
        setTables((prev) => prev.filter((t) => t.id !== tableId));
      }
    } catch (e) {
      alert('Network error');
    }
  };

  const handleToggleStatus = async (table: any) => {
    const nextStatus = table.status === 'AVAILABLE' ? 'OCCUPIED' : 'AVAILABLE';
    try {
      const res = await fetch(`/api/tables/${table.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setTables((prev) =>
          prev.map((t) => (t.id === table.id ? { ...t, status: nextStatus } : t))
        );
      }
    } catch (e) {}
  };

  const filteredTables = tables.filter((t) => {
    if (sectionFilter === 'ALL') return true;
    return t.section === sectionFilter;
  });

  if (loading) {
    return (
      <div role="status" className="flex h-64 items-center justify-center">
        <span className="sr-only">Loading restaurant tables</span>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-wepass-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {loadError && (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {loadError}
        </p>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-subtle border border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Tables & Floor Plan</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure restaurant dining tables, capacities, and sections for optimal party allocation.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-wepass-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-wepass-700 transition self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" /> Add New Table
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['ALL', 'MAIN', 'PATIO', 'VIP', 'BAR', 'OUTDOOR'].map((sec) => (
          <button
            key={sec}
            onClick={() => setSectionFilter(sec)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              sectionFilter === sec
                ? 'bg-wepass-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {sec === 'ALL' ? 'All Sections' : `${sec} Section`}
          </button>
        ))}
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredTables.length === 0 && !loadError && (
          <p className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            No tables have been added to this restaurant yet.
          </p>
        )}
        {filteredTables.map((tbl) => (
          <div
            key={tbl.id}
            className={`rounded-3xl p-5 border shadow-subtle transition relative flex flex-col justify-between ${
              tbl.status === 'AVAILABLE'
                ? 'bg-white border-emerald-200'
                : 'bg-purple-50/40 border-purple-200'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                  {tbl.tableNumber}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    tbl.status === 'AVAILABLE'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  {tbl.status}
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-600 font-medium">
                <p>Capacity: <strong className="text-slate-900 font-bold">{tbl.capacity} Persons</strong></p>
                <p>Section: <strong className="text-slate-900">{tbl.section}</strong></p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => handleToggleStatus(tbl)}
                className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
                  tbl.status === 'AVAILABLE'
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {tbl.status === 'AVAILABLE' ? 'Mark Occupied' : 'Mark Available'}
              </button>

              <button
                onClick={() => handleDeleteTable(tbl.id)}
                title="Delete Table"
                className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Table Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm sm:items-center">
          <div className="max-h-[calc(100dvh-2rem)] w-full max-w-sm overflow-y-auto rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl md:p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Add New Table</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <p className="mb-3 text-xs font-semibold text-rose-600 bg-rose-50 p-2 rounded-xl">
                {formError}
              </p>
            )}

            <form onSubmit={handleAddTable} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Table Number / Label <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. T-07, Patio-3, VIP-2"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-wepass-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Seating Capacity (Guests)
                </label>
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={capacity}
                  onChange={(e) => setCapacity(parseInt(e.target.value, 10) || 2)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-wepass-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Section
                </label>
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-wepass-500 focus:outline-none"
                >
                  <option value="MAIN">Main Dining Hall</option>
                  <option value="PATIO">Patio & Garden</option>
                  <option value="VIP">VIP Lounge</option>
                  <option value="BAR">Bar & High-Tops</option>
                  <option value="OUTDOOR">Outdoor Terrace</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-wepass-600 px-5 py-2 text-xs font-bold text-white shadow hover:bg-wepass-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Create Table'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
