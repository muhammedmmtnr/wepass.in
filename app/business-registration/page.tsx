'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, ArrowLeft, Building2, LoaderCircle } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import styles from './page.module.css';

type LeadForm = {
  contactPersonName: string;
  businessName: string;
  city: string;
  district: string;
  state: string;
  whatsappNumber: string;
  email: string;
  businessType: string;
  notes: string;
  preferredDemoDate: string;
  preferredDemoTime: string;
  demoDuration: string;
};

type LeadStatuses = {
  sheets?: string;
  gmail?: string;
  calendar?: string;
  customerConfirmation?: string;
};

const initialForm: LeadForm = {
  contactPersonName: '',
  businessName: '',
  city: '',
  district: '',
  state: '',
  whatsappNumber: '',
  email: '',
  businessType: '',
  notes: '',
  preferredDemoDate: '',
  preferredDemoTime: '',
  demoDuration: '30',
};

const requiredFields: Array<keyof Omit<LeadForm, 'email'>> = [
  'contactPersonName',
  'businessName',
  'city',
  'district',
  'state',
  'whatsappNumber',
];

const fieldLabels: Record<keyof LeadForm, string> = {
  contactPersonName: 'Contact person name',
  businessName: 'Restaurant / business name',
  city: 'City',
  district: 'District',
  state: 'State',
  whatsappNumber: 'WhatsApp number',
  email: 'Email address',
  businessType: 'Business type',
  notes: 'Notes / requirements',
  preferredDemoDate: 'Preferred demo date',
  preferredDemoTime: 'Preferred demo time (IST)',
  demoDuration: 'Preferred demo duration',
};

function getIndiaClock() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? '';
  return {
    date: `${part('year')}-${part('month')}-${part('day')}`,
    hour: Number(part('hour')),
    minute: Number(part('minute')),
  };
}

function getMinimumIndiaTime(date: string) {
  const now = getIndiaClock();
  if (date !== now.date) return undefined;
  const nextSlot = Math.floor((now.hour * 60 + now.minute) / 30 + 1) * 30;
  if (nextSlot >= 24 * 60) return '23:59';
  return `${String(Math.floor(nextSlot / 60)).padStart(2, '0')}:${String(nextSlot % 60).padStart(2, '0')}`;
}

