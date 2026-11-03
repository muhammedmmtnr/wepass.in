import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const rawParam = params.token;
    const session = await getAuthSession(req);

    const entry = await prisma.queueEntry.findFirst({
      where: {
        OR: [{ id: rawParam }, { token: rawParam.toUpperCase() }],
      },
    });

    if (!entry) {
      return NextResponse.json({ error: 'Queue entry not found' }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Free table
      if (entry.assignedTableId) {
        await tx.table.update({
          where: { id: entry.assignedTableId },
          data: { status: 'AVAILABLE' },
        });
      }

      const q = await tx.queueEntry.update({
        where: { id: entry.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      await tx.queueEvent.create({
        data: {
          queueEntryId: entry.id,
          restaurantId: entry.restaurantId,
          eventType: 'COMPLETED',
          description: 'Dining session completed. Table released.',
          performedByUserId: session?.userId || null,
        },
      });

      return q;
    });

    return NextResponse.json({
      success: true,
      entry: updated,
      message: `Dining session completed for ${entry.token}. Table released.`,
    });
  } catch (error: any) {
    console.error('Complete session error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
