'use client';

import React, { FormEvent, useCallback, useEffect, useState } from 'react';
import { MessageCircle, RefreshCw, Save, Search } from 'lucide-react';

const leadStatuses = ['NEW', 'CONTACTED', 'SCHEDULED', 'COMPLETED', 'CANCELLED'] as const;
type LeadStatus = (typeof leadStatuses)[number];

type DemoLead = {
  leadId: string;
  contactPersonName: string;
  businessName: string;
  whatsappNumber: string;
  city: string | null;
  status: LeadStatus;
  createdAt: string;
  scheduledDemoDate: string | null;
  internalNotes: string;
};

type LeadDraft = {
  status: LeadStatus;
  scheduledDemoDate: string;
  internalNotes: string;
};

function localDateTime(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

function dateLabel(value: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export default function DemoLeadsPage() {
  const [leads, setLeads] = useState<DemoLead[]>([]);
  const [drafts, setDrafts] = useState<Record<string, LeadDraft>>({});
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingLead, setSavingLead] = useState('');
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [error, setError] = useState('');

  const loadLeads = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (appliedQuery) params.set('q', appliedQuery);
      if (statusFilter) params.set('status', statusFilter);
      const response = await fetch(`/api/admin/demo-leads?${params.toString()}`);
      const result: unknown = await response.json();
      if (response.status === 401) {
        setAuthenticated(false);
        setLeads([]);
        return;
      }
      if (!response.ok || !result || typeof result !== 'object' || !('leads' in result) || !Array.isArray(result.leads)) {
        const message = result && typeof result === 'object' && 'error' in result && typeof result.error === 'string'
          ? result.error
          : 'Unable to load demo leads.';
        if (response.status === 403) setAuthenticated(true);
        throw new Error(message);
      }
      setAuthenticated(true);
      setLeads(result.leads as DemoLead[]);
    } catch (loadError) {
      console.error('Demo leads could not be loaded:', loadError);
      setError(loadError instanceof Error ? loadError.message : 'Unable to load demo leads.');
    } finally {
      setLoading(false);
    }
  }, [appliedQuery, statusFilter]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    try {
      const response = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to sign in.');
      setLoginPassword('');
      await loadLeads();
    } catch (loginError) {
      console.error('Administrator sign-in failed:', loginError);
      setError(loginError instanceof Error ? loginError.message : 'Unable to sign in.');
    }
  };

  const updateDraft = (lead: DemoLead, key: keyof LeadDraft, value: string) => {
    setDrafts((current) => ({
      ...current,
      [lead.leadId]: {
        status: current[lead.leadId]?.status ?? lead.status,
        scheduledDemoDate: current[lead.leadId]?.scheduledDemoDate ?? localDateTime(lead.scheduledDemoDate),
        internalNotes: current[lead.leadId]?.internalNotes ?? lead.internalNotes,
        [key]: value,
      },
    }));
  };

  const saveLead = async (lead: DemoLead) => {
    const draft = drafts[lead.leadId] ?? {
      status: lead.status,
      scheduledDemoDate: localDateTime(lead.scheduledDemoDate),
      internalNotes: lead.internalNotes,
    };
    setSavingLead(lead.leadId);
    setError('');
    try {
      const response = await fetch('/api/admin/demo-leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.leadId,
          status: draft.status,
          scheduledDemoDate: draft.scheduledDemoDate
            ? new Date(draft.scheduledDemoDate).toISOString()
            : null,
          internalNotes: draft.internalNotes,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success || !result.lead) {
        throw new Error(result.error || 'Unable to update this lead.');
      }
      setLeads((current) => current.map((item) => item.leadId === lead.leadId ? result.lead : item));
      setDrafts((current) => {
        const next = { ...current };
        delete next[lead.leadId];
        return next;
      });
    } catch (saveError) {
      console.error('Demo lead could not be updated:', saveError);
      setError(saveError instanceof Error ? saveError.message : 'Unable to update this lead.');
    } finally {
      setSavingLead('');
    }
  };

  if (authenticated === false) {
    return (
      <main className="min-h-screen bg-[#E8F3EC] px-4 py-12">
        <form onSubmit={handleLogin} className="mx-auto mt-12 max-w-md rounded-3xl border border-white bg-white p-7 shadow-lg sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">WePass Administration</p>
          <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-900">Sign in to demo leads</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Use an active WePass account with the ADMIN role.</p>
          {error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
          <label className="mt-5 block text-sm font-semibold text-slate-800" htmlFor="admin-email">Email</label>
          <input
            id="admin-email"
            className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            type="email"
            autoComplete="username"
            value={loginEmail}
            onChange={(event) => setLoginEmail(event.target.value)}
            required
          />
          <label className="mt-4 block text-sm font-semibold text-slate-800" htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            type="password"
            autoComplete="current-password"
            value={loginPassword}
            onChange={(event) => setLoginPassword(event.target.value)}
            required
          />
          <button type="submit" className="mt-6 min-h-12 w-full rounded-full bg-emerald-700 px-5 font-bold text-white hover:bg-emerald-800">
            Sign in
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#E8F3EC] px-3 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 rounded-3xl border border-white bg-white p-5 shadow-sm sm:flex-row sm:items-end sm:justify-between sm:p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">WePass Administration</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Demo Leads</h1>
            <p className="mt-2 text-sm text-slate-600">Review requests, arrange demos, and keep your follow-ups moving.</p>
          </div>
          <button
            type="button"
            onClick={loadLeads}
            disabled={loading}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            Refresh
          </button>
        </header>

        <section className="mt-5 rounded-3xl border border-white bg-white p-4 shadow-sm sm:p-6" aria-label="Filter demo leads">
          <form
            className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem_auto]"
            onSubmit={(event) => {
              event.preventDefault();
              setAppliedQuery(query.trim());
            }}
          >
            <label className="relative block">
              <span className="sr-only">Search demo leads</span>
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                className="min-h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                placeholder="Search name, restaurant, phone or lead ID"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <label>
              <span className="sr-only">Filter by lead status</span>
              <select
                className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="">All statuses</option>
                {leadStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </label>
            <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-sm font-bold text-white hover:bg-emerald-800">
              <Search className="h-4 w-4" aria-hidden="true" />
              Search
            </button>
          </form>
        </section>

        {error && <p role="alert" className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</p>}

        <section className="mt-5 overflow-hidden rounded-3xl border border-white bg-white shadow-sm" aria-label="Demo leads">
          {loading ? (
            <div className="p-12 text-center text-sm text-slate-500">Loading demo leads…</div>
          ) : leads.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-500">No demo leads match these filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1120px] border-collapse text-left">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-bold">Lead / request date</th>
                    <th className="px-4 py-3 font-bold">Owner / restaurant</th>
                    <th className="px-4 py-3 font-bold">WhatsApp / city</th>
                    <th className="px-4 py-3 font-bold">Status</th>
                    <th className="px-4 py-3 font-bold">Scheduled demo</th>
                    <th className="px-4 py-3 font-bold">Internal notes</th>
                    <th className="px-4 py-3 font-bold">Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leads.map((lead) => {
                    const draft = drafts[lead.leadId] ?? {
                      status: lead.status,
                      scheduledDemoDate: localDateTime(lead.scheduledDemoDate),
                      internalNotes: lead.internalNotes,
                    };
                    const phoneDigits = lead.whatsappNumber.replace(/\D/g, '');
                    const message = encodeURIComponent(`Hi ${lead.contactPersonName}, this is WePass. We're following up on your demo request for ${lead.businessName}.`);
                    return (
                      <tr key={lead.leadId} className="align-top">
                        <td className="px-4 py-4">
                          <p className="font-mono text-xs font-bold text-slate-800">{lead.leadId}</p>
                          <p className="mt-1 whitespace-nowrap text-xs text-slate-500">{dateLabel(lead.createdAt)}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm font-bold text-slate-900">{lead.contactPersonName}</p>
                          <p className="mt-1 text-xs text-slate-600">{lead.businessName}</p>
                        </td>
                        <td className="px-4 py-4">
                          <a
                            href={`https://wa.me/${phoneDigits}?text=${message}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-900"
                          >
                            <MessageCircle className="h-4 w-4" aria-hidden="true" />
                            {lead.whatsappNumber}
                          </a>
                          <p className="mt-1 text-xs text-slate-500">{lead.city || 'City not provided'}</p>
                        </td>
                        <td className="px-4 py-4">
                          <select
                            aria-label={`Status for ${lead.businessName}`}
                            className="min-h-10 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold"
                            value={draft.status}
                            onChange={(event) => updateDraft(lead, 'status', event.target.value)}
                          >
                            {leadStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-4">
                          <label className="sr-only" htmlFor={`scheduled-${lead.leadId}`}>Scheduled demo date</label>
                          <input
                            id={`scheduled-${lead.leadId}`}
                            className="min-h-10 rounded-lg border border-slate-200 px-2 text-xs"
                            type="datetime-local"
                            value={draft.scheduledDemoDate}
                            onChange={(event) => updateDraft(lead, 'scheduledDemoDate', event.target.value)}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <label className="sr-only" htmlFor={`notes-${lead.leadId}`}>Internal notes</label>
                          <textarea
                            id={`notes-${lead.leadId}`}
                            className="min-h-16 w-48 rounded-lg border border-slate-200 p-2 text-xs"
                            maxLength={5000}
                            value={draft.internalNotes}
                            onChange={(event) => updateDraft(lead, 'internalNotes', event.target.value)}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() => saveLead(lead)}
                            disabled={savingLead === lead.leadId}
                            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-emerald-700 px-3 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-60"
                          >
                            <Save className="h-3.5 w-3.5" aria-hidden="true" />
                            {savingLead === lead.leadId ? 'Saving' : 'Save'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
