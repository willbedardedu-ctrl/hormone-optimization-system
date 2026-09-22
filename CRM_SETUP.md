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
2. Delete any starter code and paste this in:

   ```javascript
   function doGet(e) {
     var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
     var data = e.parameter;

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

     return ContentService
       .createTextOutput(JSON.stringify({ status: 'ok' }))
       .setMimeType(ContentService.MimeType.JSON);
   }
   ```

   Note: this uses `doGet` (not `doPost`). Apps Script's own redirect
   downgrades POST requests to GET before they reach your script, so the
   site sends the lead data as URL query parameters instead of a POST
   body — `doGet` with `e.parameter` is what actually receives it.

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

## Email notifications (Resend via Vercel)

The Google Sheet is the record of every lead. On top of that, the site
emails you the moment someone submits, so you don't have to watch the
sheet. This runs in a small serverless function (`api/notify.js`)
deployed with the site on Vercel, and the form fires it alongside the
sheet submission. The two are independent — if the email ever fails, the
lead is still in the sheet.

The code is already in the repo. The only thing to configure is the
Resend API key, which lives as a Vercel environment variable so it stays
secret (never in the code or the browser):

1. **Get a Resend API key** — sign in at [resend.com](https://resend.com)
   → **API Keys → Create API Key** → copy it (starts with `re_`, shown
   once).
2. **Add it to Vercel** — open the `tbw` project → **Settings →
   Environment Variables** → add:
   - Name: `RESEND_API_KEY`, Value: your `re_...` key (apply to all
     environments)
   - Optionally `NOTIFY_EMAIL` = the address to alert. If you skip it, it
     falls back to the default in `api/notify.js`. Use the email your
     Resend account is registered under — the `onboarding@resend.dev`
     sender can only deliver to your own account email until you verify a
     domain.
3. **Redeploy** so the new env var is picked up — Vercel → Deployments →
   latest → **Redeploy** (or just push any commit).
4. **Test** — submit the form once and confirm both a new sheet row *and*
   an email arrive.

To send from your own domain later (e.g. `apply@trainedbywill.com`
instead of `onboarding@resend.dev`): in Resend go to **Domains → Add
Domain**, add the DNS records, then change the `from` address in
`api/notify.js`.
