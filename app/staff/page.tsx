'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  Clock,
  CheckCircle2,
  Phone,
  MessageSquare,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  UserCheck,
  Armchair,
  Check,
  X,
  Plus,
  RefreshCw,
  Search,
  Filter,
  ShieldAlert,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import QueueStatusBadge from '@/components/QueueStatusBadge';
import FairnessModal from '@/components/FairnessModal';

export default function StaffQueueDashboard() {
  const router = useRouter();
  const [restaurantId, setRestaurantId] = useState<string>('');
  const [restaurant, setRestaurant] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [queueError, setQueueError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'live' | 'seated' | 'tables' | 'history'>('live');

  // Fairness modal state
  const [fairnessModalOpen, setFairnessModalOpen] = useState(false);
  const [targetCallEntry, setTargetCallEntry] = useState<any>(null);
  const [skippedEntries, setSkippedEntries] = useState<any[]>([]);

  // Table assign modal state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedEntryForTable, setSelectedEntryForTable] = useState<any>(null);
  const [selectedTableId, setSelectedTableId] = useState<string>('');

  // Manual walk-in modal state
  const [walkinModalOpen, setWalkinModalOpen] = useState(false);
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [walkinPartySize, setWalkinPartySize] = useState(2);
  const [walkinRequests, setWalkinRequests] = useState('');
  const [walkinSubmitting, setWalkinSubmitting] = useState(false);

  useEffect(() => {
    async function initStaff() {
      try {
        setLoading(true);
        const authRes = await fetch('/api/auth/me');
        const authData = await authRes.json();
        if (!authRes.ok || !authData.authenticated || !authData.user) {
          router.replace('/login');
          return;
        }

        const targetRestId = authData.user.currentRestaurant?.id;
        if (!targetRestId) {
          setQueueError('This account is not associated with a restaurant.');
          return;
        }

        setRestaurantId(targetRestId);
        await loadQueueData(targetRestId);
      } catch (error) {
        console.error('Failed to initialize the staff queue desk:', error);
        setQueueError('We could not load your restaurant queue. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    initStaff();
  }, [router]);

  // Poll live queue every 4 seconds
  useEffect(() => {
    if (!restaurantId) return;
    const interval = setInterval(() => {
      loadQueueData(restaurantId, false);
    }, 4000);
    return () => clearInterval(interval);
  }, [restaurantId]);

  const loadQueueData = async (restId: string, showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const res = await fetch(`/api/restaurants/${restId}/queue?view=all`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to load the queue.');
      setQueueError('');
      setRestaurant(data.restaurant);
      setStats(data.stats);
      setTables(data.tables || []);
      setEntries(data.entries || []);
    } catch (error) {
      console.error('Staff queue request failed:', error);
      setQueueError(error instanceof Error ? error.message : 'Unable to load the queue.');
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  // 1. Call guest (with fairness detection)
  const handleCallGuest = async (
    entry: any,
    fairnessReason?: string,
    customNotes?: string,
    managerApproved?: boolean
  ) => {
    try {
      const res = await fetch(`/api/queue/${entry.id}/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fairnessReason,
          customNotes,
          managerApproved,
        }),
      });

      const data = await res.json();

      if (res.status === 422 && data.requiresFairnessReason) {
        // Earlier waiting guests exist! Prompt fairness modal
        setTargetCallEntry(entry);
        setSkippedEntries(data.skippedEntries || []);
        setFairnessModalOpen(true);
        return;
      }

      if (res.ok) {
        setFairnessModalOpen(false);
        loadQueueData(restaurantId, false);
      } else {
        alert(data.error || 'Failed to call guest.');
      }
    } catch (e) {
      alert('Error calling guest.');
    }
  };

  // 2. Open WhatsApp prefilled chat
  const handleOpenWhatsApp = async (entry: any) => {
    try {
      const res = await fetch(`/api/queue/${entry.id}/whatsapp`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.whatsappUrl) {
        window.open(data.whatsappUrl, '_blank');
        loadQueueData(restaurantId, false);
      } else {
        alert('Could not generate WhatsApp link.');
      }
    } catch (e) {
      alert('Error opening WhatsApp.');
    }
  };

  // 3. Assign Table
  const handleAssignTableSubmit = async () => {
    if (!selectedTableId || !selectedEntryForTable) return;
    try {
      const res = await fetch(`/api/queue/${selectedEntryForTable.id}/assign-table`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId: selectedTableId }),
      });
      if (res.ok) {
        setAssignModalOpen(false);
        setSelectedEntryForTable(null);
        setSelectedTableId('');
        loadQueueData(restaurantId, false);
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to assign table.');
      }
    } catch (e) {
      alert('Error assigning table.');
    }
  };

  // 4. Mark Seated
  const handleMarkSeated = async (entry: any) => {
    try {
      const res = await fetch(`/api/queue/${entry.id}/seat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId: entry.assignedTableId }),
      });
      if (res.ok) {
        loadQueueData(restaurantId, false);
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to mark seated.');
      }
    } catch (e) {
      alert('Error seating guest.');
    }
  };

  // 5. Complete Dining Session
  const handleCompleteVisit = async (entry: any) => {
    try {
      const res = await fetch(`/api/queue/${entry.id}/complete`, { method: 'POST' });
      if (res.ok) {
        loadQueueData(restaurantId, false);
      }
    } catch (e) {}
  };

  // 6. Generic Status Update (SKIP, PAUSE, RESUME, NO_SHOW, CANCEL)
  const handleUpdateStatus = async (entryId: string, status: string, reason?: string) => {
    try {
      const res = await fetch(`/api/queue/${entryId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, cancellationReason: reason }),
      });
      if (res.ok) {
        loadQueueData(restaurantId, false);
      }
    } catch (e) {}
  };

  // 7. Manual Walk-in Registration
  const handleWalkinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkinName.trim()) return;
    setWalkinSubmitting(true);
    try {
      const res = await fetch('/api/queue/manual-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          guestName: walkinName.trim(),
          guestPhone: walkinPhone.trim(),
          partySize: walkinPartySize,
          specialRequests: walkinRequests.trim() || null,
        }),
      });
      if (res.ok) {
        setWalkinModalOpen(false);
        setWalkinName('');
        setWalkinPhone('');
        setWalkinPartySize(2);
        setWalkinRequests('');
        loadQueueData(restaurantId, false);
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to register walk-in.');
      }
    } catch (e) {
      alert('Connection error.');
    } finally {
      setWalkinSubmitting(false);
    }
  };

  // Filter entries
  const filteredEntries = entries.filter((e) => {
    const matchesSearch =
      e.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.guestPhone && e.guestPhone.includes(searchQuery));

    const matchesGroup = selectedGroup === 'all' || e.tableGroup === selectedGroup;

    if (activeTab === 'live') {
      return matchesSearch && matchesGroup && ['WAITING', 'CALLED', 'CONFIRMED', 'PAUSED'].includes(e.status);
    } else if (activeTab === 'seated') {
      return matchesSearch && matchesGroup && e.status === 'SEATED';
    } else if (activeTab === 'history') {
      return matchesSearch && matchesGroup && ['COMPLETED', 'CANCELLED', 'NO_SHOW', 'SKIPPED'].includes(e.status);
    }
    return matchesSearch && matchesGroup;
  });

  return (
    <div className="min-h-screen bg-[#F0F5F2] text-slate-800">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 md:px-8 py-3 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-2 sm:flex-1 sm:gap-4">
            <BrandLogo size="sm" />
            <div className="hidden sm:block h-5 w-px bg-slate-200" />
            <div className="flex min-w-0 items-center gap-2">
              <span className="hidden rounded-lg bg-wepass-100 px-2.5 py-1 text-xs font-black uppercase tracking-wider text-wepass-800 sm:inline-flex">
                Staff Host Desk
              </span>
              <span className="truncate text-sm font-extrabold text-slate-800">
                {restaurant?.name ?? 'Restaurant queue'}
              </span>
            </div>
          </div>

          <div className="flex w-full items-center justify-end gap-2 sm:w-auto sm:gap-3">
            <button
              type="button"
              onClick={() => setWalkinModalOpen(true)}
              disabled={!restaurantId || loading}
              className="flex items-center gap-1.5 rounded-xl bg-wepass-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-wepass-700 sm:px-3.5"
            >
              <Plus className="h-4 w-4" /> Add Walk-in
            </button>
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-slate-600 transition hover:text-slate-900 border border-slate-200 rounded-xl px-3 py-2"
            >
              <span className="sm:hidden">Owner</span>
              <span className="hidden sm:inline">Owner Portal</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto min-w-0 max-w-7xl space-y-6 p-4 md:p-8">
        {queueError && (
          <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-white p-4 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between">
            <p>{queueError}</p>
            <button
              type="button"
              onClick={() => restaurantId && loadQueueData(restaurantId)}
              disabled={!restaurantId || loading}
              className="min-h-11 rounded-xl border border-rose-200 px-4 py-2 font-semibold transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Try again
            </button>
          </div>
        )}
        {/* Real-time KPI Bar */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="rounded-2xl bg-white p-4 shadow-subtle border border-emerald-100">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Waiting</span>
                <Users className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">{stats.waitingCount}</p>
              <span className="text-[10px] text-emerald-600 font-semibold">Active in queue</span>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-subtle border border-amber-100">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Called</span>
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">{stats.calledCount}</p>
              <span className="text-[10px] text-amber-600 font-semibold">Awaiting arrival</span>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-subtle border border-blue-100">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800">Confirmed</span>
                <UserCheck className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">{stats.confirmedCount}</p>
              <span className="text-[10px] text-blue-600 font-semibold">At entrance</span>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-subtle border border-purple-100">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-800">Seated</span>
                <Armchair className="h-4 w-4 text-purple-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">{stats.seatedCount}</p>
              <span className="text-[10px] text-purple-600 font-semibold">Currently dining</span>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-subtle border border-slate-100">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Free Tables</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">
                {stats.availableTables} / {stats.totalTables}
              </p>
              <span className="text-[10px] text-slate-500 font-semibold">Ready to seat</span>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-subtle border border-slate-100">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Avg Wait</span>
                <Clock className="h-4 w-4 text-slate-400" />
              </div>
              <p className="text-2xl font-black text-slate-900">~{stats.avgWaitMinutes}m</p>
              <span className="text-[10px] text-slate-500 font-semibold">Served today: {stats.completedToday}</span>
            </div>
          </div>
        )}

        {/* Tab & Filter Bar */}
        <div className="flex min-w-0 flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-subtle md:flex-row md:items-center">
          {/* Main Navigation Tabs */}
          <div className="w-full min-w-0 max-w-full overflow-x-auto pb-1 md:pb-0">
            <div className="flex w-max min-w-full gap-1.5">
            <button
              onClick={() => setActiveTab('live')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                activeTab === 'live'
                  ? 'bg-wepass-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Users className="h-4 w-4" /> Live Queue (
              {entries.filter((e) => ['WAITING', 'CALLED', 'CONFIRMED'].includes(e.status)).length})
            </button>
            <button
              onClick={() => setActiveTab('seated')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                activeTab === 'seated'
                  ? 'bg-wepass-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Armchair className="h-4 w-4" /> Seated ({entries.filter((e) => e.status === 'SEATED').length})
            </button>
            <button
              onClick={() => setActiveTab('tables')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                activeTab === 'tables'
                  ? 'bg-wepass-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" /> Floor Tables ({tables.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                activeTab === 'history'
                  ? 'bg-wepass-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <RotateCcw className="h-4 w-4" /> History
            </button>
            </div>
          </div>

          {/* Group and Search Filters */}
          <div className="flex w-full min-w-0 flex-col gap-2.5 sm:flex-row md:w-auto">
            {/* Table Group Filter */}
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-wepass-500 sm:w-auto"
            >
              <option value="all">All Party Groups</option>
              <option value="A">Group A (1-2 Guests)</option>
              <option value="B">Group B (3-4 Guests)</option>
              <option value="C">Group C (5-6 Guests)</option>
              <option value="D">Group D (7+ Guests)</option>
            </select>

            {/* Search Input */}
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search token or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-wepass-500"
              />
            </div>
          </div>
        </div>

        {/* Tab 1 & Tab 2: Live Queue / Seated Tables */}
        {activeTab !== 'tables' ? (
          <div className="overflow-hidden rounded-3xl bg-white shadow-subtle border border-slate-200">
            {filteredEntries.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                <h3 className="text-base font-bold text-slate-700">No parties found</h3>
                <p className="text-xs text-slate-400 mt-1">
                  {activeTab === 'live'
                    ? 'Waitlist is clear. Guests scanning the QR code will appear here in real-time.'
                    : 'No entries currently matching this tab.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredEntries.map((entry, index) => (
                  <div
                    key={entry.id}
                    className={`flex flex-col lg:flex-row lg:items-center justify-between p-4 md:p-5 gap-4 transition hover:bg-slate-50/60 ${
                      entry.status === 'CALLED'
                        ? 'bg-amber-50/40 border-l-4 border-amber-500'
                        : entry.status === 'CONFIRMED'
                        ? 'bg-blue-50/40 border-l-4 border-blue-500'
                        : ''
                    }`}
                  >
                    {/* Left: Token, Guest details, Special requests */}
                    <div className="flex items-start gap-4">
                      {/* Token chip */}
                      <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-100 px-3.5 py-2 font-mono border border-slate-200 min-w-[64px]">
                        <span className="text-lg font-black text-slate-900">{entry.token}</span>
                        <span className="text-[9px] font-bold text-slate-500 uppercase">
                          Grp {entry.tableGroup}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h4 className="text-base font-extrabold text-slate-900">{entry.guestName}</h4>
                          <QueueStatusBadge status={entry.status} size="sm" showPulse />
                          {entry.isManualEntry && (
                            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                              Walk-in
                            </span>
                          )}
                        </div>

                        <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                          <span className="font-semibold text-slate-700">
                            Party of {entry.partySize}
                          </span>
                          <span>•</span>
                          <span>{entry.guestPhone || 'No phone'}</span>
                          <span>•</span>
                          <span>Joined {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>

                        {/* Special requests & Assigned table badges */}
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          {entry.specialRequests && (
                            <span className="rounded-lg bg-amber-50 px-2 py-0.5 text-xs text-amber-800 border border-amber-200 font-medium">
                              Note: {entry.specialRequests}
                            </span>
                          )}
                          {entry.accessibilityNeeds && (
                            <span className="rounded-lg bg-blue-50 px-2 py-0.5 text-xs text-blue-800 border border-blue-200 font-medium">
                              ♿ Accessibility Needed
                            </span>
                          )}
                          {entry.assignedTable && (
                            <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-xs text-emerald-800 border border-emerald-200 font-bold">
                              Table: {entry.assignedTable.tableNumber} ({entry.assignedTable.section})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Operational Actions */}
                    <div className="flex items-center gap-2 flex-wrap self-end lg:self-center">
                      {/* WhatsApp trigger */}
                      {entry.guestPhone && (
                        <button
                          onClick={() => handleOpenWhatsApp(entry)}
                          title="Open WhatsApp prefilled message"
                          className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition shadow-sm"
                        >
                          <MessageSquare className="h-3.5 w-3.5" /> WhatsApp
                        </button>
                      )}

                      {/* CALL GUEST BUTTON */}
                      {['WAITING', 'PAUSED', 'SKIPPED'].includes(entry.status) && (
                        <button
                          onClick={() => handleCallGuest(entry)}
                          className="flex items-center gap-1.5 rounded-xl bg-weamber-500 px-4 py-2 text-xs font-black text-amber-950 shadow-sm hover:bg-weamber-600 transition"
                        >
                          <Phone className="h-3.5 w-3.5" /> Call Guest
                        </button>
                      )}

                      {/* ASSIGN TABLE BUTTON */}
                      {['CALLED', 'CONFIRMED', 'WAITING'].includes(entry.status) && (
                        <button
                          onClick={() => {
                            setSelectedEntryForTable(entry);
                            setAssignModalOpen(true);
                          }}
                          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm"
                        >
                          <Armchair className="h-3.5 w-3.5 text-slate-500" />
                          {entry.assignedTableId ? 'Change Table' : 'Assign Table'}
                        </button>
                      )}

                      {/* SEAT GUEST BUTTON */}
                      {['CALLED', 'CONFIRMED'].includes(entry.status) && (
                        <button
                          onClick={() => handleMarkSeated(entry)}
                          className="flex items-center gap-1.5 rounded-xl bg-wepass-600 px-4 py-2 text-xs font-black text-white shadow-sm hover:bg-wepass-700 transition"
                        >
                          <Check className="h-4 w-4" /> Mark Seated
                        </button>
                      )}

                      {/* COMPLETE VISIT BUTTON */}
                      {entry.status === 'SEATED' && (
                        <button
                          onClick={() => handleCompleteVisit(entry)}
                          className="flex items-center gap-1.5 rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-900 transition"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Finish & Free Table
                        </button>
                      )}

                      {/* SKIP OR NO-SHOW */}
                      {['WAITING', 'CALLED'].includes(entry.status) && (
                        <button
                          onClick={() => handleUpdateStatus(entry.id, 'NO_SHOW')}
                          title="Mark No-Show"
                          className="rounded-xl border border-slate-200 px-2.5 py-2 text-xs font-bold text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                        >
                          No-Show
                        </button>
                      )}

                      {/* CANCEL */}
                      {['WAITING', 'CALLED', 'PAUSED'].includes(entry.status) && (
                        <button
                          onClick={() => handleUpdateStatus(entry.id, 'CANCELLED', 'Staff manual cancel')}
                          title="Cancel Entry"
                          className="rounded-xl p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Tab 3: Floor Tables Overview */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tables.map((tbl) => (
              <div
                key={tbl.id}
                className={`rounded-3xl p-5 border shadow-subtle transition ${
                  tbl.status === 'AVAILABLE'
                    ? 'bg-white border-emerald-200'
                    : tbl.status === 'OCCUPIED'
                    ? 'bg-purple-50/50 border-purple-200'
                    : 'bg-amber-50/50 border-amber-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl font-black text-slate-900 font-mono">
                    {tbl.tableNumber}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      tbl.status === 'AVAILABLE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : tbl.status === 'OCCUPIED'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {tbl.status}
                  </span>
                </div>

                <p className="text-xs text-slate-500 font-medium">
                  {tbl.capacity} Seats • {tbl.section} Section
                </p>

                {tbl.status === 'OCCUPIED' && (
                  <button
                    onClick={async () => {
                      // Free table manually
                      await fetch(`/api/tables/${tbl.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: 'AVAILABLE' }),
                      });
                      loadQueueData(restaurantId, false);
                    }}
                    className="mt-4 w-full rounded-xl bg-white border border-slate-200 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
                  >
                    Clear & Free Table
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ================= FAIRNESS EXCEPTION MODAL ================= */}
      {targetCallEntry && (
        <FairnessModal
          isOpen={fairnessModalOpen}
          onClose={() => setFairnessModalOpen(false)}
          targetToken={targetCallEntry.token}
          targetGuestName={targetCallEntry.guestName}
          skippedEntries={skippedEntries}
          onConfirm={(reason, notes, managerApproved) => {
            handleCallGuest(targetCallEntry, reason, notes, managerApproved);
          }}
        />
      )}

      {/* ================= ASSIGN TABLE MODAL ================= */}
      {assignModalOpen && selectedEntryForTable && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm sm:items-center">
          <div className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Assign Table</h3>
                <p className="text-xs text-slate-500">
                  Guest: <strong className="text-slate-800">{selectedEntryForTable.guestName}</strong> ({selectedEntryForTable.partySize} guests)
                </p>
              </div>
              <button
                onClick={() => setAssignModalOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto mb-5 pr-1">
              {tables.filter((t) => t.status === 'AVAILABLE').length === 0 ? (
                <p className="text-xs text-rose-600 font-semibold p-4 bg-rose-50 rounded-xl">
                  No available tables right now. Please free up an occupied table first.
                </p>
              ) : (
                tables
                  .filter((t) => t.status === 'AVAILABLE')
                  .map((t) => (
                    <label
                      key={t.id}
                      className={`flex items-center justify-between rounded-xl border p-3 text-xs cursor-pointer transition ${
                        selectedTableId === t.id
                          ? 'border-wepass-500 bg-wepass-50 font-bold text-wepass-900'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="tableSelect"
                          value={t.id}
                          checked={selectedTableId === t.id}
                          onChange={(e) => setSelectedTableId(e.target.value)}
                          className="text-wepass-600 focus:ring-wepass-500"
                        />
                        <span className="font-mono text-sm">{t.tableNumber}</span>
                        <span className="text-slate-400">({t.section})</span>
                      </div>
                      <span className="font-semibold text-slate-600">{t.capacity} Seats</span>
                    </label>
                  ))
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setAssignModalOpen(false)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignTableSubmit}
                disabled={!selectedTableId}
                className="rounded-xl bg-wepass-600 px-5 py-2 text-xs font-bold text-white shadow hover:bg-wepass-700 disabled:opacity-50"
              >
                Confirm Table
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MANUAL WALK-IN MODAL ================= */}
      {walkinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm sm:items-center">
          <div className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl md:p-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Register Walk-in Guest</h3>
                <p className="text-xs text-slate-500">For guests who cannot scan the QR code.</p>
              </div>
              <button
                onClick={() => setWalkinModalOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleWalkinSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Guest Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={walkinName}
                  onChange={(e) => setWalkinName(e.target.value)}
                  placeholder="e.g. Priya Nair"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-wepass-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Mobile Number (Optional)
                </label>
                <input
                  type="tel"
                  value={walkinPhone}
                  onChange={(e) => setWalkinPhone(e.target.value)}
                  placeholder="+91 98765 00000"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-wepass-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Party Size
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={walkinPartySize}
                    onChange={(e) => setWalkinPartySize(parseInt(e.target.value, 10) || 1)}
                    className="w-24 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-900 focus:border-wepass-500 focus:outline-none"
                  />
                  <span className="text-xs text-slate-500">
                    Auto assigned Group: {walkinPartySize <= 2 ? 'A' : walkinPartySize <= 4 ? 'B' : walkinPartySize <= 6 ? 'C' : 'D'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Special Notes
                </label>
                <input
                  type="text"
                  value={walkinRequests}
                  onChange={(e) => setWalkinRequests(e.target.value)}
                  placeholder="e.g. VIP guest, patio requested..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-wepass-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setWalkinModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={walkinSubmitting}
                  className="rounded-xl bg-wepass-600 px-5 py-2 text-xs font-bold text-white shadow hover:bg-wepass-700 disabled:opacity-50"
                >
                  {walkinSubmitting ? 'Registering...' : 'Add to Queue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
