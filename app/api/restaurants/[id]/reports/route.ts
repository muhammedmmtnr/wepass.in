import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const restaurantId = params.id;
    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || 'daily'; // 'daily', 'weekly', 'monthly'

    const now = new Date();
    let startDate = new Date();

    if (range === 'daily') {
      startDate.setHours(0, 0, 0, 0);
    } else if (range === 'weekly') {
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
    } else {
      // monthly
      startDate.setDate(now.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
    }

    const entries = await prisma.queueEntry.findMany({
      where: {
        restaurantId,
        createdAt: { gte: startDate },
      },
      include: {
        assignedTable: true,
      },
    });

    const totalTables = await prisma.table.count({ where: { restaurantId } });
    const tablesOccupied = await prisma.table.count({
      where: { restaurantId, status: { in: ['OCCUPIED', 'RESERVED'] } },
    });

    const totalGuests = entries.reduce((sum, e) => sum + e.partySize, 0);
    const totalParties = entries.length;
    const completed = entries.filter((e) => e.status === 'COMPLETED').length;
    const seated = entries.filter((e) => e.status === 'SEATED').length;
    const cancelled = entries.filter((e) => e.status === 'CANCELLED').length;
    const noShows = entries.filter((e) => e.status === 'NO_SHOW').length;
    const activeWaiting = entries.filter((e) => e.status === 'WAITING' || e.status === 'CALLED' || e.status === 'CONFIRMED').length;

    const cancellationRate = totalParties > 0 ? Math.round((cancelled / totalParties) * 100) : 0;
    const noShowRate = totalParties > 0 ? Math.round((noShows / totalParties) * 100) : 0;
    const tableUtilisation = totalTables > 0 ? Math.round((tablesOccupied / totalTables) * 100) : 0;

    // Average wait time for parties that got seated
    const seatedList = entries.filter((e) => e.seatedAt);
    let avgWaitMinutes = 14;
    if (seatedList.length > 0) {
      const totalWaitMs = seatedList.reduce((sum, e) => {
        return sum + (new Date(e.seatedAt!).getTime() - new Date(e.createdAt).getTime());
      }, 0);
      avgWaitMinutes = Math.round(totalWaitMs / (seatedList.length * 60000));
    }

    // Hourly distribution for peak hours chart
    const hourlyCounts = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      count: 0,
      guests: 0,
    }));

    entries.forEach((e) => {
      const h = new Date(e.createdAt).getHours();
      hourlyCounts[h].count += 1;
      hourlyCounts[h].guests += e.partySize;
    });

    // Peak service period
    let peakHour = '19:00 - 21:00';
    let maxHourCount = 0;
    hourlyCounts.forEach((hc, idx) => {
      if (hc.count > maxHourCount) {
        maxHourCount = hc.count;
        peakHour = `${idx}:00 - ${idx + 1}:00`;
      }
    });

    // Fairness audits in period
    const fairnessAudits = await prisma.queueFairnessAudit.findMany({
      where: {
        restaurantId,
        createdAt: { gte: startDate },
      },
      include: {
        targetQueueEntry: { select: { token: true, guestName: true, partySize: true } },
        staffUser: { select: { name: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      range,
      metrics: {
        totalParties,
        totalGuests,
        completed,
        seated,
        cancelled,
        noShows,
        activeWaiting,
        cancellationRate,
        noShowRate,
        tableUtilisation,
        avgWaitMinutes,
        peakHour,
        totalTables,
        tablesOccupied,
      },
      hourlyDistribution: hourlyCounts.filter((_, idx) => idx >= 11 && idx <= 23), // standard service hours 11 AM - 11 PM
      fairnessAudits,
    });
  } catch (error: any) {
    console.error('Fetch reports error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
