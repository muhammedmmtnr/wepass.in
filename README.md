# WePass — Complete Restaurant Queue & Table Management Platform

> **"WePass — Your Queue. Your Time. Your Table."**

WePass is a production-ready, full-stack restaurant waitlist, queue, and table management platform. Inspired by the simplicity of Vardivo but crafted with its own original brand identity, WePass seamlessly connects restaurant guests, front-desk staff, and restaurant owners in a single, database-driven ecosystem.

---

## 🌟 Key Highlights & Brand Identity

- **Design Aesthetic:** Apple-inspired simplicity, Linear-grade dashboard hierarchy, and Stripe-level data presentation.
- **Brand Colors:**
  - Soft Background Tint: `#E8F3EC`
  - Signature Mint/Emerald Green: `#05A85C` / `#035831`
  - Warm Amber Accent: `#F59E0B` / `#D97706`
  - Crisp Surfaces: `#FFFFFF` with soft borders and subtle shadows
- **Typography:** Inter with clear visual hierarchy and monospace tokens.
- **Database-backed proof:** Public restaurant usage totals are calculated from actual queue records for active, non-demo restaurants; seeded demo activity is excluded.

---

## 📱 The 3 Connected Experiences

### 1. Guest-Facing Mobile PWA (`/r/[slug]` & `/queue/[token]`)
- **Step 1 — Static Reusable QR:** Every restaurant receives one permanent QR code (`/r/olive-bistro`). All guests scan this static QR code; no ephemeral codes needed.
- **Step 2 — Restaurant Landing Page:** Live queue count, estimated wait time, opening status, and digital menu access.
- **Step 3 — Join Queue Form:** Guest name, phone number, party size (with +/- stepper), special notes (high chair, anniversary), accessibility needs. Validates duplicate bookings to prevent spam.
- **Step 4 & 5 — Live Queue Tracking:**
  - Prominent position indicator (e.g., `#2 in line`).
  - Unique queue token (e.g., `A01`, `B02`).
  - Real-time Server-Sent Events (SSE) updates.
  - Parties ahead and estimated wait countdown.
  - Persistent browser session (reloading the page preserves the ticket).
- **Step 6 — "I'm Coming" Action:** When called by staff, displays an urgent table-ready alert with deadline countdown and an interactive **"I'M COMING"** button to confirm arrival.
- **Step 7 — Seated Success Screen:** Shows assigned table number, seated timestamp, and digital menu access.

### 2. Restaurant Staff Queue Dashboard (`/staff`)
- Real-time front-of-house operational desk.
- Live KPI counters: Waiting, Called, Confirmed Arrivals, Seated, Free Tables, Average Wait.
- Per-entry operations:
  - **Call Guest:** Updates status to `CALLED`, sets arrival deadline countdown, and triggers audio chime.
  - **WhatsApp Integration:** Opens a prefilled WhatsApp message to the guest's phone (`wa.me/...`) without falsely claiming delivery until actual action.
  - **Assign Table:** Party-size compatible table assignment modal.
  - **Mark Seated:** Transitions guest to `SEATED` and marks the table `OCCUPIED`.
  - **Complete Visit:** Finishes visit and automatically frees up the table to `AVAILABLE`.
  - **Skip / Pause / No-Show / Cancel:** Full status handling.
- **Fairness Exception Engine:**
  - If a staff member attempts to call a guest while earlier eligible parties in that group are waiting, the system intercepts the call.
  - Requires selecting an auditable reason (`EARLIER_GUEST_NOT_PRESENT`, `TABLE_COMPATIBILITY`, `ACCESSIBILITY_REQUIREMENT`, `GUEST_REQUESTED_PRIORITY`, `MANAGER_APPROVED_EXCEPTION`, `OTHER`).
  - Persists full audit trail to `QueueFairnessAudit`.
- **Manual Walk-In Entry:** Register walk-in guests directly from the host desk.

