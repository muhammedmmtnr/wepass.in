import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

const leadStatuses = ['NEW', 'CONTACTED', 'SCHEDULED', 'COMPLETED', 'CANCELLED'] as const;
type LeadStatus = (typeof leadStatuses)[number];

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (auth.errorResponse) return auth.errorResponse;

    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get('q')?.trim() ?? '';
    const status = searchParams.get('status') ?? '';
    if (status && !leadStatuses.includes(status as LeadStatus)) {
      return NextResponse.json({ error: 'Choose a valid lead status.' }, { status: 400 });
    }

    const where: Prisma.DemoRequestWhereInput = {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { leadId: { contains: search } },
              { contactPersonName: { contains: search } },
              { businessName: { contains: search } },
              { whatsappNumber: { contains: search } },
              { city: { contains: search } },
            ],
          }
        : {}),
    };
    const leads = await prisma.demoRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, leads });
  } catch (error) {
    console.error('Demo leads could not be loaded.', error);
    return NextResponse.json({ error: 'Unable to load demo leads.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (auth.errorResponse) return auth.errorResponse;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Please submit valid lead updates.' }, { status: 400 });
    }
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Please submit valid lead updates.' }, { status: 400 });
    }

    const data = body as Record<string, unknown>;
    const leadId = typeof data.leadId === 'string' ? data.leadId : '';
    if (!leadId) {
      return NextResponse.json({ error: 'A lead ID is required.' }, { status: 400 });
    }

    const updates: Prisma.DemoRequestUpdateInput = {};
    if (data.status !== undefined) {
      if (typeof data.status !== 'string' || !leadStatuses.includes(data.status as LeadStatus)) {
        return NextResponse.json({ error: 'Choose a valid lead status.' }, { status: 400 });
      }
      updates.status = data.status;
    }
    if (data.internalNotes !== undefined) {
      if (typeof data.internalNotes !== 'string' || data.internalNotes.length > 5000) {
        return NextResponse.json({ error: 'Internal notes must be 5,000 characters or fewer.' }, { status: 400 });
      }
      updates.internalNotes = data.internalNotes.trim();
    }
    if (data.scheduledDemoDate !== undefined) {
      if (data.scheduledDemoDate === null || data.scheduledDemoDate === '') {
        updates.scheduledDemoDate = null;
      } else if (typeof data.scheduledDemoDate === 'string') {
        const scheduledDate = new Date(data.scheduledDemoDate);
        if (Number.isNaN(scheduledDate.getTime())) {
          return NextResponse.json({ error: 'Choose a valid scheduled demo date.' }, { status: 400 });
        }
        updates.scheduledDemoDate = scheduledDate;
      } else {
        return NextResponse.json({ error: 'Choose a valid scheduled demo date.' }, { status: 400 });
      }
    }
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No lead changes were provided.' }, { status: 400 });
    }

    const lead = await prisma.demoRequest.update({
      where: { leadId },
      data: updates,
    });
    return NextResponse.json({ success: true, lead });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Demo lead not found.' }, { status: 404 });
    }
    console.error('Demo lead could not be updated.', error);
    return NextResponse.json({ error: 'Unable to update demo lead.' }, { status: 500 });
  }
}
