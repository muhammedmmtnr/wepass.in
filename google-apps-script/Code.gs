const SPREADSHEET_ID = '1ucfsdaEja37Pf1rcFEeGTh-hxDR50tO-lZHMO-vSzZc';
const SHEET_NAME = 'WE PASS Leads';
const TIME_ZONE = 'Asia/Kolkata';
const HEADERS = [
  'Timestamp',
  'Contact Person Name',
  'Restaurant / Business Name',
  'City',
  'District',
  'State',
  'WhatsApp Number',
  'Email Address',
  'Notes / Requirements',
  'Request Type',
  'Business Type',
  'Preferred Demo Date',
  'Preferred Demo Time',
  'Demo Duration',
  'Calendar Event ID',
  'Email Notification Status',
  'Calendar Status',
  'Lead Status',
  'Request ID',
  'Customer Confirmation Status',
];
const MAX_LENGTH = {
  contactPersonName: 200,
  businessName: 200,
  businessType: 200,
  city: 200,
  district: 200,
  state: 200,
  whatsappNumber: 32,
  notes: 3000,
  email: 254,
};

function doPost(event) {
  let lock;
  try {
    const body = JSON.parse(event.postData.contents);
    const expectedSecret = PropertiesService.getScriptProperties().getProperty('API_SECRET');

    if (!expectedSecret || !constantTimeEquals(body.apiSecret, expectedSecret)) {
      return jsonResponse({ success: false, error: 'Unauthorized request.' });
    }

    const lead = validateLead(body);
    lock = LockService.getScriptLock();
    lock.waitLock(10000);

    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
    const columns = ensureHeaders(sheet);
    let row = findRequestRow(sheet, columns.requestId, lead.requestId);
    let isNew = row === 0;

    if (isNew) {
      row = appendLead(sheet, columns, lead);
      SpreadsheetApp.flush();
    } else if (!matchesExistingLead(sheet, columns, row, lead)) {
      return jsonResponse({ success: false, error: 'Request ID is already associated with different details.' });
    }

    const statuses = {
      sheets: 'saved',
      gmail: 'not_applicable',
      calendar: 'not_applicable',
      customerConfirmation: 'not_applicable',
    };

    if (lead.requestType === 'demo_booking') {
      statuses.calendar = processCalendar(sheet, columns, row, lead);
      statuses.gmail = processBusinessEmail(sheet, columns, row, lead);
      statuses.customerConfirmation = processCustomerEmail(sheet, columns, row, lead);
      SpreadsheetApp.flush();
    }

    return jsonResponse({
      success: true,
      requestId: lead.requestId,
      duplicate: !isNew,
      statuses: statuses,
    });
  } catch (error) {
    console.error('Lead could not be validated or one or more services failed.');
    return jsonResponse({
      success: false,
      error: 'Unable to save or process lead.',
      statuses: {
        sheets: 'unknown',
        gmail: 'unknown',
        calendar: 'unknown',
        customerConfirmation: 'unknown',
      },
    });
  } finally {
    if (lock && lock.hasLock()) lock.releaseLock();
  }
}

function authorizeGoogleServices() {
  const properties = PropertiesService.getScriptProperties();
  if (!properties.getProperty('API_SECRET')) throw new Error('Set API_SECRET in Script Properties first.');
  if (!properties.getProperty('NOTIFICATION_EMAIL')) throw new Error('Set NOTIFICATION_EMAIL in Script Properties first.');

  SpreadsheetApp.openById(SPREADSHEET_ID).getName();
  GmailApp.getAliases();
  CalendarApp.getDefaultCalendar().getId();
}

