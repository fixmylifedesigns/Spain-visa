"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ExternalLink, Heart, MapPin, RefreshCw } from "lucide-react";
import { useLang, type Bi } from "@/components/Lang";
import { PageHead } from "@/components/Page";

// Listings live in the valencia-home repo, which stays the source of truth for flats.
const DATA_URL = "https://raw.githubusercontent.com/fixmylifedesigns/valencia-home/main/data/listings.json";
const EDIT_URL = "https://github.com/fixmylifedesigns/valencia-home/edit/main/data/listings.json";
const POLL_MS = 5 * 60 * 1000;
const PLACES_TTL = 7 * 24 * 60 * 60 * 1000;
// Pre-built by scripts/build-places.mjs in GitHub Actions, served with the site.
const PLACES_CACHE_URL = (process.env.NEXT_PUBLIC_BASE_PATH || "") + "/data/places.json";

type Listing = {
  id: string; area: string; district: string; street: string; price: number; size: number;
  bedrooms: number; bathrooms: number; url: string | null; images: string[];
  lat: number | null; lng: number | null; status: string; notes: string;
};
type Pt = { lat: number; lng: number };
type Place = { name: string; lat: number; lng: number; d: number };
type Places = { at: number; japanese: Place[]; dominican: Place[]; supermarket: Place[] };
type PlaceState = Places | { loading: true } | { error: string };

const AREAS: Record<string, { safety: number; note: Bi }> = {
  "Sant Francesc": { safety: 3, note: { en: "The very centre. Walkable to everything, but busy and touristy; watch for pickpockets.", ja: "まさに中心部。どこへでも歩けるが、人が多く観光客も多い。スリに注意。" } },
  "El Mercat": { safety: 3, note: { en: "Historic streets by the Central Market. Lively; some streets are loud at night.", ja: "中央市場そばの歴史ある街並み。にぎやかで、夜うるさい通りも。" } },
  Russafa: { safety: 4, note: { en: "Trendy cafés and terraces, lots of dogs. Generally safe; weekend nights can be noisy.", ja: "おしゃれなカフェやテラスが多く、犬もたくさん。治安は概ね良いが週末の夜はにぎやか。" } },
  "Gran Vía": { safety: 5, note: { en: "Elegant and quiet, next to the Turia gardens. Great for dog walks.", ja: "上品で静か。トゥリア公園のすぐそばで犬の散歩に最適。" } },
  Arrancapins: { safety: 4, note: { en: "Local and residential, good value, near Estació del Nord.", ja: "地元感のある住宅街でお手頃。北駅の近く。" } },
};
const areaInfo = (a: string) => AREAS[a] || { safety: 3, note: { en: "", ja: "" } };

const CATS: { key: "japanese" | "dominican" | "supermarket"; label: Bi; emoji: string }[] = [
  { key: "japanese", label: { en: "Japanese", ja: "日本食" }, emoji: "🍣" },
  { key: "dominican", label: { en: "Dominican & Caribbean", ja: "ドミニカ・カリブ料理" }, emoji: "🇩🇴" },
  { key: "supermarket", label: { en: "Supermarkets", ja: "スーパー" }, emoji: "🛒" },
];

const store = {
  get<T>(k: string, d: T): T { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k: string, v: unknown) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const metres = (a: Pt, b: Pt) => {
  const R = 6371000, rad = (x: number) => (x * Math.PI) / 180;
  const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};
const addressOf = (f: Listing) => `${f.street || f.area}, ${f.area}, València`;
const mapsUrl = (q: string) => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
const listingUrl = (f: Listing) =>
  f.url || "https://www.google.com/search?q=" + encodeURIComponent(`site:idealista.com alquiler ${f.street ? `"${f.street.split(",")[0]}"` : f.area} València ${f.price}`);

function tileFor(lat: number, lng: number, z = 16) {
  const n = 2 ** z, r = (lat * Math.PI) / 180;
  const xf = ((lng + 180) / 360) * n;
  const yf = ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * n;
  const x = Math.floor(xf), y = Math.floor(yf);
  return { url: `https://tile.openstreetmap.org/${z}/${x}/${y}.png`, fx: xf - x, fy: yf - y };
}

let geoQueue: Promise<Pt | null> = Promise.resolve(null);
function geocode(f: Listing): Promise<Pt | null> {
  const key = "geo:" + addressOf(f);
  const hit = store.get<Pt | null>(key, null);
  if (hit) return Promise.resolve(hit);
  geoQueue = geoQueue.then(async () => {
    const res = await fetch("https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" + encodeURIComponent(addressOf(f) + ", Spain"));
    const [r] = await res.json();
    await sleep(1100);
    if (!r) return null;
    const pt = { lat: +r.lat, lng: +r.lon };
    store.set(key, pt);
    return pt;
  }).catch(() => null);
  return geoQueue;
}

const OVERPASS = [
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass-api.de/api/interpreter",
];
// Ask every mirror at once and take the first good answer.
async function overpass(q: string) {
  const ctrls = OVERPASS.map(() => new AbortController());
  const timer = setTimeout(() => ctrls.forEach((c) => c.abort()), 20000);
  try {
    return await Promise.any(
      OVERPASS.map(async (url, i) => {
        const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: "data=" + encodeURIComponent(q), signal: ctrls[i].signal });
        if (!res.ok) throw new Error(String(res.status));
        const json = await res.json();
        ctrls.forEach((c, j) => j !== i && c.abort());
        return json;
      })
    );
  } catch {
    throw new Error("busy");
  } finally {
    clearTimeout(timer);
  }
}