export default function BusinessRegistrationPage() {
  const [form, setForm] = useState<LeadForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submittedAsDemo, setSubmittedAsDemo] = useState(false);
  const [submittedDemoSlot, setSubmittedDemoSlot] = useState('');
  const [submittedStatuses, setSubmittedStatuses] = useState<LeadStatuses>({});
  const requestId = useRef<string | null>(null);

  const updateField = (field: keyof LeadForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    requestId.current = null;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const isDemoBooking =
      submitter instanceof HTMLButtonElement && submitter.value === 'demo_booking';

    const missingField = requiredFields.find((field) => !form[field].trim());
    if (missingField) {
      setError(`${fieldLabels[missingField]} is required.`);
      return;
    }

    if (isDemoBooking) {
      if (Boolean(form.preferredDemoDate) !== Boolean(form.preferredDemoTime)) {
        setError('Choose both a preferred demo date and time, or leave both blank.');
        return;
      }
    }

    const digits = form.whatsappNumber.replace(/\D/g, '');
    if (!form.whatsappNumber.trim().startsWith('+') || digits.length < 8 || digits.length > 15) {
      setError('Enter a valid WhatsApp number with its country code, such as +91 98765 43210.');
      return;
    }

    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError('Enter a valid email address or leave it blank.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          requestId: isDemoBooking ? (requestId.current ??= crypto.randomUUID()) : undefined,
          requestType: isDemoBooking ? 'demo_booking' : 'business_enquiry',
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || 'We could not save your details. Please try again.');
        return;
      }

      setForm(initialForm);
      setSubmittedAsDemo(isDemoBooking);
      setSubmittedDemoSlot(
        isDemoBooking
          ? `${form.preferredDemoDate} at ${form.preferredDemoTime} IST (${form.demoDuration} minutes)`
          : ''
      );
      setSubmittedStatuses(isDemoBooking ? result.statuses ?? {} : {});
      requestId.current = null;
      setSubmitted(true);
    } catch (submitError) {
      console.error('Business registration request failed:', submitError);
      setError('Connection failed. Your details were not submitted. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClassName =
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-slate-400 focus:border-[#237A50] focus:ring-2 focus:ring-[#237A50]/15';
  const labelClassName = 'mb-1.5 block text-sm font-semibold text-slate-800';

  return (
    <main className={`${styles.page} min-h-screen bg-[#EFF8F2] px-4 py-8 sm:px-6 sm:py-12`}>
      <div className={`${styles.container} mx-auto max-w-3xl`}>
        <div className={`${styles.header} mb-8 flex items-center justify-between`}>
          <BrandLogo className={styles.brand} size="md" showSubtitle />
          <Link href="/" className={`${styles.homeLink} inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#237A50]`}>
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
        </div>

        <section className={`${styles.card} overflow-hidden rounded-3xl border border-white bg-white shadow-xl shadow-emerald-950/5`}>
          <div className={`${styles.hero} bg-[#237A50] px-6 py-8 text-white sm:px-10 sm:py-10`}>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
              <Building2 className="h-6 w-6" />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-50">WE PASS for restaurants</p>
            <h1 className={`${styles.title} mt-2 text-3xl font-black tracking-tight sm:text-4xl`}>Let’s improve your guest experience.</h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-emerald-50 sm:text-base">
              Tell us about your business and what you need. Our team will get in touch to help you get started.
            </p>
          </div>

          <div className={`${styles.content} p-6 sm:p-10`}>
            {submitted && (
              <div role="status" className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#237A50]" />
                <div>
                  <p className="font-bold">
                    {submittedAsDemo
                      ? 'Demo Request Submitted Successfully!'
                      : 'Thanks — your details have been saved.'}
                  </p>
                  <p className="mt-1">
                    {submittedAsDemo
                      ? 'Thank you for your interest in WE PASS. Our team will contact you shortly to schedule your personalized demo.'
                      : 'The WE PASS team will follow up with you.'}
                  </p>
                  {submittedAsDemo && (
                    <p className="mt-1">
                      Requested slot: {submittedDemoSlot}. Appointment status: Pending Confirmation.
                    </p>
                  )}
                  {submittedAsDemo && (
                    <p className="mt-1">
                      Sheets: {submittedStatuses.sheets ?? 'unknown'} · Business email: {submittedStatuses.gmail ?? 'unknown'} ·
                      {' '}Calendar: {submittedStatuses.calendar ?? 'unknown'} · Customer confirmation: {submittedStatuses.customerConfirmation ?? 'unknown'}
                    </p>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div role="alert" className="mb-6 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div className={`${styles.fields} grid gap-5 sm:grid-cols-2`}>
                {([
                  ['contactPersonName', 'text', 'Your full name', true],
                  ['businessName', 'text', 'e.g. The Green Table', true],
                  ['city', 'text', 'City', true],
                  ['district', 'text', 'District', true],
                  ['state', 'text', 'State', true],
                  ['whatsappNumber', 'tel', '+91 98765 43210', true],
                  ['email', 'email', 'you@business.com', false],
                ] as const).map(([field, type, placeholder, required]) => (
                  <div key={field}>
                    <label className={labelClassName} htmlFor={field}>
                      {fieldLabels[field]}{field === 'email' && <span className="ml-1 text-slate-500">(optional)</span>}
                      {required && <span className="ml-1 text-[#237A50]">*</span>}
                    </label>
                    <input
                      id={field}
                      name={field}
                      type={type}
                      value={form[field]}
                      onChange={(event) => updateField(field, event.target.value)}
                      placeholder={placeholder}
                      required={required}
                      autoComplete={field === 'contactPersonName' ? 'name' : field === 'email' ? 'email' : 'off'}
                      aria-required={required}
                      className={inputClassName}
                    />
                    {field === 'whatsappNumber' && (
                      <p className="mt-1.5 text-xs text-slate-500">Include the international country code, starting with +.</p>
                    )}
                  </div>
                ))}
                <div>
                  <label className={labelClassName} htmlFor="businessType">Business type</label>
                  <input
                    id="businessType"
                    name="businessType"
                    type="text"
                    value={form.businessType}
                    onChange={(event) => updateField('businessType', event.target.value)}
                    placeholder="Restaurant, cafe, hotel..."
                    maxLength={200}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label className={labelClassName} htmlFor="preferredDemoDate">
                    Preferred demo date (optional)
                  </label>
                  <input
                    id="preferredDemoDate"
                    name="preferredDemoDate"
                    type="date"
                    min={getIndiaClock().date}
                    value={form.preferredDemoDate}
                    onChange={(event) => updateField('preferredDemoDate', event.target.value)}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label className={labelClassName} htmlFor="preferredDemoTime">
                    Preferred demo time (IST, optional)
                  </label>
                  <input
                    id="preferredDemoTime"
                    name="preferredDemoTime"
                    type="time"
                    step={1800}
                    min={getMinimumIndiaTime(form.preferredDemoDate)}
                    value={form.preferredDemoTime}
                    onChange={(event) => updateField('preferredDemoTime', event.target.value)}
                    className={inputClassName}
                  />
                  <p className="mt-1.5 text-xs text-slate-500">30-minute intervals; requested slots remain pending confirmation.</p>
                </div>
                <div>
                  <label className={labelClassName} htmlFor="demoDuration">
                    Preferred demo duration
                  </label>
                  <select
                    id="demoDuration"
                    name="demoDuration"
                    value={form.demoDuration}
                    onChange={(event) => updateField('demoDuration', event.target.value)}
                    className={inputClassName}
                  >
                    <option value="30">30 minutes (default)</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClassName} htmlFor="notes">
                  {fieldLabels.notes} (optional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={form.notes}
                  onChange={(event) => updateField('notes', event.target.value)}
                  placeholder="Tell us about your queue, table management, or other requirements."
                  rows={5}
                  maxLength={3000}
                  className={`${inputClassName} resize-y`}
                />
                <p className="mt-1 text-right text-xs text-slate-400">{form.notes.length}/3000</p>
              </div>

              <div className={`${styles.actions} flex flex-col gap-3 sm:flex-row`}>
                <button
                  type="submit"
                  name="requestType"
                  value="business_enquiry"
                  disabled={submitting}
                  className="w-full rounded-xl border border-[#237A50] bg-white px-6 py-3.5 text-sm font-bold text-[#237A50] transition hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-[#237A50] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {submitting && <LoaderCircle className="mr-2 inline h-4 w-4 animate-spin" aria-hidden="true" />}
                  {submitting ? 'Submitting…' : 'Send business enquiry'}
                </button>
                <button
                  type="submit"
                  name="requestType"
                  value="demo_booking"
                  disabled={submitting}
                  className="w-full rounded-xl bg-[#237A50] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#087c50] focus:outline-none focus:ring-2 focus:ring-[#237A50] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {submitting && <LoaderCircle className="mr-2 inline h-4 w-4 animate-spin" aria-hidden="true" />}
                  {submitting ? 'Submitting…' : 'Book a demo'}
                </button>
              </div>
            </form>

            <p className={`${styles.footer} mt-6 border-t border-slate-100 pt-5 text-sm text-slate-500`}>
              Already have a WE PASS account?{' '}
              <Link href="/login" className="font-semibold text-[#237A50] hover:underline">Sign in</Link>
              {' · '}
              <Link href="/register" className="font-semibold text-[#237A50] hover:underline">Create an account</Link>
            </p>
          </div>
        </section>

        <p className={`${styles.note} mt-6 text-center text-xs text-slate-500`}>
          Your enquiry is sent securely to the WE PASS team and saved in our business leads sheet.
        </p>
      </div>
    </main>
  );
}
