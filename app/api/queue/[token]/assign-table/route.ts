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
    const { tableId } = await req.json();

    if (!tableId) {
      return NextResponse.json({ error: 'Table ID is required' }, { status: 400 });
    }

    const entry = await prisma.queueEntry.findFirst({
      where: {
        OR: [{ id: rawParam }, { token: rawParam.toUpperCase() }],
      },
    });

    if (!entry) {
      return NextResponse.json({ error: 'Queue entry not found' }, { status: 404 });
    }

    const table = await prisma.table.findUnique({
      where: { id: tableId },
    });

    if (!table || table.restaurantId !== entry.restaurantId) {
      return NextResponse.json({ error: 'Table not found or belongs to another restaurant' }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      // If previous table was assigned, reset it to AVAILABLE
      if (entry.assignedTableId && entry.assignedTableId !== tableId) {
        await tx.table.update({
          where: { id: entry.assignedTableId },
          data: { status: 'AVAILABLE' },
        });
      }

      // Mark new table as RESERVED
      await tx.table.update({
        where: { id: tableId },
        data: { status: 'RESERVED' },
      });

      const q = await tx.queueEntry.update({
        where: { id: entry.id },
        data: { assignedTableId: tableId },
        include: { assignedTable: true },
      });

      await tx.queueEvent.create({
        data: {
          queueEntryId: entry.id,
          restaurantId: entry.restaurantId,
          eventType: 'TABLE_ASSIGNED',
          description: `Assigned Table ${table.tableNumber} (Capacity: ${table.capacity})`,
          performedByUserId: session?.userId || null,
        },
      });

      return q;
    });

    return NextResponse.json({
      success: true,
      entry: updated,
      message: `Assigned Table ${table.tableNumber} to guest ${entry.token}.`,
    });
  } catch (error: any) {
    console.error('Assign table error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
