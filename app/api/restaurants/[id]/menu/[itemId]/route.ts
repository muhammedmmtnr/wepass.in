import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const { itemId } = params;
    const body = await req.json();

    const item = await prisma.menuItem.update({
      where: { id: itemId },
      data: {
        ...(body.name ? { name: body.name.trim() } : {}),
        ...(body.description !== undefined ? { description: body.description?.trim() } : {}),
        ...(body.price !== undefined ? { price: parseFloat(body.price) } : {}),
        ...(body.categoryId !== undefined ? { categoryId: body.categoryId } : {}),
        ...(body.imageUrl !== undefined ? { imageUrl: body.imageUrl } : {}),
        ...(typeof body.isVegetarian === 'boolean' ? { isVegetarian: body.isVegetarian } : {}),
        ...(typeof body.isVegan === 'boolean' ? { isVegan: body.isVegan } : {}),
        ...(typeof body.isGlutenFree === 'boolean' ? { isGlutenFree: body.isGlutenFree } : {}),
        ...(typeof body.isAvailable === 'boolean' ? { isAvailable: body.isAvailable } : {}),
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    console.error('Update menu item error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const { itemId } = params;
    await prisma.menuItem.delete({ where: { id: itemId } });
    return NextResponse.json({ success: true, message: 'Item deleted' });
  } catch (error: any) {
    console.error('Delete menu item error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