### 3. Restaurant Owner Dashboard (`/dashboard`)
- **Overview:** Live database metrics, total guests today, seated count, table turnover %, cancellation rate, no-show rate, peak service period bar chart.
- **Tables & Floor Plan (`/dashboard/tables`):** CRUD operations on tables, capacities, sections (Main, Patio, VIP, Bar), and availability toggling.
- **QR Management (`/dashboard/qr`):** High-resolution PNG download, printable table tent card view, permanent link copying, scan & join analytics.
- **Staff & Roles (`/dashboard/staff`):** Invite staff, configure roles (`RESTAURANT_MANAGER`, `RESTAURANT_STAFF`), toggle active status.
- **Digital Menu (`/dashboard/menu`):** Add dishes, categorize, dietary badges (Veg, Vegan, Gluten-Free), and in-stock / sold-out toggles.
- **Analytics & Reports (`/dashboard/reports`):** Daily, weekly, monthly reports with CSV export and fairness exception log.
- **Settings (`/dashboard/settings`):** Queue engine parameter tuning (wait time per party, max party size, call deadline, dining duration).

---

## ⚙️ Queue Management Engine Specifications

### Party-Size Based Grouping
Parties are categorized into dedicated table groups to ensure equitable table allocation:
- **Group A:** 1–2 Guests (Tokens `A01`, `A02`...)
- **Group B:** 3–4 Guests (Tokens `B01`, `B02`...)
- **Group C:** 5–6 Guests (Tokens `C01`, `C02`...)
- **Group D:** 7+ Guests (Tokens `D01`, `D02`...)

### Wait Time & Position Formula
- **Group Position:** Calculated dynamically from waiting entries in the same group that joined prior to the current entry.
- **Estimated Wait Time:** `(partiesAheadInGroup + 1) * restaurant.estimatedWaitPerPartyMin`.
- **Duplicate Prevention:** Sanitizes mobile number and prevents multiple active tickets in `WAITING`, `CALLED`, or `CONFIRMED` status.

---

## 🗄️ Database Schema & Entities

Built with **Prisma ORM** (configured for zero-config SQLite out-of-the-box, with native support for PostgreSQL via `DATABASE_URL`):

- `User`: Roles (`RESTAURANT_OWNER`, `RESTAURANT_MANAGER`, `RESTAURANT_STAFF`), password hashes, session states.
- `Restaurant`: Multi-tenant restaurant profile, slug, dining parameters, queue open/close state.
- `Staff`: Relation mapping users to restaurants with permissions and active flags.
- `Table`: Dining tables with numbers, capacity, sections, and live status (`AVAILABLE`, `OCCUPIED`, `RESERVED`, `CLEANING`).
- `QueueEntry`: Guest name, phone, party size, table group, live status, session secret, deadlines, timestamps.
- `QueueEvent`: Event log for every action (`JOINED`, `CALLED`, `CONFIRMED`, `SEATED`, `COMPLETED`, `WHATSAPP_OPENED`).
- `QueueFairnessAudit`: Compliance log storing target guest, bypassed guests, staff ID, reason, manager approval flag.
- `NotificationLog`: Logs WhatsApp and SMS attempts accurately with timestamp and status.
- `QRConfiguration`: Permanent URL, scan count, join count, conversion metrics.
- `MenuCategory` & `MenuItem`: Digital menu categories, prices, dietary tags, availability.
- `SubscriptionPlan` & `Subscription`: Free, Basic, Pro, Enterprise tiers, expiry dates, billing cycles.
- `SystemAuditLog`: Global operational audit logs.

---

## 🚀 Getting Started & Local Development

### 1. Prerequisites
- Node.js 18+ (verified on Node v25.2.1)
- npm or pnpm

