import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tableId = params.id;
    const body = await req.json();

    const table = await prisma.table.update({
      where: { id: tableId },
      data: {
        ...(body.tableNumber ? { tableNumber: body.tableNumber.trim() } : {}),
        ...(body.capacity ? { capacity: parseInt(body.capacity, 10) } : {}),
        ...(body.section ? { section: body.section.toUpperCase().trim() } : {}),
        ...(body.status ? { status: body.status } : {}),
      },
    });

    return NextResponse.json({ success: true, table });
  } catch (error: any) {
    console.error('Update table error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tableId = params.id;

    // Check if table is currently assigned to active guest
    const activeEntry = await prisma.queueEntry.findFirst({
      where: {
        assignedTableId: tableId,
        status: { in: ['CALLED', 'CONFIRMED', 'SEATED'] },
      },
    });

    if (activeEntry) {
      return NextResponse.json(
        { error: `Cannot delete table while guest ${activeEntry.token} is assigned or seated.` },
        { status: 400 }
      );
    }

    await prisma.table.delete({
      where: { id: tableId },
    });

    return NextResponse.json({ success: true, message: 'Table deleted successfully.' });
  } catch (error: any) {
    console.error('Delete table error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
