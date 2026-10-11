// Stufe post: nach der Installation, NUR LESEN (GET/HEAD, adb dumpsys/screencap). Keine Klicks, kein adb install.
import fs from 'node:fs';
import { def, sh, http, openPage, repoVersion, LOXBERRY, PROXY, SHELLY, APK, scratch, PASS, FAIL, WARN, SKIP, consoleNoise, read, R } from './lib.mjs';

const K = 'Kritiker', P = 'Programmierer', U = 'UX';

def({ id: 'QC-P01', stage: 'post', role: P, must: true, mode: 'auto', title: 'LoxBerry: /api/update current == Repo-Version, newer=false' }, async () => {
  const h = await http(LOXBERRY + '/api/update'); if (!h.ok) return FAIL(`${LOXBERRY}/api/update -> ${h.status || h.err}`);
  const j = h.json(), want = repoVersion();
  if (j.current !== want) return FAIL(`current ${j.current} != Repo ${want} (Update noch nicht installiert?)`);
  return j.newer ? WARN(`current ${j.current}, aber newer=true (latest ${j.latest})`) : PASS(`current ${j.current}, latest ${j.latest}`);
});

def({ id: 'QC-P02', stage: 'post', role: K, must: true, mode: 'auto', title: 'LoxBerry: Smoke / /config /settings /api/* /manifest /favicon.ico 200; Titel tilebert; Manifest-Name; Groesse wie lpdev' }, async () => {
  const bad = [];
  for (const p of ['/', '/config', '/settings', '/api/devices', '/api/meta', '/manifest.webmanifest', '/favicon.ico']) {
    const h = await http(LOXBERRY + p); if (h.status !== 200) { bad.push(`${p} -> ${h.status || h.err}`); continue; }
    if (p === '/' && !/<title>[^<]*tilebert/i.test(h.text())) bad.push('Titel ohne "tilebert"');
    if (p === '/manifest.webmanifest') { try { const n = h.json().name; if (!/tilebert/i.test(n || '')) bad.push('Manifest-Name "' + n + '"'); } catch (e) { bad.push('Manifest kein JSON'); } }
    if (p === '/favicon.ico' && h.size < 500) bad.push('favicon.ico zu klein');
  }
  // Frontend identisch zum Repo: gleiche Groesse wie lpdev (gleicher Code), sonst Hinweis
  const a = await http(LOXBERRY + '/'), b = await http((process.env.QC_LPDEV || 'http://127.0.0.1:8099') + '/');
  if (a.ok && b.ok && a.size !== b.size) bad.push(`/ ${a.size} B != lpdev ${b.size} B (anderer Frontend-Stand?)`);
  return bad.length ? FAIL(bad.join(' | ')) : PASS('7 Pfade 200, Titel tilebert, Frontend gleich gross wie lpdev');
});

def({ id: 'QC-P03', stage: 'post', role: K, must: true, mode: 'auto', title: 'LoxBerry: /api/devices plausibel (Liste, eindeutige Namen/UIDs, TbViewer-Geraete type tbview, bekanntes Shelly-Geraet)' }, async () => {
  const h = await http(LOXBERRY + '/api/devices'); if (!h.ok) return FAIL('/api/devices -> ' + (h.status || h.err));
  const d = h.json(), list = d.devices || [], bad = [];
  if (!Array.isArray(list)) return FAIL('devices keine Liste');
  const names = list.map(x => x.name); if (new Set(names).size !== names.length) bad.push('doppelte Namen');
  const uids = list.map(x => (x.detected || {}).uid).filter(Boolean); if (new Set(uids).size !== uids.length) bad.push('doppelte UID (Geraet nach APK-Update doppelt?)');
  const kinds = new Set(list.map(x => x.kiosk)); for (const k of kinds) if (!['', 'tbview', 'fully', 'browser', null, undefined].includes(k)) bad.push('unbekannter kiosk-Typ ' + k);
  const shelly = list.filter(x => x.ip === SHELLY.split(':')[0]);
  if (shelly.length && shelly[0].kiosk !== 'tbview') bad.push(`Shelly ${shelly[0].name}: kiosk "${shelly[0].kiosk}" != tbview`);
  const tb = list.filter(x => x.kiosk === 'tbview').length;
  const info = `${list.length} Geraete (${list.filter(x => x.online).length} online), ${tb} tbview` + (shelly.length ? `, Shelly "${shelly[0].name}" ${shelly[0].online ? 'online' : 'offline'}` : ', Shelly nicht in Liste');
  return bad.length ? FAIL(bad.join(' | ') + ' | ' + info) : PASS(info);
});

