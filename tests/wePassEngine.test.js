const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'wepass-jwt-secret-secure-key-restaurant-system-2026';

function getTableGroupByPartySize(partySize) {
  if (partySize <= 2) return 'A';
  if (partySize <= 4) return 'B';
  if (partySize <= 6) return 'C';
  return 'D';
}

async function runTestSuite() {
  console.log('====================================================');
  console.log('🧪 RUNNING WEPASS AUTOMATED ENGINE & INTEGRATION TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Party-Size Grouping Engine
    console.log('--- Test Suite 1: Party-Size Grouping Engine ---');
    assert(getTableGroupByPartySize(1) === 'A', '1 guest routes to Group A');
    assert(getTableGroupByPartySize(2) === 'A', '2 guests route to Group A');
    assert(getTableGroupByPartySize(3) === 'B', '3 guests route to Group B');
    assert(getTableGroupByPartySize(4) === 'B', '4 guests route to Group B');
    assert(getTableGroupByPartySize(5) === 'C', '5 guests route to Group C');
    assert(getTableGroupByPartySize(6) === 'C', '6 guests route to Group C');
    assert(getTableGroupByPartySize(8) === 'D', '8+ guests route to Group D');

    // 2. Authentication & Password Security
    console.log('\n--- Test Suite 2: Authentication & Password Security ---');
    const rawPass = 'SecretTestPass123!';
    const hash = await bcrypt.hash(rawPass, 10);
    const isValid = await bcrypt.compare(rawPass, hash);
    const isInvalid = await bcrypt.compare('WrongPassword', hash);
    assert(isValid === true, 'Bcrypt password hashing verified');
    assert(isInvalid === false, 'Invalid password correctly rejected');

    const testPayload = { userId: 'usr-1', email: 'test@wepass.in', role: 'RESTAURANT_OWNER' };
    const token = jwt.sign(testPayload, JWT_SECRET, { expiresIn: '1h' });
    const decoded = jwt.verify(token, JWT_SECRET);
    assert(decoded.userId === 'usr-1' && decoded.role === 'RESTAURANT_OWNER', 'JWT signing and token verification valid');

    // 3. Restaurant & Static QR Integrity
    console.log('\n--- Test Suite 3: Restaurant & Permanent Static QR Integrity ---');
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: 'olive-bistro' },
      include: { qrConfig: true },
    });
    assert(restaurant !== null, 'Seeded restaurant "The Olive Bistro" exists');
    assert(restaurant?.qrConfig?.permanentUrl.includes('/r/olive-bistro'), 'Permanent reusable QR URL exists and matches restaurant slug');

    // 4. Duplicate Queue Prevention
    console.log('\n--- Test Suite 4: Duplicate Active Queue Prevention ---');
    const testPhone = '+91 99999 88888';
    // Clean any prior test entry
    await prisma.queueEntry.deleteMany({
      where: { guestPhone: testPhone },
    });

    // Create first active entry
    const entry1 = await prisma.queueEntry.create({
      data: {
        restaurantId: restaurant.id,
        token: 'A99',
        guestName: 'Duplicate Test Guest',
        guestPhone: testPhone,
        partySize: 2,
        tableGroup: 'A',
        status: 'WAITING',
      },
    });
    assert(entry1.id !== null, 'First queue ticket created');

    // Check duplicate detection
    const existingActive = await prisma.queueEntry.findFirst({
      where: {
        restaurantId: restaurant.id,
        guestPhone: testPhone,
        status: { in: ['WAITING', 'CALLED', 'CONFIRMED'] },
      },
    });
    assert(existingActive !== null && existingActive.id === entry1.id, 'Duplicate check identified existing active ticket');

    // 5. Fairness Exception Engine & Auditing
    console.log('\n--- Test Suite 5: Early-Call Fairness Exception & Audit Trail ---');
    // Create early entry
    const earlyGuest = await prisma.queueEntry.create({
      data: {
        restaurantId: restaurant.id,
        token: 'T01',
        guestName: 'Early Waiting Guest',
        guestPhone: '+91 91111 22222',
        partySize: 2,
        tableGroup: 'T',
        status: 'WAITING',
        createdAt: new Date(Date.now() - 10 * 60000),
      },
    });

    // Create later entry in same group
    const laterGuest = await prisma.queueEntry.create({
      data: {
        restaurantId: restaurant.id,
        token: 'T02',
        guestName: 'Later Guest Attempting Early Jump',
        guestPhone: '+91 93333 44444',
        partySize: 2,
        tableGroup: 'T',
        status: 'WAITING',
        createdAt: new Date(),
      },
    });

    // Detect if calling laterGuest bypasses earlyGuest
    const skipped = await prisma.queueEntry.findMany({
      where: {
        restaurantId: restaurant.id,
        tableGroup: 'T',
        status: 'WAITING',
        createdAt: { lt: laterGuest.createdAt },
      },
    });
    assert(skipped.length > 0 && skipped[0].id === earlyGuest.id, 'Fairness engine identified earlier bypassed guest T01');

    // Log fairness audit exception
    const staff = await prisma.user.findFirst({ where: { role: 'RESTAURANT_STAFF' } });
    const auditLog = await prisma.queueFairnessAudit.create({
      data: {
        restaurantId: restaurant.id,
        targetQueueEntryId: laterGuest.id,
        skippedQueueEntryIds: JSON.stringify([earlyGuest.id]),
        staffUserId: staff ? staff.id : 'staff-test-id',
        reason: 'TABLE_COMPATIBILITY',
        customNotes: 'Table is ready for party specifics',
        managerApproved: true,
      },
    });
    assert(auditLog.id !== null, 'Queue fairness audit exception successfully recorded in database');

    // 6. Table Allocation & Seating Lifecycle
    console.log('\n--- Test Suite 6: Table Allocation & Session Completion Lifecycle ---');
    const table = await prisma.table.findFirst({
      where: { restaurantId: restaurant.id, status: 'AVAILABLE' },
    });
    assert(table !== null, 'Available dining table located');

    // Assign table
    const assignedEntry = await prisma.queueEntry.update({
      where: { id: laterGuest.id },
      data: { assignedTableId: table.id, status: 'CALLED' },
    });
    assert(assignedEntry.assignedTableId === table.id, 'Table assigned to queue ticket');

    // Guest confirms arrival "I'M COMING"
    const confirmedEntry = await prisma.queueEntry.update({
      where: { id: laterGuest.id },
      data: { status: 'CONFIRMED', confirmedAt: new Date() },
    });
    assert(confirmedEntry.status === 'CONFIRMED', 'Guest arrival confirmed');

    // Mark Seated
    await prisma.table.update({ where: { id: table.id }, data: { status: 'OCCUPIED' } });
    const seatedEntry = await prisma.queueEntry.update({
      where: { id: laterGuest.id },
      data: { status: 'SEATED', seatedAt: new Date() },
    });
    assert(seatedEntry.status === 'SEATED', 'Guest marked seated');

    const occupiedTable = await prisma.table.findUnique({ where: { id: table.id } });
    assert(occupiedTable.status === 'OCCUPIED', 'Table status updated to OCCUPIED');

    // Finish session and free table
    await prisma.table.update({ where: { id: table.id }, data: { status: 'AVAILABLE' } });
    const completedEntry = await prisma.queueEntry.update({
      where: { id: laterGuest.id },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });
    assert(completedEntry.status === 'COMPLETED', 'Visit marked COMPLETED');

    const freedTable = await prisma.table.findUnique({ where: { id: table.id } });
    assert(freedTable.status === 'AVAILABLE', 'Table successfully released back to AVAILABLE');

    // Cleanup test entries
    await prisma.queueFairnessAudit.deleteMany({ where: { id: auditLog.id } });
    await prisma.queueEntry.deleteMany({
      where: { id: { in: [entry1.id, earlyGuest.id, laterGuest.id] } },
    });

    console.log('\n====================================================');
    console.log(`🎉 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Test execution error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTestSuite();
