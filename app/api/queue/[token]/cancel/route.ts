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
    const body = await req.json().catch(() => ({}));
    const reason = body.reason || 'Guest self-cancelled from web app';

    const entry = await prisma.queueEntry.findFirst({
      where: {
        token: rawToken,
        ...(slug ? { restaurant: { slug } } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!entry) {
      return NextResponse.json({ error: 'Queue ticket not found.' }, { status: 404 });
    }

    if (['SEATED', 'COMPLETED', 'CANCELLED'].includes(entry.status)) {
      return NextResponse.json(
        { error: `Cannot cancel entry in status '${entry.status}'.` },
        { status: 400 }
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      // If table was assigned, unassign and mark table AVAILABLE
      if (entry.assignedTableId) {
        await tx.table.update({
          where: { id: entry.assignedTableId },
          data: { status: 'AVAILABLE' },
        });
      }

      const q = await tx.queueEntry.update({
        where: { id: entry.id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancellationReason: reason,
          assignedTableId: null,
        },
      });

      await tx.queueEvent.create({
        data: {
          queueEntryId: entry.id,
          restaurantId: entry.restaurantId,
          eventType: 'CANCELLED',
          description: `Queue entry cancelled: ${reason}`,
        },
      });

      return q;
    });

    return NextResponse.json({
      success: true,
      status: updated.status,
      message: 'Queue entry cancelled successfully.',
    });
  } catch (error: any) {
    console.error('Cancel queue error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
