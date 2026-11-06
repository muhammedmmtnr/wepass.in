import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  getTableGroupByPartySize,
  generateNextToken,
  checkDuplicateQueue,
  calculateQueuePosition,
} from '@/lib/queueEngine';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const {
      restaurantId,
      guestName,
      guestPhone,
      partySize,
      specialRequests,
      accessibilityNeeds,
    } = await req.json();

    if (!restaurantId || !guestName || !guestPhone || !partySize) {
      return NextResponse.json(
        { error: 'Restaurant ID, Guest Name, Mobile Number, and Party Size are required.' },
        { status: 400 }
      );
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    if (!restaurant.isQueueOpen) {
      return NextResponse.json(
        { error: 'The waitlist queue is currently paused or closed by the restaurant host.' },
        { status: 403 }
      );
    }

    const parsedPartySize = parseInt(partySize, 10);
    if (isNaN(parsedPartySize) || parsedPartySize < 1) {
      return NextResponse.json({ error: 'Party size must be at least 1 person.' }, { status: 400 });
    }

    if (parsedPartySize > restaurant.maxPartySize) {
      return NextResponse.json(
        { error: `Maximum party size allowed online is ${restaurant.maxPartySize}. Please speak with the host.` },
        { status: 400 }
      );
    }

    // Duplicate check
    const existingActive = await checkDuplicateQueue(restaurantId, guestPhone);
    if (existingActive) {
      return NextResponse.json(
        { error: 'You already have an active queue ticket at this restaurant.' },
        { status: 409 }
      );
    }

    // Party-size grouping
    const tableGroup = getTableGroupByPartySize(parsedPartySize);
    const token = await generateNextToken(restaurantId, tableGroup);
    const sessionSecret = crypto.randomBytes(32).toString('hex');

    // Create queue entry
    const entry = await prisma.$transaction(async (tx) => {
      const created = await tx.queueEntry.create({
        data: {
          restaurantId,
          token,
          guestName: guestName.trim(),
          guestPhone: guestPhone.trim(),
          partySize: parsedPartySize,
          tableGroup,
          status: 'WAITING',
          specialRequests: specialRequests ? specialRequests.trim() : null,
          accessibilityNeeds: Boolean(accessibilityNeeds),
          sessionSecret,
        },
      });

      // Log event
      await tx.queueEvent.create({
        data: {
          queueEntryId: created.id,
          restaurantId,
          eventType: 'JOINED',
          description: `Guest joined queue with party of ${parsedPartySize} (Group ${tableGroup})`,
        },
      });

      // Update QR joins
      await tx.qRConfiguration.updateMany({
        where: { restaurantId },
        data: { totalJoins: { increment: 1 } },
      });

      return created;
    });

    const positionInfo = await calculateQueuePosition(entry.id);

    const response = NextResponse.json({
      success: true,
      token: entry.token,
      entry: {
        id: entry.id,
        token: entry.token,
        guestName: entry.guestName,
        partySize: entry.partySize,
        tableGroup: entry.tableGroup,
        status: entry.status,
        restaurantName: restaurant.name,
        restaurantSlug: restaurant.slug,
        createdAt: entry.createdAt,
      },
      position: positionInfo.groupPosition,
      overallPosition: positionInfo.overallPosition,
      partiesAhead: positionInfo.partiesAhead,
      estimatedWaitMinutes: positionInfo.estimatedWaitMinutes,
    });

    response.cookies.set(`wepass_queue_${entry.id}`, sessionSecret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/queue',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error('Queue join error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
