import { NextRequest, NextResponse } from "next/server";

const webAppUrl = process.env.GOOGLE_SHEETS_WEBAPP_URL;
const token = process.env.TRACKER_API_TOKEN;

function configured() {
  return Boolean(webAppUrl && token);
}

export async function GET() {
  if (!configured()) {
    return NextResponse.json(
      { error: "Google Sheets sync is not configured. See README.md and .env.example." },
      { status: 503 }
    );
  }
  const url = new URL(webAppUrl!);
  url.searchParams.set("token", token!);
  const response = await fetch(url, { cache: "no-store" });
  const text = await response.text();
  if (!response.ok) return NextResponse.json({ error: text }, { status: response.status });
  try {
    return NextResponse.json(JSON.parse(text));
  } catch {
    return NextResponse.json({ error: text }, { status: 502 });
  }
}

export async function PUT(req: NextRequest) {
  if (!configured()) {
    return NextResponse.json(
      { error: "Google Sheets sync is not configured. See README.md and .env.example." },
      { status: 503 }
    );
  }
  const body = await req.json();
  const response = await fetch(webAppUrl!, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ ...body, token }),
    cache: "no-store",
  });
  const text = await response.text();
  if (!response.ok) return NextResponse.json({ error: text }, { status: response.status });
  try {
    return NextResponse.json(JSON.parse(text));
  } catch {
    return NextResponse.json({ error: text }, { status: 502 });
  }
}
