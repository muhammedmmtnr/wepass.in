import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRestaurantAuth } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const rawParam = params.token;
    const { status, cancellationReason } = await req.json();

    const validStatuses = ['WAITING', 'CALLED', 'CONFIRMED', 'SEATED', 'COMPLETED', 'PAUSED', 'SKIPPED', 'CANCELLED', 'NO_SHOW'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: `Invalid status: ${status}` }, { status: 400 });
    }

    const entry = await prisma.queueEntry.findFirst({
      where: {
        OR: [{ id: rawParam }, { token: rawParam.toUpperCase() }],
      },
    });

    if (!entry) {
      return NextResponse.json({ error: 'Queue entry not found' }, { status: 404 });
    }

    const auth = await requireRestaurantAuth(req, entry.restaurantId);
    if (auth.errorResponse) return auth.errorResponse;

    const updated = await prisma.$transaction(async (tx) => {
      // If setting to NO_SHOW or CANCELLED, release table
      if (['NO_SHOW', 'CANCELLED'].includes(status) && entry.assignedTableId) {
        await tx.table.update({
          where: { id: entry.assignedTableId },
          data: { status: 'AVAILABLE' },
        });
      }

      const q = await tx.queueEntry.update({
        where: { id: entry.id },
        data: {
          status,
          ...(status === 'CANCELLED' ? { cancelledAt: new Date(), cancellationReason: cancellationReason || 'Cancelled by staff' } : {}),
          ...(['NO_SHOW', 'CANCELLED'].includes(status) ? { assignedTableId: null } : {}),
        },
      });

      await tx.queueEvent.create({
        data: {
          queueEntryId: entry.id,
          restaurantId: entry.restaurantId,
          eventType: status,
          description: `Queue status updated to ${status}${cancellationReason ? `: ${cancellationReason}` : ''}`,
          performedByUserId: auth.user!.userId,
        },
      });

      return q;
    });

    return NextResponse.json({
      success: true,
      entry: updated,
      message: `Status updated to ${status}`,
    });
  } catch (error: any) {
    console.error('Update queue status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
