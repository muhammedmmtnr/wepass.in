import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const restaurantId = params.id;
    const tables = await prisma.table.findMany({
      where: { restaurantId },
      orderBy: [
        { section: 'asc' },
        { tableNumber: 'asc' },
      ],
      include: {
        queueEntries: {
          where: { status: { in: ['CALLED', 'CONFIRMED', 'SEATED'] } },
          select: { id: true, token: true, guestName: true, partySize: true, status: true },
        },
      },
    });

    return NextResponse.json({ success: true, tables });
  } catch (error: any) {
    console.error('Fetch tables error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const restaurantId = params.id;
    const session = await getAuthSession(req);
    const { tableNumber, capacity, section } = await req.json();

    if (!tableNumber) {
      return NextResponse.json({ error: 'Table number is required' }, { status: 400 });
    }

    const existing = await prisma.table.findUnique({
      where: {
        restaurantId_tableNumber: {
          restaurantId,
          tableNumber: tableNumber.trim(),
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: `Table '${tableNumber}' already exists.` }, { status: 409 });
    }

    const table = await prisma.table.create({
      data: {
        restaurantId,
        tableNumber: tableNumber.trim(),
        capacity: parseInt(capacity, 10) || 4,
        section: (section || 'MAIN').toUpperCase().trim(),
        status: 'AVAILABLE',
      },
    });

    return NextResponse.json({ success: true, table });
  } catch (error: any) {
    console.error('Create table error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
