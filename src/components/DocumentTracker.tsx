"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle, ChevronDown, ChevronRight, Download, ExternalLink,
  Lock, LogOut, RefreshCw, Search, Sheet,
} from "lucide-react";
import { useLang, type Bi } from "@/components/Lang";
import { SHEET_URL, WORKFLOWS } from "@/components/Checklist";
import {
  clearCreds, defaultUrl, getCreds, loadTracker, saveCreds, updateTracker,
  type ChecklistItem, type Creds, type DocumentStatus, type TrackerPayload,
} from "@/lib/sheets";

const STATUS_LABEL: Record<DocumentStatus, Bi> = {
  "not-started": { en: "Not started", ja: "未着手" },
  requested: { en: "Requested", ja: "申請済み" },
  received: { en: "Received", ja: "受領済み" },
  "apostille-pending": { en: "Sent for apostille", ja: "アポスティーユ申請中" },
  apostilled: { en: "Apostilled", ja: "アポスティーユ済み" },
  "translation-pending": { en: "Sent for translation", ja: "翻訳中" },
  ready: { en: "Ready", ja: "準備完了" },
  "not-applicable": { en: "Not applicable", ja: "対象外" },
};
const STATUS_ORDER = Object.keys(STATUS_LABEL) as DocumentStatus[];

const PERSON: Record<string, Bi> = {
  Both: { en: "Both", ja: "二人" },
  Irving: { en: "Irving", ja: "アーヴィング" },
  Partner: { en: "Moeno", ja: "モエノ" },
  Employer: { en: "Employer", ja: "雇用主" },
};

function progress(items: ChecklistItem[]) {
  const relevant = items.filter((item) => item.status !== "not-applicable");
  if (!relevant.length) return 0;
  return Math.round((relevant.filter((item) => item.status === "ready").length / relevant.length) * 100);
}

function isRequired(value: string | boolean) {
  return value === true || String(value).toLowerCase() === "true";
}

