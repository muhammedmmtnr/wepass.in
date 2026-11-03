import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession(req);
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        status: true,
        ownedRestaurants: {
          select: {
            id: true,
            name: true,
            slug: true,
            category: true,
            status: true,
            isQueueOpen: true,
          },
        },
        staffProfiles: {
          select: {
            restaurantId: true,
            role: true,
            restaurant: {
              select: {
                id: true,
                name: true,
                slug: true,
                category: true,
                status: true,
                isQueueOpen: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 404 });
    }

    const currentRestaurant =
      user.ownedRestaurants[0] || user.staffProfiles[0]?.restaurant || null;

    return NextResponse.json({
      authenticated: true,
      user: {
        ...user,
        currentRestaurant,
      },
    });
  } catch (error: any) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
