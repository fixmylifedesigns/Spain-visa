// Pre-fetches "what's nearby" for every Valencia listing so the site doesn't wait on Overpass.
// Runs in GitHub Actions before `next build`. Never fails the build: flats it can't fetch
// are simply left out, and the page falls back to a live lookup for them.
import fs from "node:fs/promises";

const LISTINGS_URL = "https://raw.githubusercontent.com/fixmylifedesigns/valencia-home/main/data/listings.json";
const PREV_URL = process.env.PLACES_PREV_URL; // the currently published places.json, reused while fresh
const OUT = "public/data/places.json";
const MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const UA = "Spain-visa hub build (github.com/fixmylifedesigns/Spain-visa)";
const MIRRORS = [
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass-api.de/api/interpreter",
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const rad = (x) => (x * Math.PI) / 180;
const metres = (a, b) => {
  const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(h));
};

async function getJson(url, opts = {}, ms = 30000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { ...opts, signal: ctrl.signal, headers: { "User-Agent": UA, ...(opts.headers || {}) } });
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function geocode(f) {
  if (f.lat && f.lng) return { lat: f.lat, lng: f.lng };
  const q = `${f.street || f.area}, ${f.area}, València, Spain`;
  const [r] = await getJson("https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" + encodeURIComponent(q));
  await sleep(1100); // Nominatim usage policy: max 1 request/second
  return r ? { lat: +r.lat, lng: +r.lon } : null;
}

// Same query and sorting as src/app/homes/page.tsx
function query({ lat, lng }) {
  const A = (r) => `(around:${r},${lat},${lng})`;
  const EAT = '["amenity"~"restaurant|fast_food|cafe|bar"]';
  return `[out:json][timeout:60];(
    nwr${A(1200)}${EAT}["cuisine"~"japanese|sushi|ramen",i];
    nwr${A(1500)}["shop"~"supermarket|convenience|deli|food"]["name"~"jap|asia|orient",i];
    nwr${A(2500)}${EAT}["cuisine"~"dominican|caribbean|latin",i];
    nwr${A(2500)}${EAT}["name"~"dominic|quisqueya|colmado",i];
    nwr${A(2500)}["shop"]["name"~"dominic|quisqueya|colmado|latin",i];
    nwr${A(700)}["shop"="supermarket"];
  );out center tags;`;
}

async function overpass(q) {
  for (const url of MIRRORS) {
    try {
      return await getJson(url, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: "data=" + encodeURIComponent(q) }, 90000);
    } catch (e) {
      console.warn("  mirror failed:", e.message);
    }
  }
  throw new Error("all Overpass mirrors failed");
}

function classify(pt, json) {
  const out = { japanese: [], dominican: [], supermarket: [] };
  const seen = new Set();
  for (const el of json.elements || []) {
    const tg = el.tags || {};
    const name = tg.name;
    const lat = el.lat ?? el.center?.lat, lng = el.lon ?? el.center?.lon;
    if (!name || lat == null || seen.has(name + lat)) continue;
    seen.add(name + lat);
    const cuisine = String(tg.cuisine || "").toLowerCase();
    const item = { name, lat, lng, d: Math.round(metres(pt, { lat, lng })) };
    if (/japanese|sushi|ramen|izakaya/.test(cuisine) || (tg.shop && /jap|asia|orient/i.test(name))) out.japanese.push(item);
    else if (/dominican|caribbean|latin/.test(cuisine) || /dominic|quisqueya|colmado|latin/i.test(name)) out.dominican.push(item);
    else if (tg.shop === "supermarket") out.supermarket.push(item);
  }
  for (const k of Object.keys(out)) out[k].sort((a, b) => a.d - b.d);
  return out;
}

async function main() {
  const { listings } = await getJson(LISTINGS_URL);
  let prev = {};
  if (PREV_URL) {
    try { prev = (await getJson(PREV_URL)).places || {}; } catch { console.log("No previous cache published yet."); }
  }

  const places = {};
  for (const f of listings.filter((l) => l.status !== "rejected")) {
    try {
      const pt = await geocode(f);
      if (!pt) { console.warn(`${f.id}: address not found`); continue; }
      const old = prev[f.id];
      if (old && Date.now() - old.at < MAX_AGE && metres(pt, old) < 100) {
        places[f.id] = old;
        console.log(`${f.id}: reused cache`);
        continue;
      }
      places[f.id] = { ...pt, at: Date.now(), ...classify(pt, await overpass(query(pt))) };
      console.log(`${f.id}: fetched`);
      await sleep(2000); // be gentle with the public Overpass servers
    } catch (e) {
      console.warn(`${f.id}: skipped (${e.message})`);
    }
  }
  return places;
}

let places = {};
try { places = await main(); } catch (e) { console.warn("Places pre-fetch failed:", e.message); }
await fs.mkdir("public/data", { recursive: true });
await fs.writeFile(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), places }));
console.log(`Wrote ${Object.keys(places).length} flats to ${OUT}`);