function retryFailedIntegrations() {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet || sheet.getLastRow() < 2) return;
    const columns = ensureHeaders(sheet);

    for (let row = 2; row <= sheet.getLastRow(); row += 1) {
      if (sheet.getRange(row, columns.requestType).getDisplayValue() !== 'demo_booking') continue;
      const emailStatus = sheet.getRange(row, columns.gmailStatus).getDisplayValue();
      const calendarStatus = sheet.getRange(row, columns.calendarStatus).getDisplayValue();
      const confirmationStatus = sheet.getRange(row, columns.customerConfirmationStatus).getDisplayValue();
      if (
        ['Failed', 'Not configured'].indexOf(emailStatus) < 0 &&
        ['Failed', 'Not configured'].indexOf(confirmationStatus) < 0 &&
        calendarStatus !== 'Failed'
      ) {
        continue;
      }

      const lead = leadFromRow(sheet, columns, row);
      if (calendarStatus === 'Failed') processCalendar(sheet, columns, row, lead);
      if (emailStatus === 'Failed' || emailStatus === 'Not configured') {
        processBusinessEmail(sheet, columns, row, lead);
      }
      if (confirmationStatus === 'Failed' || confirmationStatus === 'Not configured') {
        processCustomerEmail(sheet, columns, row, lead);
      }
      SpreadsheetApp.flush();
    }
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function leadFromRow(sheet, columns, row) {
  const value = function (column) { return sheet.getRange(row, column).getDisplayValue(); };
  const timestampValue = sheet.getRange(row, columns.timestamp).getValue();
  return {
    timestamp: timestampValue instanceof Date ? timestampValue.toISOString() : String(timestampValue),
    contactPersonName: value(columns.contactPersonName),
    businessName: value(columns.businessName),
    businessType: value(columns.businessType),
    city: value(columns.city),
    district: value(columns.district),
    state: value(columns.state),
    whatsappNumber: value(columns.whatsappNumber),
    email: value(columns.email),
    notes: value(columns.notes),
    requestType: value(columns.requestType),
    preferredDemoDate: value(columns.preferredDemoDate),
    preferredDemoTime: value(columns.preferredDemoTime),
    demoDuration: Number(value(columns.demoDuration)),
    requestId: value(columns.requestId),
  };
}

function validateLead(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('Invalid request body.');
  }

  const allowedRequestTypes = ['business_enquiry', 'booking_request', 'demo_booking'];
  const requestType = body.requestType || 'business_enquiry';
  if (!allowedRequestTypes.includes(requestType)) throw new Error('Invalid request type.');

  const fields = [
    'contactPersonName',
    'businessName',
    'city',
    'district',
    'state',
    'whatsappNumber',
    'notes',
  ];
  const lead = {};
  fields.forEach(function (field) {
    const value = body[field];
    if (typeof value !== 'string' || !value.trim() || value.trim().length > MAX_LENGTH[field]) {
      throw new Error('Invalid required field.');
    }
    lead[field] = value.trim();
  });

  lead.businessType = typeof body.businessType === 'string' ? body.businessType.trim() : '';
  if (lead.businessType.length > MAX_LENGTH.businessType) throw new Error('Invalid business type.');

  lead.email = typeof body.email === 'string' ? body.email.trim() : '';
  if (
    lead.email.length > MAX_LENGTH.email ||
    (requestType === 'demo_booking' && !lead.email) ||
    (lead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email))
  ) {
    throw new Error('Invalid email.');
  }

  const phoneDigits = lead.whatsappNumber.replace(/\D/g, '');
  if (!lead.whatsappNumber.startsWith('+') || phoneDigits.length < 8 || phoneDigits.length > 15) {
    throw new Error('Invalid WhatsApp number.');
  }
  lead.whatsappNumber = '+' + phoneDigits;

  lead.requestType = requestType;
  lead.timestamp = typeof body.timestamp === 'string' ? body.timestamp : new Date().toISOString();
  lead.requestId = typeof body.requestId === 'string' ? body.requestId : Utilities.getUuid();
  lead.preferredDemoDate = typeof body.preferredDemoDate === 'string' ? body.preferredDemoDate : '';
  lead.preferredDemoTime = typeof body.preferredDemoTime === 'string' ? body.preferredDemoTime : '';
  lead.demoDuration = Number(body.demoDuration || 30);

  if (requestType === 'demo_booking') {
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(lead.preferredDemoDate) ||
      !/^\d{2}:\d{2}$/.test(lead.preferredDemoTime) ||
      ![30, 45, 60].includes(lead.demoDuration) ||
      !isFutureIndiaSlot(lead.preferredDemoDate, lead.preferredDemoTime)
    ) {
      throw new Error('Invalid or non-future preferred demo slot.');
    }
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(lead.requestId)) {
      throw new Error('Invalid request ID.');
    }
  }
  return lead;
}

