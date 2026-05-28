require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
const calendar = require('./google-calendar');

const app = express();
app.disable('x-powered-by');
const PORT = process.env.PORT || 8080;

const SENSITIVE_FILES = new Set([
  '.env',
  'token.json',
  'credentials.json',
  'package.json',
  'package-lock.json',
  'server.js',
  'google-calendar.js',
]);

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function cleanHeaderText(value) {
  return String(value ?? '').replace(/[\r\n]+/g, ' ').trim();
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use((req, res, next) => {
  const requestedName = path.basename(req.path).toLowerCase();
  if (SENSITIVE_FILES.has(requestedName)) {
    return res.status(404).send('Not found');
  }
  return next();
});
app.use(express.static(path.join(__dirname)));

// ===== Google Calendar API Routes =====

// Check if calendar is configured
app.get('/api/calendar/status', (req, res) => {
  res.json({
    configured: calendar.isAuthenticated(),
    workingHours: calendar.getWorkingHours(),
  });
});

// Start OAuth flow
app.get('/api/calendar/oauth', (req, res) => {
  const url = calendar.getAuthUrl();
  if (!url) {
    return res.status(500).json({ error: 'Google Calendar not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env' });
  }
  res.redirect(url);
});

// OAuth callback
app.get('/api/calendar/oauth/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('Missing authorization code');
  try {
    await calendar.saveToken(code);
    res.send('<html><body style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;background:#0a1527;color:#00d4fe"><div style="text-align:center"><h1>✓ Connected!</h1><p>Google Calendar is now linked. You can close this tab.</p></div></body></html>');
  } catch (err) {
    res.status(500).send('OAuth error: ' + err.message);
  }
});

// Get available slots for a date range
app.get('/api/calendar/slots', async (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) return res.status(400).json({ error: 'start and end dates required (YYYY-MM-DD)' });

  const workingHours = calendar.getWorkingHours();
  const startDate = new Date(start);
  const endDate = new Date(end);
  endDate.setHours(23, 59, 59);

  // Cap max range
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + workingHours.maxBookingDays);
  if (endDate > maxDate) return res.status(400).json({ error: `Max booking range is ${workingHours.maxBookingDays} days` });

  // Get busy slots from Google Calendar
  let busySlots = [];
  if (calendar.isAuthenticated()) {
    busySlots = await calendar.getBusySlots(startDate, endDate);
  }

  // Generate available slots per day
  const slots = [];
  const current = new Date(startDate);
  const now = new Date();
  const minAhead = new Date(now.getTime() + workingHours.minBookingAheadHours * 60 * 60 * 1000);

  while (current <= endDate) {
    const dayOfWeek = current.getDay(); // 0=Sun
    const dateStr = `${current.getFullYear()}-${String(current.getMonth()+1).padStart(2,'0')}-${String(current.getDate()).padStart(2,'0')}`;

    if (workingHours.workingDays.includes(dayOfWeek)) {
      const [startH, startM] = workingHours.start.split(':').map(Number);
      const [endH, endM] = workingHours.end.split(':').map(Number);

      const slotStart = new Date(current);
      slotStart.setHours(startH, startM, 0, 0);
      const slotEndLimit = new Date(current);
      slotEndLimit.setHours(endH, endM, 0, 0);

      const cursor = new Date(slotStart);
      while (cursor < slotEndLimit) {
        const slotEnd = new Date(cursor.getTime() + workingHours.slotDuration * 60 * 1000);
        if (slotEnd > slotEndLimit) break;

        // Check if slot is in the past (below min booking ahead)
        const isPast = slotEnd <= minAhead;

        // Check if slot overlaps with any busy period
        const isBusy = busySlots.some(busy => {
          return cursor < busy.end && slotEnd > busy.start;
        });

        slots.push({
          date: dateStr,
          timeStart: `${String(cursor.getHours()).padStart(2, '0')}:${String(cursor.getMinutes()).padStart(2, '0')}`,
          timeEnd: `${String(slotEnd.getHours()).padStart(2, '0')}:${String(slotEnd.getMinutes()).padStart(2, '0')}`,
          available: !isPast && !isBusy,
        });

        cursor.setTime(slotEnd.getTime());
      }
    }
    current.setDate(current.getDate() + 1);
  }

  res.json({ slots, workingHours });
});

