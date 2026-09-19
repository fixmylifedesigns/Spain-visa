"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Download,
  ExternalLink,
  RefreshCw,
  Search,
  Sheet,
} from "lucide-react";
import type { ChecklistItem, DocumentStatus, TrackerPayload } from "@/data/types";
import { getStoredAuthHeader } from "@/components/AuthGate";

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1V6nOlPEjoIVLC_Jc_Q-9lFYhsVX19EU_bRoQq5aF4mg/edit";

const STATUS_LABEL: Record<DocumentStatus, string> = {
  "not-started": "Not started",
  requested: "Requested",
  received: "Received",
  "apostille-pending": "Sent for apostille",
  apostilled: "Apostilled",
  "translation-pending": "Sent for translation",
  ready: "Ready",
  "not-applicable": "Not applicable",
};

const STATUS_ORDER = Object.keys(STATUS_LABEL) as DocumentStatus[];

const WORKFLOW_LABELS: Record<string, string> = {
  dnv: "Digital Nomad Visa",
  "domestic-partnership": "California domestic partnership",
  dependent: "Moeno family-member filing",
  arrival: "Spain arrival / TIE / padrón",
  tax: "Tax & social security",
  pet: "Mui / pet move",
  citizenship: "Citizenship preparation",
  "dr-license": "NY → DR licence",
};

function progress(items: ChecklistItem[]) {
  const relevant = items.filter((item) => item.status !== "not-applicable");
  if (!relevant.length) return 0;
  return Math.round(
    (relevant.filter((item) => item.status === "ready").length / relevant.length) * 100
  );
}

function isRequired(value: string | boolean) {
  return value === true || String(value).toLowerCase() === "true";
}