function Unlock({ onUnlock }: { onUnlock: (c: Creds) => void }) {
  const { t } = useLang();
  const [url, setUrl] = useState(defaultUrl);
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    const c = { url: url.trim(), token: token.trim() };
    if (!c.url || !c.token) return;
    setBusy(true);
    setError("");
    try {
      await loadTracker(c);
      saveCreds(c);
      onUnlock(c);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setError(
        msg === "unauthorized"
          ? t({ en: "That token doesn't match TRACKER_API_TOKEN in the Apps Script.", ja: "トークンがApps ScriptのTRACKER_API_TOKENと一致しません。" })
          : t({ en: "Couldn't reach the Apps Script. Check the /exec URL.", ja: "Apps Scriptに接続できません。/exec のURLを確認してください。" })
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-md rounded border border-stone-200 bg-white p-6">
      <Lock className="h-5 w-5 text-stone-500" />
      <h2 className="mt-2 font-serif text-xl font-semibold text-stone-900">{t({ en: "Unlock the tracker", ja: "トラッカーのロックを解除" })}</h2>
      <p className="mt-1 text-sm text-stone-600">
        {t({ en: "Enter the Apps Script token to read and edit the Google Sheet. It's saved on this device only.", ja: "Googleスプレッドシートを閲覧・編集するにはApps Scriptのトークンを入力してください。この端末にのみ保存されます。" })}
      </p>
      {!defaultUrl && (
        <>
          <label className="mb-1 mt-4 block text-xs font-medium text-stone-500">{t({ en: "Apps Script web-app URL (ends in /exec)", ja: "Apps ScriptのウェブアプリURL（/exec で終わる）" })}</label>
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://script.google.com/macros/s/…/exec" className="w-full rounded border border-stone-300 px-3 py-2 text-sm" />
        </>
      )}
      <label className="mb-1 mt-4 block text-xs font-medium text-stone-500">{t({ en: "Token", ja: "トークン" })}</label>
      <input type="password" value={token} onChange={(e) => setToken(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} className="w-full rounded border border-stone-300 px-3 py-2 text-sm" />
      {error && <p className="mt-3 text-sm text-red-800">{error}</p>}
      <button onClick={submit} disabled={busy} className="mt-4 w-full rounded bg-stone-800 px-3 py-2 text-sm font-medium text-white disabled:opacity-50">
        {busy ? t({ en: "Checking…", ja: "確認中…" }) : t({ en: "Unlock", ja: "解除する" })}
      </button>
    </section>
  );
}

export default function DocumentTracker() {
  const { t } = useLang();
  const [creds, setCreds] = useState<Creds | null>(null);
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<TrackerPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [workflow, setWorkflow] = useState("all");
  const [status, setStatus] = useState("all");
  const [owner, setOwner] = useState("all");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showWarnings, setShowWarnings] = useState(true);
  const [showSources, setShowSources] = useState(false);

  useEffect(() => {
    setCreds(getCreds());
    setReady(true);
  }, []);

  async function load(c = creds) {
    if (!c) return;
    setLoading(true);
    setError("");
    try {
      setData(await loadTracker(c));
    } catch (err) {
      if (err instanceof Error && err.message === "unauthorized") return lock();
      setError(err instanceof Error ? err.message : "Unable to load tracker.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (creds) load(creds);
  }, [creds]);

  function lock() {
    clearCreds();
    setCreds(null);
    setData(null);
  }

  async function updateItem(id: string, patch: Partial<ChecklistItem>) {
    if (!data || !creds) return;
    const previous = data;
    setSaving(id);
    setData({ ...data, checklist: data.checklist.map((item) => (item.id === id ? { ...item, ...patch } : item)) });
    try {
      await updateTracker(creds, { action: "updateItem", id, patch });
    } catch (err) {
      setData(previous);
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(null);
    }
  }

  const items = data?.checklist ?? [];
  const wfLabel = (w: string) => t(WORKFLOWS[w] || { en: w, ja: w });

  const workflows = useMemo(
    () => Array.from(new Set(items.map((item) => item.workflow))).sort((a, b) => wfLabel(a).localeCompare(wfLabel(b))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, t]
  );
  const owners = useMemo(() => Array.from(new Set(items.map((item) => item.person))).sort(), [items]);

  const visibleItems = useMemo(() => {
    const search = query.trim().toLowerCase();
    return items
      .filter((item) => workflow === "all" || item.workflow === workflow)
      .filter((item) => status === "all" || item.status === status)
      .filter((item) => owner === "all" || item.person === owner)
      .filter((item) => !search || [item.title, item.notes, item.caution || ""].join(" ").toLowerCase().includes(search))
      .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
  }, [items, workflow, status, owner, query]);

  function exportJson() {
    if (!data) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "spain-move-tracker.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const overall = progress(items);

  return (
    <div>
      <header className="mb-7 border-b border-stone-300 pb-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-stone-500">
          {t({ en: "Spain move · legal & relocation case file", ja: "スペイン移住 · 法務・移住ケースファイル" })}
        </p>
        <div className="mt-1 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-semibold text-stone-900">
              {t({ en: "Irving & Moeno — Spain master tracker", ja: "アーヴィング & モエノ — スペイン移住マスタートラッカー" })}
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-stone-600">
              {t({ en: "DNV, California domestic partnership, family-member filing, arrival, taxes, Mui, citizenship and licence planning.", ja: "DNV、カリフォルニア州パートナーシップ、家族申請、到着手続き、税金、ムイ、国籍、免許の計画。" })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={SHEET_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded border border-stone-300 bg-white px-3 py-2 text-xs font-medium">
              <Sheet className="h-4 w-4" />
              {t({ en: "Open Google Sheet", ja: "Googleスプレッドシートを開く" })}
              <ExternalLink className="h-3 w-3" />
            </a>
            {creds && (
              <button onClick={lock} className="inline-flex items-center gap-2 rounded border border-stone-300 bg-white px-3 py-2 text-xs font-medium">
                <LogOut className="h-3.5 w-3.5" /> {t({ en: "Lock", ja: "ロック" })}
              </button>
            )}
          </div>
        </div>

        {creds && (
          <div className="mt-5 flex items-end gap-3">
            <div className="flex-1">
              <div className="mb-1 flex justify-between text-xs text-stone-500">
                <span>{t({ en: "Overall completion", ja: "全体の進捗" })}</span>
                <span>{overall}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-stone-200">
                <div className="h-full bg-emerald-700 transition-all" style={{ width: `${overall}%` }} />
              </div>
            </div>
            <button onClick={() => load()} className="inline-flex items-center gap-2 rounded border border-stone-300 bg-white px-3 py-2 text-xs font-medium">
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              {t({ en: "Refresh", ja: "更新" })}
            </button>
          </div>
        )}
      </header>

      {ready && !creds && <Unlock onUnlock={setCreds} />}

      {creds && (
        <>
          {error && (
            <div className="mb-5 rounded border border-red-300 bg-red-50 p-4 text-sm text-red-900">
              <p className="font-medium">{t({ en: "Google Sheets sync needs attention", ja: "Googleスプレッドシートの同期に問題があります" })}</p>
              <p className="mt-1">{error}</p>
            </div>
          )}

          <section className="mb-5 rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <div className="flex gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                <b>{t({ en: "Critical path:", ja: "クリティカルパス：" })}</b>{" "}
                {t({
                  en: "California domestic partnership → certified copy → apostille → translation; employer Certificate of Coverage + posted-worker letter; police records; financial evidence; then simultaneous filing for Irving and Moeno.",
                  ja: "カリフォルニア州パートナーシップ → 認証謄本 → アポスティーユ → 翻訳。雇用主の適用証明書と赴任レター。犯罪経歴証明。資金証明。その後、アーヴィングとモエノを同時申請。",
                })}
              </p>
            </div>
          </section>

          <section className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            {workflows.map((name) => (
              <button
                key={name}
                onClick={() => setWorkflow(name)}
                className={`rounded border bg-white p-3 text-left ${workflow === name ? "border-stone-900 ring-1 ring-stone-900" : "border-stone-200"}`}
              >
                <p className="text-xs font-medium text-stone-600">{wfLabel(name)}</p>
                <p className="mt-1 font-mono text-lg font-semibold">{progress(items.filter((item) => item.workflow === name))}%</p>
              </button>
            ))}
          </section>

          <div className="mb-4 flex flex-wrap gap-2">
            <button
              onClick={() => setWorkflow("all")}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${workflow === "all" ? "border-stone-800 bg-stone-800 text-white" : "border-stone-300 bg-white"}`}
            >
              {t({ en: "All items", ja: "すべての項目" })}
            </button>
            <button onClick={() => setShowTimeline((v) => !v)} className="ml-auto rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium">
              {t({ en: "Timeline", ja: "タイムライン" })}
            </button>
          </div>

          {showTimeline && data && (
            <section className="mb-5 rounded border border-indigo-200 bg-indigo-50/40 p-4">
              <h2 className="mb-3 text-sm font-semibold">{t({ en: "Recommended timeline", ja: "推奨タイムライン" })}</h2>
              <div className="space-y-3">
                {data.timeline.map((row, index) => (
                  <div key={index} className="border-l-2 border-indigo-400 pl-3">
                    <p className="font-mono text-xs font-medium text-indigo-800">{row.label}</p>
                    <p className="text-sm text-stone-700">{row.actions}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="mb-4 flex flex-wrap gap-2">
            <div className="relative min-w-[220px] flex-1">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t({ en: "Search checklist", ja: "チェックリストを検索" })}
                className="w-full rounded border border-stone-300 bg-white py-2 pl-8 pr-3 text-sm"
              />
            </div>
            <select value={owner} onChange={(e) => setOwner(e.target.value)} className="rounded border border-stone-300 bg-white px-3 py-2 text-xs">
              <option value="all">{t({ en: "All owners", ja: "すべての担当者" })}</option>
              {owners.map((name) => <option key={name} value={name}>{t(PERSON[name] || { en: name, ja: name })}</option>)}
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded border border-stone-300 bg-white px-3 py-2 text-xs">
              <option value="all">{t({ en: "All statuses", ja: "すべてのステータス" })}</option>
              {STATUS_ORDER.map((value) => <option key={value} value={value}>{t(STATUS_LABEL[value])}</option>)}
            </select>
          </section>

          <section className="mb-8 space-y-2">
            {loading && !data && (
              <div className="rounded border border-stone-200 bg-white p-8 text-center text-sm text-stone-500">
                {t({ en: "Loading tracker from Google Sheets…", ja: "Googleスプレッドシートから読み込み中…" })}
              </div>
            )}

            {visibleItems.map((item) => {
              const open = expanded === item.id;
              return (
                <article key={item.id} className="rounded border border-stone-200 bg-white">
                  <button onClick={() => setExpanded(open ? null : item.id)} aria-expanded={open} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                    {open ? <ChevronDown className="h-4 w-4 text-stone-400" /> : <ChevronRight className="h-4 w-4 text-stone-400" />}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-stone-900">{item.title}</p>
                        {!isRequired(item.required) && (
                          <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] uppercase text-stone-500">{t({ en: "optional", ja: "任意" })}</span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500">{wfLabel(item.workflow)} · {t(PERSON[item.person] || { en: item.person, ja: item.person })}</p>
                    </div>
                    <span className="rounded border border-stone-300 px-2 py-0.5 text-[11px]">
                      {saving === item.id ? t({ en: "Saving…", ja: "保存中…" }) : t(STATUS_LABEL[item.status] || { en: item.status, ja: item.status })}
                    </span>
                  </button>

                  {open && (
                    <div className="border-t border-stone-100 px-4 py-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-stone-500">{t({ en: "Status", ja: "ステータス" })}</label>
                          <select
                            value={item.status}
                            onChange={(e) => updateItem(item.id, { status: e.target.value as DocumentStatus })}
                            className="w-full rounded border border-stone-300 bg-white px-2 py-2 text-sm"
                          >
                            {STATUS_ORDER.map((value) => <option key={value} value={value}>{t(STATUS_LABEL[value])}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1 text-xs text-stone-600">
                          <p><b>{t({ en: "Apostille", ja: "アポスティーユ" })}:</b> {item.apostille || "—"}</p>
                          <p><b>{t({ en: "Translation", ja: "翻訳" })}:</b> {item.translation || "—"}</p>
                          {item.validity && <p><b>{t({ en: "Validity", ja: "有効期間" })}:</b> {item.validity}</p>}
                          {item.recommendedLeadTime && <p><b>{t({ en: "Lead time", ja: "目安の時期" })}:</b> {item.recommendedLeadTime}</p>}
                        </div>
                      </div>

                      <label className="mb-1 mt-3 block text-xs font-medium text-stone-500">{t({ en: "Instructions / notes", ja: "手順・メモ" })}</label>
                      <textarea
                        value={item.notes || ""}
                        onChange={(e) =>
                          setData((current) =>
                            current ? { ...current, checklist: current.checklist.map((entry) => (entry.id === item.id ? { ...entry, notes: e.target.value } : entry)) } : current
                          )
                        }
                        onBlur={(e) => updateItem(item.id, { notes: e.target.value })}
                        rows={3}
                        className="w-full rounded border border-stone-300 px-2 py-2 text-sm"
                      />

                      {item.caution && <p className="mt-3 rounded border border-amber-300 bg-amber-50 p-2 text-xs text-amber-900">{item.caution}</p>}

                      {item.officialUrl && (
                        <a href={item.officialUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-indigo-700 hover:underline">
                          {t({ en: "Official source", ja: "公式情報" })} <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </section>

          {data && (
            <>
              <section className="mb-4 rounded border border-stone-200 bg-white">
                <button onClick={() => setShowWarnings((v) => !v)} className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold">
                  {t({ en: "Warnings & things to confirm", ja: "注意点・確認事項" })}
                  {showWarnings ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                {showWarnings && (
                  <div className="space-y-3 border-t border-stone-100 p-4">
                    {data.warnings.map((w, index) => (
                      <div key={index}>
                        <p className="text-sm font-medium">{w.title}</p>
                        <p className="text-sm text-stone-600">{w.body}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="mb-8 rounded border border-stone-200 bg-white">
                <button onClick={() => setShowSources((v) => !v)} className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold">
                  {t({ en: "Sources", ja: "出典" })}
                  {showSources ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                {showSources && (
                  <div className="grid gap-2 border-t border-stone-100 p-4 sm:grid-cols-2">
                    {data.sources.map((s, index) => (
                      <a key={index} href={s.url} target="_blank" rel="noreferrer" className="text-xs text-indigo-700 hover:underline">{s.label}</a>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-2xl text-xs text-stone-500">
              {t({ en: "Edits save straight to the Google Sheet, which stays the source of truth.", ja: "編集内容はそのままGoogleスプレッドシートに保存されます（スプレッドシートが正本です）。" })}
            </p>
            <button onClick={exportJson} disabled={!data} className="inline-flex items-center gap-2 rounded border border-stone-300 bg-white px-3 py-2 text-xs font-medium disabled:opacity-50">
              <Download className="h-3.5 w-3.5" /> {t({ en: "Export JSON", ja: "JSONを書き出す" })}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
