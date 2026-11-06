import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateQueuePosition } from '@/lib/queueEngine';
import { hasQueueAccess } from '@/lib/queueAccess';

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const rawToken = params.token?.toUpperCase().trim();
    if (!rawToken) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Optional query param: restaurantId or slug to disambiguate token if needed
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    const entry = await prisma.queueEntry.findFirst({
      where: {
        token: rawToken,
        ...(slug ? { restaurant: { slug } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            bannerUrl: true,
            address: true,
            city: true,
            phone: true,
            callDeadlineMinutes: true,
          },
        },
        assignedTable: {
          select: {
            id: true,
            tableNumber: true,
            capacity: true,
            section: true,
          },
        },
      },
    });

    if (!entry) {
      return NextResponse.json({ error: 'Queue ticket not found.' }, { status: 404 });
    }

    if (!hasQueueAccess(req, entry)) {
      return NextResponse.json({ error: 'Queue access denied. Join again from the restaurant QR code.' }, { status: 403 });
    }

    const positionInfo = await calculateQueuePosition(entry.id);

    const response = NextResponse.json({
      success: true,
      ticket: {
        id: entry.id,
        token: entry.token,
        guestName: entry.guestName,
        partySize: entry.partySize,
        tableGroup: entry.tableGroup,
        status: entry.status,
        specialRequests: entry.specialRequests,
        accessibilityNeeds: entry.accessibilityNeeds,
        calledAt: entry.calledAt,
        callDeadlineAt: entry.callDeadlineAt,
        confirmedAt: entry.confirmedAt,
        seatedAt: entry.seatedAt,
        completedAt: entry.completedAt,
        cancelledAt: entry.cancelledAt,
        cancellationReason: entry.cancellationReason,
        createdAt: entry.createdAt,
        assignedTable: entry.assignedTable,
        restaurant: entry.restaurant,
      },
      position: positionInfo.groupPosition,
      overallPosition: positionInfo.overallPosition,
      partiesAhead: positionInfo.partiesAhead,
      estimatedWaitMinutes: positionInfo.estimatedWaitMinutes,
    });

    if (req.headers.has('x-queue-access-token') && entry.sessionSecret) {
      response.cookies.set(`wepass_queue_${entry.id}`, entry.sessionSecret, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/api/queue',
        maxAge: 7 * 24 * 60 * 60,
      });
    }

    return response;
  } catch (error: any) {
    console.error('Fetch queue token error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
