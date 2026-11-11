'use client';

import React, { useState, useEffect } from 'react';
import {
  UserCog,
  Plus,
  Mail,
  Phone,
  Shield,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
} from 'lucide-react';
import { useDashboardRestaurant } from '@/components/DashboardRestaurantContext';

export default function StaffManagementPage() {
  const restaurant = useDashboardRestaurant();
  const restaurantId = restaurant.id;
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Invite modal state
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('RESTAURANT_STAFF');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    async function loadStaff() {
      try {
        setLoading(true);
        setLoadError('');
        const res = await fetch(`/api/restaurants/${restaurantId}/staff`);
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Unable to load restaurant staff.');
        }
        setStaffList(data.staff || []);
      } catch (error) {
        console.error('Restaurant staff request failed:', error);
        setLoadError(error instanceof Error ? error.message : 'Unable to load restaurant staff.');
      } finally {
        setLoading(false);
      }
    }
    loadStaff();
  }, [restaurantId]);

  if (loading) {
    return (
      <div role="status" className="flex h-64 items-center justify-center">
        <span className="sr-only">Loading restaurant staff</span>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-wepass-500 border-t-transparent" />
      </div>
    );
  }

  const handleInviteStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setFormError('Name and email are required');
      return;
    }
    setSubmitting(true);
    setFormError('');

    try {
      const res = await fetch(`/api/restaurants/${restaurantId}/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), phone: phone.trim(), role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to add staff');
      } else {
        setStaffList((prev) => [data.staff, ...prev]);
        setIsInviteOpen(false);
        setName('');
        setEmail('');
        setPhone('');
      }
    } catch (e) {
      setFormError('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (staffId: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/staff/${staffId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      if (res.ok) {
        setStaffList((prev) =>
          prev.map((s) => (s.id === staffId ? { ...s, isActive: !currentActive } : s))
        );
      }
    } catch (e) {}
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (!confirm('Remove this staff profile?')) return;
    try {
      const res = await fetch(`/api/staff/${staffId}`, { method: 'DELETE' });
      if (res.ok) {
        setStaffList((prev) => prev.filter((s) => s.id !== staffId));
      }
    } catch (e) {}
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {loadError && (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {loadError}
        </p>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-subtle border border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Staff & Roles</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage front desk hosts, shift managers, and access permissions.
          </p>
        </div>

        <button
          onClick={() => setIsInviteOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-wepass-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-wepass-700 transition self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" /> Add Staff Member
        </button>
      </div>

      {/* Staff List Table */}
      <div className="overflow-hidden rounded-3xl bg-white shadow-subtle border border-slate-200">
        <div role="region" aria-label="Staff members" tabIndex={0} className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4">Staff Member</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {staffList.length === 0 && !loadError && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-500">
                    No staff members have been added to this restaurant yet.
                  </td>
                </tr>
              )}
              {staffList.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-wepass-100 font-bold text-wepass-800">
                        {st.user?.name ? st.user.name.slice(0, 2).toUpperCase() : 'ST'}
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-900">{st.user?.name}</p>
                        <p className="text-[11px] text-slate-400">{st.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700">
                      <Shield className="h-3 w-3 text-wepass-600" />
                      {st.role === 'RESTAURANT_MANAGER' ? 'Manager' : 'Host / Staff'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {st.user?.phone || 'No phone registered'}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(st.id, st.isActive)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition ${
                        st.isActive
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                    >
                      {st.isActive ? 'Active' : 'Deactivated'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDeleteStaff(st.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                      title="Remove Staff"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm sm:items-center">
          <div className="max-h-[calc(100dvh-2rem)] w-full max-w-sm overflow-y-auto rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl md:p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Add Staff Member</h3>
              <button
                onClick={() => setIsInviteOpen(false)}
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

            <form onSubmit={handleInviteStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Iyer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-wepass-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="maya@olivebistro.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-wepass-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-wepass-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Role & Permissions
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-wepass-500 focus:outline-none"
                >
                  <option value="RESTAURANT_STAFF">Host / Front Desk Staff</option>
                  <option value="RESTAURANT_MANAGER">Shift Manager (Can approve fairness skips)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-wepass-600 px-5 py-2 text-xs font-bold text-white shadow hover:bg-wepass-700 disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Add Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
