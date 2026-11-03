import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug?.toLowerCase().trim();
    if (!slug) {
      return NextResponse.json({ error: 'Restaurant slug is required' }, { status: 400 });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { slug },
      include: {
        qrConfig: true,
        menuCategories: {
          orderBy: { sortOrder: 'asc' },
          include: {
            items: {
              where: { isAvailable: true },
            },
          },
        },
      },
    });

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    // Increment scan counter
    if (restaurant.qrConfig) {
      await prisma.qRConfiguration.update({
        where: { id: restaurant.qrConfig.id },
        data: { totalScans: { increment: 1 } },
      }).catch(() => {});
    }

    // Calculate current live queue metrics
    const waitingCount = await prisma.queueEntry.count({
      where: {
        restaurantId: restaurant.id,
        status: 'WAITING',
      },
    });

    const calledCount = await prisma.queueEntry.count({
      where: {
        restaurantId: restaurant.id,
        status: 'CALLED',
      },
    });

    const estimatedWaitMinutes = waitingCount === 0 ? 0 : waitingCount * (restaurant.estimatedWaitPerPartyMin || 8);

    return NextResponse.json({
      success: true,
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug,
        logoUrl: restaurant.logoUrl,
        bannerUrl: restaurant.bannerUrl,
        address: restaurant.address,
        city: restaurant.city,
        country: restaurant.country,
        phone: restaurant.phone,
        email: restaurant.email,
        category: restaurant.category,
        isQueueOpen: restaurant.isQueueOpen,
        maxPartySize: restaurant.maxPartySize,
        callDeadlineMinutes: restaurant.callDeadlineMinutes,
        waitingCount,
        calledCount,
        estimatedWaitMinutes,
        menuCategories: restaurant.menuCategories,
      },
    });
  } catch (error: any) {
    console.error('Fetch restaurant by slug error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