def({ id: 'QC-P04', stage: 'post', role: P, must: true, mode: 'auto', title: 'Proxy 8097: Panel (?device=claude-audit) und Config laden ohne JS-Fehler; keine Klicks, Nicht-GET abgefangen = 0' }, async () => {
  const bad = [];
  const o1 = await openPage(`${PROXY}/?device=claude-audit`, { w: 960, h: 480, wait: 5000, readyFn: () => typeof lpHost !== 'undefined' });
  const e1 = [...o1.st.errs, ...o1.st.cons.filter(c => !consoleNoise(c))]; if (e1.length) bad.push('Panel: ' + e1.slice(0, 2).join('; '));
  const tabs = await o1.pg.evaluate(() => document.querySelectorAll('#tabs .tab').length); if (!tabs) bad.push('Panel: keine Tabs');
  if (o1.st.writes.length) bad.push('Panel schreibt: ' + o1.st.writes.join(','));
  await o1.close();
  const o2 = await openPage(`${PROXY}/config`, { w: 1280, h: 900, wait: 5000, readyFn: () => typeof setRubric === 'function' });
  const e2 = [...o2.st.errs, ...o2.st.cons.filter(c => !consoleNoise(c))]; if (e2.length) bad.push('Config: ' + e2.slice(0, 2).join('; '));
  if (o2.st.writes.length) bad.push('Config schreibt beim Oeffnen: ' + o2.st.writes.join(','));
  await o2.close();
  return bad.length ? FAIL(bad.join(' | ')) : PASS(`Panel (${tabs} Tabs) und Config ohne Fehler, 0 Schreibzugriffe`);
});

def({ id: 'QC-P05', stage: 'post', role: K, must: false, mode: 'auto', title: 'Shelly per adb (nur lesen): Paketversion == APK im Repo, Vordergrund Kiosk, Screenshot nicht leer (optional)' }, async () => {
  const adb = (c, t = 20000) => sh(`timeout 25 adb -s ${SHELLY} ${c}`, { timeout: t });
  if (sh('which adb').code) return SKIP('adb nicht installiert');
  const devs = sh('adb devices').out;
  if (!devs.includes(SHELLY + '\tdevice')) { sh(`timeout 8 adb connect ${SHELLY}`, { timeout: 10000 }); if (!sh('adb devices').out.includes(SHELLY + '\tdevice')) return SKIP(`${SHELLY} nicht erreichbar`); }
  const pk = adb('shell dumpsys package de.loxpanel.launcher').out;
  const vc = (/versionCode=(\d+)/.exec(pk) || [])[1], vn = (/versionName=(\S+)/.exec(pk) || [])[1];
  const want = read(`${R}/config/app/android/LoxPanel-Launcher.version`).trim();
  const bad = [], warn = [];
  if (!vc) return FAIL('Paket de.loxpanel.launcher nicht installiert');
  if (vc !== want) bad.push(`installiert versionCode ${vc} != APK im Repo ${want}`);
  const win = adb('shell dumpsys window').out;
  const focus = (/mCurrentFocus=.*?\s(\S+)\}/.exec(win) || [])[1] || '?';
  if (!/de\.loxpanel\.launcher\/.*Kiosk/.test(focus)) warn.push('Vordergrund: ' + focus);
  const awake = /mWakefulness=Awake/.test(adb('shell dumpsys power').out);
  let shot = 'Display aus, kein Screenshot';
  if (awake) { const p = `${scratch}/shelly.png`; sh(`timeout 30 adb -s ${SHELLY} exec-out screencap -p > '${p}'`, { timeout: 35000 });
    const sz = fs.existsSync(p) ? fs.statSync(p).size : 0;
    if (sz < 3000) warn.push('Screenshot fehlgeschlagen (' + sz + ' B)'); else if (sz < 12000) warn.push(`Screenshot einfarbig/schwarz (${sz} B): Schoner/Nachtabdunkelung aktiv?`); shot = `Screenshot ${sz} B`; }
  if (bad.length) return FAIL(bad.join(' | '));
  return warn.length ? WARN(warn.join(' | ') + ` | v${vc}/${vn}, ${focus.split('/').pop()}`) : PASS(`v${vc}/${vn}, ${focus.split('/').pop()}, ${shot}`);
});
