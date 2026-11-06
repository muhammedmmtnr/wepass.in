import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRestaurantAuth } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const rawParam = params.token;

    const entry = await prisma.queueEntry.findFirst({
      where: {
        OR: [{ id: rawParam }, { token: rawParam.toUpperCase() }],
      },
      include: { restaurant: true },
    });

    if (!entry) {
      return NextResponse.json({ error: 'Queue entry not found' }, { status: 404 });
    }

    const auth = await requireRestaurantAuth(req, entry.restaurantId);
    if (auth.errorResponse) return auth.errorResponse;

    // Sanitize guest phone for WhatsApp international format
    let cleanPhone = entry.guestPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10) {
      cleanPhone = `91${cleanPhone}`; // Default Indian country code if 10 digits
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
    const ticketUrl = new URL(`/queue/${entry.token}`, appUrl);
    ticketUrl.searchParams.set('slug', entry.restaurant.slug);
    if (entry.sessionSecret) ticketUrl.searchParams.set('access', entry.sessionSecret);
    const message = `Hello ${entry.guestName}, your table at ${entry.restaurant.name} is ready! Please come to the entrance. Your token is ${entry.token}. Track live: ${ticketUrl.toString()}`;
    const loggedMessage = message.replace(ticketUrl.toString(), `/queue/${entry.token}?slug=${entry.restaurant.slug}`);

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

    // Record notification attempt accurately (INITIATED / OPENED)
    await prisma.notificationLog.create({
      data: {
        restaurantId: entry.restaurantId,
        queueEntryId: entry.id,
        type: 'WHATSAPP',
        recipientPhone: entry.guestPhone,
        message: loggedMessage,
        status: 'OPENED',
      },
    });

    await prisma.queueEvent.create({
      data: {
        queueEntryId: entry.id,
        restaurantId: entry.restaurantId,
        eventType: 'WHATSAPP_OPENED',
        description: `Host opened WhatsApp chat with prefilled message for token ${entry.token}`,
        performedByUserId: auth.user!.userId,
      },
    });

    return NextResponse.json({
      success: true,
      whatsappUrl,
      recipientPhone: entry.guestPhone,
      message,
    });
  } catch (error: any) {
    console.error('WhatsApp action error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