function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
    return headerColumns(HEADERS);
  }

  const currentWidth = Math.max(sheet.getLastColumn(), 10);
  const currentHeaders = sheet.getRange(1, 1, 1, currentWidth).getDisplayValues()[0]
    .map(function (value) { return value.trim(); });
  const legacyHeaders = HEADERS.slice(0, 10);
  if (!legacyHeaders.every(function (header, index) { return currentHeaders[index] === header; })) {
    throw new Error('Existing leads columns do not match the legacy schema.');
  }

  HEADERS.slice(10).forEach(function (header) {
    if (currentHeaders.indexOf(header) < 0) {
      currentHeaders.push(header);
      sheet.getRange(1, currentHeaders.length).setValue(header);
    }
  });
  return headerColumns(currentHeaders);
}

function headerColumns(headers) {
  const result = {};
  HEADERS.forEach(function (header) { result[headerKey(header)] = headers.indexOf(header) + 1; });
  return result;
}

function headerKey(header) {
  return {
    'Timestamp': 'timestamp',
    'Contact Person Name': 'contactPersonName',
    'Restaurant / Business Name': 'businessName',
    'City': 'city',
    'District': 'district',
    'State': 'state',
    'WhatsApp Number': 'whatsappNumber',
    'Email Address': 'email',
    'Notes / Requirements': 'notes',
    'Request Type': 'requestType',
    'Business Type': 'businessType',
    'Preferred Demo Date': 'preferredDemoDate',
    'Preferred Demo Time': 'preferredDemoTime',
    'Demo Duration': 'demoDuration',
    'Calendar Event ID': 'calendarEventId',
    'Email Notification Status': 'gmailStatus',
    'Calendar Status': 'calendarStatus',
    'Lead Status': 'leadStatus',
    'Request ID': 'requestId',
    'Customer Confirmation Status': 'customerConfirmationStatus',
  }[header];
}

function appendLead(sheet, columns, lead) {
  const values = [];
  values[columns.timestamp - 1] = new Date(lead.timestamp);
  values[columns.contactPersonName - 1] = safeCellValue(lead.contactPersonName);
  values[columns.businessName - 1] = safeCellValue(lead.businessName);
  values[columns.city - 1] = safeCellValue(lead.city);
  values[columns.district - 1] = safeCellValue(lead.district);
  values[columns.state - 1] = safeCellValue(lead.state);
  values[columns.whatsappNumber - 1] = safeCellValue(lead.whatsappNumber);
  values[columns.email - 1] = safeCellValue(lead.email);
  values[columns.notes - 1] = safeCellValue(lead.notes);
  values[columns.requestType - 1] = safeCellValue(lead.requestType);
  values[columns.businessType - 1] = safeCellValue(lead.businessType);
  values[columns.preferredDemoDate - 1] = safeCellValue(lead.preferredDemoDate);
  values[columns.preferredDemoTime - 1] = safeCellValue(lead.preferredDemoTime);
  values[columns.demoDuration - 1] = lead.requestType === 'demo_booking' ? lead.demoDuration : '';
  values[columns.calendarEventId - 1] = '';
  values[columns.gmailStatus - 1] = lead.requestType === 'demo_booking' ? 'Pending' : 'Not applicable';
  values[columns.calendarStatus - 1] = lead.requestType === 'demo_booking' ? 'Pending' : 'Not applicable';
  values[columns.leadStatus - 1] = 'New';
  values[columns.requestId - 1] = safeCellValue(lead.requestId);
  values[columns.customerConfirmationStatus - 1] = lead.requestType === 'demo_booking' ? 'Pending' : 'Not applicable';

  const row = sheet.getLastRow() + 1;
  const width = Math.max.apply(null, Object.keys(columns).map(function (key) { return columns[key]; }));
  const rowValues = Array(width).fill('');
  values.forEach(function (value, index) {
    if (value !== undefined) rowValues[index] = value;
  });
  sheet.getRange(row, columns.preferredDemoDate).setNumberFormat('@');
  sheet.getRange(row, columns.preferredDemoTime).setNumberFormat('@');
  sheet.getRange(row, 1, 1, width).setValues([rowValues]);
  return row;
}

function findRequestRow(sheet, requestIdColumn, requestId) {
  if (sheet.getLastRow() < 2) return 0;
  const values = sheet.getRange(2, requestIdColumn, sheet.getLastRow() - 1, 1).getDisplayValues();
  for (let index = 0; index < values.length; index += 1) {
    if (values[index][0] === requestId) return index + 2;
  }
  return 0;
}

