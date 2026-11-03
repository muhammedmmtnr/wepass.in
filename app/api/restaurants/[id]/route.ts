import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const restaurantId = params.id;
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: {
        owner: { select: { id: true, name: true, email: true, phone: true } },
        qrConfig: true,
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

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, restaurant });
  } catch (error: any) {
    console.error('Get restaurant error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const restaurantId = params.id;
    const body = await req.json();

    const restaurant = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        ...(body.name ? { name: body.name.trim() } : {}),
        ...(body.category ? { category: body.category.trim() } : {}),
        ...(body.phone !== undefined ? { phone: body.phone?.trim() } : {}),
        ...(body.email !== undefined ? { email: body.email?.trim() } : {}),
        ...(body.address !== undefined ? { address: body.address?.trim() } : {}),
        ...(body.city !== undefined ? { city: body.city?.trim() } : {}),
        ...(typeof body.isQueueOpen === 'boolean' ? { isQueueOpen: body.isQueueOpen } : {}),
        ...(body.avgDiningDurationMin ? { avgDiningDurationMin: parseInt(body.avgDiningDurationMin, 10) } : {}),
        ...(body.maxPartySize ? { maxPartySize: parseInt(body.maxPartySize, 10) } : {}),
        ...(body.estimatedWaitPerPartyMin ? { estimatedWaitPerPartyMin: parseInt(body.estimatedWaitPerPartyMin, 10) } : {}),
        ...(body.callDeadlineMinutes ? { callDeadlineMinutes: parseInt(body.callDeadlineMinutes, 10) } : {}),
        ...(body.status ? { status: body.status } : {}),
      },
    });

    return NextResponse.json({ success: true, restaurant });
  } catch (error: any) {
    console.error('Update restaurant error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
