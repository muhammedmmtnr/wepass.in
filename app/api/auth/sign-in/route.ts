import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        ownedRestaurants: { select: { id: true, name: true, slug: true } },
        staffProfiles: {
          select: {
            restaurantId: true,
            role: true,
            restaurant: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (user.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Your account is suspended or inactive.' }, { status: 403 });
    }

    if (!['ADMIN', 'RESTAURANT_OWNER', 'RESTAURANT_MANAGER', 'RESTAURANT_STAFF'].includes(user.role)) {
      return NextResponse.json({ error: 'This account role is no longer supported.' }, { status: 403 });
    }

    let restaurantId = user.ownedRestaurants[0]?.id;
    if (!restaurantId && user.staffProfiles.length > 0) {
      restaurantId = user.staffProfiles[0].restaurantId;
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      restaurantId,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        restaurantId,
        restaurantName: user.ownedRestaurants[0]?.name || user.staffProfiles[0]?.restaurant.name,
        restaurantSlug: user.ownedRestaurants[0]?.slug || user.staffProfiles[0]?.restaurant.slug,
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
    console.error('Sign-in error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
