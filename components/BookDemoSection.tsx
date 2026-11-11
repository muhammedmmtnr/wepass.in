'use client';

import React, { useState } from 'react';
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
  whatsappNumber: string;
  city: string;
  district: string;
  state: string;
  notes: string;
};

const initialForm: DemoForm = {
  firstName: '',
  lastName: '',
  businessName: '',
  email: '',
  whatsappNumber: '',
  city: '',
  district: '',
  state: '',
  notes: '',
};

export default function BookDemoSection() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const updateField = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setSuccess(false);
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setSuccess(false);
    setError('');

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactPersonName: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
          businessName: form.businessName,
          city: form.city,
          district: form.district,
          state: form.state,
          whatsappNumber: form.whatsappNumber,
          email: form.email,
          notes: form.notes,
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

      setForm(initialForm);
      setSuccess(true);
    } catch (submitError) {
      console.error('Demo booking request failed:', submitError);
      setError('Connection failed. Your request was not submitted. Please try again.');
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
              <span>Your demo request has been submitted. The WePass team will follow up with you.</span>
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
