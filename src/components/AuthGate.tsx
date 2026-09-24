"use client";

import { createContext, FormEvent, ReactNode, useContext, useEffect, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { LangToggle, useLang } from "@/components/Lang";
import { login, type Creds } from "@/lib/sheets";

// Same keys as the original Netlify AuthGate, so a saved login keeps working.
const USERNAME_KEY = "spain-visa:username";
const PASSWORD_KEY = "spain-visa:password";

const AuthContext = createContext<{ creds: Creds; logout: () => void } | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthGate>");
  return ctx;
}

export default function AuthGate({ children }: { children: ReactNode }) {
  const { t } = useLang();
  const [checking, setChecking] = useState(true);
  const [creds, setCreds] = useState<Creds | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function message(err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg === "unauthorized") return t({ en: "Wrong username or password.", ja: "ユーザー名またはパスワードが違います。" });
    return msg || t({ en: "Login failed.", ja: "ログインに失敗しました。" });
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

    const saved = { username: savedUsername, password: savedPassword };
    login(saved)
      .then(() => setCreds(saved))
      .catch((err) => {
        if (err instanceof Error && err.message === "unauthorized") {
          window.localStorage.removeItem(USERNAME_KEY);
          window.localStorage.removeItem(PASSWORD_KEY);
        } else {
          setError(message(err));
        }
      })
      .finally(() => setChecking(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const next = { username: username.trim(), password };
      await login(next);
      window.localStorage.setItem(USERNAME_KEY, next.username);
      window.localStorage.setItem(PASSWORD_KEY, next.password);
      setCreds(next);
    } catch (err) {
      setError(message(err));
    } finally {
      setSubmitting(false);
    }
  }

  function logout() {
    window.localStorage.removeItem(USERNAME_KEY);
    window.localStorage.removeItem(PASSWORD_KEY);
    setPassword("");
    setCreds(null);
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f4ec] text-stone-600">
        <p className="text-sm">{t({ en: "Checking login…", ja: "ログインを確認中…" })}</p>
      </main>
    );
  }

  if (!creds) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f4ec] px-4 text-stone-800">
        <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <div className="flex items-start justify-between">
              <div className="mb-3 inline-flex rounded-full bg-stone-100 p-2">
                <LockKeyhole className="h-5 w-5 text-stone-700" />
              </div>
              <LangToggle />
            </div>
            <h1 className="font-serif text-2xl font-semibold text-stone-900">
              {t({ en: "Spain Move Tracker", ja: "スペイン移住トラッカー" })}
            </h1>
            <p className="mt-1 text-sm text-stone-500">
              {t({ en: "Sign in to access the private case tracker.", ja: "非公開のトラッカーにアクセスするにはサインインしてください。" })}
            </p>
          </div>

          <label className="mb-1 block text-xs font-medium text-stone-600">{t({ en: "Username", ja: "ユーザー名" })}</label>
          <input
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="mb-4 w-full rounded border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-600"
            required
          />

          <label className="mb-1 block text-xs font-medium text-stone-600">{t({ en: "Password", ja: "パスワード" })}</label>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-600"
            required
          />

          {error && <p className="mt-3 text-sm text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 w-full rounded bg-stone-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {submitting ? t({ en: "Signing in…", ja: "サインイン中…" }) : t({ en: "Sign in", ja: "サインイン" })}
          </button>

          <p className="mt-4 text-[11px] leading-relaxed text-stone-400">
            {t({ en: "This build remembers the username and password in this browser's localStorage.", ja: "ユーザー名とパスワードはこのブラウザ（localStorage）に保存されます。" })}
          </p>
        </form>
      </main>
    );
  }

  return <AuthContext.Provider value={{ creds, logout }}>{children}</AuthContext.Provider>;
}
