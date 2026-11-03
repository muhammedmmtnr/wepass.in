'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, Store, Clock, Users, Shield } from 'lucide-react';

export default function RestaurantSettingsPage() {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [avgDining, setAvgDining] = useState(45);
  const [waitPerParty, setWaitPerParty] = useState(8);
  const [maxParty, setMaxParty] = useState(12);
  const [callDeadline, setCallDeadline] = useState(10);
  const [isQueueOpen, setIsQueueOpen] = useState(true);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const authRes = await fetch('/api/auth/me');
        const authData = await authRes.json();
        let restId = authData?.user?.currentRestaurant?.id;

        if (!restId) {
          const restRes = await fetch('/api/restaurants/by-slug/olive-bistro');
          const restData = await restRes.json();
          restId = restData?.restaurant?.id;
        }

        if (restId) {
          const res = await fetch(`/api/restaurants/${restId}`);
          const data = await res.json();
          if (data.success && data.restaurant) {
            const r = data.restaurant;
            setRestaurant(r);
            setName(r.name || '');
            setCategory(r.category || '');
            setPhone(r.phone || '');
            setEmail(r.email || '');
            setAddress(r.address || '');
            setCity(r.city || '');
            setAvgDining(r.avgDiningDurationMin || 45);
            setWaitPerParty(r.estimatedWaitPerPartyMin || 8);
            setMaxParty(r.maxPartySize || 12);
            setCallDeadline(r.callDeadlineMinutes || 10);
            setIsQueueOpen(r.isQueueOpen);
          }
        }
      } catch (e) {}
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant?.id) return;
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch(`/api/restaurants/${restaurant.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          category: category.trim(),
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim(),
          city: city.trim(),
          avgDiningDurationMin: avgDining,
          estimatedWaitPerPartyMin: waitPerParty,
          maxPartySize: maxParty,
          callDeadlineMinutes: callDeadline,
          isQueueOpen,
        }),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (e) {
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-subtle border border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Restaurant Settings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure dining parameters, queue policies, and host contact information.
          </p>
        </div>

        {savedSuccess && (
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
            <CheckCircle2 className="h-4 w-4" /> Changes Saved!
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="rounded-3xl bg-white p-6 shadow-subtle border border-slate-200 space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Store className="h-5 w-5 text-wepass-600" /> Restaurant Profile
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Restaurant Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-wepass-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-wepass-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Host Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-wepass-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-wepass-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Street Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-wepass-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Operational Engine Tuning */}
        <div className="rounded-3xl bg-white p-6 shadow-subtle border border-slate-200 space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Clock className="h-5 w-5 text-wepass-600" /> Queue Engine Parameters
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Est. Wait / Party
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={waitPerParty}
                  onChange={(e) => setWaitPerParty(parseInt(e.target.value, 10) || 8)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 font-bold focus:border-wepass-500 focus:outline-none"
                />
                <span className="text-xs text-slate-400">mins</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Call Deadline
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={callDeadline}
                  onChange={(e) => setCallDeadline(parseInt(e.target.value, 10) || 10)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 font-bold focus:border-wepass-500 focus:outline-none"
                />
                <span className="text-xs text-slate-400">mins</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Max Party Size
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={maxParty}
                  onChange={(e) => setMaxParty(parseInt(e.target.value, 10) || 12)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 font-bold focus:border-wepass-500 focus:outline-none"
                />
                <span className="text-xs text-slate-400">guests</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Avg Dining Time
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={15}
                  max={180}
                  value={avgDining}
                  onChange={(e) => setAvgDining(parseInt(e.target.value, 10) || 45)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 font-bold focus:border-wepass-500 focus:outline-none"
                />
                <span className="text-xs text-slate-400">mins</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-2xl bg-wepass-600 px-6 py-3 text-xs font-bold text-white shadow-premium hover:bg-wepass-700 transition disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
}
