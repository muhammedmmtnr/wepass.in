import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const staffId = params.id;
    const body = await req.json();

    const staff = await prisma.staff.update({
      where: { id: staffId },
      data: {
        ...(typeof body.isActive === 'boolean' ? { isActive: body.isActive } : {}),
        ...(body.role ? { role: body.role } : {}),
      },
      include: { user: true },
    });

    return NextResponse.json({ success: true, staff });
  } catch (error: any) {
    console.error('Update staff error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const staffId = params.id;
    await prisma.staff.delete({ where: { id: staffId } });
    return NextResponse.json({ success: true, message: 'Staff profile removed' });
  } catch (error: any) {
    console.error('Delete staff error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
