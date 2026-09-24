"use client";

import Link from "next/link";
import { ArrowRight, Dog, Film, Home, Landmark, ListChecks, Map, ScrollText } from "lucide-react";
import { useLang } from "@/components/Lang";
import { PageHead } from "@/components/Page";
import { items, progress, SheetLink } from "@/components/Checklist";

const CARDS = [
  { href: "/plan/", Icon: Map, title: { en: "Game plan", ja: "ゲームプラン" }, body: { en: "Málaga for the visa, Madrid for the TIE, Valencia for home.", ja: "ビザはマラガ、TIEはマドリード、住まいはバレンシア。" } },
  { href: "/checklist/", Icon: ListChecks, title: { en: "Checklist", ja: "チェックリスト" }, body: { en: "Every document from the Google Sheet, by workflow.", ja: "スプレッドシートの全書類をワークフロー別に。" } },
  { href: "/partnership/", Icon: ScrollText, title: { en: "California partnership", ja: "カリフォルニア・パートナーシップ" }, body: { en: "Why we register in California instead of a Spanish pareja de hecho.", ja: "スペインのパレハ・デ・エチョではなくカリフォルニアで登録する理由。" } },
  { href: "/n26/", Icon: Landmark, title: { en: "N26", ja: "N26" }, body: { en: "Our Spanish bank account and what to update after the move.", ja: "スペインの銀行口座と、引っ越し後に更新すること。" } },
  { href: "/mui/", Icon: Dog, title: { en: "Mui", ja: "ムイ" }, body: { en: "Bringing Mui from Japan to Spain, step by step.", ja: "ムイを日本からスペインへ連れて行く手順。" } },
  { href: "/homes/", Icon: Home, title: { en: "Valencia homes", ja: "バレンシアの物件" }, body: { en: "Dog-friendly flats near the centre, with what's nearby.", ja: "中心部の犬OK物件と周辺情報。" } },
  { href: "/videos/", Icon: Film, title: { en: "Videos", ja: "動画" }, body: { en: "Life in Valencia, in English and Japanese.", ja: "バレンシアの暮らし（英語・日本語）。" } },
];

export default function HubHome() {
  const { t } = useLang();
  const pct = progress(items);
  const ready = items.filter((i) => i.status === "ready").length;

  return (
    <>
      <PageHead
        eyebrow={{ en: "Spain move · our hub", ja: "スペイン移住 · 私たちのハブ" }}
        title={{ en: "Everything for our move to Spain", ja: "スペイン移住のすべて" }}
        intro={{
          en: "Visa paperwork, our California partnership, banking, Mui's journey and the search for our home in Valencia, all in one place.",
          ja: "ビザ書類、カリフォルニアのパートナーシップ、銀行、ムイの移動、バレンシアでの家探しを一か所にまとめました。",
        }}
      />

      <section className="mb-6 rounded border border-stone-200 bg-white p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-stone-500">{t({ en: "Checklist progress", ja: "チェックリストの進捗" })}</p>
            <p className="font-mono text-3xl font-semibold text-stone-900">{pct}%</p>
            <p className="text-xs text-stone-500">
              {t({ en: `${ready} of ${items.length} items ready`, ja: `${items.length}項目中${ready}項目が完了` })}
            </p>
          </div>
          <SheetLink />
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-stone-200">
          <div className="h-full bg-emerald-700" style={{ width: `${pct}%` }} />
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map(({ href, Icon, title, body }) => (
          <Link key={href} href={href} className="group rounded border border-stone-200 bg-white p-4 hover:border-stone-900">
            <Icon className="h-5 w-5 text-emerald-800" />
            <p className="mt-2 font-serif text-lg font-semibold text-stone-900">{t(title)}</p>
            <p className="mt-1 text-sm text-stone-600">{t(body)}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-indigo-700">
              {t({ en: "Open", ja: "開く" })} <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </section>
    </>
  );
}
