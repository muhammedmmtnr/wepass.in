import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - 30);

    const activeRestaurant = { restaurant: { status: 'ACTIVE', isDemo: false } };
    const [activeRestaurants, partiesWaiting, servedGuests, seatedEntries] = await Promise.all([
      prisma.restaurant.count({ where: { status: 'ACTIVE', isDemo: false } }),
      prisma.queueEntry.count({
        where: { ...activeRestaurant, status: 'WAITING' },
      }),
      prisma.queueEntry.aggregate({
        where: {
          ...activeRestaurant,
          status: 'COMPLETED',
          createdAt: { gte: periodStart },
        },
        _sum: { partySize: true },
      }),
      prisma.queueEntry.findMany({
        where: {
          ...activeRestaurant,
          seatedAt: { gte: periodStart },
        },
        select: { createdAt: true, seatedAt: true },
      }),
    ]);

    const validWaits = seatedEntries
      .filter((entry) => entry.seatedAt)
      .map((entry) => (entry.seatedAt!.getTime() - entry.createdAt.getTime()) / 60_000)
      .filter((minutes) => Number.isFinite(minutes) && minutes >= 0);

    const averageWaitMinutes = validWaits.length
      ? Math.round(validWaits.reduce((sum, minutes) => sum + minutes, 0) / validWaits.length)
      : null;

    return NextResponse.json({
      success: true,
      periodDays: 30,
      stats: {
        activeRestaurants,
        partiesWaiting,
        guestsServed: servedGuests._sum.partySize || 0,
        averageWaitMinutes,
      },
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Platform proof metrics error:', error);
    return NextResponse.json({ error: 'Unable to load platform usage statistics.' }, { status: 500 });
  }
}
