import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateQueuePosition } from '@/lib/queueEngine';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const restaurantId = searchParams.get('restaurantId');

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let isClosed = false;

      const sendEvent = (event: string, data: any) => {
        if (isClosed) return;
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch {
          isClosed = true;
        }
      };

      const pushUpdate = async () => {
        if (isClosed) return;

        try {
          if (token) {
            // Guest live tracking stream
            const entry = await prisma.queueEntry.findFirst({
              where: { token: token.toUpperCase().trim() },
              orderBy: { createdAt: 'desc' },
              include: {
                assignedTable: true,
                restaurant: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    callDeadlineMinutes: true,
                  },
                },
              },
            });

            if (entry) {
              const pos = await calculateQueuePosition(entry.id);
              sendEvent('guest_update', {
                status: entry.status,
                token: entry.token,
                partySize: entry.partySize,
                tableGroup: entry.tableGroup,
                assignedTable: entry.assignedTable,
                calledAt: entry.calledAt,
                callDeadlineAt: entry.callDeadlineAt,
                confirmedAt: entry.confirmedAt,
                seatedAt: entry.seatedAt,
                groupPosition: pos.groupPosition,
                overallPosition: pos.overallPosition,
                partiesAhead: pos.partiesAhead,
                estimatedWaitMinutes: pos.estimatedWaitMinutes,
                updatedAt: new Date().toISOString(),
              });
            }
          } else if (restaurantId) {
            // Staff / Owner dashboard stream
            const waitingCount = await prisma.queueEntry.count({
              where: { restaurantId, status: 'WAITING' },
            });
            const calledCount = await prisma.queueEntry.count({
              where: { restaurantId, status: 'CALLED' },
            });
            const confirmedCount = await prisma.queueEntry.count({
              where: { restaurantId, status: 'CONFIRMED' },
            });
            const seatedCount = await prisma.queueEntry.count({
              where: { restaurantId, status: 'SEATED' },
            });
            const availableTables = await prisma.table.count({
              where: { restaurantId, status: 'AVAILABLE' },
            });

            sendEvent('dashboard_update', {
              waitingCount,
              calledCount,
              confirmedCount,
              seatedCount,
              availableTables,
              updatedAt: new Date().toISOString(),
            });
          }
        } catch (err) {
          // ignore transient poll error
        }
      };

      // Send initial state immediately
      await pushUpdate();

      // Poll every 3 seconds for active connection
      const interval = setInterval(async () => {
        if (isClosed) {
          clearInterval(interval);
          return;
        }
        await pushUpdate();
      }, 3000);

      req.signal.addEventListener('abort', () => {
        isClosed = true;
        clearInterval(interval);
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
