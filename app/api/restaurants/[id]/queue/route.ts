import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const restaurantId = params.id;
    const { searchParams } = new URL(req.url);
    const view = searchParams.get('view') || 'active'; // 'active', 'history', 'all'
    const group = searchParams.get('group'); // 'A', 'B', 'C', 'D'

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: {
        tables: {
          orderBy: { tableNumber: 'asc' },
        },
      },
    });

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    // Determine status filter
    let statusFilter: any = {
      in: ['WAITING', 'CALLED', 'CONFIRMED', 'SEATED', 'PAUSED'],
    };
    if (view === 'history') {
      statusFilter = {
        in: ['COMPLETED', 'CANCELLED', 'NO_SHOW', 'SKIPPED'],
      };
    } else if (view === 'all') {
      statusFilter = undefined;
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const entries = await prisma.queueEntry.findMany({
      where: {
        restaurantId,
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(group ? { tableGroup: group } : {}),
        createdAt: { gte: startOfToday },
      },
      orderBy: [
        { status: 'asc' },
        { createdAt: 'asc' },
      ],
      include: {
        assignedTable: true,
        events: {
          orderBy: { createdAt: 'desc' },
          take: 3,
        },
      },
    });

    // Metrics calculation
    const waitingCount = entries.filter((e) => e.status === 'WAITING').length;
    const calledCount = entries.filter((e) => e.status === 'CALLED').length;
    const confirmedCount = entries.filter((e) => e.status === 'CONFIRMED').length;
    const seatedCount = entries.filter((e) => e.status === 'SEATED').length;
    
    // Total served today
    const completedToday = await prisma.queueEntry.count({
      where: {
        restaurantId,
        status: 'COMPLETED',
        createdAt: { gte: startOfToday },
      },
    });

    const cancelledToday = await prisma.queueEntry.count({
      where: {
        restaurantId,
        status: 'CANCELLED',
        createdAt: { gte: startOfToday },
      },
    });

    const noShowToday = await prisma.queueEntry.count({
      where: {
        restaurantId,
        status: 'NO_SHOW',
        createdAt: { gte: startOfToday },
      },
    });

    // Average wait time of seated/completed today in minutes
    const seatedEntries = await prisma.queueEntry.findMany({
      where: {
        restaurantId,
        seatedAt: { not: null },
        createdAt: { gte: startOfToday },
      },
      select: { createdAt: true, seatedAt: true },
    });

    let avgWaitMinutes = 12; // default reasonable benchmark
    if (seatedEntries.length > 0) {
      const totalWaitMs = seatedEntries.reduce((sum, item) => {
        return sum + (new Date(item.seatedAt!).getTime() - new Date(item.createdAt).getTime());
      }, 0);
      avgWaitMinutes = Math.round(totalWaitMs / (seatedEntries.length * 60000));
    }

    return NextResponse.json({
      success: true,
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug,
        isQueueOpen: restaurant.isQueueOpen,
        callDeadlineMinutes: restaurant.callDeadlineMinutes,
      },
      stats: {
        waitingCount,
        calledCount,
        confirmedCount,
        seatedCount,
        completedToday,
        cancelledToday,
        noShowToday,
        avgWaitMinutes,
        availableTables: restaurant.tables.filter((t) => t.status === 'AVAILABLE').length,
        totalTables: restaurant.tables.length,
      },
      tables: restaurant.tables,
      entries,
    });
  } catch (error: any) {
    console.error('Fetch restaurant queue error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