export default function DocumentTracker() {
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

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/tracker", {
        cache: "no-store",
        headers: { "X-Tracker-Auth": getStoredAuthHeader() },
      });
      const json = await response.json();
      if (!response.ok || json.error) {
        throw new Error(json.error || "Unable to load tracker.");
      }
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load tracker.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function updateItem(id: string, patch: Partial<ChecklistItem>) {
    if (!data) return;

    const previous = data;
    setSaving(id);
    setData({
      ...data,
      checklist: data.checklist.map((item) =>
        item.id === id ? { ...item, ...patch } : item
      ),
    });

    try {
      const response = await fetch("/api/tracker", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Tracker-Auth": getStoredAuthHeader(),
        },
        body: JSON.stringify({ action: "updateItem", id, patch }),
      });
      const json = await response.json();
      if (!response.ok || json.error) throw new Error(json.error || "Save failed.");
    } catch (err) {
      setData(previous);
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(null);
    }
  }

  const items = data?.checklist ?? [];

  const workflows = useMemo(
    () =>
      Array.from(new Set(items.map((item) => item.workflow))).sort((a, b) =>
        (WORKFLOW_LABELS[a] || a).localeCompare(WORKFLOW_LABELS[b] || b)
      ),
    [items]
  );

  const owners = useMemo(
    () => Array.from(new Set(items.map((item) => item.person))).sort(),
    [items]
  );

  const visibleItems = useMemo(() => {
    const search = query.trim().toLowerCase();
    return items
      .filter((item) => workflow === "all" || item.workflow === workflow)
      .filter((item) => status === "all" || item.status === status)
      .filter((item) => owner === "all" || item.person === owner)
      .filter(
        (item) =>
          !search ||
          [item.title, item.notes, item.caution || ""]
            .join(" ")
            .toLowerCase()
            .includes(search)
      )
      .sort(
        (a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0)
      );
  }, [items, workflow, status, owner, query]);

  function exportJson() {
    if (!data) return;
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "spain-move-tracker.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const overall = progress(items);

  return (
    <main className="min-h-screen bg-[#f7f4ec] text-stone-800">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-7 border-b border-stone-300 pb-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-stone-500">
            Spain move · legal & relocation case file
          </p>
          <div className="mt-1 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl font-semibold text-stone-900">
                Irving & Moeno — Spain master tracker
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-stone-600">
                DNV, California domestic partnership, family-member filing,
                arrival, taxes, Mui, citizenship and licence planning.
              </p>
            </div>
            <a
              href={SHEET_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded border border-stone-300 bg-white px-3 py-2 text-xs font-medium"
            >
              <Sheet className="h-4 w-4" />
              Open Google Sheet
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="mt-5 flex items-end gap-3">
            <div className="flex-1">
              <div className="mb-1 flex justify-between text-xs text-stone-500">
                <span>Overall completion</span>
                <span>{overall}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-stone-200">
                <div
                  className="h-full bg-emerald-700 transition-all"
                  style={{ width: `${overall}%` }}
                />
              </div>
            </div>
            <button
              onClick={load}
              className="inline-flex items-center gap-2 rounded border border-stone-300 bg-white px-3 py-2 text-xs font-medium"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-5 rounded border border-red-300 bg-red-50 p-4 text-sm text-red-900">
            <p className="font-medium">Google Sheets sync needs attention</p>
            <p className="mt-1">{error}</p>
          </div>
        )}

        <section className="mb-5 rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <div className="flex gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              <b>Critical path:</b> California domestic partnership → certified
              copy → apostille → translation; employer Certificate of Coverage +
              posted-worker letter; police records; financial evidence; then
              simultaneous filing for Irving and Moeno.
            </p>
          </div>
        </section>

        <section className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          {workflows.map((name) => {
            const pct = progress(items.filter((item) => item.workflow === name));
            return (
              <button
                key={name}
                onClick={() => setWorkflow(name)}
                className={`rounded border bg-white p-3 text-left ${
                  workflow === name ? "border-stone-900 ring-1 ring-stone-900" : "border-stone-200"
                }`}
              >
                <p className="text-xs font-medium text-stone-600">
                  {WORKFLOW_LABELS[name] || name}
                </p>
                <p className="mt-1 font-mono text-lg font-semibold">{pct}%</p>
              </button>
            );
          })}
        </section>

        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setWorkflow("all")}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
              workflow === "all"
                ? "border-stone-800 bg-stone-800 text-white"
                : "border-stone-300 bg-white"
            }`}
          >
            All items
          </button>
          <button
            onClick={() => setShowTimeline((value) => !value)}
            className="ml-auto rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium"
          >
            Timeline
          </button>
        </div>

        {showTimeline && data && (
          <section className="mb-5 rounded border border-indigo-200 bg-indigo-50/40 p-4">
            <h2 className="mb-3 text-sm font-semibold">Recommended timeline</h2>
            <div className="space-y-3">
              {data.timeline.map((row, index) => (
                <div key={index} className="border-l-2 border-indigo-400 pl-3">
                  <p className="font-mono text-xs font-medium text-indigo-800">
                    {row.label}
                  </p>
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
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search checklist"
              className="w-full rounded border border-stone-300 bg-white py-2 pl-8 pr-3 text-sm"
            />
          </div>
          <select
            value={owner}
            onChange={(event) => setOwner(event.target.value)}
            className="rounded border border-stone-300 bg-white px-3 py-2 text-xs"
          >
            <option value="all">All owners</option>
            {owners.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded border border-stone-300 bg-white px-3 py-2 text-xs"
          >
            <option value="all">All statuses</option>
            {STATUS_ORDER.map((value) => (
              <option key={value} value={value}>
                {STATUS_LABEL[value]}
              </option>
            ))}
          </select>
        </section>

        <section className="mb-8 space-y-2">
          {loading && !data && (
            <div className="rounded border border-stone-200 bg-white p-8 text-center text-sm text-stone-500">
              Loading tracker from Google Sheets…
            </div>
          )}

          {visibleItems.map((item) => {
            const open = expanded === item.id;
            return (
              <article key={item.id} className="rounded border border-stone-200 bg-white">
                <button
                  onClick={() => setExpanded(open ? null : item.id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left"
                >
                  {open ? (
                    <ChevronDown className="h-4 w-4 text-stone-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-stone-400" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-stone-900">{item.title}</p>
                      {!isRequired(item.required) && (
                        <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] uppercase text-stone-500">
                          optional
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500">
                      {WORKFLOW_LABELS[item.workflow] || item.workflow} · {item.person}
                    </p>
                  </div>
                  <span className="rounded border border-stone-300 px-2 py-0.5 text-[11px]">
                    {saving === item.id ? "Saving…" : STATUS_LABEL[item.status]}
                  </span>
                </button>

                {open && (
                  <div className="border-t border-stone-100 px-4 py-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-stone-500">
                          Status
                        </label>
                        <select
                          value={item.status}
                          onChange={(event) =>
                            updateItem(item.id, {
                              status: event.target.value as DocumentStatus,
                            })
                          }
                          className="w-full rounded border border-stone-300 bg-white px-2 py-2 text-sm"
                        >
                          {STATUS_ORDER.map((value) => (
                            <option key={value} value={value}>
                              {STATUS_LABEL[value]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1 text-xs text-stone-600">
                        <p><b>Apostille:</b> {item.apostille || "—"}</p>
                        <p><b>Translation:</b> {item.translation || "—"}</p>
                        {item.validity && <p><b>Validity:</b> {item.validity}</p>}
                        {item.recommendedLeadTime && (
                          <p><b>Lead time:</b> {item.recommendedLeadTime}</p>
                        )}
                      </div>
                    </div>

                    <label className="mb-1 mt-3 block text-xs font-medium text-stone-500">
                      Instructions / notes
                    </label>
                    <textarea
                      value={item.notes || ""}
                      onChange={(event) =>
                        setData((current) =>
                          current
                            ? {
                                ...current,
                                checklist: current.checklist.map((entry) =>
                                  entry.id === item.id
                                    ? { ...entry, notes: event.target.value }
                                    : entry
                                ),
                              }
                            : current
                        )
                      }
                      onBlur={(event) =>
                        updateItem(item.id, { notes: event.target.value })
                      }
                      rows={3}
                      className="w-full rounded border border-stone-300 px-2 py-2 text-sm"
                    />

                    {item.caution && (
                      <p className="mt-3 rounded border border-amber-300 bg-amber-50 p-2 text-xs text-amber-900">
                        {item.caution}
                      </p>
                    )}

                    {item.officialUrl && (
                      <a
                        href={item.officialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-indigo-700 hover:underline"
                      >
                        Official source <ExternalLink className="h-3 w-3" />
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
              <button
                onClick={() => setShowWarnings((value) => !value)}
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold"
              >
                Warnings & things to confirm
                {showWarnings ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              {showWarnings && (
                <div className="space-y-3 border-t border-stone-100 p-4">
                  {data.warnings.map((warning, index) => (
                    <div key={index}>
                      <p className="text-sm font-medium">{warning.title}</p>
                      <p className="text-sm text-stone-600">{warning.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="mb-8 rounded border border-stone-200 bg-white">
              <button
                onClick={() => setShowSources((value) => !value)}
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold"
              >
                Sources
                {showSources ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              {showSources && (
                <div className="grid gap-2 border-t border-stone-100 p-4 sm:grid-cols-2">
                  {data.sources.map((source, index) => (
                    <a
                      key={index}
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-indigo-700 hover:underline"
                    >
                      {source.label}
                    </a>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-300 pt-4">
          <p className="max-w-2xl text-xs text-stone-500">
            Planning software, not a substitute for case-specific legal or tax
            advice. The Google Sheet is the editable source of truth.
          </p>
          <button
            onClick={exportJson}
            disabled={!data}
            className="inline-flex items-center gap-2 rounded border border-stone-300 bg-white px-3 py-2 text-xs font-medium disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            Export JSON
          </button>
        </footer>
      </div>
    </main>
  );
}
