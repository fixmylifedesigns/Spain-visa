// Talks straight to the Google Apps Script bridge (scripts/google-apps-script.gs).
// The script checks the website login (AUTH_USERNAME / AUTH_PASSWORD script properties)
// on every read and write, which replaces the old Netlify /api/auth + /api/tracker routes.

export type DocumentStatus =
  | "not-started" | "requested" | "received" | "apostille-pending"
  | "apostilled" | "translation-pending" | "ready" | "not-applicable";

export type ChecklistItem = {
  id: string;
  workflow: string;
  title: string;
  person: string;
  required: string | boolean;
  apostille: string;
  translation: string;
  validity?: string;
  recommendedLeadTime?: string;
  status: DocumentStatus;
  officialUrl?: string;
  notes: string;
  caution?: string;
  sortOrder?: string | number;
};

export type TrackerPayload = {
  checklist: ChecklistItem[];
  timeline: Record<string, string>[];
  sources: Record<string, string>[];
  warnings: Record<string, string>[];
  settings: Record<string, string>[];
  uploads: Record<string, string>[];
};

export const SHEETS_URL = process.env.NEXT_PUBLIC_SHEETS_URL || "";

export type Creds = { username: string; password: string };

async function call(c: Creds, body: Record<string, unknown>) {
  if (!SHEETS_URL) throw new Error("not-configured");
  // text/plain keeps this a "simple" request, so the browser doesn't need a CORS preflight.
  const res = await fetch(SHEETS_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ ...body, username: c.username, password: c.password }),
    cache: "no-store",
  });
  const text = await res.text();
  let json: any;
  try { json = JSON.parse(text); } catch { throw new Error("Google Apps Script returned an invalid response."); }
  if (json?.error) {
    throw new Error(String(json.error).toLowerCase() === "unauthorized" ? "unauthorized" : String(json.error));
  }
  return json;
}

export const loadTracker = (c: Creds): Promise<TrackerPayload> => call(c, { action: "read" });
export const updateTracker = (c: Creds, body: Record<string, unknown>) => call(c, body);