function matchesExistingLead(sheet, columns, row, lead) {
  const fields = [
    ['contactPersonName', lead.contactPersonName],
    ['businessName', lead.businessName],
    ['businessType', lead.businessType],
    ['city', lead.city],
    ['district', lead.district],
    ['state', lead.state],
    ['whatsappNumber', lead.whatsappNumber],
    ['email', lead.email],
    ['notes', lead.notes],
    ['requestType', lead.requestType],
    ['preferredDemoDate', lead.preferredDemoDate],
    ['preferredDemoTime', lead.preferredDemoTime],
    ['demoDuration', lead.requestType === 'demo_booking' ? String(lead.demoDuration) : ''],
  ];
  return fields.every(function (field) {
    return sheet.getRange(row, columns[field[0]]).getDisplayValue() === field[1];
  });
}

function processCalendar(sheet, columns, row, lead) {
  const savedId = sheet.getRange(row, columns.calendarEventId).getDisplayValue();
  if (savedId) return 'Created';

  try {
    const calendar = getCalendar();
    const start = indiaDateTime(lead.preferredDemoDate, lead.preferredDemoTime);
    const end = new Date(start.getTime() + lead.demoDuration * 60 * 1000);

    const recovered = findEventByRequestId(calendar, start, lead.requestId);
    if (recovered) {
      sheet.getRange(row, columns.calendarEventId).setValue(recovered.getId());
      sheet.getRange(row, columns.calendarStatus).setValue('Created');
      return 'Created';
    }

    const currentStatus = sheet.getRange(row, columns.calendarStatus).getDisplayValue();
    if (
      currentStatus === 'Conflict / Needs Rescheduling' ||
      currentStatus === 'Creating' ||
      currentStatus === 'Created'
    ) {
      return currentStatus === 'Created' ? 'Needs review' : currentStatus;
    }
    if (start.getTime() <= Date.now()) {
      sheet.getRange(row, columns.calendarStatus).setValue('Expired / Needs Rescheduling');
      return 'Expired / Needs Rescheduling';
    }

    const conflicts = calendar.getEvents(start, end).filter(function (event) {
      return event.getStartTime().getTime() < end.getTime() &&
        event.getEndTime().getTime() > start.getTime();
    });
    if (conflicts.length) {
      sheet.getRange(row, columns.calendarStatus).setValue('Conflict / Needs Rescheduling');
      return 'Conflict / Needs Rescheduling';
    }

    sheet.getRange(row, columns.calendarStatus).setValue('Creating');
    SpreadsheetApp.flush();
    const event = calendar.createEvent(
      'WE PASS Demo Request — ' + lead.businessName + ' (PENDING)',
      start,
      end,
      { description: eventDescription(lead), location: [lead.city, lead.state].filter(Boolean).join(', ') }
    );
    sheet.getRange(row, columns.calendarEventId).setValue(event.getId());
    sheet.getRange(row, columns.calendarStatus).setValue('Created');
    return 'Created';
  } catch (error) {
    sheet.getRange(row, columns.calendarStatus).setValue('Failed');
    console.error('Calendar event creation failed.');
    return 'Failed';
  }
}

function processBusinessEmail(sheet, columns, row, lead) {
  const statusCell = sheet.getRange(row, columns.gmailStatus);
  const currentStatus = statusCell.getDisplayValue();
  if (currentStatus === 'Sent' || currentStatus === 'Sending') return currentStatus;

  const recipient = PropertiesService.getScriptProperties().getProperty('NOTIFICATION_EMAIL');
  if (!recipient || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient.trim())) {
    statusCell.setValue('Not configured');
    return 'Not configured';
  }

  statusCell.setValue('Sending');
  SpreadsheetApp.flush();
  try {
    const calendarStatus = sheet.getRange(row, columns.calendarStatus).getDisplayValue();
    GmailApp.sendEmail(
      recipient.trim(),
      'New WE PASS Demo Request — ' + lead.businessName.replace(/[\r\n]/g, ' '),
      businessEmailText(lead, calendarStatus),
      { htmlBody: businessEmailHtml(lead, calendarStatus), name: 'WE PASS' }
    );
    statusCell.setValue('Sent');
    return 'Sent';
  } catch (error) {
    statusCell.setValue('Failed');
    console.error('Business notification email failed.');
    return 'Failed';
  }
}

