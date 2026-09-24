"use client";

import type { ReactNode } from "react";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { useLang, type Bi } from "./Lang";

export function PageHead({ eyebrow, title, intro }: { eyebrow: Bi; title: Bi; intro?: Bi }) {
  const { t } = useLang();
  return (
    <header className="mb-7 border-b border-stone-300 pb-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-stone-500">{t(eyebrow)}</p>
      <h1 className="mt-1 font-serif text-3xl font-semibold text-stone-900">{t(title)}</h1>
      {intro && <p className="mt-2 max-w-3xl text-sm leading-relaxed text-stone-600">{t(intro)}</p>}
    </header>
  );
}

export function Section({ title, children }: { title?: Bi; children: ReactNode }) {
  const { t } = useLang();
  return (
    <section className="mb-6 rounded border border-stone-200 bg-white p-5">
      {title && <h2 className="mb-3 font-serif text-xl font-semibold text-stone-900">{t(title)}</h2>}
      <div className="space-y-3 text-sm leading-relaxed text-stone-700">{children}</div>
    </section>
  );
}

export function Warn({ title, body }: { title: Bi; body: Bi }) {
  const { t } = useLang();
  return (
    <div className="mb-5 rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
      <div className="flex gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <p><b>{t(title)}</b> {t(body)}</p>
      </div>
    </div>
  );
}

export function P({ c }: { c: Bi }) {
  const { t } = useLang();
  return <p>{t(c)}</p>;
}

export function Bullets({ items }: { items: Bi[] }) {
  const { t } = useLang();
  return (
    <ul className="list-disc space-y-1.5 pl-5">
      {items.map((i, k) => <li key={k}>{t(i)}</li>)}
    </ul>
  );
}

export function Source({ href, label }: { href: string; label: Bi }) {
  const { t } = useLang();
  return (
    <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-indigo-700 hover:underline">
      {t(label)} <ExternalLink className="h-3 w-3" />
    </a>
  );
}

export function Footer() {
  const { t } = useLang();
  return (
    <footer className="mt-10 border-t border-stone-300 pt-4 text-xs text-stone-500">
      {t({
        en: "Planning notes, not legal or tax advice. Confirm each step with your immigration lawyer and tax adviser.",
        ja: "計画用のメモであり、法律・税務のアドバイスではありません。各ステップは移民弁護士と税理士に確認してください。",
      })}
    </footer>
  );
}
