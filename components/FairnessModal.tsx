'use client';

import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, X } from 'lucide-react';

interface SkippedEntry {
  id: string;
  token: string;
  guestName: string;
  partySize: number;
}

interface FairnessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, notes: string, managerApproved: boolean) => void;
  targetToken: string;
  targetGuestName: string;
  skippedEntries: SkippedEntry[];
}

export const FAIRNESS_REASONS = [
  { id: 'EARLIER_GUEST_NOT_PRESENT', label: 'Earlier guest not present at entrance / unreachable' },
  { id: 'TABLE_COMPATIBILITY', label: 'Table capacity or section specifically matches this party' },
  { id: 'ACCESSIBILITY_REQUIREMENT', label: 'Accessibility requirement (stroller, wheelchair, ground level)' },
  { id: 'GUEST_REQUESTED_PRIORITY', label: 'VIP / guest requested priority with host' },
  { id: 'MANAGER_APPROVED_EXCEPTION', label: 'Manager-approved operational exception' },
  { id: 'OTHER', label: 'Other operational reason (must document notes below)' },
];

export default function FairnessModal({
  isOpen,
  onClose,
  onConfirm,
  targetToken,
  targetGuestName,
  skippedEntries,
}: FairnessModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [managerApproved, setManagerApproved] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) {
      setError('Please select an auditable reason before proceeding.');
      return;
    }
    if (selectedReason === 'OTHER' && !notes.trim()) {
      setError('Please provide notes explaining the reason.');
      return;
    }
    setError('');
    onConfirm(selectedReason, notes, managerApproved);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200 sm:items-center">
      <div className="relative max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-3xl border border-amber-200 bg-white p-6 shadow-2xl md:p-8">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 text-amber-600 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Fairness System Alert</h3>
            <p className="text-xs text-amber-700 font-medium">Queue policy exception audit</p>
          </div>
        </div>

        <p className="text-sm text-slate-600 mb-4 leading-relaxed">
          You are calling <strong className="text-slate-900">{targetToken} ({targetGuestName})</strong> ahead of{' '}
          <strong className="text-amber-700">{skippedEntries.length} earlier waiting party(ies)</strong>.
          WePass records every queue jump to maintain guest fairness and staff transparency.
        </p>

        {/* Skipped guests badge summary */}
        <div className="mb-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 p-3.5">
          <p className="text-xs font-semibold text-amber-900 mb-2">Parties being bypassed:</p>
          <div className="flex flex-wrap gap-2">
            {skippedEntries.map((item) => (
              <span
                key={item.id}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-slate-700 border border-amber-200 shadow-sm"
              >
                <span className="font-bold text-amber-700">{item.token}</span>
                <span>{item.guestName}</span>
                <span className="text-[10px] text-slate-400">({item.partySize}p)</span>
              </span>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Select Auditable Reason <span className="text-rose-500">*</span>
            </label>
            <div className="space-y-2">
              {FAIRNESS_REASONS.map((r) => (
                <label
                  key={r.id}
                  className={`flex items-start gap-3 rounded-xl border p-2.5 text-xs transition cursor-pointer ${
                    selectedReason === r.id
                      ? 'border-wepass-500 bg-wepass-50/60 font-medium text-wepass-900'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="fairnessReason"
                    value={r.id}
                    checked={selectedReason === r.id}
                    onChange={(e) => {
                      setSelectedReason(e.target.value);
                      setError('');
                    }}
                    className="mt-0.5 text-wepass-600 focus:ring-wepass-500"
                  />
                  <span>{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Operational Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe the seating constraint or guest request."
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-wepass-500 focus:outline-none focus:ring-1 focus:ring-wepass-500"
            />
          </div>

          <label className="flex items-center gap-2.5 rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={managerApproved}
              onChange={(e) => setManagerApproved(e.target.checked)}
              className="rounded text-wepass-600 focus:ring-wepass-500"
            />
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="h-4 w-4 text-wepass-600" />
              Manager on-duty has reviewed and approved this exception
            </span>
          </label>

          {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel Call
            </button>
            <button
              type="submit"
              className="rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-600/20 hover:bg-amber-700 transition"
            >
              Log Audit & Call Guest
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