function processCustomerEmail(sheet, columns, row, lead) {
  const statusCell = sheet.getRange(row, columns.customerConfirmationStatus);
  const currentStatus = statusCell.getDisplayValue();
  if (!lead.email) {
    statusCell.setValue('Not provided');
    return 'Not provided';
  }
  if (currentStatus === 'Sent' || currentStatus === 'Sending') return currentStatus;

  statusCell.setValue('Sending');
  SpreadsheetApp.flush();
  try {
    const message = [
      'Thank you for your interest in WE PASS!',
      '',
      'We have received your demo request successfully. Your preferred demo date and time have been recorded.',
      '',
      'Our team will review your request and contact you to confirm the appointment.',
      'Your requested slot is pending confirmation and is not yet a confirmed appointment.',
      '',
      'WE PASS — Your Time Matters.',
    ].join('\n');
    GmailApp.sendEmail(
      lead.email,
      'WE PASS — Your Demo Request Has Been Received',
      message,
      { htmlBody: customerEmailHtml(lead), name: 'WE PASS' }
    );
    statusCell.setValue('Sent');
    return 'Sent';
  } catch (error) {
    statusCell.setValue('Failed');
    console.error('Customer confirmation email failed.');
    return 'Failed';
  }
}

function getCalendar() {
  const calendarId = PropertiesService.getScriptProperties().getProperty('CALENDAR_ID');
  const calendar = calendarId ? CalendarApp.getCalendarById(calendarId) : CalendarApp.getDefaultCalendar();
  if (!calendar) throw new Error('Configured calendar was not found or is inaccessible.');
  return calendar;
}

function findEventByRequestId(calendar, start, requestId) {
  const searchStart = new Date(start.getTime() - 24 * 60 * 60 * 1000);
  const searchEnd = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  const marker = 'Request ID: ' + requestId;
  return calendar.getEvents(searchStart, searchEnd).find(function (event) {
    return event.getDescription().indexOf(marker) >= 0;
  }) || null;
}

function eventDescription(lead) {
  return [
    'Pending WE PASS demo request. This is not a confirmed appointment.',
    '',
    'Contact person: ' + lead.contactPersonName,
    'Business name: ' + lead.businessName,
    'Business type: ' + lead.businessType,
    'WhatsApp: ' + lead.whatsappNumber,
    'Email: ' + lead.email,
    'Location: ' + [lead.city, lead.district, lead.state].join(', '),
    'Requirements: ' + lead.notes,
    'Preferred demo: ' + lead.preferredDemoDate + ' ' + lead.preferredDemoTime + ' IST',
    'Duration: ' + lead.demoDuration + ' minutes',
    'Request ID: ' + lead.requestId,
    'Submission timestamp: ' + lead.timestamp,
  ].join('\n');
}

function businessEmailText(lead, calendarStatus) {
  return [
    'New WE PASS Demo Request',
    'Contact Person: ' + lead.contactPersonName,
    'Restaurant / Business Name: ' + lead.businessName,
    'Business Type: ' + lead.businessType,
    'City: ' + lead.city,
    'District: ' + lead.district,
    'State: ' + lead.state,
    'WhatsApp Number: ' + lead.whatsappNumber,
    'Email Address: ' + lead.email,
    'Requirements / Notes: ' + lead.notes,
    'Preferred Demo Date: ' + lead.preferredDemoDate,
    'Preferred Demo Time: ' + lead.preferredDemoTime + ' IST',
    'Demo Duration: ' + lead.demoDuration + ' minutes',
    'Calendar Status: ' + calendarStatus,
    'Request ID: ' + lead.requestId,
    'Submission Timestamp: ' + lead.timestamp,
  ].join('\n');
}

