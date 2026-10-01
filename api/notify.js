// Vercel serverless function that runs on every form submission. It does two
// things, each independent so one failing never blocks the other (or the
// Google Sheet capture, which happens separately on the client):
//   1) Emails you a notification via Resend.
//   2) Texts the applicant their booking link via Twilio.
//
// All secrets/config come from Vercel environment variables
// (Project -> Settings -> Environment Variables), never from the code:
//   RESEND_API_KEY       (email)  your Resend key, starts with "re_"
//   NOTIFY_EMAIL         (email)  where your alert goes (defaults below)
//   TWILIO_ACCOUNT_SID   (sms)    starts with "AC..."
//   TWILIO_AUTH_TOKEN    (sms)    your Twilio auth token
//   TWILIO_FROM_NUMBER   (sms)    your Twilio phone number, E.164 (+1512...)
//   BOOKING_URL          (sms)    your Calendly / scheduling link
// Any channel whose variables aren't set is simply skipped.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const d = req.body || {};
  const result = {};

  result.email = await sendEmail(d).catch((e) => ({ ok: false, error: String(e) }));
  result.sms = await sendSms(d).catch((e) => ({ ok: false, error: String(e) }));

  return res.status(200).json({ status: 'ok', ...result });
}

// ---- Email (Resend) -------------------------------------------------------
async function sendEmail(d) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { skipped: 'RESEND_API_KEY not set' };
  const notifyEmail = process.env.NOTIFY_EMAIL || 'willbedard.edu@gmail.com';

  const fields = [
    ['Name', d.name], ['Email', d.email], ['Phone', d.phone],
    ['Instagram', d.instagram], ['Goal', d.goal], ['Age', d.age],
    ['Committed', d.committed], ['Biggest obstacle', d.obstacle],
    ['Investment level', d.budget]
  ];
  const html = '<h2>New coaching application</h2>' +
    fields.map(([k, v]) => `<p><strong>${k}:</strong> ${escapeHtml(v || '-')}</p>`).join('');

  const payload = {
    from: 'Trained by Will <onboarding@resend.dev>',
    to: [notifyEmail],
    subject: `New application: ${d.name || 'Someone'}${d.goal ? ' - ' + d.goal : ''}`,
    html
  };
  if (d.email) payload.reply_to = d.email;

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!r.ok) return { ok: false, error: await r.text() };
  return { ok: true };
}

// ---- SMS (Twilio) ---------------------------------------------------------
async function sendSms(d) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  const bookingUrl = process.env.BOOKING_URL;
  if (!sid || !token || !from || !bookingUrl) {
    return { skipped: 'Twilio env vars or BOOKING_URL not set' };
  }

  const to = toE164(d.phone);
  if (!to) return { skipped: 'no usable phone number' };

  const firstName = (d.name || '').trim().split(/\s+/)[0] || 'there';
  const body =
    `Hey ${firstName}, thanks for applying to Trained by Will. ` +
    `Grab a time for your call here: ${bookingUrl} - Will`;

  const form = new URLSearchParams({ To: to, From: from, Body: body });
  const auth = Buffer.from(`${sid}:${token}`).toString('base64');

  const r = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: form.toString()
    }
  );
  if (!r.ok) return { ok: false, error: await r.text() };
  return { ok: true, to };
}

// Normalize a free-typed phone number to E.164. Assumes US (+1) for bare
// 10-digit numbers; international entries should be typed with their + prefix.
function toE164(raw) {
  if (!raw) return null;
  const s = String(raw).trim();
  if (s.startsWith('+')) {
    const rest = s.slice(1).replace(/\D/g, '');
    return rest ? '+' + rest : null;
  }
  const digits = s.replace(/\D/g, '');
  if (digits.length === 10) return '+1' + digits;
  if (digits.length === 11 && digits.startsWith('1')) return '+' + digits;
  return digits ? '+' + digits : null;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"]/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]
  ));
}
