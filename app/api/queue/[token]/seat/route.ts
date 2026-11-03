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
    const body = await req.json().catch(() => ({}));
    const { tableId } = body;

    const entry = await prisma.queueEntry.findFirst({
      where: {
        OR: [{ id: rawParam }, { token: rawParam.toUpperCase() }],
      },
      include: { assignedTable: true },
    });

    if (!entry) {
      return NextResponse.json({ error: 'Queue entry not found' }, { status: 404 });
    }

    const finalTableId = tableId || entry.assignedTableId;

    const updated = await prisma.$transaction(async (tx) => {
      if (finalTableId) {
        await tx.table.update({
          where: { id: finalTableId },
          data: { status: 'OCCUPIED' },
        });
      }

      const q = await tx.queueEntry.update({
        where: { id: entry.id },
        data: {
          status: 'SEATED',
          seatedAt: new Date(),
          ...(finalTableId ? { assignedTableId: finalTableId } : {}),
        },
        include: { assignedTable: true },
      });

      await tx.queueEvent.create({
        data: {
          queueEntryId: entry.id,
          restaurantId: entry.restaurantId,
          eventType: 'SEATED',
          description: `Guest seated at ${q.assignedTable ? `Table ${q.assignedTable.tableNumber}` : 'assigned table'}`,
          performedByUserId: session?.userId || null,
        },
      });

      return q;
    });

    return NextResponse.json({
      success: true,
      entry: updated,
      message: `Guest ${entry.token} marked as SEATED!`,
    });
  } catch (error: any) {
    console.error('Mark seated error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