let prebuilt: Promise<Record<string, Places & Pt>> | null = null;
function loadPrebuilt() {
  prebuilt ??= fetch(PLACES_CACHE_URL)
    .then((r) => (r.ok ? r.json() : { places: {} }))
    .then((j) => j.places || {})
    .catch(() => ({}));
  return prebuilt;
}

async function fetchNearby(pt: Pt, id: string): Promise<Places> {
  const built = (await loadPrebuilt())[id];
  if (built && metres(pt, built) < 100) return built;
  const key = `places:${pt.lat.toFixed(4)},${pt.lng.toFixed(4)}`;
  const hit = store.get<Places | null>(key, null);
  if (hit && Date.now() - hit.at < PLACES_TTL) return hit;
  const A = (r: number) => `(around:${r},${pt.lat},${pt.lng})`;
  const EAT = '["amenity"~"restaurant|fast_food|cafe|bar"]';
  const q = `[out:json][timeout:20];(
    nwr${A(1200)}${EAT}["cuisine"~"japanese|sushi|ramen",i];
    nwr${A(1500)}["shop"~"supermarket|convenience|deli|food"]["name"~"jap|asia|orient",i];
    nwr${A(2500)}${EAT}["cuisine"~"dominican|caribbean|latin",i];
    nwr${A(2500)}${EAT}["name"~"dominic|quisqueya|colmado",i];
    nwr${A(2500)}["shop"]["name"~"dominic|quisqueya|colmado|latin",i];
    nwr${A(700)}["shop"="supermarket"];
  );out center tags;`;
  const json = await overpass(q);
  const out: Places = { at: Date.now(), japanese: [], dominican: [], supermarket: [] };
  const seen = new Set<string>();
  for (const el of json.elements as any[]) {
    const tg = el.tags || {};
    const name: string | undefined = tg.name;
    const lat = el.lat ?? el.center?.lat, lng = el.lon ?? el.center?.lon;
    if (!name || lat == null || seen.has(name + lat)) continue;
    seen.add(name + lat);
    const cuisine = String(tg.cuisine || "").toLowerCase();
    const item = { name, lat, lng, d: Math.round(metres(pt, { lat, lng })) };
    if (/japanese|sushi|ramen|izakaya/.test(cuisine) || (tg.shop && /jap|asia|orient/i.test(name))) out.japanese.push(item);
    else if (/dominican|caribbean|latin/.test(cuisine) || /dominic|quisqueya|colmado|latin/i.test(name)) out.dominican.push(item);
    else if (tg.shop === "supermarket") out.supermarket.push(item);
  }
  for (const c of CATS) out[c.key].sort((a, b) => a.d - b.d);
  store.set(key, out);
  return out;
}

