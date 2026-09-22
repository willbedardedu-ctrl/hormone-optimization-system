# Wiring the questionnaire to your "Coaching Leads" CRM

Submissions from `index.html` are sent to a Google Sheet so you can
open it any time and see who applied, then follow up. On every
submission you also get an email notification (via Resend) so you know
the moment someone fills out the form.

The sheet has already been created in your Google Drive:
**Coaching Leads** — https://docs.google.com/spreadsheets/d/1joObxfCpVkqJrj0Dw9D_0xRWr9UQbjTsY9zPDwLlytc/edit

It has columns: `Timestamp, Name, Email, Phone, Instagram, Age, Goal,
Committed, Obstacle, Budget, Status`. Add your own notes in the `Status`
column as you follow up (e.g. "contacted", "booked call", "closed").

The only piece left is a small Google Apps Script that receives form
submissions and appends them as new rows. This step has to be done once,
by hand, inside the Sheet's own editor — Google requires a human to
authorize any script that writes to your account, so it can't be scripted
from here.

## One-time setup (~3 minutes)

1. Open the sheet (link above) → **Extensions → Apps Script**.
2. Delete any starter code and paste this in. It does two things on every
   submission: appends a row to the sheet **and** emails you a
   notification through Resend. Fill in the two values at the top of
   `sendNotification` (your Resend API key and the email to notify) —
   see the "Resend setup" section below for where the API key comes from.

   ```javascript
   function doGet(e) {
     var data = e.parameter;

     // 1) Append the lead to the sheet (this always runs first, so the
     //    row is saved even if the email step below ever fails).
     var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
     sheet.appendRow([
       new Date(),
       data.name || '',
       data.email || '',
       data.phone || '',
       data.instagram || '',
       data.age || '',
       data.goal || '',
       data.committed || '',
       data.obstacle || '',
       data.budget || '',
       '' // Status - fill in manually as you follow up
     ]);

     // 2) Send yourself an email notification via Resend.
     try {
       sendNotification(data);
     } catch (err) {
       // Never let an email failure lose the lead — it's already in the sheet.
       console.error('Resend notification failed: ' + err);
     }

     return ContentService
       .createTextOutput(JSON.stringify({ status: 'ok' }))
       .setMimeType(ContentService.MimeType.JSON);
   }

   function sendNotification(data) {
     var RESEND_API_KEY = 'PASTE_YOUR_RESEND_API_KEY_HERE'; // starts with re_
     var NOTIFY_EMAIL   = 'you@example.com';                // where you want to be notified
     // Until you verify your own domain in Resend, keep this exact "from"
     // address — Resend lets onboarding@resend.dev send to your own
     // account email with no domain setup. Swap it for your domain later.
     var FROM = 'Trained by Will <onboarding@resend.dev>';

     var rows = [
       ['Name', data.name], ['Email', data.email], ['Phone', data.phone],
       ['Instagram', data.instagram], ['Goal', data.goal], ['Age', data.age],
       ['Committed', data.committed], ['Biggest obstacle', data.obstacle],
       ['Investment level', data.budget]
     ];
     var html = '<h2>New coaching application</h2>';
     rows.forEach(function (r) {
       html += '<p><strong>' + r[0] + ':</strong> ' + (r[1] || '-') + '</p>';
     });

     var payload = {
       from: FROM,
       to: [NOTIFY_EMAIL],
       subject: 'New application: ' + (data.name || 'Someone') + (data.goal ? ' — ' + data.goal : ''),
       html: html
     };
     if (data.email) payload.reply_to = data.email; // reply goes straight to the applicant

     UrlFetchApp.fetch('https://api.resend.com/emails', {
       method: 'post',
       contentType: 'application/json',
       headers: { Authorization: 'Bearer ' + RESEND_API_KEY },
       payload: JSON.stringify(payload),
       muteHttpExceptions: true
     });
   }
   ```

   Note: this uses `doGet` (not `doPost`). Apps Script's own redirect
   downgrades POST requests to GET before they reach your script, so the
   site sends the lead data as URL query parameters instead of a POST
   body — `doGet` with `e.parameter` is what actually receives it. The
   Resend API key lives only in this server-side script, never in the
   website, so it stays private.

## Resend setup (~2 minutes)

1. Sign in at [resend.com](https://resend.com) (free tier is plenty).
2. Go to **API Keys → Create API Key**, give it a name, and copy the key
   (it starts with `re_`). You only see it once.
3. Paste it into `RESEND_API_KEY` in the script above, and set
   `NOTIFY_EMAIL` to the address where you want the alerts (use the same
   email your Resend account is registered under — `onboarding@resend.dev`
   is only allowed to send to your own account email until you verify a
   domain).
4. Later, to send from your own domain (e.g. `apply@trainedbywill.com`):
   in Resend go to **Domains → Add Domain**, add the DNS records it gives
   you, then change `FROM` in the script to use that address.

When you edit the script after this, remember to push a **New version**
(see the note at the bottom) so the change goes live.

3. Click **Deploy → New deployment**.
4. Click the gear icon next to "Select type" → choose **Web app**.
5. Set:
   - **Execute as**: Me
   - **Who has access**: Anyone
6. Click **Deploy**, then authorize it (Google will warn it's an
   unverified app — this is expected since it's your own script; click
   **Advanced → Go to (project name)** to proceed).
7. Copy the **Web app URL** it gives you (ends in `/exec`).
8. In `index.html`, find this line near the top of the `<script>`
   block:

   ```javascript
   const SHEET_ENDPOINT = 'PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE';
   ```

   Replace the placeholder with the URL you copied, then commit/push.

## Testing

Submit the form once with test data and confirm a new row appears in the
Sheet. If it doesn't show up, re-open the Apps Script editor, check
**Executions** (left sidebar) for errors, and make sure the deployment's
"Who has access" is set to **Anyone**.

If you ever redeploy the script (not just edit it — actually create a
*new* deployment), you'll get a new URL and will need to update
`SHEET_ENDPOINT` again. Editing the existing deployment's code and saving
does **not** change the URL.

**Important:** if you edit the script's code after it's already deployed,
those changes do **not** take effect at the existing `/exec` URL until you
push a new version. Go to **Deploy → Manage deployments**, click the
pencil (edit) icon on the active deployment, set **Version** to
**New version**, and click **Deploy** again. The URL stays the same.
