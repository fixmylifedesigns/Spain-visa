"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, ExternalLink, Sheet } from "lucide-react";
import data from "@/data/checklist.json";
import { useLang, type Bi } from "./Lang";

export const SHEET_URL = "https://docs.google.com/spreadsheets/d/1V6nOlPEjoIVLC_Jc_Q-9lFYhsVX19EU_bRoQq5aF4mg/edit";

export type Item = (typeof data.items)[number];

export const WORKFLOWS: Record<string, Bi> = {
  dnv: { en: "Digital Nomad Visa", ja: "デジタルノマドビザ" },
  "domestic-partnership": { en: "California domestic partnership", ja: "カリフォルニア州ドメスティック・パートナーシップ" },
  dependent: { en: "Moeno family-member filing", ja: "モエノの家族申請" },
  arrival: { en: "Arrival / TIE / padrón", ja: "到着・TIE・住民登録" },
  tax: { en: "Tax & social security", ja: "税金・社会保障" },
  pet: { en: "Mui's move", ja: "ムイの移動" },
  citizenship: { en: "Citizenship preparation", ja: "国籍取得の準備" },
  "dr-license": { en: "NY → DR licence", ja: "NY → ドミニカ免許" },
};

const STATUS: Record<string, Bi> = {
  "not-started": { en: "Not started", ja: "未着手" },
  requested: { en: "Requested", ja: "申請済み" },
  received: { en: "Received", ja: "受領済み" },
  "apostille-pending": { en: "Sent for apostille", ja: "アポスティーユ申請中" },
  apostilled: { en: "Apostilled", ja: "アポスティーユ済み" },
  "translation-pending": { en: "Sent for translation", ja: "翻訳中" },
  ready: { en: "Ready", ja: "準備完了" },
  "not-applicable": { en: "Not applicable", ja: "対象外" },
};

const PERSON: Record<string, Bi> = {
  Both: { en: "Both", ja: "二人" },
  Irving: { en: "Irving", ja: "アーヴィング" },
  Partner: { en: "Moeno", ja: "モエノ" },
  Employer: { en: "Employer", ja: "雇用主" },
};

export const items = [...data.items];
export const snapshotDate = data.snapshotDate;

export function progress(list: Item[]) {
  const rel = list.filter((i) => i.status !== "not-applicable");
  return rel.length ? Math.round((rel.filter((i) => i.status === "ready").length / rel.length) * 100) : 0;
}

export function SheetLink() {
  const { t } = useLang();
  return (
    <a href={SHEET_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded border border-stone-300 bg-white px-3 py-2 text-xs font-medium">
      <Sheet className="h-4 w-4" />
      {t({ en: "Open Google Sheet", ja: "Googleスプレッドシートを開く" })}
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}

// titles: optional translations keyed by item id (used for Mui's rows)
export function ChecklistList({ list, titles }: { list: Item[]; titles?: Record<string, Bi> }) {
  const { t, lang } = useLang();
  const [open, setOpen] = useState<string | null>(null);
  const sorted = useMemo(() => list, [list]);
  return (
    <div className="space-y-2">
      {sorted.map((item) => {
        const isOpen = open === item.id;
        const title = titles?.[item.id] ? t(titles[item.id]) : item.title;
        return (
          <article key={item.id} className="rounded border border-stone-200 bg-white">
            <button onClick={() => setOpen(isOpen ? null : item.id)} aria-expanded={isOpen} className="flex w-full items-center gap-3 px-4 py-3 text-left">
              {isOpen ? <ChevronDown className="h-4 w-4 text-stone-400" /> : <ChevronRight className="h-4 w-4 text-stone-400" />}
              <div className="min-w-0 flex-1">
                <p className="font-medium text-stone-900">{title}</p>
                <p className="text-xs text-stone-500">
                  {t(WORKFLOWS[item.workflow] || { en: item.workflow, ja: item.workflow })} · {t(PERSON[item.person] || { en: item.person, ja: item.person })}
                </p>
              </div>
              <span className={`rounded border px-2 py-0.5 text-[11px] ${item.status === "ready" ? "border-emerald-700 text-emerald-800" : "border-stone-300"}`}>
                {t(STATUS[item.status] || { en: item.status, ja: item.status })}
              </span>
            </button>
            {isOpen && (
              <div className="space-y-2 border-t border-stone-100 px-4 py-4 text-sm text-stone-700">
                <p className="text-xs text-stone-500"><b>{t({ en: "Lead time", ja: "目安の時期" })}:</b> {item.leadTime}</p>
                {item.notes && <p>{item.notes}</p>}
                {item.caution && <p className="rounded border border-amber-300 bg-amber-50 p-2 text-xs text-amber-900">{item.caution}</p>}
                {lang === "ja" && <p className="text-xs text-stone-500">※ 詳細メモはスプレッドシートの原文（英語）です。</p>}
                {item.officialUrl && (
                  <a href={item.officialUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-indigo-700 hover:underline">
                    {t({ en: "Official source", ja: "公式情報" })} <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