export default function Homes() {
  const { t, lang } = useLang();
  const [data, setData] = useState<{ updatedAt: string; listings: Listing[] } | null>(null);
  const [error, setError] = useState(false);
  const [coords, setCoords] = useState<Record<string, Pt>>({});
  const [area, setArea] = useState("All");
  const [sort, setSort] = useState("price");
  const [onlyLiked, setOnlyLiked] = useState(false);
  const [liked, setLiked] = useState<string[]>([]);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [places, setPlaces] = useState<Record<string, PlaceState>>({});
  const [photo, setPhoto] = useState<Record<string, number>>({});

  useEffect(() => { setLiked(store.get<string[]>("vlc-liked", [])); loadPrebuilt(); }, []);
  useEffect(() => { store.set("vlc-liked", liked); }, [liked]);

  const load = useCallback(async () => {
    try {
      const res = await fetch(DATA_URL + "?t=" + Date.now(), { cache: "no-store" });
      if (!res.ok) throw new Error();
      setData(await res.json());
      setError(false);
    } catch { setError(true); }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, POLL_MS);
    return () => clearInterval(id);
  }, [load]);

  useEffect(() => {
    if (!data) return;
    loadPrebuilt().then((built) => data.listings.forEach((f) => {
      const known = f.lat && f.lng ? { lat: f.lat, lng: f.lng } : built[f.id] ? { lat: built[f.id].lat, lng: built[f.id].lng } : null;
      if (known) { setCoords((c) => (c[f.id] ? c : { ...c, [f.id]: known })); return; }
      geocode(f).then((pt) => pt && setCoords((c) => ({ ...c, [f.id]: pt })));
    }));
  }, [data]);

  const loadNearby = async (f: Listing) => {
    setPlaces((p) => ({ ...p, [f.id]: { loading: true } }));
    const pt = coords[f.id] || (await geocode(f));
    if (!pt) { setPlaces((p) => ({ ...p, [f.id]: { error: "map" } })); return; }
    try { const r = await fetchNearby(pt, f.id); setPlaces((p) => ({ ...p, [f.id]: r })); }
    catch { setPlaces((p) => ({ ...p, [f.id]: { error: "busy" } })); }
  };

  const toggleNearby = (f: Listing) => {
    const next = !open[f.id];
    setOpen((o) => ({ ...o, [f.id]: next }));
    const p = places[f.id];
    if (next && !(p && ("at" in p || "loading" in p))) loadNearby(f);
  };

  const listings = data?.listings || [];
  const areas = useMemo(() => Array.from(new Set(listings.map((f) => f.area))), [listings]);
  const cheapest = useMemo(() => listings.reduce<Listing | null>((m, f) => (!m || f.price < m.price ? f : m), null)?.id, [listings]);
  const list = useMemo(() => {
    const key: Record<string, (f: Listing) => number> = {
      price: (f) => f.price, space: (f) => -f.size, value: (f) => f.price / f.size, safety: (f) => -areaInfo(f.area).safety,
    };
    return listings
      .filter((f) => f.status !== "rejected")
      .filter((f) => (area === "All" || f.area === area) && (!onlyLiked || liked.includes(f.id)))
      .sort((a, b) => key[sort](a) - key[sort](b));
  }, [listings, area, sort, onlyLiked, liked]);

  const updated = data?.updatedAt ? new Date(data.updatedAt).toLocaleString(lang === "ja" ? "ja-JP" : "en-GB", { dateStyle: "medium", timeStyle: "short" }) : "";

  return (
    <>
      <PageHead
        eyebrow={{ en: "Valencia homes · from idealista", ja: "バレンシアの物件 · idealistaより" }}
        title={{ en: "Dog-friendly flats near the centre", ja: "中心部の犬OK物件" }}
        intro={{ en: "2–3 bedrooms, ideally under €1,000 and up to €1,400. Tap “What's nearby” for Japanese spots, Dominican spots and supermarkets within walking distance.", ja: "2〜3LDK、できれば1,000ユーロ以下、上限1,400ユーロ。「周辺を見る」で徒歩圏内の日本食・ドミニカ料理・スーパーを表示。" }}
      />

      <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-stone-500">
        {error ? <span className="text-red-800">{t({ en: "Couldn't load listings. Check your connection.", ja: "物件を読み込めませんでした。接続を確認してください。" })}</span>
          : data ? <span>{t({ en: `Updated ${updated} · ${listings.length} flats`, ja: `${updated}更新 · ${listings.length}件` })}</span>
          : <span>{t({ en: "Loading listings…", ja: "物件を読み込み中…" })}</span>}
        <button onClick={load} className="inline-flex items-center gap-1 rounded border border-stone-300 bg-white px-2.5 py-1.5 font-medium text-stone-700">
          <RefreshCw className="h-3 w-3" /> {t({ en: "Refresh", ja: "更新" })}
        </button>
        <a href={EDIT_URL} target="_blank" rel="noreferrer" className="font-medium text-indigo-700 hover:underline">{t({ en: "Edit the list", ja: "リストを編集" })}</a>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <select value={area} onChange={(e) => setArea(e.target.value)} aria-label={t({ en: "Area", ja: "エリア" })} className="rounded border border-stone-300 bg-white px-3 py-2 text-xs">
          <option value="All">{t({ en: "All areas", ja: "すべてのエリア" })}</option>
          {areas.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label={t({ en: "Sort", ja: "並び替え" })} className="rounded border border-stone-300 bg-white px-3 py-2 text-xs">
          <option value="price">{t({ en: "Lowest price", ja: "安い順" })}</option>
          <option value="space">{t({ en: "Most space", ja: "広い順" })}</option>
          <option value="value">{t({ en: "Best €/m²", ja: "㎡単価が安い順" })}</option>
          <option value="safety">{t({ en: "Calmest area", ja: "落ち着いたエリア順" })}</option>
        </select>
        <button onClick={() => setOnlyLiked((v) => !v)} aria-pressed={onlyLiked} className={`rounded-full border px-3 py-1.5 text-xs font-medium ${onlyLiked ? "border-stone-800 bg-stone-800 text-white" : "border-stone-300 bg-white"}`}>
          {t({ en: `Liked (${liked.length})`, ja: `お気に入り（${liked.length}）` })}
        </button>
      </div>

      {data && list.length === 0 && (
        <div className="mb-5 rounded border border-dashed border-stone-300 p-6 text-sm text-stone-500">
          {onlyLiked ? t({ en: "No liked flats yet. Tap a heart to shortlist one.", ja: "お気に入りはまだありません。ハートをタップして追加。" }) : t({ en: "No flats match. Try another area.", ja: "該当する物件がありません。別のエリアを選んでください。" })}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((f) => {
          const info = areaInfo(f.area);
          const pt = coords[f.id];
          const imgs = f.images || [];
          const idx = photo[f.id] || 0;
          const tile = !imgs.length && pt ? tileFor(pt.lat, pt.lng) : null;
          const tp = tile ? Math.min(1, Math.max(0, (tile.fy - 0.375) / 0.25)) : 0;
          const isLiked = liked.includes(f.id);
          const p = places[f.id];
          return (
            <article key={f.id} className={`flex flex-col overflow-hidden rounded border bg-white ${f.id === cheapest ? "border-emerald-700 ring-1 ring-emerald-700" : "border-stone-200"}`}>
              <div className="relative aspect-[4/3] bg-stone-200">
                {imgs.length ? (
                  <>
                    <img src={imgs[idx]} alt="" loading="lazy" className="h-full w-full object-cover" />
                    {imgs.length > 1 && (
                      <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-stone-900/70 px-2 text-xs text-white">
                        <button aria-label="Previous photo" className="px-1 text-lg" onClick={() => setPhoto((s) => ({ ...s, [f.id]: (idx - 1 + imgs.length) % imgs.length }))}>‹</button>
                        {idx + 1}/{imgs.length}
                        <button aria-label="Next photo" className="px-1 text-lg" onClick={() => setPhoto((s) => ({ ...s, [f.id]: (idx + 1) % imgs.length }))}>›</button>
                      </div>
                    )}
                  </>
                ) : tile ? (
                  <div className="absolute inset-0 bg-no-repeat grayscale-[30%]" style={{ backgroundImage: `url(${tile.url})`, backgroundSize: "100% auto", backgroundPosition: `0 ${tp * 100}%` }}>
                    <MapPin className="absolute h-7 w-7 -translate-x-1/2 -translate-y-full fill-red-600 text-white" style={{ left: `${tile.fx * 100}%`, top: `${((tile.fy - tp * 0.25) / 0.75) * 100}%` }} />
                    <span className="absolute bottom-2 left-2 rounded bg-white/90 px-2 py-0.5 text-[11px] text-stone-600">{t({ en: "No photos yet", ja: "写真はまだありません" })}</span>
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-stone-500">{t({ en: "Finding on the map…", ja: "地図で検索中…" })}</div>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-2 p-4">
                {f.id === cheapest && <span className="self-start rounded bg-emerald-700 px-2 py-0.5 text-[11px] font-medium text-white">{t({ en: "Cheapest right now", ja: "現在の最安値" })}</span>}
                <p className="font-mono text-2xl font-semibold text-stone-900">€{f.price.toLocaleString("en-GB")}<span className="text-sm font-normal text-stone-500"> {t({ en: "/month", ja: "/月" })}</span></p>
                <p className="font-serif text-lg font-semibold text-stone-900">{f.area}{f.district ? `, ${f.district}` : ""}</p>
                <p className="-mt-1 text-xs text-stone-500">{f.street || t({ en: "Street not listed", ja: "通り名の記載なし" })}</p>
                <div className="flex flex-wrap gap-3 border-y border-dashed border-stone-200 py-2 text-sm">
                  <span>{f.bedrooms} {t({ en: "bed", ja: "寝室" })}</span>
                  <span>{f.bathrooms} {t({ en: "bath", ja: "浴室" })}</span>
                  <span>{f.size} m²</span>
                  <span>€{(f.price / f.size).toFixed(1)}/m²</span>
                </div>
                {t(info.note) && <p className="text-sm text-stone-600">{t(info.note)}</p>}
                <p className="text-xs font-medium text-emerald-800">{t({ en: "Calm & safety", ja: "落ち着き・治安" })}: {"●".repeat(info.safety)}{"○".repeat(5 - info.safety)}</p>
                {f.notes && <p className="text-sm text-stone-800">📝 {f.notes}</p>}

                <button onClick={() => toggleNearby(f)} aria-expanded={!!open[f.id]} className="self-start rounded bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-800">
                  {open[f.id] ? t({ en: "Hide nearby", ja: "周辺を閉じる" }) : t({ en: "What's nearby", ja: "周辺を見る" })}
                </button>
                {open[f.id] && (
                  <div className="space-y-2 border-l-2 border-stone-800 pl-3 text-sm">
                    {!p || "loading" in p ? <p className="text-stone-500">{t({ en: "Looking around the block…", ja: "周辺を検索中…" })}</p>
                      : "error" in p ? (
                        <p className="text-red-800">
                          {p.error === "map" ? t({ en: "Couldn't find this address on the map.", ja: "この住所が地図で見つかりませんでした。" }) : t({ en: "The places service is busy right now.", ja: "周辺情報サービスが混み合っています。" })}{" "}
                          <button onClick={() => loadNearby(f)} className="font-medium text-indigo-700 underline">{t({ en: "Try again", ja: "再試行" })}</button>
                        </p>
                      ) : CATS.map((c) => (
                        <div key={c.key}>
                          <p className="font-medium">{c.emoji} {t(c.label)} <span className="font-normal text-stone-500">({p[c.key].length})</span></p>
                          {p[c.key].length === 0 ? <p className="text-xs text-stone-500">{t({ en: "None within walking distance", ja: "徒歩圏内にはなし" })}</p> : (
                            <ul className="list-disc pl-5">
                              {p[c.key].slice(0, 4).map((s) => (
                                <li key={s.name + s.lat}>
                                  <a href={mapsUrl(`${s.name}, València`)} target="_blank" rel="noreferrer" className="hover:underline">{s.name}</a>
                                  <span className="text-xs text-stone-500"> · {t({ en: `${Math.max(1, Math.round(s.d / 80))} min walk`, ja: `徒歩${Math.max(1, Math.round(s.d / 80))}分` })}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                  </div>
                )}

                <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                  <div className="flex flex-wrap gap-3 text-xs font-medium text-indigo-700">
                    <a href={listingUrl(f)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:underline">
                      {f.url ? t({ en: "View listing", ja: "物件を見る" }) : t({ en: "Find listing", ja: "物件を探す" })} <ExternalLink className="h-3 w-3" />
                    </a>
                    <a href={mapsUrl(addressOf(f))} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:underline">
                      {t({ en: "Maps", ja: "地図" })} <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <button
                    onClick={() => setLiked((l) => (l.includes(f.id) ? l.filter((x) => x !== f.id) : [...l, f.id]))}
                    aria-pressed={isLiked}
                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${isLiked ? "border-rose-700 bg-rose-700 text-white" : "border-stone-300"}`}
                  >
                    <Heart className={`h-3.5 w-3.5 ${isLiked ? "fill-current" : ""}`} /> {isLiked ? t({ en: "Liked", ja: "お気に入り" }) : t({ en: "Like", ja: "いいね" })}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <p className="mt-6 text-xs text-stone-500">
        {t({ en: "Listings come from idealista; confirm pet rules with each landlord. Nearby places come live from OpenStreetMap. Safety dots are a general impression. Map tiles © OpenStreetMap contributors.", ja: "物件情報はidealistaより。ペットの条件は各大家さんに確認してください。周辺情報はOpenStreetMapからリアルタイムで取得。治安の評価は一般的な印象です。地図 © OpenStreetMap contributors。" })}
      </p>
    </>
  );
}
