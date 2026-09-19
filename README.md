# Spain Move Master Tracker

A Next.js tracker for Irving and Moeno's Spain relocation plan. The Google Sheet is the source of truth and the web app reads/writes checklist status and notes through a small Google Apps Script bridge.

## Included workflows

- Spain Digital Nomad Visa (W-2 / posted-worker structure)
- California registered domestic partnership
- Moeno's DNV family-member application
- Spain arrival: housing, padrón, TIE
- Spain/U.S. tax and social-security setup
- Mui's move from Japan to Spain
- Two-year citizenship preparation using Dominican nationality
- NY → Dominican Republic licence planning and DGT risk check

## Google Sheet

Created sheet ID:

`1V6nOlPEjoIVLC_Jc_Q-9lFYhsVX19EU_bRoQq5aF4mg`

Tabs:

- `Checklist` — primary source of truth used by the app
- `Timeline` — lead-time windows and sequencing
- `Sources` — official/reference URLs
- `Warnings` — legal/process risks to keep visible
- `Settings` — app/case configuration
- `Uploads` — metadata for Drive documents linked to checklist items

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Connect the Sheet to the app

The repo intentionally keeps Google credentials out of the browser. It uses a Google Apps Script Web App as a thin authenticated bridge.

1. Open the Google Sheet.
2. Choose **Extensions → Apps Script**.
3. Replace the default script with `scripts/google-apps-script.gs`.
4. In **Project Settings → Script Properties**, add:
   - key: `TRACKER_API_TOKEN`
   - value: a long random secret
5. Choose **Deploy → New deployment → Web app**.
6. Execute as: **Me**.
7. Access: **Anyone with the link**.
8. Copy the deployment `/exec` URL.
9. Add to `.env.local`:

```env
AUTH_USERNAME=your-private-username
AUTH_PASSWORD=your-private-password
GOOGLE_SHEET_ID=1V6nOlPEjoIVLC_Jc_Q-9lFYhsVX19EU_bRoQq5aF4mg
GOOGLE_SHEETS_WEBAPP_URL=https://script.google.com/macros/s/...../exec
TRACKER_API_TOKEN=the-same-long-secret
```

The login username/password are validated server-side against `AUTH_USERNAME` and `AUTH_PASSWORD`. After a successful login, this build stores the entered username and password in browser `localStorage` so the login persists on that device. The protected tracker API validates those credentials on every request. The Apps Script separately verifies `TRACKER_API_TOKEN` on Sheet read/write requests.

## Data flow

```text
Browser
  ↓ /api/tracker
Next.js server route
  ↓ token-protected request
Google Apps Script Web App
  ↓
Spain Move Master Tracker Google Sheet
```

## App behavior

- Reads the full `Checklist`, `Timeline`, `Sources`, `Warnings`, `Settings`, and `Uploads` tabs.
- Changing a status writes directly back to the `Checklist` tab.
- Notes are saved when the notes field loses focus.
- The Google Sheet can also be edited directly; use **Refresh from Sheet** in the app to reload it.
- JSON export remains available as a backup/snapshot.

## Important legal-design decisions in this build

- California domestic partnership is the **primary relationship-document route** for Moeno.
- The older plan to first register a Spanish `pareja de hecho` is not the default route anymore.
- The W-2 DNV workflow treats Irving as a **U.S. employee temporarily posted/assigned to Spain**, with the SSA Certificate of Coverage and a lawyer-reviewed employer posting letter as critical-path items.
- Citizenship is tracked separately from tax residence; travel/absence history and proof of continuous legal residence are preserved from day one.
- The DR → Spain driving-licence strategy is explicitly flagged as high risk until the DGT confirms treatment of a Dominican licence obtained by exchange from New York.

## Deployment

The project is compatible with standard Next.js hosting such as Netlify or Vercel. Add all five environment variables from `.env.example` to the hosting provider before deploying.

## Security

Do not commit `.env.local`, `AUTH_PASSWORD`, or the Apps Script token. The created Google Sheet should remain private to the Google account unless you deliberately share it. This build intentionally stores the entered username/password in browser `localStorage` as requested; that is convenient but less secure than an HttpOnly cookie/session because JavaScript running on the site can read localStorage.
