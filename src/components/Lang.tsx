"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "ja";
export type Bi<T = string> = { en: T; ja: T };

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "en",
  setLang: () => {},
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("hub-lang");
      if (saved === "en" || saved === "ja") setLangState(saved);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("hub-lang", l); } catch {}
  };

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export function useLang() {
  const { lang, setLang } = useContext(LangContext);
  const t = <T,>(b: Bi<T>): T => b[lang];
  return { lang, setLang, t };
}

export function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div role="group" aria-label="Language" className="inline-flex overflow-hidden rounded border border-stone-300 bg-white text-xs font-medium">
      {(["en", "ja"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`px-2.5 py-1.5 ${lang === l ? "bg-stone-800 text-white" : "text-stone-700"}`}
        >
          {l === "en" ? "EN" : "日本語"}
        </button>
      ))}
    </div>
  );
}
