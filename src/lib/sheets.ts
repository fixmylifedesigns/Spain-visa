// Talks straight to the Google Apps Script bridge (scripts/google-apps-script.gs).
// The script checks TRACKER_API_TOKEN on every read and write, so no server is needed:
// the token is typed in once and kept only in this browser.

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

const KEY = "hub-sheets";
const DEFAULT_URL = process.env.NEXT_PUBLIC_SHEETS_URL || "";

export type Creds = { url: string; token: string };

export function getCreds(): Creds | null {
  try {
    const c = JSON.parse(localStorage.getItem(KEY) || "null");
    if (c?.token && (c.url || DEFAULT_URL)) return { url: c.url || DEFAULT_URL, token: c.token };
  } catch {}
  return null;
}
export function saveCreds(c: Creds) {
  try { localStorage.setItem(KEY, JSON.stringify(c)); } catch {}
}
export function clearCreds() {
  try { localStorage.removeItem(KEY); } catch {}
}
export const defaultUrl = DEFAULT_URL;

async function parse(res: Response) {
  const text = await res.text();
  let json: any;
  try { json = JSON.parse(text); } catch { throw new Error("Google Apps Script returned an invalid response. Check the /exec URL."); }
  if (json?.error) {
    throw new Error(String(json.error).toLowerCase() === "unauthorized" ? "unauthorized" : String(json.error));
  }
  return json;
}

export async function loadTracker(c: Creds): Promise<TrackerPayload> {
  const url = new URL(c.url);
  url.searchParams.set("token", c.token);
  return parse(await fetch(url, { cache: "no-store" }));
}

// text/plain keeps this a "simple" request, so the browser doesn't need a CORS preflight.
export async function updateTracker(c: Creds, body: Record<string, unknown>) {
  return parse(await fetch(c.url, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ ...body, token: c.token }),
    cache: "no-store",
  }));
}
