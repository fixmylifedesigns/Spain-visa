"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { LangToggle, useLang } from "./Lang";

export const NAV = [
  { href: "/", en: "Hub", ja: "ホーム" },
  { href: "/plan/", en: "Game plan", ja: "ゲームプラン" },
  { href: "/checklist/", en: "Checklist", ja: "チェックリスト" },
  { href: "/partnership/", en: "CA partnership", ja: "カリフォルニア・パートナーシップ" },
  { href: "/n26/", en: "N26", ja: "N26" },
  { href: "/mui/", en: "Mui", ja: "ムイ" },
  { href: "/homes/", en: "Valencia homes", ja: "バレンシアの物件" },
  { href: "/videos/", en: "Videos", ja: "動画" },
];

export default function Nav() {
  const { lang, t } = useLang();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) => (href === "/" ? path === "/" : path?.startsWith(href.replace(/\/$/, "")));

  return (
    <header className="sticky top-0 z-20 border-b border-stone-300 bg-[#f7f4ec]/95 backdrop-blur" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="font-serif text-lg font-semibold text-stone-900">
          {t({ en: "Irving & Moeno · Spain", ja: "アーヴィング & モエノ · スペイン" })}
        </Link>
        <nav className="ml-auto hidden gap-1 lg:flex" aria-label="Main">
          {NAV.slice(1).map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`rounded px-2.5 py-1.5 text-xs font-medium ${active(n.href) ? "bg-stone-800 text-white" : "text-stone-700 hover:bg-stone-200"}`}
            >
              {lang === "en" ? n.en : n.ja}
            </Link>
          ))}
        </nav>
        <div className="ml-auto lg:ml-2"><LangToggle /></div>
        <button className="rounded border border-stone-300 bg-white p-1.5 lg:hidden" aria-label="Menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>
      {open && (
        <nav className="border-t border-stone-200 px-4 pb-3 lg:hidden" aria-label="Main">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className={`block rounded px-2 py-2 text-sm ${active(n.href) ? "bg-stone-800 text-white" : "text-stone-800"}`}
            >
              {lang === "en" ? n.en : n.ja}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
