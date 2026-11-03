import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const restaurantId = params.id;
    const categories = await prisma.menuCategory.findMany({
      where: { restaurantId },
      orderBy: { sortOrder: 'asc' },
      include: {
        items: {
          orderBy: { name: 'asc' },
        },
      },
    });

    const unassignedItems = await prisma.menuItem.findMany({
      where: { restaurantId, categoryId: null },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ success: true, categories, unassignedItems });
  } catch (error: any) {
    console.error('Fetch menu error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const restaurantId = params.id;
    const body = await req.json();

    if (body.type === 'category') {
      const category = await prisma.menuCategory.create({
        data: {
          restaurantId,
          name: body.name.trim(),
          sortOrder: parseInt(body.sortOrder, 10) || 0,
        },
      });
      return NextResponse.json({ success: true, category });
    }

    // Default: create menu item
    if (!body.name || body.price === undefined) {
      return NextResponse.json({ error: 'Item name and price are required' }, { status: 400 });
    }

    const item = await prisma.menuItem.create({
      data: {
        restaurantId,
        categoryId: body.categoryId || null,
        name: body.name.trim(),
        description: body.description ? body.description.trim() : null,
        price: parseFloat(body.price),
        imageUrl: body.imageUrl || null,
        isVegetarian: Boolean(body.isVegetarian),
        isVegan: Boolean(body.isVegan),
        isGlutenFree: Boolean(body.isGlutenFree),
        isAvailable: body.isAvailable !== undefined ? Boolean(body.isAvailable) : true,
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    console.error('Add menu item error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
