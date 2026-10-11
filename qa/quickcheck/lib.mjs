// Quickcheck - gemeinsame Hilfen: Pruefungs-Register, Shell, Baseline, Browser.
// Nur Lesen auf LoxBerry/Proxy. Schreibt nur in qa/quickcheck/baseline.json (Befehl "baseline") und audit/qc-runs.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

export const QA = path.dirname(new URL(import.meta.url).pathname);
export const R = path.resolve(QA, '../..');
export const H = `${R}/config/app/webfrontend/html`;
export const WEBVISU = `${R}/config/app/bin/webvisu.py`;
export const APK = `${R}/config/app/android/LoxPanel-Launcher.apk`;
export const KIOSK = `${R}/android/panel-launcher/src/de/loxpanel/launcher/Kiosk.java`;
export const BROWSER_DIR = process.env.QC_BROWSER_DIR || '/home/dietpi/projekte/tools/browser';
export const CHROMIUM = process.env.QC_CHROMIUM || '/usr/bin/chromium';
export const LPDEV = process.env.QC_LPDEV || 'http://127.0.0.1:8099';
export const PROXY = process.env.QC_PROXY || 'http://127.0.0.1:8097';
export const LOXBERRY = process.env.QC_LOXBERRY || 'http://192.168.1.103:8098';
export const SHELLY = process.env.QC_SHELLY || '192.168.1.247:5555';
export const RUNS_DIR = process.env.QC_RUNS || '/home/dietpi/projekte/audit/qc-runs';
export const TOK_SECRET = 'abc123def456';   // nur fuer Stub-Tests (kein echtes Token)

export const opts = { full: false };
export const scratch = process.env.QC_SCRATCH || fs.mkdtempSync(path.join(os.tmpdir(), 'qc-'));
fs.mkdirSync(scratch, { recursive: true });

export function sh(cmd, o = {}) {
  const r = spawnSync('bash', ['-c', cmd], { cwd: o.cwd || R, encoding: 'utf8', timeout: o.timeout || 120000,
    env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1', ...(o.env || {}) }, maxBuffer: 64 * 1024 * 1024 });
  return { code: r.status === null ? 124 : r.status, out: (r.stdout || '').trim(), err: (r.stderr || '').trim() };
}
export const read = f => fs.readFileSync(f, 'utf8');
export const exists = f => fs.existsSync(f);
export const ms = () => Date.now();

// ---------- Ergebnis-Helfer ----------
export const PASS = (info = '') => ({ r: 'PASS', info });
export const FAIL = (info = '') => ({ r: 'FAIL', info });
export const WARN = (info = '') => ({ r: 'WARN', info });
export const SKIP = (info = '') => ({ r: 'SKIP', info });

// ---------- Register ----------
export const checks = [];
// meta: id, stage (pre|post|pm), role, must (bool), mode (auto|manuell|teils), title, full (nur mit --full)
export function def(meta, fn) { checks.push({ ...meta, fn }); }

// ---------- Version ----------
export function repoVersion() {
  const m = /^VERSION=(\S+)/m.exec(read(`${R}/plugin.cfg`));
  return m ? m[1] : '';
}
export function cmpVer(a, b) {
  const x = a.split('.').map(Number), y = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) { if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) - (y[i] || 0); }
  return 0;
}

// ---------- HTTP (nur GET/HEAD) ----------
export async function http(url, o = {}) {
  const t0 = ms();
  try {
    const r = await fetch(url, { method: o.method || 'GET', signal: AbortSignal.timeout(o.timeout || 10000), redirect: o.redirect || 'follow' });
    const buf = o.head ? Buffer.alloc(0) : Buffer.from(await r.arrayBuffer());
    return { ok: r.ok, status: r.status, size: buf.length, text: () => buf.toString('utf8'), json: () => JSON.parse(buf.toString('utf8')), headers: r.headers, ms: ms() - t0 };
  } catch (e) { return { ok: false, status: 0, size: 0, err: String(e.message || e), text: () => '', json: () => null, ms: ms() - t0 }; }
}

