// Vercel serverless function: emails a notification via Resend on each form
// submission. The Google Sheet capture is unchanged and independent of this —
// if this ever fails, the lead is still saved to the sheet.
//
// Secrets/config come from Vercel environment variables
// (Project → Settings → Environment Variables), never from the code:
//   RESEND_API_KEY  (required) — your Resend API key, starts with "re_"
//   NOTIFY_EMAIL    (optional) — where alerts go; defaults below
//
// Until you verify your own domain in Resend, keep the onboarding@resend.dev
// sender — it can only deliver to the email your Resend account is registered
// under, so NOTIFY_EMAIL must match that address.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const notifyEmail = process.env.NOTIFY_EMAIL || 'willbedard.edu@gmail.com';
  if (!apiKey) {
    return res.status(500).json({ error: 'RESEND_API_KEY is not set' });
  }

  const d = req.body || {};
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
    subject: `New application: ${d.name || 'Someone'}${d.goal ? ' — ' + d.goal : ''}`,
    html
  };
  if (d.email) payload.reply_to = d.email;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    if (!r.ok) {
      return res.status(502).json({ error: 'Resend error', detail: await r.text() });
    }
    return res.status(200).json({ status: 'ok' });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"]/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]
  ));
}
