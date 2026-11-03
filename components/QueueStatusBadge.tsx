import React from 'react';

export type QueueStatus =
  | 'WAITING'
  | 'CALLED'
  | 'CONFIRMED'
  | 'SEATED'
  | 'COMPLETED'
  | 'PAUSED'
  | 'SKIPPED'
  | 'CANCELLED'
  | 'NO_SHOW';

interface QueueStatusBadgeProps {
  status: QueueStatus | string;
  size?: 'sm' | 'md' | 'lg';
  showPulse?: boolean;
}

export default function QueueStatusBadge({
  status,
  size = 'md',
  showPulse = false,
}: QueueStatusBadgeProps) {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 font-bold',
  };

  const statusConfig: Record<
    string,
    { label: string; bg: string; text: string; dot: string; pulse?: boolean }
  > = {
    WAITING: {
      label: 'Waiting in Line',
      bg: 'bg-emerald-50 border border-emerald-200/60',
      text: 'text-emerald-700',
      dot: 'bg-emerald-500',
      pulse: true,
    },
    CALLED: {
      label: 'Table Called',
      bg: 'bg-weamber-100 border border-weamber-300',
      text: 'text-weamber-800',
      dot: 'bg-weamber-500',
      pulse: true,
    },
    CONFIRMED: {
      label: "I'm Coming",
      bg: 'bg-blue-50 border border-blue-200',
      text: 'text-blue-700',
      dot: 'bg-blue-500',
      pulse: true,
    },
    SEATED: {
      label: 'Seated & Dining',
      bg: 'bg-purple-50 border border-purple-200',
      text: 'text-purple-700',
      dot: 'bg-purple-500',
    },
    COMPLETED: {
      label: 'Visit Completed',
      bg: 'bg-slate-100 border border-slate-200',
      text: 'text-slate-600',
      dot: 'bg-slate-400',
    },
    PAUSED: {
      label: 'Queue Paused',
      bg: 'bg-orange-50 border border-orange-200',
      text: 'text-orange-700',
      dot: 'bg-orange-400',
    },
    SKIPPED: {
      label: 'Skipped',
      bg: 'bg-amber-50 border border-amber-200',
      text: 'text-amber-700',
      dot: 'bg-amber-400',
    },
    CANCELLED: {
      label: 'Cancelled',
      bg: 'bg-rose-50 border border-rose-200',
      text: 'text-rose-700',
      dot: 'bg-rose-400',
    },
    NO_SHOW: {
      label: 'No-Show',
      bg: 'bg-slate-100 border border-slate-300',
      text: 'text-slate-600',
      dot: 'bg-slate-400',
    },
  };

  const current = statusConfig[status] || {
    label: status,
    bg: 'bg-slate-100 border border-slate-200',
    text: 'text-slate-700',
    dot: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ${current.bg} ${current.text} ${sizeClasses[size]}`}
    >
      <span
        className={`h-2 w-2 rounded-full ${current.dot} ${
          showPulse && current.pulse ? 'animate-ping' : ''
        }`}
      />
      <span>{current.label}</span>
    </span>
  );
}
