import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const {
      name,
      email,
      password,
      phone,
      restaurantName,
      category,
      city,
      address,
    } = await req.json();

    if (!name || !email || !password || !restaurantName) {
      return NextResponse.json(
        { error: 'Name, email, password, and restaurant name are required' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    // Generate unique slug
    let baseSlug = restaurantName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!baseSlug) baseSlug = 'restaurant';

    let uniqueSlug = baseSlug;
    let counter = 1;
    while (await prisma.restaurant.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const passwordHash = await hashPassword(password);

    // Create user and restaurant in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email: email.toLowerCase().trim(),
          passwordHash,
          phone: phone || null,
          role: 'RESTAURANT_OWNER',
          status: 'ACTIVE',
        },
      });

      const restaurant = await tx.restaurant.create({
        data: {
          name: restaurantName,
          slug: uniqueSlug,
          category: category || 'Casual Dining',
          city: city || 'Bengaluru',
          address: address || null,
          phone: phone || null,
          email: email.toLowerCase().trim(),
          ownerId: user.id,
          status: 'ACTIVE',
          isQueueOpen: true,
          avgDiningDurationMin: 45,
          estimatedWaitPerPartyMin: 10,
        },
      });

      // Create QR configuration with permanent static link
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      await tx.qRConfiguration.create({
        data: {
          restaurantId: restaurant.id,
          permanentUrl: `${appUrl}/r/${restaurant.slug}`,
        },
      });

      // Default tables
      await tx.table.createMany({
        data: [
          { restaurantId: restaurant.id, tableNumber: 'T-01', capacity: 2, section: 'MAIN' },
          { restaurantId: restaurant.id, tableNumber: 'T-02', capacity: 2, section: 'MAIN' },
          { restaurantId: restaurant.id, tableNumber: 'T-03', capacity: 4, section: 'MAIN' },
          { restaurantId: restaurant.id, tableNumber: 'T-04', capacity: 4, section: 'MAIN' },
          { restaurantId: restaurant.id, tableNumber: 'P-01', capacity: 6, section: 'PATIO' },
        ],
      });

      // Assign Basic plan
      const defaultPlan = await tx.subscriptionPlan.findFirst({
        where: { tier: 'basic' },
      });

      if (defaultPlan) {
        await tx.subscription.create({
          data: {
            restaurantId: restaurant.id,
            planId: defaultPlan.id,
            status: 'ACTIVE',
            billingCycle: 'MONTHLY',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });
      }

      return { user, restaurant };
    });

    const token = signToken({
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role,
      restaurantId: result.restaurant.id,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        restaurantId: result.restaurant.id,
        restaurantName: result.restaurant.name,
        restaurantSlug: result.restaurant.slug,
      },
      token,
    });

    response.cookies.set('wepass_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error('Sign-up error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
