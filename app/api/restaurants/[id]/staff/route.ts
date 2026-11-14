import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession, hashPassword } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const restaurantId = params.id;
    const staffMembers = await prisma.staff.findMany({
      where: { restaurantId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, staff: staffMembers });
  } catch (error: any) {
    console.error('Fetch staff error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const restaurantId = params.id;
    const session = await getAuthSession(req);
    const { name, email, phone, role, password } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }
    const staffRole = role || 'RESTAURANT_STAFF';
    if (!['RESTAURANT_MANAGER', 'RESTAURANT_STAFF'].includes(staffRole)) {
      return NextResponse.json({ error: 'Choose a valid restaurant staff role.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      const defaultPassword = password || 'StaffPass2026!';
      const passwordHash = await hashPassword(defaultPassword);
      user = await prisma.user.create({
        data: {
          name: name.trim(),
          email: cleanEmail,
          passwordHash,
          phone: phone ? phone.trim() : null,
          role: staffRole,
          status: 'ACTIVE',
        },
      });
    }

    const existingStaff = await prisma.staff.findUnique({
      where: {
        userId_restaurantId: {
          userId: user.id,
          restaurantId,
        },
      },
    });

    if (existingStaff) {
      return NextResponse.json({ error: 'This user is already a staff member for this restaurant.' }, { status: 409 });
    }

    const staff = await prisma.staff.create({
      data: {
        userId: user.id,
        restaurantId,
        role: staffRole,
        isActive: true,
      },
      include: { user: true },
    });

    return NextResponse.json({ success: true, staff });
  } catch (error: any) {
    console.error('Add staff error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