// ---------- Baseline ----------
// Aufbau: { section: { "<Schluessel>": { ref: "<Fundstelle der Doku>", note: "..." } } }; Sonderfall allow_untracked (Liste).
const BASE_FILE = `${QA}/baseline.json`;
export const base = fs.existsSync(BASE_FILE) ? JSON.parse(read(BASE_FILE)) : {};
export const collected = {};   // nur im Modus "baseline"
export let collectMode = false;
export function setCollect(v) { collectMode = v; }
// Liefert die Schluessel, die NICHT in der Baseline stehen (neu). Im Sammelmodus: merken, nichts melden.
export function news(section, keys) {
  const uniq = [...new Set(keys)];
  if (collectMode) { collected[section] = [...new Set([...(collected[section] || []), ...uniq])]; return []; }
  const b = base[section] || {};
  return uniq.filter(k => !(k in b));
}
export function baseCount(section) { return Object.keys(base[section] || {}).length; }
export function writeBaseline(meta) {
  const out = { _doc: base._doc || 'Bekannte, dokumentierte Befunde. Nur NEUE Funde (nicht hier gelistet) werden gemeldet. Jeder Eintrag braucht ref (Fundstelle im Audit). qc.sh baseline schreibt neu gemessene Schluessel mit ref UNDOKUMENTIERT - vor dem Einchecken pruefen.' };
  out._meta = meta;
  for (const s of new Set([...Object.keys(collected), ...Object.keys(base).filter(k => !k.startsWith('_'))])) {
    if (s === 'allow_untracked' || s === 'terms_allow_note') { out[s] = base[s]; continue; }
    if (!(s in collected)) { out[s] = base[s]; continue; }   // Abschnitt in diesem Lauf nicht gemessen: erhalten
    const o = {};
    for (const k of collected[s].sort()) o[k] = (base[s] && base[s][k]) || { ref: 'UNDOKUMENTIERT' };
    out[s] = o;
  }
  if (!out.allow_untracked) out.allow_untracked = base.allow_untracked || [];
  fs.writeFileSync(BASE_FILE, JSON.stringify(out, null, 1) + '\n');
}

// ---------- Browser ----------
let _pw = null, _browser = null;
export function pw() {
  if (!_pw) _pw = createRequire(`${BROWSER_DIR}/`)('playwright-core');
  return _pw;
}
export async function browser() {
  if (!_browser) _browser = await pw().chromium.launch({ executablePath: CHROMIUM, args: ['--no-sandbox'] });
  return _browser;
}
export async function closeBrowser() { if (_browser) { await _browser.close().catch(() => {}); _browser = null; } }

// /api/tablayout: Tab-Editor holt per POST nur die wirksame Belegung (webvisu.py api_tab_layout, kein Speichern)
export const READ_ONLY_POST = ['/api/tablayout'];
// Seite mit Fehlersammler. Alle Nicht-GET-Anfragen werden abgebrochen und gezaehlt (Schutz + Messung).
export async function openPage(url, { w = 960, h = 480, ctxOpts = {}, init = null, wait = 3500, blockWrites = true, readyFn = null } = {}) {
  const b = await browser();
  const ctx = await b.newContext({ viewport: { width: w, height: h }, ...ctxOpts });
  if (init) await ctx.addInitScript(init);
  const pg = await ctx.newPage();
  const st = { errs: [], cons: [], writes: [], http: [], rpc: [] };
  pg.on('pageerror', e => st.errs.push(e.message));
  pg.on('console', m => { if (m.type() === 'error') st.cons.push(m.text().slice(0, 200)); });
  pg.on('response', r => { if (r.status() >= 400) st.http.push(`${r.status()} ${new URL(r.url()).pathname}`); });
  await ctx.route('**/*', route => {
    const rq = route.request(), m = rq.method();
    // Reine Berechnungs-POSTs (liefern nur Daten, speichern nichts) zaehlen nicht als Schreibzugriff, werden aber nie ausgefuehrt
    if (m === 'POST' && READ_ONLY_POST.includes(new URL(rq.url()).pathname)) { st.rpc.push(new URL(rq.url()).pathname); return route.abort(); }
    if (m !== 'GET' && m !== 'HEAD' && m !== 'OPTIONS') { st.writes.push(`${m} ${new URL(rq.url()).pathname}`); return blockWrites ? route.abort() : route.continue(); }
    return route.continue();
  });
  if (url) await pg.goto(url, { waitUntil: 'domcontentloaded' });
  if (readyFn) await pg.waitForFunction(readyFn, null, { timeout: 20000 }).catch(() => {});
  if (wait) await pg.waitForTimeout(wait);
  return { pg, ctx, st, close: () => ctx.close().catch(() => {}) };
}
// Bekannte, harmlose Konsolenmeldungen (Ressourcen-404 bzw. 403 auf geschuetzte Config-Ressourcen)
export const consoleNoise = t => /404|403|Failed to load resource|favicon/i.test(t);
