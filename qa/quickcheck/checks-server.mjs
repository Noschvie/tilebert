// Stufe pre: Testserver lpdev (Docker, Port 8099, ohne Miniserver) neu starten und per HTTP pruefen.
import { def, sh, http, LPDEV, repoVersion, PASS, FAIL, WARN } from './lib.mjs';

const P = 'Programmierer';
const sleep = t => new Promise(r => setTimeout(r, t));

def({ id: 'QC-V01', stage: 'pre', role: P, must: true, mode: 'auto', title: 'lpdev neu starten; /api/update liefert Repo-Version; keine Tracebacks im Log' }, async () => {
  const since = sh('date -u +%Y-%m-%dT%H:%M:%S').out;
  const r = sh('docker restart lpdev', { timeout: 60000 });
  if (r.code) return FAIL('docker restart lpdev: ' + (r.err || r.out).slice(0, 120));
  const want = repoVersion(); let cur = '', last = '';
  for (let i = 0; i < 40; i++) { await sleep(1000); const h = await http(LPDEV + '/api/update'); if (h.ok) { try { const j = h.json(); cur = j.current; last = JSON.stringify(j); if (cur === want) break; } catch (e) {} } }
  if (cur !== want) return FAIL(`/api/update current "${cur}" != Repo ${want} (${last || 'keine Antwort'})`);
  const log = sh(`docker logs --since ${since} lpdev 2>&1 | grep -ciE 'traceback|exception'`).out;
  return +log ? FAIL(`${log} Traceback-/Exception-Zeilen im Log seit Neustart`) : PASS(`current ${cur}, Log sauber`);
});

def({ id: 'QC-V02', stage: 'pre', role: P, must: true, mode: 'auto', title: 'API-Smoke lpdev: /, /config, /settings, /api/update, /api/devices, /api/meta, /manifest.webmanifest, /favicon.ico -> 200, JSON gueltig' }, async () => {
  const bad = [], sizes = [];
  for (const p of ['/', '/config', '/settings', '/api/update', '/api/devices', '/api/meta', '/manifest.webmanifest', '/favicon.ico']) {
    const h = await http(LPDEV + p);
    if (h.status !== 200) { bad.push(`${p} -> ${h.status || h.err}`); continue; }
    sizes.push(`${p} ${(h.size / 1024).toFixed(0)}K`);
    if (p.startsWith('/api/') || p.endsWith('.webmanifest')) { try { h.json(); } catch (e) { bad.push(p + ' kein JSON'); } }
    if (p === '/api/update') { const j = h.json(); if (j.newer === true) bad.push('/api/update newer=true (lpdev kennt neuere Version)'); }
    if (p === '/' && !/<title>[^<]*tilebert/i.test(h.text())) bad.push('/ Titel enthaelt nicht "tilebert"');
    if (p === '/manifest.webmanifest') { const j = h.json(); if (!/tilebert/i.test(j.name || '')) bad.push('Manifest name "' + j.name + '"'); }
    if (p === '/favicon.ico' && h.size < 500) bad.push('favicon.ico zu klein');
  }
  return bad.length ? FAIL(bad.join(' | ')) : PASS(sizes.join(', '));
});
