import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const rawToken = params.token?.toUpperCase().trim();
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    const entry = await prisma.queueEntry.findFirst({
      where: {
        token: rawToken,
        ...(slug ? { restaurant: { slug } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: { restaurant: true },
    });

    if (!entry) {
      return NextResponse.json({ error: 'Queue ticket not found.' }, { status: 404 });
    }

    if (entry.status !== 'CALLED') {
      return NextResponse.json(
        { error: `Cannot confirm arrival for ticket in status '${entry.status}'. Must be 'CALLED'.` },
        { status: 400 }
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const q = await tx.queueEntry.update({
        where: { id: entry.id },
        data: {
          status: 'CONFIRMED',
          confirmedAt: new Date(),
        },
      });

      await tx.queueEvent.create({
        data: {
          queueEntryId: entry.id,
          restaurantId: entry.restaurantId,
          eventType: 'CONFIRMED',
          description: "Guest confirmed arrival via 'I am Coming' button",
        },
      });

      return q;
    });

    return NextResponse.json({
      success: true,
      status: updated.status,
      confirmedAt: updated.confirmedAt,
      message: 'Arrival confirmed! Please head to the restaurant entrance.',
    });
  } catch (error: any) {
    console.error('Confirm arrival error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
