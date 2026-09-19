"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import { LockKeyhole, LogOut } from "lucide-react";

const USERNAME_KEY = "spain-visa:username";
const PASSWORD_KEY = "spain-visa:password";

function basicAuth(username: string, password: string) {
  return "Basic " + btoa(unescape(encodeURIComponent(username + ":" + password)));
}

export function getStoredAuthHeader() {
  if (typeof window === "undefined") return "";

  const username = window.localStorage.getItem(USERNAME_KEY) || "";
  const password = window.localStorage.getItem(PASSWORD_KEY) || "";

  if (!username || !password) return "";

  return basicAuth(username, password);
}

export default function AuthGate({ children }: { children: ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function validate(user: string, pass: string) {
    const response = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user, password: pass }),
    });

    const json = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(json.error || "Login failed.");
    }

    return true;
  }

  useEffect(() => {
    const savedUsername = window.localStorage.getItem(USERNAME_KEY) || "";
    const savedPassword = window.localStorage.getItem(PASSWORD_KEY) || "";

    if (!savedUsername || !savedPassword) {
      setChecking(false);
      return;
    }

    setUsername(savedUsername);
    setPassword(savedPassword);

    validate(savedUsername, savedPassword)
      .then(() => setAuthenticated(true))
      .catch(() => {
        window.localStorage.removeItem(USERNAME_KEY);
        window.localStorage.removeItem(PASSWORD_KEY);
      })
      .finally(() => setChecking(false));
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await validate(username, password);

      window.localStorage.setItem(USERNAME_KEY, username);
      window.localStorage.setItem(PASSWORD_KEY, password);

      setAuthenticated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  function logout() {
    window.localStorage.removeItem(USERNAME_KEY);
    window.localStorage.removeItem(PASSWORD_KEY);
    setPassword("");
    setAuthenticated(false);
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f4ec] text-stone-600">
        <p className="text-sm">Checking login…</p>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f4ec] px-4 text-stone-800">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm rounded-lg border border-stone-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-5">
            <div className="mb-3 inline-flex rounded-full bg-stone-100 p-2">
              <LockKeyhole className="h-5 w-5 text-stone-700" />
            </div>
            <h1 className="font-serif text-2xl font-semibold text-stone-900">
              Spain Move Tracker
            </h1>
            <p className="mt-1 text-sm text-stone-500">
              Sign in to access the private case tracker.
            </p>
          </div>

          <label className="mb-1 block text-xs font-medium text-stone-600">
            Username
          </label>
          <input
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="mb-4 w-full rounded border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-600"
            required
          />

          <label className="mb-1 block text-xs font-medium text-stone-600">
            Password
          </label>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-600"
            required
          />

          {error && (
            <p className="mt-3 text-sm text-red-700">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 w-full rounded bg-stone-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>

          <p className="mt-4 text-[11px] leading-relaxed text-stone-400">
            This build remembers the username and password in this browser's
            localStorage.
          </p>
        </form>
      </main>
    );
  }

  return (
    <>
      <div className="fixed right-3 top-3 z-50">
        <button
          onClick={logout}
          className="inline-flex items-center gap-1.5 rounded border border-stone-300 bg-white/95 px-2.5 py-1.5 text-xs font-medium text-stone-700 shadow-sm"
        >
          <LogOut className="h-3.5 w-3.5" />
          Log out
        </button>
      </div>
      {children}
    </>
  );
}
