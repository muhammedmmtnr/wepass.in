import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { getTableGroupByPartySize, generateNextToken, calculateQueuePosition } from '@/lib/queueEngine';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    const {
      restaurantId,
      guestName,
      guestPhone,
      partySize,
      specialRequests,
      accessibilityNeeds,
    } = await req.json();

    if (!restaurantId || !guestName || !partySize) {
      return NextResponse.json(
        { error: 'Restaurant ID, Guest Name, and Party Size are required.' },
        { status: 400 }
      );
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    const parsedPartySize = parseInt(partySize, 10);
    const tableGroup = getTableGroupByPartySize(parsedPartySize);
    const token = await generateNextToken(restaurantId, tableGroup);
    const sessionSecret = crypto.randomBytes(16).toString('hex');

    const entry = await prisma.$transaction(async (tx) => {
      const created = await tx.queueEntry.create({
        data: {
          restaurantId,
          token,
          guestName: guestName.trim(),
          guestPhone: (guestPhone || '').trim(),
          partySize: parsedPartySize,
          tableGroup,
          status: 'WAITING',
          specialRequests: specialRequests ? specialRequests.trim() : null,
          accessibilityNeeds: Boolean(accessibilityNeeds),
          isManualEntry: true,
          createdByStaffId: session?.userId || null,
          sessionSecret,
        },
      });

      await tx.queueEvent.create({
        data: {
          queueEntryId: created.id,
          restaurantId,
          eventType: 'JOINED',
          description: `Front desk staff registered walk-in party of ${parsedPartySize}`,
          performedByUserId: session?.userId || null,
        },
      });

      return created;
    });

    const positionInfo = await calculateQueuePosition(entry.id);

    return NextResponse.json({
      success: true,
      entry,
      position: positionInfo.groupPosition,
      estimatedWaitMinutes: positionInfo.estimatedWaitMinutes,
      message: `Walk-in guest registered with token ${entry.token}`,
    });
  } catch (error: any) {
    console.error('Manual queue entry error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