function businessEmailHtml(lead, calendarStatus) {
  const rows = [
    ['Contact Person Name', lead.contactPersonName],
    ['Restaurant / Business Name', lead.businessName],
    ['Business Type', lead.businessType],
    ['City', lead.city],
    ['District', lead.district],
    ['State', lead.state],
    ['WhatsApp Number', lead.whatsappNumber],
    ['Email Address', lead.email],
    ['Requirements / Notes', lead.notes],
    ['Preferred Demo Date', lead.preferredDemoDate],
    ['Preferred Demo Time', lead.preferredDemoTime + ' IST'],
    ['Demo Duration', lead.demoDuration + ' minutes'],
    ['Calendar Status', calendarStatus],
    ['Request ID', lead.requestId],
    ['Submission Timestamp', lead.timestamp],
  ];
  const details = rows.map(function (item) {
    return '<tr><td style="padding:11px 14px;color:#52665a;border-bottom:1px solid #e8eee9;">' +
      escapeHtml(item[0]) + '</td><td style="padding:11px 14px;color:#17231d;font-weight:600;border-bottom:1px solid #e8eee9;">' +
      escapeHtml(item[1]) + '</td></tr>';
  }).join('');
  const digits = lead.whatsappNumber.replace(/\D/g, '');
  const whatsapp = digits.length >= 8 && digits.length <= 15
    ? '<a href="https://wa.me/' + digits + '" style="display:inline-block;margin-top:18px;background:#079F61;color:#fff;text-decoration:none;padding:11px 16px;border-radius:8px;font-weight:700;">Message on WhatsApp</a>'
    : '';
  return '<div style="background:#f4f8f5;padding:28px;font-family:Arial,sans-serif;color:#17231d;">' +
    '<div style="max-width:640px;margin:auto;background:#fff;border:1px solid #e4ece6;border-radius:16px;overflow:hidden;">' +
    '<div style="background:#079F61;color:#fff;padding:24px 28px;"><div style="font-size:12px;letter-spacing:1px;font-weight:700;">WE PASS</div>' +
    '<h1 style="font-size:22px;margin:10px 0 0;">New Demo Request</h1></div>' +
    '<div style="padding:20px 28px;"><p style="color:#52665a;line-height:1.6;">A new demo request is pending review. The requested slot is not confirmed.</p>' +
    '<table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px;">' + details + '</table>' +
    whatsapp + '<p style="margin:24px 0 0;color:#738278;font-size:12px;">WE PASS — Your Time Matters.</p></div></div></div>';
}

function customerEmailHtml(lead) {
  return '<div style="background:#f4f8f5;padding:28px;font-family:Arial,sans-serif;color:#17231d;">' +
    '<div style="max-width:600px;margin:auto;background:#fff;border:1px solid #e4ece6;border-radius:16px;overflow:hidden;">' +
    '<div style="background:#079F61;color:#fff;padding:24px 28px;"><strong style="letter-spacing:1px;">WE PASS</strong></div>' +
    '<div style="padding:28px;"><h1 style="font-size:22px;margin:0 0 16px;">Your demo request has been received</h1>' +
    '<p style="line-height:1.7;color:#52665a;">Thank you for your interest in WE PASS! We have received your demo request successfully. ' +
    'Your preferred demo date and time have been recorded.</p><p style="line-height:1.7;color:#52665a;">Our team will review your request and contact you to confirm the appointment.</p>' +
    '<div style="border:1px solid #cfe9d8;background:#f0faf3;border-radius:10px;padding:14px;color:#17633f;"><strong>Pending confirmation</strong><br>' +
    escapeHtml(lead.preferredDemoDate) + ' at ' + escapeHtml(lead.preferredDemoTime) + ' IST for ' + lead.demoDuration +
    ' minutes. This is a requested slot, not a confirmed appointment.</div><p style="margin:24px 0 0;color:#079F61;font-weight:700;">WE PASS — Your Time Matters.</p></div></div></div>';
}

function isFutureIndiaSlot(dateText, timeText) {
  const parts = dateText.split('-').map(Number);
  const time = timeText.split(':').map(Number);
  if (parts.length !== 3 || time.length !== 2 || time[0] > 23 || time[1] > 59 || time[1] % 30 !== 0) return false;
  const candidate = indiaDateTime(dateText, timeText);
  return !isNaN(candidate.getTime()) &&
    Utilities.formatDate(candidate, TIME_ZONE, 'yyyy-MM-dd HH:mm') === dateText + ' ' + timeText &&
    candidate.getTime() > Date.now();
}

function indiaDateTime(dateText, timeText) {
  const date = dateText.split('-').map(Number);
  const time = timeText.split(':').map(Number);
  return new Date(Date.UTC(date[0], date[1] - 1, date[2], time[0], time[1]) - 330 * 60 * 1000);
}

function safeCellValue(value) {
  const text = String(value == null ? '' : value);
  return /^[\u0000-\u0020]*[=+\-@]/.test(text) ? "'" + text : text;
}

function escapeHtml(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[character];
  });
}

function constantTimeEquals(candidate, expected) {
  if (typeof candidate !== 'string' || typeof expected !== 'string') return false;
  let difference = candidate.length ^ expected.length;
  const length = Math.max(candidate.length, expected.length);
  for (let index = 0; index < length; index += 1) {
    difference |= (candidate.charCodeAt(index) || 0) ^ (expected.charCodeAt(index) || 0);
  }
  return difference === 0;
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
