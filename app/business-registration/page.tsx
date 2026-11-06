'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, ArrowLeft, Building2 } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

type LeadForm = {
  contactPersonName: string;
  businessName: string;
  city: string;
  district: string;
  state: string;
  whatsappNumber: string;
  email: string;
  notes: string;
  requestedDateTime: string;
};

const initialForm: LeadForm = {
  contactPersonName: '',
  businessName: '',
  city: '',
  district: '',
  state: '',
  whatsappNumber: '',
  email: '',
  notes: '',
  requestedDateTime: '',
};

const requiredFields: Array<keyof Omit<LeadForm, 'email' | 'requestedDateTime'>> = [
  'contactPersonName',
  'businessName',
  'city',
  'district',
  'state',
  'whatsappNumber',
  'notes',
];

const fieldLabels: Record<keyof LeadForm, string> = {
  contactPersonName: 'Contact person name',
  businessName: 'Restaurant / business name',
  city: 'City',
  district: 'District',
  state: 'State',
  whatsappNumber: 'WhatsApp number',
  email: 'Email address',
  notes: 'Notes / requirements',
  requestedDateTime: 'Requested date and time',
};

export default function BusinessRegistrationPage() {
  const [form, setForm] = useState<LeadForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submittedAsBooking, setSubmittedAsBooking] = useState(false);

  const updateField = (field: keyof LeadForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const isBookingRequest =
      submitter instanceof HTMLButtonElement && submitter.value === 'booking_request';

    const missingField = requiredFields.find((field) => !form[field].trim());
    if (missingField) {
      setError(`${fieldLabels[missingField]} is required.`);
      return;
    }

    if (isBookingRequest && !form.requestedDateTime) {
      setError('Choose a requested date and time for your booking request.');
      return;
    }

    if (form.requestedDateTime && new Date(form.requestedDateTime).getTime() <= Date.now()) {
      setError('Choose a requested date and time in the future.');
      return;
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
          requestType: isBookingRequest ? 'booking_request' : 'business_enquiry',
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || 'We could not save your details. Please try again.');
        return;
      }

      setForm(initialForm);
      setSubmittedAsBooking(isBookingRequest);
      setSubmitted(true);
    } catch (submitError) {
      console.error('Business registration request failed:', submitError);
      setError('Connection failed. Your details were not submitted. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClassName =
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-slate-400 focus:border-[#079F61] focus:ring-2 focus:ring-[#079F61]/15';
  const labelClassName = 'mb-1.5 block text-sm font-semibold text-slate-800';

  return (
    <main className="min-h-screen bg-[#EFF8F2] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <BrandLogo size="md" showSubtitle />
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#079F61]">
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
        </div>

        <section className="overflow-hidden rounded-3xl border border-white bg-white shadow-xl shadow-emerald-950/5">
          <div className="bg-[#079F61] px-6 py-8 text-white sm:px-10 sm:py-10">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
              <Building2 className="h-6 w-6" />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-50">WE PASS for restaurants</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Let’s improve your guest experience.</h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-emerald-50 sm:text-base">
              Tell us about your business and what you need. Our team will get in touch to help you get started.
            </p>
          </div>

          <div className="p-6 sm:p-10">
            {submitted && (
              <div role="status" className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#079F61]" />
                <div>
                  <p className="font-bold">
                    {submittedAsBooking
                      ? 'Thanks — your booking request has been saved.'
                      : 'Thanks — your details have been saved.'}
                  </p>
                  <p className="mt-1">
                    {submittedAsBooking
                      ? 'The WE PASS team will follow up to confirm your requested time.'
                      : 'The WE PASS team will follow up with you.'}
                  </p>
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
              <div className="grid gap-5 sm:grid-cols-2">
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
                      {fieldLabels[field]}{required && <span className="ml-1 text-[#079F61]">*</span>}
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
              </div>

              <div>
                <label className={labelClassName} htmlFor="notes">
                  {fieldLabels.notes}<span className="ml-1 text-[#079F61]">*</span>
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={form.notes}
                  onChange={(event) => updateField('notes', event.target.value)}
                  placeholder="Tell us about your queue, table management, or other requirements."
                  required
                  rows={5}
                  maxLength={3000}
                  aria-required="true"
                  className={`${inputClassName} resize-y`}
                />
                <p className="mt-1 text-right text-xs text-slate-400">{form.notes.length}/3000</p>
              </div>

              <div>
                <label className={labelClassName} htmlFor="requestedDateTime">
                  Requested date and time
                  <span className="ml-1 text-slate-400">(for booking requests)</span>
                </label>
                <input
                  id="requestedDateTime"
                  name="requestedDateTime"
                  type="datetime-local"
                  value={form.requestedDateTime}
                  onChange={(event) => updateField('requestedDateTime', event.target.value)}
                  min={new Date(Date.now() - new Date().getTimezoneOffset() * 60_000)
                    .toISOString()
                    .slice(0, 16)}
                  className={inputClassName}
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  name="requestType"
                  value="business_enquiry"
                  disabled={submitting}
                  className="w-full rounded-xl border border-[#079F61] bg-white px-6 py-3.5 text-sm font-bold text-[#079F61] transition hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-[#079F61] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {submitting ? 'Submitting…' : 'Send business enquiry'}
                </button>
                <button
                  type="submit"
                  name="requestType"
                  value="booking_request"
                  disabled={submitting}
                  className="w-full rounded-xl bg-[#079F61] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#067f4e] focus:outline-none focus:ring-2 focus:ring-[#079F61] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {submitting ? 'Submitting…' : 'Book request'}
                </button>
              </div>
            </form>

            <p className="mt-6 border-t border-slate-100 pt-5 text-sm text-slate-500">
              Already have a WE PASS account?{' '}
              <Link href="/login" className="font-semibold text-[#079F61] hover:underline">Sign in</Link>
              {' · '}
              <Link href="/register" className="font-semibold text-[#079F61] hover:underline">Create an account</Link>
            </p>
          </div>
        </section>

        <p className="mt-6 text-center text-xs text-slate-500">
          Your enquiry is sent securely to the WE PASS team and saved in our business leads sheet.
        </p>
      </div>
    </main>
  );
}
