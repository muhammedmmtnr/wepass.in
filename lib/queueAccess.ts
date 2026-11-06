import { timingSafeEqual } from 'crypto';
import type { QueueEntry } from '@prisma/client';
import type { NextRequest } from 'next/server';

export function hasQueueAccess(req: NextRequest, entry: Pick<QueueEntry, 'id' | 'sessionSecret'>): boolean {
  const expected = entry.sessionSecret;
  if (!expected) return false;

  const expectedBuffer = Buffer.from(expected);
  const candidates = [
    req.cookies.get(`wepass_queue_${entry.id}`)?.value,
    req.headers.get('x-queue-access-token'),
  ];

  return candidates.some((provided) => {
    if (!provided) return false;
    const providedBuffer = Buffer.from(provided);
    return (
      expectedBuffer.length === providedBuffer.length &&
      timingSafeEqual(expectedBuffer, providedBuffer)
    );
  });
}
