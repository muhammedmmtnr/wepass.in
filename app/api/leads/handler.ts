import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';

export const dynamic = 'force-dynamic';

const maxLengthByField = {
  contactPersonName: 200,
  businessName: 200,
  businessType: 200,
  city: 200,
  district: 200,
  state: 200,
  whatsappNumber: 32,
  notes: 3000,
} as const;

const requiredFields = [
  'contactPersonName',
  'businessName',
  'city',
  'district',
  'state',
  'whatsappNumber',
] as const;

const integrationStatusFields = ['sheets', 'gmail', 'calendar', 'customerConfirmation'] as const;

function hasIntegrationStatuses(
  value: unknown
): value is Record<(typeof integrationStatusFields)[number], string> {
  return (
    !!value &&
    typeof value === 'object' &&
    integrationStatusFields.every(
      (field) => field in value && typeof value[field] === 'string'
    )
  );
}

function isValidFutureDemoSlot(dateValue: string, timeValue: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue) || !/^\d{2}:\d{2}$/.test(timeValue)) {
    return false;
  }

  const [year, month, day] = dateValue.split('-').map(Number);
  const [hour, minute] = timeValue.split(':').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 0, 0));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day ||
    hour > 23 ||
    minute > 59 ||
    minute % 30 !== 0
  ) {
    return false;
  }

  const requestedInstant = Date.UTC(year, month - 1, day, hour, minute) - 330 * 60_000;
  return requestedInstant > Date.now();
}

