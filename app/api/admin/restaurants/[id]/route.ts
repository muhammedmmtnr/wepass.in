import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth(req, ['SUPER_ADMIN']);
    if (auth.errorResponse) return auth.errorResponse;

    const restaurantId = params.id;
    const body = await req.json();

    const restaurant = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        ...(body.status ? { status: body.status } : {}),
        ...(body.name ? { name: body.name.trim() } : {}),
        ...(body.category ? { category: body.category.trim() } : {}),
        ...(body.city ? { city: body.city.trim() } : {}),
        ...(body.phone !== undefined ? { phone: body.phone?.trim() } : {}),
        ...(body.email !== undefined ? { email: body.email?.trim() } : {}),
        ...(typeof body.isQueueOpen === 'boolean' ? { isQueueOpen: body.isQueueOpen } : {}),
      },
    });

    return NextResponse.json({ success: true, restaurant });
  } catch (error: any) {
    console.error('Admin update restaurant error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth(req, ['SUPER_ADMIN']);
    if (auth.errorResponse) return auth.errorResponse;

    const restaurantId = params.id;

    // Check if there are active queue entries
    const activeQueues = await prisma.queueEntry.count({
      where: {
        restaurantId,
        status: { in: ['WAITING', 'CALLED', 'CONFIRMED', 'SEATED'] },
      },
    });

    if (activeQueues > 0) {
      return NextResponse.json(
        { error: `Cannot delete restaurant with ${activeQueues} active guests in queue. Suspend it instead.` },
        { status: 400 }
      );
    }

    await prisma.restaurant.delete({
      where: { id: restaurantId },
    });

    return NextResponse.json({ success: true, message: 'Restaurant deleted successfully.' });
  } catch (error: any) {
    console.error('Admin delete restaurant error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
