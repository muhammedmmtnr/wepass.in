'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Users,
  Clock,
  MapPin,
  Utensils,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Phone,
  Sparkles,
  RefreshCw,
  Bell,
  X,
  Volume2,
} from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import QueueStatusBadge, { QueueStatus } from '@/components/QueueStatusBadge';

export default function GuestQueueTrackingPage({
  params,
}: {
  params: { token: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = params.token?.toUpperCase().trim();
  const slug = searchParams.get('slug');

  const [ticket, setTicket] = useState<any>(null);
  const [position, setPosition] = useState<number | null>(null);
  const [overallPosition, setOverallPosition] = useState<number | null>(null);
  const [partiesAhead, setPartiesAhead] = useState<number>(0);
  const [estimatedWait, setEstimatedWait] = useState<number>(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Deadline countdown state for CALLED status
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);

  // Modal states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [confirmingArrival, setConfirmingArrival] = useState(false);

  // Audio chime ref for CALLED alert
  const calledSoundPlayed = useRef(false);

  // Fetch ticket details
  const fetchTicket = async () => {
    try {
      const accessToken =
        localStorage.getItem(`wepass_secret_${token}`) || searchParams.get('access');
      const res = await fetch(`/api/queue/${token}${slug ? `?slug=${slug}` : ''}`, {
        headers: accessToken ? { 'x-queue-access-token': accessToken } : undefined,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Ticket not found.');
      } else {
        setTicket(data.ticket);
        setPosition(data.position);
        setOverallPosition(data.overallPosition);
        setPartiesAhead(data.partiesAhead);
        setEstimatedWait(data.estimatedWaitMinutes);
        setLastRefreshed(new Date());
        if (searchParams.has('access')) {
          const cleanUrl = `/queue/${token}${slug ? `?slug=${encodeURIComponent(slug)}` : ''}`;
          router.replace(cleanUrl);
        }

        // Play chime once if status changes to CALLED
        if (data.ticket.status === 'CALLED' && !calledSoundPlayed.current) {
          calledSoundPlayed.current = true;
          try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
            osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
            osc.start();
            osc.stop(ctx.currentTime + 0.5);
          } catch {}
        }
      }
    } catch (err) {
      // offline / transient error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    let eventSource: EventSource | null = null;
    let pollInterval: ReturnType<typeof setInterval> | null = null;

    const connect = async () => {
      await fetchTicket();
      if (cancelled) return;

      const streamParams = new URLSearchParams({ token });
      if (slug) streamParams.set('slug', slug);
      eventSource = new EventSource(`/api/queue/stream?${streamParams}`);

      eventSource.onopen = () => {
        setIsLiveConnected(true);
      };

      eventSource.addEventListener('guest_update', (event) => {
        try {
          const update = JSON.parse(event.data);
          setTicket((prev: any) => ({
            ...prev,
            status: update.status,
            assignedTable: update.assignedTable,
            calledAt: update.calledAt,
            callDeadlineAt: update.callDeadlineAt,
            confirmedAt: update.confirmedAt,
            seatedAt: update.seatedAt,
          }));
          setPosition(update.groupPosition);
          setOverallPosition(update.overallPosition);
          setPartiesAhead(update.partiesAhead);
          setEstimatedWait(update.estimatedWaitMinutes);
          setLastRefreshed(new Date());
        } catch (e) {}
      });

      eventSource.onerror = () => {
        setIsLiveConnected(false);
      };

      pollInterval = setInterval(() => {
        fetchTicket();
      }, 5000);
    };

    void connect();

    return () => {
      cancelled = true;
      eventSource?.close();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [token, slug]);

  // Handle countdown timer when CALLED
  useEffect(() => {
    if (ticket?.status === 'CALLED' && ticket.callDeadlineAt) {
      const deadline = new Date(ticket.callDeadlineAt).getTime();
      const updateCountdown = () => {
        const diff = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
        setSecondsRemaining(diff);
      };
      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    } else {
      setSecondsRemaining(null);
    }
  }, [ticket?.status, ticket?.callDeadlineAt]);

  // Guest confirms arrival "I'M COMING"
  const handleImComing = async () => {
    setConfirmingArrival(true);
    try {
      const accessToken = localStorage.getItem(`wepass_secret_${token}`);
      const res = await fetch(`/api/queue/${token}/im-coming${slug ? `?slug=${slug}` : ''}`, {
        method: 'POST',
        headers: accessToken ? { 'x-queue-access-token': accessToken } : undefined,
      });
      const data = await res.json();
      if (res.ok) {
        setTicket((prev: any) => ({
          ...prev,
          status: 'CONFIRMED',
          confirmedAt: new Date().toISOString(),
        }));
      } else {
        alert(data.error || 'Unable to confirm arrival. Please notify the host.');
      }
    } catch (e) {
      alert('Network issue confirming arrival. Please notify host directly.');
    } finally {
      setConfirmingArrival(false);
    }
  };

  // Guest cancels queue
  const handleCancelQueue = async () => {
    setCancelling(true);
    try {
      const accessToken = localStorage.getItem(`wepass_secret_${token}`);
      const res = await fetch(`/api/queue/${token}/cancel${slug ? `?slug=${slug}` : ''}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { 'x-queue-access-token': accessToken } : {}),
        },
        body: JSON.stringify({ reason: 'Guest cancelled from live tracker' }),
      });
      if (res.ok) {
        setShowCancelModal(false);
        setTicket((prev: any) => ({ ...prev, status: 'CANCELLED' }));
        if (slug) {
          localStorage.removeItem(`wepass_active_token_${slug}`);
        }
        localStorage.removeItem(`wepass_secret_${token}`);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to cancel. Please try again.');
      }
    } catch (e) {
      alert('Failed to cancel. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#E8F3EC]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-wepass-500 border-t-transparent" />
          <p className="text-sm font-semibold text-wepass-800">Loading your live spot...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#E8F3EC] p-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-premium border border-slate-100">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Ticket Not Found</h2>
          <p className="text-sm text-slate-500 mb-6">{error || 'This ticket token has expired or is invalid.'}</p>
          <Link
            href="/"
            className="inline-flex rounded-xl bg-wepass-600 px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-wepass-700 transition"
          >
            Return to WePass
          </Link>
        </div>
      </div>
    );
  }

  const restaurant = ticket.restaurant;

  return (
    <div className="min-h-screen bg-[#E8F3EC] text-slate-800 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-wepass-200/50 px-4 py-3">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <BrandLogo size="sm" />
          <div className="flex items-center gap-2">
            <span
              className={`flex h-2.5 w-2.5 rounded-full ${
                isLiveConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
            <span className="text-[11px] font-bold text-slate-600">
              {isLiveConnected ? 'Live Updates' : 'Syncing...'}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pt-4">
        {/* Restaurant Header Pill */}
        <div className="mb-4 flex items-center justify-between rounded-2xl bg-white p-3.5 shadow-sm border border-wepass-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-wepass-500 text-white font-extrabold text-sm">
              {restaurant.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">{restaurant.name}</h2>
              <p className="text-[11px] text-slate-500">{restaurant.city || 'Bangalore'}</p>
            </div>
          </div>
          <QueueStatusBadge status={ticket.status} size="md" showPulse />
        </div>

        {/* ================= STEP 6: CALLED ALERT (CALLOUT HERO) ================= */}
        {ticket.status === 'CALLED' && (
          <div className="mb-5 overflow-hidden rounded-3xl bg-gradient-to-br from-weamber-500 to-amber-600 p-6 text-white shadow-float border border-amber-300 animate-bounce-subtle">
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-2 rounded-full bg-white/25 px-3 py-1 text-xs font-black uppercase tracking-wider backdrop-blur-md">
                <Bell className="h-4 w-4 animate-spin" /> Table Ready!
              </span>
              {secondsRemaining !== null && (
                <span className="text-xs font-mono font-bold bg-slate-900/30 px-3 py-1 rounded-full">
                  Arrive within: {formatCountdown(secondsRemaining)}
                </span>
              )}
            </div>

            <h3 className="text-2xl font-black tracking-tight mb-2">
              Your table is ready, {ticket.guestName}!
            </h3>
            <p className="text-xs text-amber-100 mb-5 leading-relaxed">
              Please proceed immediately to the restaurant entrance. Tap below to confirm you are on your way so staff holds your table.
            </p>

            <button
              onClick={handleImComing}
              disabled={confirmingArrival}
              className="w-full rounded-2xl bg-white py-4 text-base font-black text-amber-900 shadow-xl hover:bg-amber-50 active:scale-[0.98] transition flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              {confirmingArrival ? 'Notifying Host...' : "I'M COMING →"}
            </button>
          </div>
        )}

        {/* ================= STEP 6B: CONFIRMED ARRIVAL ================= */}
        {ticket.status === 'CONFIRMED' && (
          <div className="mb-5 rounded-3xl bg-blue-600 p-6 text-white shadow-premium">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold">Arrival Confirmed!</h3>
                <p className="text-xs text-blue-100">Host has been notified you are at the entrance.</p>
              </div>
            </div>
            <p className="text-xs text-blue-100 mt-2 bg-blue-700/50 p-3 rounded-xl border border-blue-400/30">
              Please let the host desk know your token: <strong className="text-white font-mono text-sm">{ticket.token}</strong>.
            </p>
          </div>
        )}

        {/* ================= STEP 7: SEATED SUCCESS HERO ================= */}
        {ticket.status === 'SEATED' && (
          <div className="mb-5 rounded-3xl bg-gradient-to-br from-wepass-700 to-wepass-500 p-6 text-white shadow-float text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-md text-white">
              <Sparkles className="h-8 w-8 text-amber-300" />
            </div>
            <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider">
              Seated Successfully
            </span>
            <h3 className="text-2xl font-black mt-2 mb-1">Welcome to {restaurant.name}!</h3>
            <p className="text-xs text-wepass-100 mb-4">Enjoy your dining experience.</p>

            <div className="rounded-2xl bg-white/10 backdrop-blur-md p-4 border border-white/20 mb-4">
              <p className="text-[11px] uppercase tracking-wider text-wepass-200">Your Table</p>
              <p className="text-3xl font-black tracking-tight mt-0.5">
                {ticket.assignedTable ? ticket.assignedTable.tableNumber : 'Host Assigned Table'}
              </p>
              {ticket.assignedTable?.section && (
                <p className="text-xs text-emerald-200 mt-1 font-medium">
                  {ticket.assignedTable.section} Section
                </p>
              )}
            </div>

            <Link
              href={`/menu/${restaurant.slug}`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3.5 text-sm font-extrabold text-wepass-800 shadow hover:bg-wepass-50 transition"
            >
              <Utensils className="h-4 w-4" /> Open Digital Menu
            </Link>
          </div>
        )}

        {/* ================= STEP 5: LIVE QUEUE TRACKING CARD ================= */}
        <div className="overflow-hidden rounded-3xl bg-white p-6 shadow-premium border border-white/80 mb-5 text-center relative">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">
            Queue Pass Token
          </p>
          <div className="inline-block rounded-2xl bg-wepass-50 border border-wepass-200/80 px-6 py-2.5 mb-5 shadow-sm">
            <span className="text-3xl font-black tracking-tight text-wepass-700 font-mono">
              {ticket.token}
            </span>
          </div>

          {/* Large Prominent Queue Position */}
          {ticket.status === 'WAITING' ? (
            <div className="py-2">
              <p className="text-xs font-semibold text-slate-500 mb-1">Your Current Position</p>
              <div className="flex items-baseline justify-center gap-1.5">
                <span className="text-6xl font-black tracking-tighter text-slate-900">
                  #{position ?? '—'}
                </span>
                <span className="text-sm font-bold text-slate-500">in line</span>
              </div>
              <p className="mt-1 text-xs text-wepass-700 font-semibold">
                Table Group {ticket.tableGroup} (Party of {ticket.partySize})
              </p>

              {/* 3 Metrics Grid */}
              <div className="mt-6 grid grid-cols-2 gap-3 text-left">
                <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Users className="h-4 w-4 text-wepass-600" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Ahead of you</span>
                  </div>
                  <p className="text-xl font-black text-slate-900">
                    {partiesAhead} {partiesAhead === 1 ? 'party' : 'parties'}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Clock className="h-4 w-4 text-weamber-600" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Est. Waiting</span>
                  </div>
                  <p className="text-xl font-black text-slate-900">
                    ~{estimatedWait} mins
                  </p>
                </div>
              </div>
            </div>
          ) : ticket.status === 'COMPLETED' ? (
            <div className="py-4">
              <CheckCircle2 className="mx-auto h-12 w-12 text-slate-400 mb-2" />
              <h4 className="text-lg font-bold text-slate-800">Visit Completed</h4>
              <p className="text-xs text-slate-500 mt-1">Thank you for dining with us!</p>
            </div>
          ) : ticket.status === 'CANCELLED' ? (
            <div className="py-4">
              <X className="mx-auto h-12 w-12 text-rose-500 mb-2" />
              <h4 className="text-lg font-bold text-slate-800">Queue Entry Cancelled</h4>
              <p className="text-xs text-slate-500 mt-1">
                {ticket.cancellationReason || 'This ticket was cancelled.'}
              </p>
            </div>
          ) : null}

          {/* Assigned Table Preview if available */}
          {ticket.assignedTable && ticket.status !== 'SEATED' && (
            <div className="mt-4 rounded-2xl bg-wepass-50 border border-wepass-200/70 p-3 text-xs text-wepass-800 flex items-center justify-between">
              <span className="font-semibold">Assigned Table:</span>
              <span className="font-black text-sm">Table {ticket.assignedTable.tableNumber}</span>
            </div>
          )}

          {/* Refresh pulse info */}
          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Live sync active
            </span>
            <button
              onClick={fetchTicket}
              className="font-semibold text-wepass-600 hover:text-wepass-700"
            >
              Refresh Now
            </button>
          </div>
        </div>

        {/* Useful Quick Actions */}
        <div className="space-y-3">
          <Link
            href={`/menu/${restaurant.slug}`}
            className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm border border-slate-100 hover:bg-slate-50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-wepass-100 text-wepass-700">
                <Utensils className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900">Explore Restaurant Menu</p>
                <p className="text-[11px] text-slate-500">Pick dishes while you wait</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400" />
          </Link>

          {restaurant.phone && (
            <a
              href={`tel:${restaurant.phone}`}
              className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm border border-slate-100 hover:bg-slate-50 transition"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-900">Call Restaurant Host</p>
                  <p className="text-[11px] text-slate-500">{restaurant.phone}</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </a>
          )}

          {/* Cancel queue trigger */}
          {['WAITING', 'CALLED', 'PAUSED'].includes(ticket.status) && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="w-full text-center py-2.5 text-xs font-bold text-rose-600 hover:text-rose-700 transition"
            >
              Leave / Cancel Queue Spot
            </button>
          )}
        </div>
      </main>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm sm:items-center">
          <div className="my-auto w-full max-w-sm rounded-3xl border border-slate-100 bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Cancel Queue Ticket?</h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              You will lose your #{position ?? '—'} position in line. You will need to scan and re-join if you change your mind.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
              >
                Keep My Spot
              </button>
              <button
                onClick={handleCancelQueue}
                disabled={cancelling}
                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white shadow hover:bg-rose-700 transition disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
