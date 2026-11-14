import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function requireAdmin(req: NextRequest) {
  const session = await getAuthSession(req);
  if (!session) {
    return {
      errorResponse: NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 }),
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true, status: true },
  });

  if (!user || user.status !== 'ACTIVE') {
    return {
      errorResponse: NextResponse.json({ error: 'Your account is inactive.' }, { status: 403 }),
    };
  }

  if (user.role !== 'ADMIN') {
    return {
      errorResponse: NextResponse.json({ error: 'Forbidden. Administrator access is required.' }, { status: 403 }),
    };
  }

  return { user };
}
