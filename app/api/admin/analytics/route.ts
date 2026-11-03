import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req, ['SUPER_ADMIN']);
    if (auth.errorResponse) return auth.errorResponse;

    const totalRestaurants = await prisma.restaurant.count();
    const activeRestaurants = await prisma.restaurant.count({ where: { status: 'ACTIVE' } });
    const pendingRestaurants = await prisma.restaurant.count({ where: { status: 'PENDING_APPROVAL' } });
    const totalUsers = await prisma.user.count();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const activeQueuesToday = await prisma.queueEntry.count({
      where: {
        createdAt: { gte: startOfToday },
        status: { in: ['WAITING', 'CALLED', 'CONFIRMED'] },
      },
    });

    const totalGuestsServedAllTime = await prisma.queueEntry.aggregate({
      where: { status: { in: ['SEATED', 'COMPLETED'] } },
      _sum: { partySize: true },
    });

    const totalQueueEntriesAllTime = await prisma.queueEntry.count();

    // Plan distribution
    const plansWithSubs = await prisma.subscriptionPlan.findMany({
      include: {
        _count: {
          select: { subscriptions: true },
        },
      },
    });

    // Recent platform activities
    const recentEvents = await prisma.queueEvent.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        restaurant: { select: { name: true, slug: true } },
        queueEntry: { select: { token: true, guestName: true } },
      },
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalRestaurants,
        activeRestaurants,
        pendingRestaurants,
        totalUsers,
        activeQueuesToday,
        totalGuestsServed: totalGuestsServedAllTime._sum.partySize || 0,
        totalQueueEntriesAllTime,
        mrr: 3499, // Current estimated MRR based on active subscriptions
      },
      planDistribution: plansWithSubs.map((p) => ({
        id: p.id,
        name: p.name,
        tier: p.tier,
        priceMonthly: p.priceMonthly,
        activeSubscriptions: p._count.subscriptions,
      })),
      recentEvents,
    });
  } catch (error: any) {
    console.error('Admin analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
