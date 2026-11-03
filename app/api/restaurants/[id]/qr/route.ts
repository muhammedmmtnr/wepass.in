import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateQrDataUrl, generateQrSvg } from '@/lib/qr';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const restaurantId = params.id;
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: { qrConfig: true },
    });

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const permanentUrl = `${appUrl}/r/${restaurant.slug}`;

    // Ensure qrConfig exists
    let qrConfig = restaurant.qrConfig;
    if (!qrConfig) {
      qrConfig = await prisma.qRConfiguration.create({
        data: {
          restaurantId,
          permanentUrl,
        },
      });
    }

    const qrDataUrl = await generateQrDataUrl(permanentUrl);
    const qrSvg = await generateQrSvg(permanentUrl);

    return NextResponse.json({
      success: true,
      qr: {
        permanentUrl,
        qrDataUrl,
        qrSvg,
        totalScans: qrConfig.totalScans,
        totalJoins: qrConfig.totalJoins,
        conversionRate:
          qrConfig.totalScans > 0
            ? Math.round((qrConfig.totalJoins / qrConfig.totalScans) * 100)
            : 0,
        lastRegeneratedAt: qrConfig.lastRegeneratedAt,
      },
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug,
        category: restaurant.category,
        city: restaurant.city,
      },
    });
  } catch (error: any) {
    console.error('QR fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
