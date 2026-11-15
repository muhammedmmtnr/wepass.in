'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, LoaderCircle, MessageCircle, Send, X } from 'lucide-react';
import styles from './BookDemoSection.module.css';

type DemoForm = {
  fullName: string;
  whatsappNumber: string;
  businessName: string;
  city: string;
};

const initialForm: DemoForm = {
  fullName: '',
  whatsappNumber: '',
  businessName: '',
  city: '',
};

const whatsappContact = '917406400140';

type BookDemoSectionProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function BookDemoSection({ isOpen, onClose }: BookDemoSectionProps) {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const dialogRef = useRef<HTMLElement>(null);
  const requestId = useRef<string | null>(null);
  const submissionLock = useRef(false);

  useEffect(() => {
    if (!isOpen) return;

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.querySelector<HTMLInputElement>('input')?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [isOpen]);

  const updateField = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    requestId.current = null;
    setSubmitted(false);
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submissionLock.current) return;
    submissionLock.current = true;
    setSubmitting(true);
    setError('');

    try {
      requestId.current ??= crypto.randomUUID();
      const response = await fetch('/api/demo-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, requestId: requestId.current }),
      });
      const result: unknown = await response.json();

      if (
        !response.ok ||
        !result ||
        typeof result !== 'object' ||
        !('success' in result) ||
        result.success !== true ||
        !('leadId' in result) ||
        typeof result.leadId !== 'string'
      ) {
        const message =
          result && typeof result === 'object' && 'error' in result && typeof result.error === 'string'
            ? result.error
            : 'We could not submit your demo request. Please try again.';
        setError(message);
        return;
      }

      setSubmitted(true);
      requestId.current = null;
    } catch (submitError) {
      console.error('Demo request submission failed:', submitError);
      setError('We could not confirm your request was saved. Please try again.');
    } finally {
      submissionLock.current = false;
      setSubmitting(false);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Hi WePass, I just requested a free demo for ${form.businessName.trim()}. Please contact me to arrange it.`
  );
  const whatsappUrl = `https://wa.me/${whatsappContact}?text=${whatsappMessage}`;

  const handleDialogKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key !== 'Tab') return;

    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable?.length) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialogRef.current)) {
      event.preventDefault();
      first.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={styles.backdrop}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        id="book-demo"
        ref={dialogRef}
        className={styles.section}
        role="dialog"
        aria-modal="true"
        aria-labelledby="book-demo-heading"
        tabIndex={-1}
        onKeyDown={handleDialogKeyDown}
      >
      <div className={styles.container}>
        <button className={styles.closeButton} type="button" onClick={onClose} aria-label="Close demo request">
          <X aria-hidden="true" />
        </button>
        <div className={styles.formColumn}>
          <p className={styles.eyebrow}>A better guest experience starts here</p>
          <h2 id="book-demo-heading" className={styles.heading}>See WePass in Action</h2>
          <p className={styles.description}>
            Discover a smarter way to manage restaurant queues, tables and guests. Request a free personalized demo.
          </p>

          {submitted ? (
            <div className={styles.success} role="status">
              <span className={styles.successIcon}><Check aria-hidden="true" /></span>
              <div className={styles.successDetails}>
                <strong>Request received</strong>
                <p>Thank you! Your demo request has been received. Our team will contact you on WhatsApp shortly.</p>
                <a className={styles.whatsappButton} href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle aria-hidden="true" />
                  Chat with us on WhatsApp
                  <ArrowRight aria-hidden="true" />
                </a>
              </div>
            </div>
          ) : (
            <>
              {error && <p className={styles.error} role="alert">{error}</p>}

              <form className={styles.form} onSubmit={handleSubmit} aria-busy={submitting}>
                <div className={styles.fieldGrid}>
                  <div className={styles.field}>
                    <label htmlFor="demo-full-name">Full name <span aria-hidden="true">*</span></label>
                    <input
                      id="demo-full-name"
                      name="fullName"
                      type="text"
                      autoComplete="name"
                      placeholder="Your name"
                      value={form.fullName}
                      onChange={updateField}
                      maxLength={200}
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="demo-phone">WhatsApp number <span aria-hidden="true">*</span></label>
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
                    <small id="demo-phone-hint">Include your country code, starting with +.</small>
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="demo-business-name">Restaurant / business name <span aria-hidden="true">*</span></label>
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
                    <label htmlFor="demo-city">City <span className={styles.optional}>(optional)</span></label>
                    <input
                      id="demo-city"
                      name="city"
                      type="text"
                      autoComplete="address-level2"
                      placeholder="Your city"
                      value={form.city}
                      onChange={updateField}
                      maxLength={200}
                    />
                  </div>
                </div>

                <button className={styles.submit} type="submit" disabled={submitting}>
                  {submitting ? (
                    <LoaderCircle className={styles.spinner} aria-hidden="true" />
                  ) : (
                    <Send aria-hidden="true" />
                  )}
                  {submitting ? 'Sending request…' : 'Request a Free Demo'}
                  {!submitting && <ArrowRight className={styles.submitArrow} aria-hidden="true" />}
                </button>
                <p className={styles.privacyNote}>Your details are only used to arrange your personalized demo.</p>
              </form>
            </>
          )}
        </div>
      </div>
      </section>
    </div>
  );
}
