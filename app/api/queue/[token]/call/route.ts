import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { checkFairnessException } from '@/lib/queueEngine';

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const rawParam = params.token;
    const session = await getAuthSession(req);
    const body = await req.json().catch(() => ({}));
    const { fairnessReason, customNotes, managerApproved } = body;

    const entry = await prisma.queueEntry.findFirst({
      where: {
        OR: [{ id: rawParam }, { token: rawParam.toUpperCase() }],
      },
      include: { restaurant: true },
    });

    if (!entry) {
      return NextResponse.json({ error: 'Queue entry not found' }, { status: 404 });
    }

    if (!['WAITING', 'PAUSED', 'SKIPPED'].includes(entry.status)) {
      return NextResponse.json(
        { error: `Cannot call guest currently in status '${entry.status}'.` },
        { status: 400 }
      );
    }

    // Check fairness exception
    const fairnessCheck = await checkFairnessException(entry.id);
    if (fairnessCheck.isException && !fairnessReason) {
      // Prompt staff UI to provide an auditable reason before proceeding
      return NextResponse.json(
        {
          requiresFairnessReason: true,
          message: 'Earlier waiting guests detected in this group. An auditable reason is required to call this party early.',
          skippedEntries: fairnessCheck.skippedEntries,
          targetToken: entry.token,
          targetGuestName: entry.guestName,
        },
        { status: 422 }
      );
    }

    // Call deadline in minutes
    const deadlineMin = entry.restaurant.callDeadlineMinutes || 10;
    const callDeadlineAt = new Date(Date.now() + deadlineMin * 60 * 1000);

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update queue entry
      const q = await tx.queueEntry.update({
        where: { id: entry.id },
        data: {
          status: 'CALLED',
          calledAt: new Date(),
          callDeadlineAt,
        },
      });

      // 2. Record queue event
      await tx.queueEvent.create({
        data: {
          queueEntryId: entry.id,
          restaurantId: entry.restaurantId,
          eventType: 'CALLED',
          description: `Staff called guest to entrance (Arrival deadline: ${deadlineMin} mins)`,
          performedByUserId: session?.userId || null,
        },
      });

      // 3. Record fairness audit if early call was authorized
      if (fairnessCheck.isException && fairnessReason) {
        await tx.queueFairnessAudit.create({
          data: {
            restaurantId: entry.restaurantId,
            targetQueueEntryId: entry.id,
            skippedQueueEntryIds: JSON.stringify(fairnessCheck.skippedEntries.map((e) => e.id)),
            staffUserId: session?.userId || 'system-staff',
            reason: fairnessReason,
            customNotes: customNotes || null,
            managerApproved: Boolean(managerApproved),
            managerUserId: managerApproved ? session?.userId : null,
          },
        });
      }

      return q;
    });

    return NextResponse.json({
      success: true,
      entry: updated,
      message: `Guest ${entry.token} (${entry.guestName}) has been called.`,
    });
  } catch (error: any) {
    console.error('Call guest error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
