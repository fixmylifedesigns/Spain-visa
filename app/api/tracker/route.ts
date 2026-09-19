import { NextRequest, NextResponse } from "next/server";
import { requestIsAuthenticated } from "@/lib/auth";

const webAppUrl = process.env.GOOGLE_SHEETS_WEBAPP_URL;
const token = process.env.TRACKER_API_TOKEN;

function configured() {
  return Boolean(webAppUrl && token);
}

function trackerUnauthorized() {
  return NextResponse.json(
    {
      error:
        "Website login authentication failed for /api/tracker. Log out and sign in again after the latest deploy.",
      source: "tracker-auth",
    },
    { status: 401 }
  );
}

function sheetsNotConfigured() {
  return NextResponse.json(
    {
      error:
        "Google Sheets sync is not configured. GOOGLE_SHEETS_WEBAPP_URL and TRACKER_API_TOKEN must both be set in Netlify.",
      source: "tracker-config",
    },
    { status: 503 }
  );
}

function parseAppsScriptResponse(text: string, status: number) {
  let parsed: any;

  try {
    parsed = JSON.parse(text);
  } catch {
    return NextResponse.json(
      {
        error: "Google Apps Script returned an invalid response.",
        detail: text.slice(0, 500),
        source: "apps-script",
      },
      { status: status >= 400 ? status : 502 }
    );
  }

  if (parsed?.error) {
    const message =
      String(parsed.error).toLowerCase() === "unauthorized"
        ? "Google Apps Script rejected TRACKER_API_TOKEN. Make sure the Script Property named TRACKER_API_TOKEN exactly matches the TRACKER_API_TOKEN value in Netlify, then redeploy the Apps Script if needed."
        : String(parsed.error);

    return NextResponse.json(
      {
        error: message,
        source: "apps-script",
      },
      { status: status >= 400 ? status : 502 }
    );
  }

  if (status >= 400) {
    return NextResponse.json(
      {
        error: "Google Apps Script request failed.",
        detail: parsed,
        source: "apps-script",
      },
      { status }
    );
  }

  return NextResponse.json(parsed);
}

export async function GET(req: NextRequest) {
  if (!requestIsAuthenticated(req)) {
    return trackerUnauthorized();
  }

  if (!configured()) {
    return sheetsNotConfigured();
  }

  const url = new URL(webAppUrl!);
  url.searchParams.set("token", token!);

  const response = await fetch(url, { cache: "no-store" });
  const text = await response.text();

  return parseAppsScriptResponse(text, response.status);
}

export async function PUT(req: NextRequest) {
  if (!requestIsAuthenticated(req)) {
    return trackerUnauthorized();
  }

  if (!configured()) {
    return sheetsNotConfigured();
  }

  const body = await req.json();

  const response = await fetch(webAppUrl!, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ ...body, token }),
    cache: "no-store",
  });

  const text = await response.text();

  return parseAppsScriptResponse(text, response.status);
}
