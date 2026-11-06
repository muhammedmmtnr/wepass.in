const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding WePass database...');

  // 1. Subscription Plans
  const plansData = [
    {
      name: 'FREE',
      tier: 'free',
      description: 'Ideal for small cafes and trial operations',
      priceMonthly: 0,
      priceYearly: 0,
      maxTables: 5,
      maxDailyQueue: 30,
      features: JSON.stringify([
        'Up to 5 Tables',
        'Standard QR Code',
        'Guest Live Tracking Web PWA',
        'Basic Queue Ordering',
        'Staff Dashboard'
      ]),
      isActive: true,
    },
    {
      name: 'BASIC',
      tier: 'basic',
      description: 'Perfect for busy single-location bistros and eateries',
      priceMonthly: 1499,
      priceYearly: 14990,
      maxTables: 15,
      maxDailyQueue: 150,
      features: JSON.stringify([
        'Up to 15 Tables',
        'Permanent Static QR & Printable Kit',
        'Party-Size Grouping Engine',
        'WhatsApp Pre-filled Guest Callouts',
        'Audited Fairness Exceptions',
        'Daily Performance Reports'
      ]),
      isActive: true,
    },
    {
      name: 'PRO',
      tier: 'pro',
      description: 'Full-featured solution for high-volume restaurants',
      priceMonthly: 3499,
      priceYearly: 34990,
      maxTables: 40,
      maxDailyQueue: 600,
      features: JSON.stringify([
        'Up to 40 Tables',
        'Multi-Section Layouts (Indoor, Patio, VIP)',
        'Full Queue Fairness Audit Engine',
        'Arrival Deadline Countdowns',
        'Digital Menu & Table Assignment',
        'CSV & Printable PDF Exports',
        'Role-Based Staff Permissions'
      ]),
      isActive: true,
    },
    {
      name: 'ENTERPRISE',
      tier: 'enterprise',
      description: 'Enterprise grade for multi-branch restaurant groups',
      priceMonthly: 7999,
      priceYearly: 79990,
      maxTables: 150,
      maxDailyQueue: 3000,
      features: JSON.stringify([
        'Unlimited Tables & Branches',
        'Custom Domain & Brand Whitelabeling',
        'Priority 24/7 SLA Support',
        'Automated SMS Gateway Integration',
        'Advanced Capacity Forecasting'
      ]),
      isActive: true,
    },
  ];

  for (const plan of plansData) {
    await prisma.subscriptionPlan.upsert({
      where: { tier: plan.tier },
      update: plan,
      create: plan,
    });
  }

  // 2. Users
  const ownerPassword = await bcrypt.hash('OwnerPassword123!', 10);
  const staffPassword = await bcrypt.hash('StaffPassword123!', 10);

  const owner = await prisma.user.upsert({
    where: { email: 'owner@olivebistro.com' },
    update: {
      name: 'Marco Rossi',
      role: 'RESTAURANT_OWNER',
      status: 'ACTIVE',
    },
    create: {
      email: 'owner@olivebistro.com',
      passwordHash: ownerPassword,
      name: 'Marco Rossi',
      phone: '+91 98765 43210',
      role: 'RESTAURANT_OWNER',
      status: 'ACTIVE',
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@olivebistro.com' },
    update: {
      name: 'Elena Gilbert',
      role: 'RESTAURANT_MANAGER',
      status: 'ACTIVE',
    },
    create: {
      email: 'manager@olivebistro.com',
      passwordHash: staffPassword,
      name: 'Elena Gilbert',
      phone: '+91 98765 43211',
      role: 'RESTAURANT_MANAGER',
      status: 'ACTIVE',
    },
  });

  const hostStaff = await prisma.user.upsert({
    where: { email: 'staff@olivebistro.com' },
    update: {
      name: 'Alex Chen',
      role: 'RESTAURANT_STAFF',
      status: 'ACTIVE',
    },
    create: {
      email: 'staff@olivebistro.com',
      passwordHash: staffPassword,
      name: 'Alex Chen',
      phone: '+91 98765 43212',
      role: 'RESTAURANT_STAFF',
      status: 'ACTIVE',
    },
  });

  // 3. Restaurant: The Olive Bistro
  const restaurant = await prisma.restaurant.upsert({
    where: { slug: 'olive-bistro' },
    update: {
      name: 'The Olive Bistro',
      address: '142 Indiranagar 100ft Road',
      city: 'Bengaluru',
      country: 'India',
      phone: '+91 98765 43210',
      email: 'contact@olivebistro.com',
      category: 'Mediterranean & Italian',
      isQueueOpen: true,
      isDemo: true,
      avgDiningDurationMin: 45,
      maxPartySize: 12,
      estimatedWaitPerPartyMin: 8,
      callDeadlineMinutes: 10,
    },
    create: {
      name: 'The Olive Bistro',
      slug: 'olive-bistro',
      logoUrl: '/brand/logo-card.png',
      bannerUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80',
      address: '142 Indiranagar 100ft Road',
      city: 'Bengaluru',
      country: 'India',
      phone: '+91 98765 43210',
      email: 'contact@olivebistro.com',
      category: 'Mediterranean & Italian',
      status: 'ACTIVE',
      isDemo: true,
      isQueueOpen: true,
      avgDiningDurationMin: 45,
      maxPartySize: 12,
      estimatedWaitPerPartyMin: 8,
      callDeadlineMinutes: 10,
      ownerId: owner.id,
    },
  });

  // 4. Staff records
  await prisma.staff.upsert({
    where: {
      userId_restaurantId: {
        userId: manager.id,
        restaurantId: restaurant.id,
      },
    },
    update: { role: 'RESTAURANT_MANAGER', isActive: true },
    create: {
      userId: manager.id,
      restaurantId: restaurant.id,
      role: 'RESTAURANT_MANAGER',
      isActive: true,
    },
  });

  await prisma.staff.upsert({
    where: {
      userId_restaurantId: {
        userId: hostStaff.id,
        restaurantId: restaurant.id,
      },
    },
    update: { role: 'RESTAURANT_STAFF', isActive: true },
    create: {
      userId: hostStaff.id,
      restaurantId: restaurant.id,
      role: 'RESTAURANT_STAFF',
      isActive: true,
    },
  });

  // 5. QR Configuration
  await prisma.qRConfiguration.upsert({
    where: { restaurantId: restaurant.id },
    update: {
      permanentUrl: `http://localhost:3000/r/${restaurant.slug}`,
    },
    create: {
      restaurantId: restaurant.id,
      permanentUrl: `http://localhost:3000/r/${restaurant.slug}`,
      totalScans: 148,
      totalJoins: 92,
    },
  });

  // 6. Pro Subscription for Restaurant
  const proPlan = await prisma.subscriptionPlan.findUnique({ where: { tier: 'pro' } });
  if (proPlan) {
    const existingSub = await prisma.subscription.findFirst({
      where: { restaurantId: restaurant.id },
    });
    if (!existingSub) {
      await prisma.subscription.create({
        data: {
          restaurantId: restaurant.id,
          planId: proPlan.id,
          status: 'ACTIVE',
          billingCycle: 'YEARLY',
          startedAt: new Date(),
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  // 7. Tables
  const tablesData = [
    { tableNumber: 'T-01', capacity: 2, section: 'MAIN', status: 'AVAILABLE' },
    { tableNumber: 'T-02', capacity: 2, section: 'MAIN', status: 'AVAILABLE' },
    { tableNumber: 'T-03', capacity: 4, section: 'MAIN', status: 'AVAILABLE' },
    { tableNumber: 'T-04', capacity: 4, section: 'MAIN', status: 'AVAILABLE' },
    { tableNumber: 'T-05', capacity: 4, section: 'MAIN', status: 'AVAILABLE' },
    { tableNumber: 'P-01', capacity: 4, section: 'PATIO', status: 'AVAILABLE' },
    { tableNumber: 'P-02', capacity: 6, section: 'PATIO', status: 'AVAILABLE' },
    { tableNumber: 'V-01', capacity: 8, section: 'VIP', status: 'AVAILABLE' },
    { tableNumber: 'B-01', capacity: 2, section: 'BAR', status: 'AVAILABLE' },
  ];

  for (const tbl of tablesData) {
    await prisma.table.upsert({
      where: {
        restaurantId_tableNumber: {
          restaurantId: restaurant.id,
          tableNumber: tbl.tableNumber,
        },
      },
      update: tbl,
      create: {
        ...tbl,
        restaurantId: restaurant.id,
      },
    });
  }

  // 8. Menu Categories and Items
  const catStarters = await prisma.menuCategory.create({
    data: { restaurantId: restaurant.id, name: 'Starters & Antipasti', sortOrder: 1 },
  }).catch(async () => {
    return await prisma.menuCategory.findFirst({ where: { restaurantId: restaurant.id, name: 'Starters & Antipasti' } });
  });

  const catMains = await prisma.menuCategory.create({
    data: { restaurantId: restaurant.id, name: 'Artisan Mains & Pizza', sortOrder: 2 },
  }).catch(async () => {
    return await prisma.menuCategory.findFirst({ where: { restaurantId: restaurant.id, name: 'Artisan Mains & Pizza' } });
  });

  const catDrinks = await prisma.menuCategory.create({
    data: { restaurantId: restaurant.id, name: 'Beverages & Mocktails', sortOrder: 3 },
  }).catch(async () => {
    return await prisma.menuCategory.findFirst({ where: { restaurantId: restaurant.id, name: 'Beverages & Mocktails' } });
  });

  const menuItems = [
    {
      restaurantId: restaurant.id,
      categoryId: catStarters?.id,
      name: 'Wild Mushroom & Truffle Arancini',
      description: 'Crispy arborio rice spheres with fontina cheese & black truffle aioli',
      price: 495,
      isVegetarian: true,
      imageUrl: 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=600&q=80',
    },
    {
      restaurantId: restaurant.id,
      categoryId: catStarters?.id,
      name: 'Bruschetta al Pomodoro e Burrata',
      description: 'Sourdough toast with San Marzano tomatoes, fresh burrata, and garden basil',
      price: 445,
      isVegetarian: true,
      imageUrl: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=600&q=80',
    },
    {
      restaurantId: restaurant.id,
      categoryId: catMains?.id,
      name: 'Woodfired Pizza Margherita Verace',
      description: 'Slow-fermented Neapolitan dough, Fior di Latte mozzarella, San Marzano D.O.P.',
      price: 695,
      isVegetarian: true,
      imageUrl: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600&q=80',
    },
    {
      restaurantId: restaurant.id,
      categoryId: catMains?.id,
      name: 'Tagliolini al Tartufo Nero',
      description: 'Fresh hand-cut egg pasta with Normandy butter and shaved black summer truffles',
      price: 895,
      isVegetarian: true,
      imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281704?w=600&q=80',
    },
    {
      restaurantId: restaurant.id,
      categoryId: catDrinks?.id,
      name: 'Sicilian Blood Orange Spritz',
      description: 'San Pellegrino aranciata rossa, sparkling citrus mist, rosemary sprig',
      price: 295,
      isVegetarian: true,
      isVegan: true,
      imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=80',
    },
  ];

  for (const item of menuItems) {
    const existing = await prisma.menuItem.findFirst({
      where: { restaurantId: restaurant.id, name: item.name },
    });
    if (!existing) {
      await prisma.menuItem.create({ data: item });
    }
  }

  // 9. Initial Live Queue Entries so the dashboard immediately has realistic live queue data
  // Table group A: party 1-2
  // Table group B: party 3-4
  // Table group C: party 5-6
  const existingEntries = await prisma.queueEntry.count({ where: { restaurantId: restaurant.id } });
  if (existingEntries === 0) {
    const q1 = await prisma.queueEntry.create({
      data: {
        restaurantId: restaurant.id,
        token: 'A01',
        guestName: 'Ananya Sharma',
        guestPhone: '+91 98450 11223',
        partySize: 2,
        tableGroup: 'A',
        status: 'CALLED',
        calledAt: new Date(Date.now() - 3 * 60 * 1000),
        callDeadlineAt: new Date(Date.now() + 7 * 60 * 1000),
        estimatedWaitMinutes: 0,
        specialRequests: 'Window or patio booth if possible',
        sessionSecret: 'token-ananya-a01-sess',
      },
    });

    const q2 = await prisma.queueEntry.create({
      data: {
        restaurantId: restaurant.id,
        token: 'B01',
        guestName: 'Rohan Mehra',
        guestPhone: '+91 98711 44556',
        partySize: 4,
        tableGroup: 'B',
        status: 'CONFIRMED',
        calledAt: new Date(Date.now() - 6 * 60 * 1000),
        confirmedAt: new Date(Date.now() - 2 * 60 * 1000),
        estimatedWaitMinutes: 0,
        specialRequests: 'High chair needed for toddler',
        sessionSecret: 'token-rohan-b01-sess',
      },
    });

    const q3 = await prisma.queueEntry.create({
      data: {
        restaurantId: restaurant.id,
        token: 'A02',
        guestName: 'Vikram Kapoor',
        guestPhone: '+91 97110 33445',
        partySize: 2,
        tableGroup: 'A',
        status: 'WAITING',
        estimatedWaitMinutes: 8,
        sessionSecret: 'token-vikram-a02-sess',
      },
    });

    const q4 = await prisma.queueEntry.create({
      data: {
        restaurantId: restaurant.id,
        token: 'B02',
        guestName: 'Pooja Iyer',
        guestPhone: '+91 98200 99887',
        partySize: 4,
        tableGroup: 'B',
        status: 'WAITING',
        estimatedWaitMinutes: 14,
        sessionSecret: 'token-pooja-b02-sess',
      },
    });

    const q5 = await prisma.queueEntry.create({
      data: {
        restaurantId: restaurant.id,
        token: 'C01',
        guestName: 'David D’Souza',
        guestPhone: '+91 99801 22334',
        partySize: 6,
        tableGroup: 'C',
        status: 'WAITING',
        estimatedWaitMinutes: 22,
        specialRequests: 'Celebrating anniversary',
        sessionSecret: 'token-david-c01-sess',
      },
    });

    // Record Queue Events
    await prisma.queueEvent.createMany({
      data: [
        { queueEntryId: q1.id, restaurantId: restaurant.id, eventType: 'JOINED', description: 'Guest joined via QR code' },
        { queueEntryId: q1.id, restaurantId: restaurant.id, eventType: 'CALLED', description: 'Staff called guest to entrance' },
        { queueEntryId: q2.id, restaurantId: restaurant.id, eventType: 'JOINED', description: 'Guest joined via QR code' },
        { queueEntryId: q2.id, restaurantId: restaurant.id, eventType: 'CALLED', description: 'Staff called guest' },
        { queueEntryId: q2.id, restaurantId: restaurant.id, eventType: 'CONFIRMED', description: "Guest tapped 'I am Coming'" },
        { queueEntryId: q3.id, restaurantId: restaurant.id, eventType: 'JOINED', description: 'Guest joined via QR code' },
        { queueEntryId: q4.id, restaurantId: restaurant.id, eventType: 'JOINED', description: 'Guest joined via QR code' },
        { queueEntryId: q5.id, restaurantId: restaurant.id, eventType: 'JOINED', description: 'Guest joined via QR code' },
      ],
    });
  }

  console.log('✅ WePass database seed completed successfully!');
  console.log(`Demo Restaurant: ${restaurant.name} (http://localhost:3000/r/${restaurant.slug})`);
  console.log(`Owner: owner@olivebistro.com / OwnerPassword123!`);
  console.log(`Manager: manager@olivebistro.com / StaffPassword123!`);
  console.log(`Staff: staff@olivebistro.com / StaffPassword123!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
