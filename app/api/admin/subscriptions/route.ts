import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req, ['SUPER_ADMIN']);
    if (auth.errorResponse) return auth.errorResponse;

    const subscriptions = await prisma.subscription.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            slug: true,
            owner: { select: { name: true, email: true } },
          },
        },
        plan: true,
      },
    });

    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { priceMonthly: 'asc' },
    });

    return NextResponse.json({ success: true, subscriptions, plans });
  } catch (error: any) {
    console.error('Admin subscriptions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
