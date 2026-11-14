import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const requestIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Please submit valid form details.' }, { status: 400 });
  }

  if (!isRecord(body)) {
    return NextResponse.json({ error: 'Please submit valid form details.' }, { status: 400 });
  }

  const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
  const businessName = typeof body.businessName === 'string' ? body.businessName.trim() : '';
  const whatsappNumber = typeof body.whatsappNumber === 'string' ? body.whatsappNumber.trim() : '';
  const city = typeof body.city === 'string' ? body.city.trim() : '';
  const requestId = typeof body.requestId === 'string' ? body.requestId : '';
  const digits = whatsappNumber.replace(/\D/g, '');

  if (!fullName || !businessName || !whatsappNumber) {
    return NextResponse.json({ error: 'Full name, WhatsApp number, and restaurant name are required.' }, { status: 400 });
  }
  if (
    fullName.length > 200 ||
    businessName.length > 200 ||
    city.length > 200 ||
    whatsappNumber.length > 32
  ) {
    return NextResponse.json({ error: 'One or more fields exceed the maximum allowed length.' }, { status: 400 });
  }
  if (!/^\+[0-9\s().-]+$/.test(whatsappNumber) || digits.length < 8 || digits.length > 15) {
    return NextResponse.json(
      { error: 'Enter a valid WhatsApp number with its country code, such as +91 98765 43210.' },
      { status: 400 }
    );
  }
  if (!requestIdPattern.test(requestId)) {
    return NextResponse.json({ error: 'Refresh the form and submit your demo request again.' }, { status: 400 });
  }

  const normalizedPhone = `+${digits}`;
  const createdAt = new Date();
  const duplicateSince = new Date(createdAt.getTime() - 24 * 60 * 60 * 1000);

  try {
    const existingRequest = await prisma.demoRequest.findUnique({ where: { requestId } });
    if (existingRequest) {
      const matches =
        existingRequest.contactPersonName === fullName &&
        existingRequest.businessName === businessName &&
        existingRequest.whatsappNumber === normalizedPhone &&
        existingRequest.city === (city || null);
      if (!matches) {
        return NextResponse.json(
          { error: 'This request ID is already associated with different details. Refresh the form and try again.' },
          { status: 409 }
        );
      }
      return NextResponse.json({ success: true, leadId: existingRequest.leadId });
    }

    const recentRequests = await prisma.demoRequest.findMany({
      where: {
        whatsappNumber: normalizedPhone,
        createdAt: { gte: duplicateSince },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: { leadId: true, businessName: true },
    });
    const duplicate = recentRequests.find(
      (request) => request.businessName.trim().toLocaleLowerCase() === businessName.toLocaleLowerCase()
    );

    if (duplicate) {
      return NextResponse.json({ success: true, leadId: duplicate.leadId, duplicate: true });
    }

    const lead = await prisma.demoRequest.create({
      data: {
        requestId,
        leadId: randomUUID(),
        contactPersonName: fullName,
        businessName,
        businessType: '',
        city: city || null,
        district: '',
        state: '',
        whatsappNumber: normalizedPhone,
        email: '',
        notes: '',
      },
      select: { leadId: true },
    });

    return NextResponse.json({ success: true, leadId: lead.leadId }, { status: 201 });
  } catch (error) {
    console.error('Demo request could not be saved to the application database.', error);
    return NextResponse.json({ error: 'We could not save your request. Please try again.' }, { status: 500 });
  }
}
