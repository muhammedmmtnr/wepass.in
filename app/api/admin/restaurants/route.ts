import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req, ['SUPER_ADMIN']);
    if (auth.errorResponse) return auth.errorResponse;

    const restaurants = await prisma.restaurant.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        owner: { select: { id: true, name: true, email: true, phone: true } },
        subscriptions: {
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            tables: true,
            queueEntries: true,
            staffProfiles: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, restaurants });
  } catch (error: any) {
    console.error('Admin restaurants error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req, ['SUPER_ADMIN']);
    if (auth.errorResponse) return auth.errorResponse;

    const body = await req.json();
    const { name, ownerId, category, city, address, phone, email } = body;

    if (!name || !ownerId) {
      return NextResponse.json({ error: 'Name and Owner ID are required' }, { status: 400 });
    }

    let baseSlug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    let uniqueSlug = baseSlug;
    let counter = 1;
    while (await prisma.restaurant.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const restaurant = await prisma.$transaction(async (tx) => {
      const r = await tx.restaurant.create({
        data: {
          name: name.trim(),
          slug: uniqueSlug,
          ownerId,
          category: category || 'Casual Dining',
          city: city || 'Bengaluru',
          address: address || null,
          phone: phone || null,
          email: email || null,
          status: 'ACTIVE',
          isQueueOpen: true,
        },
      });

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      await tx.qRConfiguration.create({
        data: {
          restaurantId: r.id,
          permanentUrl: `${appUrl}/r/${r.slug}`,
        },
      });

      const proPlan = await tx.subscriptionPlan.findFirst({ where: { tier: 'pro' } });
      if (proPlan) {
        await tx.subscription.create({
          data: {
            restaurantId: r.id,
            planId: proPlan.id,
            status: 'ACTIVE',
            billingCycle: 'YEARLY',
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          },
        });
      }

      return r;
    });

    return NextResponse.json({ success: true, restaurant });
  } catch (error: any) {
    console.error('Admin create restaurant error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