### 2. Environment Variables
Create a `.env` file in the project root:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="wepass-jwt-secret-secure-key-restaurant-system-2026"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
GOOGLE_APPS_SCRIPT_WEB_APP_URL="https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec"
```

### Business lead collection to Google Sheets

The public business enquiry and demo booking form is available at `/business-registration`. Visitors can send a business enquiry or book a demo without selecting a date or time. It submits to the server-side `/api/leads` route, which validates the fields and forwards each submission to the configured Apps Script Web App. Demo bookings are stored with the request type `demo_booking`. The spreadsheet URL by itself is not a submission endpoint.

1. Open the supplied spreadsheet with ID `1ucfsdaEja37Pf1rcFEeGTh-hxDR50tO-lZHMO-vSzZc` and create or select a sheet named `Leads`.
2. In **Extensions → Apps Script**, add this handler. It appends each accepted lead as a new row and records the timestamp in Google Sheets.

```javascript
const SPREADSHEET_ID = '1ucfsdaEja37Pf1rcFEeGTh-hxDR50tO-lZHMO-vSzZc';
const SHEET_NAME = 'Leads';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const required = [
      'contactPersonName', 'businessName', 'city', 'district',
      'state', 'whatsappNumber', 'notes'
    ];
    if (required.some((key) => !String(data[key] || '').trim())) {
      throw new Error('Missing required fields');
    }
    const requestType = data.requestType || 'business_enquiry';
    if (!['business_enquiry', 'booking_request', 'demo_booking'].includes(requestType)) {
      throw new Error('Invalid request type');
    }

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('Leads sheet was not found');
    const headers = [
      'Timestamp', 'Contact Person Name', 'Restaurant / Business Name',
      'City', 'District', 'State', 'WhatsApp Number', 'Email Address',
      'Notes / Requirements', 'Request Type'
    ];
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
    } else {
      sheet.getRange(1, 10).setValue(headers[9]);
    }
    sheet.appendRow([
      new Date(),
      data.contactPersonName,
      data.businessName,
      data.city,
      data.district,
      data.state,
      data.whatsappNumber,
      data.email || '',
      data.notes,
      data.requestType || 'business_enquiry'
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: 'Unable to save lead' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. If the `Leads` sheet already exists, the handler sets the `Request Type` header in column J. Deploy or update the Apps Script as a **Web app**, choose **Execute as me**, and allow access to **Anyone** so the server endpoint can submit public enquiries. Copy the deployment URL ending in `/exec`.
4. Set the deployed URL (not the spreadsheet URL or a placeholder) as `GOOGLE_APPS_SCRIPT_WEB_APP_URL` in the server environment, including production hosting, and restart/redeploy. The form cannot write to Google Sheets until this endpoint is configured. Do not use the service-account email as the endpoint or expose private credentials in client code.

The UI reports success only after Apps Script returns `{ "success": true }`; failed submissions leave the form values in place so the visitor can retry.

### 3. Initialize Database & Seed Demo Data
```bash
# Push schema to SQLite database
npm run prisma:push

# Seed with demo restaurant (The Olive Bistro), tables, menu, and queues
npm run seed
```

### 4. Run Automated Integration & Engine Tests
```bash
npm test
```
*Executes all 23 integration tests verifying grouping logic, duplicate prevention, fairness bypass interception, and table seating lifecycles.*

### 5. Build & Run Application
```bash
# Production Build
npm run build

# Start Production Server
npm start

# Or run in development mode
npm run dev
```

Visit: `http://localhost:3000`

---

## 🔑 Demo Credentials (Seeded)

| Role | Email | Password | Direct Portal |
| :--- | :--- | :--- | :--- |
| **Restaurant Owner** | `owner@olivebistro.com` | `OwnerPassword123!` | `/dashboard` |
| **Shift Manager** | `manager@olivebistro.com` | `StaffPassword123!` | `/staff` |
| **Host Staff** | `staff@olivebistro.com` | `StaffPassword123!` | `/staff` |
| **Guest QR Experience** | *Public* | *None* | `/r/olive-bistro` |

---

## 🚢 Production Deployment Instructions

1. **Database:** In production, change `DATABASE_URL` in `.env` to point to a PostgreSQL cluster (e.g. Supabase, Neon, AWS RDS, or Railway). In `prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"`.
2. **Build:** Run `npm run prisma:push && npm run build`.
3. **Deploy:** Deploy directly to Vercel, Railway, AWS ECS, or Docker container with zero modifications required.
# wepass.in
