import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const requiredFields = [
  'contactPersonName',
  'businessName',
  'city',
  'district',
  'state',
  'whatsappNumber',
  'notes',
] as const;

export async function POST(req: NextRequest) {
  try {
    const endpoint = process.env.GOOGLE_APPS_SCRIPT_WEB_APP_URL;
    if (!endpoint) {
      console.error('Business lead submission is unavailable because GOOGLE_APPS_SCRIPT_WEB_APP_URL is not configured.');
      return NextResponse.json(
        { error: 'Business registration is temporarily unavailable. Please contact us directly.' },
        { status: 503 }
      );
    }

    const endpointUrl = new URL(endpoint);
    if (
      endpointUrl.protocol !== 'https:' ||
      endpointUrl.hostname !== 'script.google.com' ||
      !endpointUrl.pathname.startsWith('/macros/s/') ||
      !endpointUrl.pathname.endsWith('/exec')
    ) {
      console.error('Google Apps Script URL must be a deployed HTTPS Web App endpoint.');
      return NextResponse.json(
        { error: 'Business registration is temporarily unavailable. Please contact us directly.' },
        { status: 503 }
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Please submit valid form details.' }, { status: 400 });
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Please submit valid form details.' }, { status: 400 });
    }

    const formData = body as Record<string, unknown>;
    const requestType = formData.requestType === undefined ? 'business_enquiry' : formData.requestType;
    if (
      requestType !== 'business_enquiry' &&
      requestType !== 'booking_request' &&
      requestType !== 'demo_booking'
    ) {
      return NextResponse.json({ error: 'Please choose a valid request type.' }, { status: 400 });
    }

    const values: Record<(typeof requiredFields)[number], string> = {
      contactPersonName: '',
      businessName: '',
      city: '',
      district: '',
      state: '',
      whatsappNumber: '',
      notes: '',
    };

    for (const field of requiredFields) {
      const value = formData[field];
      if (typeof value !== 'string' || !value.trim()) {
        return NextResponse.json({ error: 'Please complete all required fields.' }, { status: 400 });
      }
      if (value.trim().length > (field === 'notes' ? 3000 : 200)) {
        return NextResponse.json({ error: 'One or more fields exceed the maximum allowed length.' }, { status: 400 });
      }
      values[field] = value.trim();
    }

    const email = typeof formData.email === 'string' ? formData.email.trim() : '';
    if (email.length > 254) {
      return NextResponse.json({ error: 'Email address is too long.' }, { status: 400 });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const digits = values.whatsappNumber.replace(/\D/g, '');
    if (!values.whatsappNumber.startsWith('+') || digits.length < 8 || digits.length > 15) {
      return NextResponse.json(
        { error: 'Enter a valid WhatsApp number with its country code, such as +91 98765 43210.' },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString();
    const response = await fetch(endpointUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timestamp,
        ...values,
        whatsappNumber: `+${digits}`,
        email,
        requestType,
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      console.error(`Google Apps Script returned HTTP ${response.status}.`);
      return NextResponse.json(
        { error: 'We could not save your details right now. Please try again.' },
        { status: 502 }
      );
    }

    const responseBody = await response.text();
    let result: unknown;
    try {
      result = JSON.parse(responseBody);
    } catch {
      console.error('Google Apps Script returned a non-JSON response.');
      return NextResponse.json(
        { error: 'We could not confirm that your details were saved. Please try again.' },
        { status: 502 }
      );
    }

    if (
      !result ||
      typeof result !== 'object' ||
      !('success' in result) ||
      result.success !== true
    ) {
      console.error('Google Apps Script did not confirm that the lead was saved.');
      return NextResponse.json(
        { error: 'We could not confirm that your details were saved. Please try again.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Business lead submission failed:', error);
    return NextResponse.json(
      { error: 'We could not save your details right now. Please try again.' },
      { status: 502 }
    );
  }
}
