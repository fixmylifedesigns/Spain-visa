import { NextRequest } from "next/server";

function expectedCredentials() {
  return {
    username: process.env.AUTH_USERNAME || "",
    password: process.env.AUTH_PASSWORD || "",
  };
}

export function authConfigured() {
  const { username, password } = expectedCredentials();
  return Boolean(username && password);
}

export function validCredentials(username: string, password: string) {
  const expected = expectedCredentials();

  if (!authConfigured()) {
    return false;
  }

  return username === expected.username && password === expected.password;
}

export function requestIsAuthenticated(req: NextRequest) {
  const header = req.headers.get("x-tracker-auth");

  if (!header) {
    return false;
  }

  try {
    const decoded = Buffer.from(header, "base64").toString("utf8");
    const separator = decoded.indexOf(":");

    if (separator === -1) {
      return false;
    }

    const username = decoded.slice(0, separator);
    const password = decoded.slice(separator + 1);

    return validCredentials(username, password);
  } catch {
    return false;
  }
}
