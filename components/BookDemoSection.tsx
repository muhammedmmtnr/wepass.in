'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import {
  ArrowRight,
  Building2,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  Check,
  Mail,
  MessageCircle,
  Phone,
  Send,
} from 'lucide-react';
import styles from './BookDemoSection.module.css';

type DemoForm = {
  firstName: string;
  lastName: string;
  businessName: string;
  email: string;
  businessType: string;
  whatsappNumber: string;
  city: string;
  district: string;
  state: string;
  notes: string;
  preferredDemoDate: string;
  preferredDemoTime: string;
  demoDuration: string;
};

const initialForm: DemoForm = {
  firstName: '',
  lastName: '',
  businessName: '',
  email: '',
  businessType: '',
  whatsappNumber: '',
  city: '',
  district: '',
  state: '',
  notes: '',
  preferredDemoDate: '',
  preferredDemoTime: '',
  demoDuration: '30',
};

type DemoStatuses = {
  sheets: string;
  gmail: string;
  calendar: string;
  customerConfirmation: string;
};

type DemoSuccess = {
  businessName: string;
  preferredDemoDate: string;
  preferredDemoTime: string;
  demoDuration: string;
  statuses: DemoStatuses;
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

function statusLabel(status: string) {
  return status.replace(/_/g, ' ');
}

export default function BookDemoSection() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<DemoSuccess | null>(null);
  const [error, setError] = useState('');
  const requestId = useRef<string | null>(null);

  const updateField = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    requestId.current = null;
    setSuccess(null);
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setSuccess(null);
    setError('');

    try {
      requestId.current ??= crypto.randomUUID();
      const response = await fetch('/api/book-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
          businessName: form.businessName,
          businessType: form.businessType,
          city: form.city,
          district: form.district,
          state: form.state,
          whatsapp: form.whatsappNumber,
          email: form.email,
          requirements: form.notes,
          preferredDemoDate: form.preferredDemoDate,
          preferredDemoTime: form.preferredDemoTime,
          demoDuration: Number(form.demoDuration),
          requestId: requestId.current,
          requestType: 'demo_booking',
        }),
      });
      const result: unknown = await response.json();

      if (
        !response.ok ||
        !result ||
        typeof result !== 'object' ||
        !('success' in result) ||
        result.success !== true
      ) {
        const message =
          result && typeof result === 'object' && 'error' in result && typeof result.error === 'string'
            ? result.error
            : 'We could not submit your demo request. Please try again.';
        setError(message);
        return;
      }

      const statuses =
        'statuses' in result && result.statuses && typeof result.statuses === 'object'
          ? result.statuses as Partial<DemoStatuses>
          : {};
      if (statuses.sheets !== 'saved') {
        setError('We could not verify that your request was saved. Please try again.');
        return;
      }

      setSuccess({
        businessName: form.businessName.trim(),
        preferredDemoDate: form.preferredDemoDate,
        preferredDemoTime: form.preferredDemoTime,
        demoDuration: form.demoDuration,
        statuses: {
          sheets: statuses.sheets,
          gmail: statuses.gmail ?? 'unknown',
          calendar: statuses.calendar ?? 'unknown',
          customerConfirmation: statuses.customerConfirmation ?? 'unknown',
        },
      });
      requestId.current = null;
      setForm(initialForm);
    } catch (submitError) {
      console.error('Demo booking request failed:', submitError);
      setError('We could not confirm the result of your request. Please try again; your request ID prevents duplicate processing.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="book-demo" className={styles.section} aria-labelledby="book-demo-heading">
      <div className={styles.orbit} aria-hidden="true" />
      <div className={styles.container}>
        <div className={styles.formColumn}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowIcon}><CalendarDays aria-hidden="true" /></span>
            Book a Demo
          </p>
          <h2 id="book-demo-heading" className={styles.heading}>Book a Demo of <span>WePass</span></h2>
          <p className={styles.description}>
            See how WePass can streamline your restaurant queue, help manage your guests, and support your team.
          </p>

          {success && (
            <div className={styles.success} role="status">
              <Check aria-hidden="true" />
              <div className={styles.successDetails}>
                <strong>Your WE PASS demo request has been received!</strong>
                <span>Business: {success.businessName}</span>
                <span>Requested date: {success.preferredDemoDate}</span>
                <span>Requested time: {success.preferredDemoTime} IST</span>
                <span>Duration: {success.demoDuration} minutes</span>
                <strong>Appointment status: Pending Confirmation</strong>
                <span>Sheets: {statusLabel(success.statuses.sheets)}</span>
                <span>Business email: {statusLabel(success.statuses.gmail)}</span>
                <span>Calendar: {statusLabel(success.statuses.calendar)}</span>
                <span>Customer confirmation: {statusLabel(success.statuses.customerConfirmation)}</span>
              </div>
            </div>
          )}

          {error && <p className={styles.error} role="alert">{error}</p>}

          <form className={styles.form} onSubmit={handleSubmit} aria-busy={submitting}>
            <div className={styles.fieldGrid}>
              <div className={styles.field}>
                <label htmlFor="demo-first-name">First name</label>
                <input
                  id="demo-first-name"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  placeholder="Enter your first name"
                  value={form.firstName}
                  onChange={updateField}
                  maxLength={100}
                  required
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="demo-last-name">Last name</label>
                <input
                  id="demo-last-name"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Enter your last name"
                  value={form.lastName}
                  onChange={updateField}
                  maxLength={100}
                  required
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="demo-business-name">Restaurant / business name</label>
                <input
                  id="demo-business-name"
                  name="businessName"
                  type="text"
                  autoComplete="organization"
                  placeholder="Your restaurant or business"
                  value={form.businessName}
                  onChange={updateField}
                  maxLength={200}
                  required
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="demo-business-type">Business type</label>
                <input
                  id="demo-business-type"
                  name="businessType"
                  type="text"
                  placeholder="Restaurant, cafe, hotel..."
                  value={form.businessType}
                  onChange={updateField}
                  maxLength={200}
                  required
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="demo-email">Email</label>
                <div className={styles.inputWithIcon}>
                  <Mail aria-hidden="true" />
                  <input
                    id="demo-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email address"
                    value={form.email}
                    onChange={updateField}
                    maxLength={254}
                    required
                  />
                </div>
              </div>
              <div className={styles.field}>
                <label htmlFor="demo-phone">WhatsApp phone number</label>
                <div className={styles.inputWithIcon}>
                  <Phone aria-hidden="true" />
                  <input
                    id="demo-phone"
                    name="whatsappNumber"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+91 98765 43210"
                    value={form.whatsappNumber}
                    onChange={updateField}
                    maxLength={32}
                    aria-describedby="demo-phone-hint"
                    required
                  />
                </div>
                <small id="demo-phone-hint">Include your country code, starting with +.</small>
              </div>
              <div className={styles.field}>
                <label htmlFor="demo-city">City</label>
                <input
                  id="demo-city"
                  name="city"
                  type="text"
                  autoComplete="address-level2"
                  placeholder="City"
                  value={form.city}
                  onChange={updateField}
                  maxLength={200}
                  required
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="demo-district">District</label>
                <input
                  id="demo-district"
                  name="district"
                  type="text"
                  autoComplete="off"
                  placeholder="District"
                  value={form.district}
                  onChange={updateField}
                  maxLength={200}
                  required
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="demo-state">State</label>
                <input
                  id="demo-state"
                  name="state"
                  type="text"
                  autoComplete="address-level1"
                  placeholder="State"
                  value={form.state}
                  onChange={updateField}
                  maxLength={200}
                  required
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="demo-preferred-date">Preferred demo date</label>
                <input
                  id="demo-preferred-date"
                  name="preferredDemoDate"
                  type="date"
                  min={getIndiaClock().date}
                  value={form.preferredDemoDate}
                  onChange={updateField}
                  required
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="demo-preferred-time">Preferred demo time (IST)</label>
                <input
                  id="demo-preferred-time"
                  name="preferredDemoTime"
                  type="time"
                  step={1800}
                  min={getMinimumIndiaTime(form.preferredDemoDate)}
                  value={form.preferredDemoTime}
                  onChange={updateField}
                  required
                />
                <small>Time slots are available every 30 minutes. Your slot is pending confirmation.</small>
              </div>
              <div className={styles.field}>
                <label htmlFor="demo-duration">Preferred demo duration</label>
                <select
                  id="demo-duration"
                  name="demoDuration"
                  value={form.demoDuration}
                  onChange={updateField}
                  required
                >
                  <option value="30">30 minutes (default)</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                </select>
              </div>
              <div className={`${styles.field} ${styles.fullWidth}`}>
                <label htmlFor="demo-notes">Message</label>
                <div className={`${styles.inputWithIcon} ${styles.textareaWithIcon}`}>
                  <MessageCircle aria-hidden="true" />
                  <textarea
                    id="demo-notes"
                    name="notes"
                    placeholder="Tell us about your restaurant and what you need..."
                    value={form.notes}
                    onChange={updateField}
                    rows={3}
                    maxLength={3000}
                    required
                  />
                </div>
              </div>
            </div>

            <button className={styles.submit} type="submit" disabled={submitting}>
              <Send aria-hidden="true" />
              {submitting ? 'Submitting your request…' : 'Book a Demo'}
              {!submitting && <ArrowRight className={styles.submitArrow} aria-hidden="true" />}
            </button>
            <p className={styles.privacyNote}>Your details are sent securely to the WePass team.</p>
          </form>
        </div>

        <aside className={styles.infoColumn} aria-label="Contact WePass">
          <div className={styles.visual}>
            <div className={styles.visualGlow} aria-hidden="true" />
            <div className={styles.visualCopy}>
              <span><ChartNoAxesColumnIncreasing aria-hidden="true" /></span>
              <h3>Smarter Queue.<br />Happier Guests.</h3>
              <i aria-hidden="true" />
            </div>
            <Image
              src="/brand/mascot.png"
              alt="WePass mascot holding a QR code for joining a restaurant queue"
              width={935}
              height={1199}
              sizes="(max-width: 760px) 85vw, 42vw"
              className={styles.visualImage}
            />
            <div className={styles.visualTag}><Check aria-hidden="true" /> Guest pass in the browser</div>
          </div>

          <div className={styles.contactList}>
            <a href="mailto:hello@wepass.in" className={styles.contactCard}>
              <span className={styles.contactIcon}><Mail aria-hidden="true" /></span>
              <span className={styles.contactText}><strong>Email Us</strong><small>hello@wepass.in</small></span>
              <ArrowRight className={styles.contactArrow} aria-hidden="true" />
            </a>
            <a
              href="https://wa.me/917406400140"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.contactCard}
            >
              <span className={styles.contactIcon}><Phone aria-hidden="true" /></span>
              <span className={styles.contactText}><strong>WhatsApp Support</strong><small>+91 74064 00140</small></span>
              <ArrowRight className={styles.contactArrow} aria-hidden="true" />
            </a>
            <div className={styles.contactCard}>
              <span className={styles.contactIcon}><Building2 aria-hidden="true" /></span>
              <span className={styles.contactText}><strong>Restaurant Support</strong><small>Queue and table management</small></span>
            </div>
          </div>
          <p className={styles.infoFootnote}>
            <MessageCircle aria-hidden="true" />
            Have a quick question? Reach us directly on WhatsApp.
          </p>
        </aside>
      </div>
    </section>
  );
}
