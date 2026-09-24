// Client side of the original Netlify setup: the browser only talks to our own
// /api/auth and /api/tracker routes. The server checks AUTH_USERNAME / AUTH_PASSWORD
// and holds GOOGLE_SHEETS_WEBAPP_URL + TRACKER_API_TOKEN (see src/app/api/*).

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

export type Creds = { username: string; password: string };

function authHeader(c: Creds) {
  return btoa(unescape(encodeURIComponent(c.username + ":" + c.password)));
}

// Checks the login against the .env credentials on the server. No Google call.
export async function login(c: Creds) {
  const res = await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(c),
  });
  const json = await res.json().catch(() => ({}));
  if (res.status === 401) throw new Error("unauthorized");
  if (!res.ok) throw new Error(json.error || "Login failed.");
  return true;
}

async function tracker(c: Creds, init: RequestInit = {}) {
  const res = await fetch("/api/tracker", {
    cache: "no-store",
    ...init,
    headers: { ...(init.headers || {}), "X-Tracker-Auth": authHeader(c) },
  });
  const json = await res.json().catch(() => ({}));
  if (res.status === 401 && json.source === "tracker-auth") throw new Error("unauthorized");
  if (!res.ok || json.error) throw new Error(json.error || "Unable to load tracker.");
  return json;
}

export const loadTracker = (c: Creds): Promise<TrackerPayload> => tracker(c);

export const updateTracker = (c: Creds, body: Record<string, unknown>) =>
  tracker(c, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
