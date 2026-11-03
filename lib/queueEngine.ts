import prisma from './prisma';

export function getTableGroupByPartySize(partySize: number): string {
  if (partySize <= 2) return 'A'; // 1-2 guests
  if (partySize <= 4) return 'B'; // 3-4 guests
  if (partySize <= 6) return 'C'; // 5-6 guests
  return 'D'; // 7+ guests (large parties)
}

export function getTableGroupLabel(group: string): string {
  switch (group) {
    case 'A': return 'Group A (1-2 Guests)';
    case 'B': return 'Group B (3-4 Guests)';
    case 'C': return 'Group C (5-6 Guests)';
    case 'D': return 'Group D (7+ Guests)';
    default: return `Group ${group}`;
  }
}

/**
 * Generate a unique token for the day/active session.
 * Format: A01, A02, B01, etc.
 */
export async function generateNextToken(restaurantId: string, tableGroup: string): Promise<string> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const countToday = await prisma.queueEntry.count({
    where: {
      restaurantId,
      tableGroup,
      createdAt: { gte: startOfDay },
    },
  });

  const nextNum = countToday + 1;
  const formattedNum = nextNum < 10 ? `0${nextNum}` : `${nextNum}`;
  return `${tableGroup}${formattedNum}`;
}

/**
 * Calculates current queue position for a waiting entry:
 * - Position within their table group (how many parties in same group are ahead)
 * - Overall position among all waiting parties
 * - Estimated wait time in minutes
 */
export async function calculateQueuePosition(queueEntryId: string) {
  const entry = await prisma.queueEntry.findUnique({
    where: { id: queueEntryId },
    include: { restaurant: true },
  });

  if (!entry || entry.status !== 'WAITING') {
    return {
      groupPosition: entry?.status === 'CALLED' ? 0 : null,
      overallPosition: entry?.status === 'CALLED' ? 0 : null,
      estimatedWaitMinutes: 0,
      partiesAhead: 0,
    };
  }

  // Parties ahead in the SAME table group who joined before this entry
  const partiesAheadSameGroup = await prisma.queueEntry.count({
    where: {
      restaurantId: entry.restaurantId,
      tableGroup: entry.tableGroup,
      status: 'WAITING',
      createdAt: { lt: entry.createdAt },
    },
  });

  // Overall parties ahead who are waiting
  const overallAhead = await prisma.queueEntry.count({
    where: {
      restaurantId: entry.restaurantId,
      status: 'WAITING',
      createdAt: { lt: entry.createdAt },
    },
  });

  const waitPerParty = entry.restaurant.estimatedWaitPerPartyMin || 8;
  const estimatedWaitMinutes = Math.max(5, (partiesAheadSameGroup + 1) * waitPerParty);

  return {
    groupPosition: partiesAheadSameGroup + 1,
    overallPosition: overallAhead + 1,
    partiesAhead: partiesAheadSameGroup,
    estimatedWaitMinutes,
  };
}

/**
 * Check whether a guest has an active queue entry at the restaurant
 */
export async function checkDuplicateQueue(restaurantId: string, phone: string) {
  const cleanPhone = phone.replace(/[\s-]/g, '');
  const activeEntry = await prisma.queueEntry.findFirst({
    where: {
      restaurantId,
      guestPhone: {
        contains: cleanPhone.slice(-10), // match last 10 digits to handle formatting (+91 etc)
      },
      status: {
        in: ['WAITING', 'CALLED', 'CONFIRMED'],
      },
    },
  });

  return activeEntry;
}

/**
 * Check for early call fairness exceptions:
 * If calling a guest when there are earlier eligible guests waiting in the same group,
 * returns the list of skipped guests.
 */
export async function checkFairnessException(queueEntryId: string) {
  const currentEntry = await prisma.queueEntry.findUnique({
    where: { id: queueEntryId },
  });

  if (!currentEntry) return { isException: false, skippedEntries: [] };

  // Find earlier waiting guests in the same table group
  const earlierWaitingGuests = await prisma.queueEntry.findMany({
    where: {
      restaurantId: currentEntry.restaurantId,
      tableGroup: currentEntry.tableGroup,
      status: 'WAITING',
      createdAt: { lt: currentEntry.createdAt },
    },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      token: true,
      guestName: true,
      partySize: true,
      createdAt: true,
    },
  });

  return {
    isException: earlierWaitingGuests.length > 0,
    skippedEntries: earlierWaitingGuests,
  };
}
