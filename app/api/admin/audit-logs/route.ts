import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req, ['SUPER_ADMIN']);
    if (auth.errorResponse) return auth.errorResponse;

    const fairnessAudits = await prisma.queueFairnessAudit.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        restaurant: { select: { id: true, name: true, slug: true } },
        targetQueueEntry: { select: { token: true, guestName: true, partySize: true } },
        staffUser: { select: { name: true, role: true, email: true } },
      },
    });

    const queueEvents = await prisma.queueEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        restaurant: { select: { id: true, name: true, slug: true } },
        queueEntry: { select: { token: true, guestName: true } },
      },
    });

    return NextResponse.json({
      success: true,
      fairnessAudits,
      queueEvents,
    });
  } catch (error: any) {
    console.error('Admin audit logs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
