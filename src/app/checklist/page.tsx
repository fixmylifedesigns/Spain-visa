"use client";

import { useMemo, useState } from "react";
import { useLang } from "@/components/Lang";
import { PageHead } from "@/components/Page";
import { ChecklistList, items, progress, SheetLink, snapshotDate, WORKFLOWS } from "@/components/Checklist";

export default function ChecklistPage() {
  const { t } = useLang();
  const [wf, setWf] = useState("all");
  const list = useMemo(() => items.filter((i) => wf === "all" || i.workflow === wf), [wf]);

  return (
    <>
      <PageHead
        eyebrow={{ en: "Checklist · from our Google Sheet", ja: "チェックリスト · Googleスプレッドシートより" }}
        title={{ en: "Every document, every step", ja: "すべての書類とステップ" }}
        intro={{
          en: `The Google Sheet is still the place to update statuses. This page shows a snapshot from ${snapshotDate}.`,
          ja: `ステータスの更新は引き続きGoogleスプレッドシートで行います。このページは${snapshotDate}時点のスナップショットです。`,
        }}
      />
      <div className="mb-5"><SheetLink /></div>

      <section className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        {Object.keys(WORKFLOWS).map((key) => (
          <button
            key={key}
            onClick={() => setWf(wf === key ? "all" : key)}
            aria-pressed={wf === key}
            className={`rounded border bg-white p-3 text-left ${wf === key ? "border-stone-900 ring-1 ring-stone-900" : "border-stone-200"}`}
          >
            <p className="text-xs font-medium text-stone-600">{t(WORKFLOWS[key])}</p>
            <p className="mt-1 font-mono text-lg font-semibold">{progress(items.filter((i) => i.workflow === key))}%</p>
          </button>
        ))}
      </section>

      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={() => setWf("all")}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium ${wf === "all" ? "border-stone-800 bg-stone-800 text-white" : "border-stone-300 bg-white"}`}
        >
          {t({ en: `All items (${items.length})`, ja: `すべて（${items.length}）` })}
        </button>
      </div>

      <ChecklistList list={list} />
    </>
  );
}
