// Google Calendar Integration
// Requires OAuth2 credentials in .env

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const TOKEN_PATH = path.join(__dirname, 'token.json');
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');

// Scopes needed
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly', 'https://www.googleapis.com/auth/calendar.events'];

let oauth2Client = null;

function getOAuth2Client() {
  if (oauth2Client) return oauth2Client;

  // Check for credentials.json first, then .env vars
  if (fs.existsSync(CREDENTIALS_PATH)) {
    const creds = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
    const { client_id, client_secret } = creds.installed || creds.web;
    oauth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:8080/api/calendar/oauth/callback'
    );

    // Load saved token if exists
    if (fs.existsSync(TOKEN_PATH)) {
      const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
      oauth2Client.setCredentials(token);
    }

    return oauth2Client;
  }

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:8080/api/calendar/oauth/callback'
    );

    if (fs.existsSync(TOKEN_PATH)) {
      const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
      oauth2Client.setCredentials(token);
    }

    return oauth2Client;
  }

  return null;
}

function isAuthenticated() {
  const client = getOAuth2Client();
  if (!client) return false;
  const creds = client.credentials;
  return !!(creds && creds.access_token);
}

// Generate auth URL for initial setup
function getAuthUrl() {
  const client = getOAuth2Client();
  if (!client) return null;
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });
}

// Exchange code for token
async function saveToken(code) {
  const client = getOAuth2Client();
  if (!client) throw new Error('OAuth2 not configured');
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
  return tokens;
}

// Get busy time slots for a date range
async function getBusySlots(startDate, endDate) {
  if (!isAuthenticated()) return [];

  const client = getOAuth2Client();
  const calendar = google.calendar({ version: 'v3', auth: client });

  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

  try {
    const res = await calendar.freebusy.query({
      requestBody: {
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        items: [{ id: calendarId }],
      },
    });

    const busy = res.data.calendars[calendarId]?.busy || [];
    return busy.map(slot => ({
      start: new Date(slot.start),
      end: new Date(slot.end),
    }));
  } catch (err) {
    console.error('Error fetching busy slots:', err.message);
    return [];
  }
}

// Create a calendar event (booking)
async function createEvent(booking) {
  if (!isAuthenticated()) {
    throw new Error('Google Calendar not authenticated. Complete OAuth setup first.');
  }

  const client = getOAuth2Client();
  const calendar = google.calendar({ version: 'v3', auth: client });
  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

  const { name, email, company, service, date, timeStart, timeEnd, notes } = booking;

  const startDateTime = new Date(`${date}T${timeStart}:00+08:00`);
  const endDateTime = new Date(`${date}T${timeEnd}:00+08:00`);

  const event = {
    summary: `Meeting with ${name}${company ? ` (${company})` : ''}`,
    description: [
      `Contact: ${name}`,
      `Email: ${email}`,
      phone ? `Phone/WhatsApp: ${phone}` : '',
      company ? `Company: ${company}` : '',
      service ? `Service: ${service}` : '',
      notes ? `Notes: ${notes}` : '',
      '',
      'Booked via Minow Website',
    ].filter(Boolean).join('\n'),
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: 'Asia/Hong_Kong',
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: 'Asia/Hong_Kong',
    },
    attendees: [{ email }],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 30 },
      ],
    },
  };

  const res = await calendar.events.insert({
    calendarId,
    requestBody: event,
    sendUpdates: 'all', // Sends email invite to attendee
  });

  return res.data;
}

// Get available working hours from .env (configurable)
function getWorkingHours() {
  return {
    start: process.env.BOOKING_START_HOUR || '09:00',
    end: process.env.BOOKING_END_HOUR || '18:00',
    slotDuration: parseInt(process.env.BOOKING_SLOT_DURATION) || 60, // minutes
    workingDays: (process.env.BOOKING_WORKING_DAYS || '1,2,3,4,5').split(',').map(Number), // Mon-Fri
    minBookingAheadHours: parseInt(process.env.BOOKING_MIN_AHEAD_HOURS) || 24,
    maxBookingDays: parseInt(process.env.BOOKING_MAX_DAYS) || 30,
  };
}

module.exports = {
  getOAuth2Client,
  isAuthenticated,
  getAuthUrl,
  saveToken,
  getBusySlots,
  createEvent,
  getWorkingHours,
};