export async function submitLead(req: NextRequest) {
  try {
    const endpoint = process.env.GOOGLE_SCRIPT_WEB_APP_URL?.trim();
    const apiSecret = process.env.GOOGLE_SCRIPT_API_SECRET?.trim();
    if (!endpoint || !apiSecret) {
      const missing = [
        !endpoint && 'GOOGLE_SCRIPT_WEB_APP_URL',
        !apiSecret && 'GOOGLE_SCRIPT_API_SECRET',
      ].filter(Boolean);
      console.error(`Business lead submission is unavailable; missing server configuration: ${missing.join(', ')}.`);
      return NextResponse.json(
        { error: 'Demo requests are temporarily unavailable. Please contact WePass directly.' },
        { status: 503 }
      );
    }

    let endpointUrl: URL;
    try {
      endpointUrl = new URL(endpoint);
    } catch {
      console.error('GOOGLE_SCRIPT_WEB_APP_URL is not a valid URL.');
      return NextResponse.json(
        { error: 'Demo requests are temporarily unavailable. Please contact WePass directly.' },
        { status: 503 }
      );
    }

    if (
      endpointUrl.protocol !== 'https:' ||
      endpointUrl.hostname !== 'script.google.com' ||
      !endpointUrl.pathname.startsWith('/macros/s/') ||
      !endpointUrl.pathname.endsWith('/exec')
    ) {
      console.error('Google Apps Script URL must be a deployed HTTPS Web App endpoint.');
      return NextResponse.json(
        { error: 'Demo requests are temporarily unavailable. Please contact WePass directly.' },
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
    };
    const aliases: Record<(typeof requiredFields)[number], string> = {
      contactPersonName: 'ownerName',
      businessName: 'businessName',
      city: 'city',
      district: 'district',
      state: 'state',
      whatsappNumber: 'whatsapp',
    };

    for (const field of requiredFields) {
      const value =
        formData[field] ??
        formData[aliases[field]] ??
        (field === 'contactPersonName' ? formData.name : undefined);
      if (typeof value !== 'string' || !value.trim()) {
        return NextResponse.json({ error: 'Please complete all required fields.' }, { status: 400 });
      }
      if (value.trim().length > maxLengthByField[field]) {
        return NextResponse.json({ error: 'One or more fields exceed the maximum allowed length.' }, { status: 400 });
      }
      values[field] = value.trim();
    }

    const notesValue = formData.notes ?? formData.requirements;
    if (notesValue !== undefined && typeof notesValue !== 'string') {
      return NextResponse.json({ error: 'Requirements must be text.' }, { status: 400 });
    }
    const notes = typeof notesValue === 'string' ? notesValue.trim() : '';
    if (notes.length > maxLengthByField.notes) {
      return NextResponse.json({ error: 'Requirements are too long.' }, { status: 400 });
    }

    if (formData.businessType !== undefined && typeof formData.businessType !== 'string') {
      return NextResponse.json({ error: 'Business type must be text.' }, { status: 400 });
    }
    const businessType = typeof formData.businessType === 'string' ? formData.businessType.trim() : '';
    if (businessType.length > maxLengthByField.businessType) {
      return NextResponse.json({ error: 'Business type is too long.' }, { status: 400 });
    }

    if (formData.email !== undefined && typeof formData.email !== 'string') {
      return NextResponse.json({ error: 'Email address must be text.' }, { status: 400 });
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

    const isDemo = requestType === 'demo_booking';
    for (const field of ['preferredDemoDate', 'preferredDemoTime'] as const) {
      if (formData[field] !== undefined && typeof formData[field] !== 'string') {
        return NextResponse.json({ error: 'Choose a valid preferred demo date and time.' }, { status: 400 });
      }
    }
    const preferredDemoDate =
      typeof formData.preferredDemoDate === 'string' ? formData.preferredDemoDate.trim() : '';
    const preferredDemoTime =
      typeof formData.preferredDemoTime === 'string' ? formData.preferredDemoTime.trim() : '';
    const demoDuration = formData.demoDuration === undefined ? 30 : Number(formData.demoDuration);
    if (
      isDemo &&
      (preferredDemoDate || preferredDemoTime) &&
      !isValidFutureDemoSlot(preferredDemoDate, preferredDemoTime)
    ) {
      return NextResponse.json(
        { error: 'Choose a future demo date and a time in India Standard Time, in 30-minute increments.' },
        { status: 400 }
      );
    }
    if (isDemo && ![30, 45, 60].includes(demoDuration)) {
      return NextResponse.json({ error: 'Choose a valid demo duration.' }, { status: 400 });
    }

    const requestId = typeof formData.requestId === 'string' ? formData.requestId : '';
    if (isDemo && !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) {
      return NextResponse.json({ error: 'Refresh the form and submit your demo request again.' }, { status: 400 });
    }

    const response = await fetch(endpointUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiSecret,
        timestamp: new Date().toISOString(),
        ...values,
        notes,
        businessType,
        whatsappNumber: `+${digits}`,
        email,
        requestType,
        requestId: requestId || randomUUID(),
        preferredDemoDate: isDemo ? preferredDemoDate : '',
        preferredDemoTime: isDemo ? preferredDemoTime : '',
        demoDuration: isDemo ? demoDuration : '',
      }),
      cache: 'no-store',
      redirect: 'follow',
      signal: AbortSignal.timeout(30_000),
    });

    const responseBody = await response.text();
    let result: unknown;
    try {
      result = JSON.parse(responseBody);
    } catch {
      console.error(`Google Apps Script returned an invalid response (HTTP ${response.status}).`);
      return NextResponse.json(
        { error: 'We could not confirm that your details were saved. Please try again.' },
        { status: 502 }
      );
    }

    if (
      !response.ok ||
      !result ||
      typeof result !== 'object' ||
      !('success' in result) ||
      result.success !== true ||
      !('statuses' in result) ||
      !hasIntegrationStatuses(result.statuses)
    ) {
      console.error(`Google Apps Script did not confirm the lead save (HTTP ${response.status}).`);
      return NextResponse.json(
        {
          error: 'We could not confirm that your details were saved. Please try again.',
        },
        { status: 502 }
      );
    }

    const statuses = result.statuses;
    if (statuses.sheets !== 'saved') {
      console.error(`Google Apps Script did not confirm the Sheets save (HTTP ${response.status}).`);
      return NextResponse.json(
        { error: 'We could not confirm that your details were saved. Please try again.' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      requestId: 'requestId' in result && typeof result.requestId === 'string' ? result.requestId : requestId,
      statuses,
    });
  } catch (error) {
    console.error(
      'Business lead submission failed.',
      error instanceof Error ? error.name : 'Unknown error.'
    );
    if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
      return NextResponse.json(
        { error: 'The request to save your details timed out. Please try again.' },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { error: 'We could not save your details right now. Please try again.' },
      { status: 502 }
    );
  }
}