// Book a slot
app.post('/api/calendar/book', async (req, res) => {
  const { name, email, phone, company, service, date, timeStart, notes } = req.body;

  if (!name || !email || !date || !timeStart) {
    return res.status(400).json({ error: 'Name, email, date, and time are required.' });
  }

  const workingHours = calendar.getWorkingHours();

  // Calculate timeEnd based on slot duration
  const [h, m] = timeStart.split(':').map(Number);
  const startDT = new Date(`${date}T${timeStart}:00+08:00`);
  const endDT = new Date(startDT.getTime() + workingHours.slotDuration * 60 * 1000);
  const timeEnd = `${String(endDT.getHours()).padStart(2, '0')}:${String(endDT.getMinutes()).padStart(2, '0')}`;

  try {
    if (calendar.isAuthenticated()) {
      const event = await calendar.createEvent({
        name, email, phone, company, service, date, timeStart, timeEnd, notes,
      });
      res.json({ success: true, eventId: event.id });
    } else {
      // Fallback: log booking
      console.log('--- New Booking (Calendar not connected) ---');
      console.log(`Name: ${name}, Email: ${email}`);
      console.log(`Date: ${date}, Time: ${timeStart} - ${timeEnd}`);
      console.log(`Company: ${company || 'N/A'}, Service: ${service || 'N/A'}`);
      console.log(`Notes: ${notes || 'N/A'}`);
      console.log('---');
      res.json({ success: true, note: 'Calendar not connected. Booking logged to console.' });
    }
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ error: 'Failed to create booking. Please try again.' });
  }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  const { name, email, company, service, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  const recipientEmail = process.env.CONTACT_EMAIL;
  if (!recipientEmail) {
    return res.status(500).json({ error: 'Contact email not configured.' });
  }

  try {
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeCompany = escapeHtml(company || 'N/A');
    const safeService = escapeHtml(service || 'N/A');
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');
    const subjectName = cleanHeaderText(name);
    const subjectCompany = cleanHeaderText(company);

    // Create transporter
    // If SMTP credentials are set, use them; otherwise use ethereal test account
    let transporter;
    if (process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_PASS !== 'your-app-password') {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // Fallback: log to console for development
      console.log('--- New Contact Form Submission ---');
      console.log(`To: ${recipientEmail}`);
      console.log(`Name: ${name}`);
      console.log(`Email: ${email}`);
      console.log(`Company: ${company || 'N/A'}`);
      console.log(`Service: ${service || 'N/A'}`);
      console.log(`Message: ${message}`);
      console.log('---');

      return res.json({
        success: true,
        note: 'SMTP not configured. Submission logged to server console. Configure SMTP in .env to enable email delivery.'
      });
    }

    // Send email
    await transporter.sendMail({
      from: `"Minow Website" <${process.env.SMTP_USER}>`,
      to: recipientEmail,
      replyTo: cleanHeaderText(email),
      subject: `New Inquiry from ${subjectName}${subjectCompany ? ` (${subjectCompany})` : ''}`,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f8f8fc; border-radius: 12px;">
          <div style="background: #fff; border-radius: 12px; padding: 32px; border: 1px solid rgba(0,0,0,0.06);">
            <h2 style="margin: 0 0 24px; color: #0a1527; font-size: 1.3rem;">New Contact Form Submission</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #6b7280; font-size: 0.85rem; width: 100px;">Name</td><td style="padding: 8px 0; font-weight: 600; color: #0a1527;">${safeName}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280; font-size: 0.85rem;">Email</td><td style="padding: 8px 0;"><a href="mailto:${safeEmail}" style="color: #00d4fe;">${safeEmail}</a></td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280; font-size: 0.85rem;">Company</td><td style="padding: 8px 0; color: #0a1527;">${safeCompany}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280; font-size: 0.85rem;">Service</td><td style="padding: 8px 0; color: #0a1527;">${safeService}</td></tr>
            </table>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(0,0,0,0.06);">
              <p style="color: #6b7280; font-size: 0.85rem; margin: 0 0 8px;">Message:</p>
              <p style="color: #0a1527; line-height: 1.7; margin: 0;">${safeMessage}</p>
            </div>
          </div>
          <p style="text-align: center; color: #6b7280; font-size: 0.75rem; margin-top: 16px;">Sent from Minow Website Contact Form</p>
        </div>
      `,
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Email send error:', err);
    res.status(500).json({ error: 'Failed to send email. Please try again later.' });
  }
});

// SPA fallback - serve static files (express.static handles this)
// For unknown HTML routes, serve the requested file or index.html
app.use((req, res) => {
  const filePath = path.join(__dirname, req.path);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.sendFile(path.join(__dirname, 'index.html'));
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Minow website running on http://localhost:${PORT}`);
  console.log(`Contact emails will be sent to: ${process.env.CONTACT_EMAIL || 'NOT SET'}`);
  if (!process.env.SMTP_USER || process.env.SMTP_PASS === 'your-app-password') {
    console.log('⚠️  SMTP not configured. Form submissions will be logged to console only.');
    console.log('   Update .env with SMTP credentials to enable email delivery.');
  }
});
