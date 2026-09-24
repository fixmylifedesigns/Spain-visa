import { NextRequest, NextResponse } from "next/server";
import { authConfigured, validCredentials } from "@/lib/auth";

export async function POST(req: NextRequest) {
  if (!authConfigured()) {
    return NextResponse.json(
      { error: "Authentication is not configured." },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const username = String(body.username || "");
  const password = String(body.password || "");

  if (!validCredentials(username, password)) {
    return NextResponse.json(
      { error: "Invalid username or password." },
      { status: 401 }
    );
  }

  return NextResponse.json({ ok: true });
}
