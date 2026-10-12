// Stufe pre: Browser-Pruefungen (Chromium + playwright-core) gegen lpdev. Ersetzt/repariert die Einzelskripte aus tools/browser
// (perr, cfgcheck, devcheck, devcard, bright, nightcam, senscheck, tok, namecheck, wx-live): Sollwerte, Exit-Code, kein Fixwert fuer Port/Secret.
import fs from 'node:fs';
import { def, openPage, browser, pw, LPDEV, TOK_SECRET, opts, scratch, news, baseCount, PASS, FAIL, WARN, SKIP, consoleNoise, collectMode } from './lib.mjs';

const K = 'Kritiker', U = 'UX', P = 'Programmierer';
const PANEL_READY = () => typeof lpHost !== 'undefined' && typeof SENS !== 'undefined' && document.querySelectorAll('#tabs .tab').length > 0;
const errList = st => [...st.errs.map(e => 'pageerror: ' + e), ...st.cons.filter(c => !consoleNoise(c)).map(c => 'console: ' + c)];

// ---------- B01 Panel ohne Fehler ----------
def({ id: 'QC-B01', stage: 'pre', role: P, must: true, mode: 'auto', title: 'Panel laedt ohne pageerror/Konsolenfehler (g3-3x1-f18, g2-2x2-f12, sens; 960x480) - Laufzeitbeleg gegen TDZ/"not defined"' }, async () => {
  const bad = [];
  for (const prof of ['g3-3x1-f18', 'g2-2x2-f12', 'sens']) {
    const o = await openPage(`${LPDEV}/?panel=${prof}&device=qc`, { readyFn: PANEL_READY, wait: 1500 });
    const e = errList(o.st); if (e.length) bad.push(`${prof}: ${e.slice(0, 2).join('; ')}`);
    const tabs = await o.pg.evaluate(() => document.querySelectorAll('#tabs .tab').length);
    if (!tabs) bad.push(`${prof}: keine Tabs gerendert`);
    await o.close();
  }
  return bad.length ? FAIL(bad.join(' | ')) : PASS('3 Profile, 0 Fehler');
});

// ---------- Config durchlaufen ----------
async function cfgSubs(pg) {
  return pg.evaluate(() => ({ set: SYS_TABS().map(t => t.k), dev: DEV_TABS.map(t => t.k), pc: PCONF_TABS.map(t => t.k) }));
}
async function cfgGo(pg, r, s) {
  await pg.evaluate(([r, s]) => { if (r === 'pconf') { cur = 'sens'; tbReset(); }
    if (r === 'settings' && s && s.indexOf('g:') === 0) goTo('global', s.slice(2)); else if (r === 'overview') setRubric('overview'); else goTo(r, s); }, [r, s]);
  await pg.waitForTimeout(250);
}
async function cfgWalk(pg, each) {
  const subs = await cfgSubs(pg);
  const list = [['overview', ''], ...subs.set.map(s => ['settings', s]), ...subs.dev.map(s => ['devices', s]), ...subs.pc.map(s => ['pconf', s])];
  for (const [r, s] of list) { await cfgGo(pg, r, s); await each(r + (s ? ':' + s : '')); }
  return list.length;
}
// META (async geladen) muss da sein: config.html:4579 liest META.deviceModels ohne Null-Pruefung (Race, siehe Doku)
const CFG_READY = () => typeof setRubric === 'function' && typeof PANELS !== 'undefined' && PANELS.__global__ && typeof META !== 'undefined' && META;

def({ id: 'QC-B02', stage: 'pre', role: P, must: true, mode: 'auto', title: 'Config/Geraete/Settings ohne pageerror; alle Rubriken und Reiter durchgeblaettert; Geraet-hinzufuegen-Formular (#np_go) vorhanden' }, async () => {
  const bad = []; let n = 0;
  let o = await openPage(`${LPDEV}/config`, { readyFn: CFG_READY, wait: 1500 });
  n = await cfgWalk(o.pg, () => {});
  const e = errList(o.st); if (e.length) bad.push('/config: ' + e.slice(0, 3).join('; '));
  await o.pg.evaluate(() => goTo('devices', 'add')); await o.pg.waitForTimeout(400);
  const wiz = await o.pg.evaluate(() => !!document.querySelector('section.spane.active[data-sub="add"] #np_go'));
  if (!wiz) bad.push('Formular #np_go fehlt unter Geraete -> Geraet hinzufuegen');
  await o.close();
  o = await openPage(`${LPDEV}/config#devices`, { wait: 2500 });
  const e2 = errList(o.st); if (e2.length) bad.push('/config#devices: ' + e2.slice(0, 2).join('; '));
  await o.close();
  o = await openPage(`${LPDEV}/settings`, { wait: 1500 });
  const e3 = errList(o.st); if (e3.length) bad.push('/settings: ' + e3.slice(0, 2).join('; '));
  await o.close();
  return bad.length ? FAIL(bad.join(' | ')) : PASS(`${n} Ansichten, Formular ok, 0 Fehler`);
});

def({ id: 'QC-B03', stage: 'pre', role: U, must: true, mode: 'auto', title: 'Config schreibt beim Oeffnen/Navigieren nichts (alle Nicht-GET abgefangen = 0; de-DE und en-US)' }, async () => {
  const w = [];
  for (const locale of ['de-DE', 'en-US']) {
    const o = await openPage(`${LPDEV}/config`, { ctxOpts: { locale, viewport: { width: 1280, height: 900 } }, w: 1280, h: 900, readyFn: CFG_READY, wait: 1500 });
    await cfgWalk(o.pg, () => {});
    w.push(...o.st.writes.map(x => `${locale}: ${x}`));
    await o.close();
  }
  return w.length ? FAIL(`${w.length} Schreibzugriffe: ${[...new Set(w)].slice(0, 4).join(', ')}`) : PASS('0 Nicht-GET in de-DE und en-US (inkl. Rubrikwechsel)');
});

// ---------- B04 Sensoren / Helligkeit / Nacht-Kamera ----------
def({ id: 'QC-B04', stage: 'pre', role: K, must: true, mode: 'auto', title: 'Sensor-Logik mit Sollwerten: setAutoBrightness nur Shelly, Annaeherung (open/wake), Nacht-Kamera (Sperre, Annaeherung, Beruehrung, Nachlauf, Option aus), prox=off, Config-Sensorfelder' }, async () => {
  const bad = [];
  // a) Helligkeit/Auto (frueher bright.mjs)
  let o = await openPage(`${LPDEV}/?panel=sens`, { readyFn: () => typeof SENS !== 'undefined' && typeof applySensors === 'function', wait: 1500 });
  const a = await o.pg.evaluate(() => {
    const out = {}; lpHost.type = 'tbview'; let auto = null, calls = [];
    lpHost.api = { setDisplayBrightness: p => (calls.push(p), true), getDeviceInfo: () => window.__info, setProximityWake() {}, setAutoBrightness: (...x) => { auto = x; } };
    NIGHT.dim = 60;
    window.__info = '{"prox":true,"light":true,"model":"Jenna"}'; applySensors({ prox: 'wake', auto: true, min: 10, max: 100 }); out.shelly = { auto, shelly: lpHost.shelly };
    applySensors({ prox: 'wake', auto: false }); out.autoAus = { auto };
    window.__info = '{"prox":true,"light":true,"model":"SM-T510"}'; applySensors({ prox: 'wake', auto: true }); out.tablet = { auto, shelly: lpHost.shelly };
    return out;
  });
  if (!(a.shelly.shelly === true && a.shelly.auto && a.shelly.auto[0] === true && a.shelly.auto[1] === 10 && a.shelly.auto[2] === 100)) bad.push('Shelly+Auto: setAutoBrightness(true,10,100) erwartet, war ' + JSON.stringify(a.shelly));
  if (!(a.autoAus.auto && a.autoAus.auto[0] === false)) bad.push('Auto aus: setAutoBrightness(false) erwartet, war ' + JSON.stringify(a.autoAus));
  if (!(a.tablet.shelly === false && a.tablet.auto && a.tablet.auto[0] === false)) bad.push('Tablet (SM-T510): Auto darf nicht aktiv werden, war ' + JSON.stringify(a.tablet));
  // b) Annaeherung "open" schliesst Schoner; "wake" weckt auch; "off" nicht (frueher senscheck.mjs)
  const s = await o.pg.evaluate(() => {
    lpHost.type = 'tbview'; const r = {};
    SENS.prox = 'open'; showSaver(); const v = saverOn(); lpHost._ev('prox', true); r.open = [v, saverOn()];
    SENS.prox = 'wake'; showSaver(); const v2 = saverOn(); lpHost._ev('prox', true); r.wake = [v2, saverOn()];
    SENS.prox = 'off'; showSaver(); const v3 = saverOn(); lpHost._ev('prox', true); r.off = [v3, saverOn()];
    try { hideSaver(); } catch (e) {} return r;
  });
  if (!(s.open[0] === true && s.open[1] === false)) bad.push('prox=open: Schoner muss bei Annaeherung schliessen, war ' + JSON.stringify(s.open));
  if (!(s.off[0] === true && s.off[1] === true)) bad.push('prox=off: Annaeherung darf den Schoner nicht schliessen, war ' + JSON.stringify(s.off));
  const e = errList(o.st); if (e.length) bad.push('Fehler: ' + e[0]);
  await o.close();
  // c) Nacht-Kamera (frueher nightcam.mjs, mit Sollwerten)
  const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  o = await openPage(`${LPDEV}/?panel=sens`, { readyFn: () => typeof SENS !== 'undefined' && SENS.nightCam === true && typeof camStream === 'function', wait: 800 });
  const st = () => o.pg.evaluate(() => { const img = document.getElementById('tcam'); return { night: NIGHT.on, camnight: document.documentElement.classList.contains('camnight'), live: !!img.getAttribute('src'), still: !!img.parentElement.querySelector('canvas.camstill'), ov: !!img.parentElement.querySelector('.camnightov') }; });
  // Server-Nachrichten duerfen die simulierte Nacht nicht zuruecksetzen (tagsueber sendet lpdev night.on=false)
  await o.pg.evaluate(() => { window.__setNight = setNight; window.__nightLog = []; setNight = on => { window.__nightLog.push(on); }; });
  await o.pg.evaluate(u => { lpHost.type = 'tbview'; lpHost.prox = true;
    const host = document.createElement('div'); host.className = 'sv-cam-frame'; host.style.cssText = 'position:fixed;left:20px;top:20px;width:320px;height:180px;z-index:99999;background:#222;overflow:hidden';
    const img = document.createElement('img'); img.id = 'tcam'; host.appendChild(img); document.body.appendChild(host); camStream(img, u + '#?id=test', 0); }, png);
  const step = async (name, act, exp) => { if (act) await o.pg.evaluate(act); await o.pg.waitForTimeout(350); const r = await st();
    for (const [k, v] of Object.entries(exp)) if (r[k] !== v) { bad.push(`Nachtkamera "${name}": ${k}=${r[k]} erwartet ${v}`); break; } };
  await step('Laden', null, { live: true });
  await step('Nacht, fern', () => { lpHost._ev('prox', false); __setNight(true); }, { camnight: true, live: false, still: true, ov: true });
  await step('Annaeherung', () => lpHost._ev('prox', true), { camnight: false, live: true, still: false });
  await step('Annaeherung weg (Nachlauf 30 s)', () => lpHost._ev('prox', false), { camnight: false, live: true });
  await step('nach Nachlauf', () => { clearTimeout(_camNightT); _camNightT = null; camNightUpdate(); }, { camnight: true, live: false, still: true });
  await step('Beruehrung', () => wake(), { camnight: false, live: true });
  await step('Option aus', () => { clearTimeout(_camNightT); _camNightT = null; camNightUpdate(); SENS.nightCam = false; camNightUpdate(); }, { camnight: false, live: true });
  await step('wieder Tag', () => { SENS.nightCam = true; camNightUpdate(); __setNight(false); }, { night: false, camnight: false, live: true });
  // prox=off: Annaeherung oeffnet die Nacht-Kamera nicht
  await step('prox=off', () => { SENS.prox = 'off'; __setNight(true); camNightUpdate(); lpHost._ev('prox', true); }, { camnight: true, live: false });
  const e2 = errList(o.st); if (e2.length) bad.push('Fehler Nachtkamera: ' + e2[0]);
  await o.close();
  // d) Config: Sensorfelder im Profil, Aenderung landet in PANELS.sens.ui, kein Speichern
  o = await openPage(`${LPDEV}/config`, { w: 1280, h: 900, readyFn: CFG_READY, wait: 800 });
  const c = await o.pg.evaluate(async () => { cur = 'sens'; tbReset(); subPconf = 'appearance'; setRubric('pconf'); await new Promise(r => setTimeout(r, 500));
    const sel = document.querySelector('select[data-uisel="prox"]'), ab = document.querySelector('select[data-uisel="autoBright"]');
    if (!sel || !ab) return { missing: true }; ab.value = 'off'; ab.dispatchEvent(new Event('change')); return { ui: PANELS.sens.ui }; });
  if (c.missing) bad.push('Config: Sensorfelder (prox/autoBright) nicht gefunden (Reiter Aussehen)'); else if (c.ui.autoBright !== false) bad.push('Config: autoBright=off landet nicht in PANELS.sens.ui: ' + JSON.stringify(c.ui));
  if (o.st.writes.length) bad.push('Config schrieb: ' + o.st.writes.join(','));
  await o.close();
  return bad.length ? FAIL(bad.join(' | ')) : PASS('Auto-Helligkeit nur Shelly, Annaeherung open/wake/off, Nachtkamera 9 Zustaende, Config-Felder');
});

// ---------- B05 Bruecke ----------
const STUB = (mode) => `(()=>{ const rec=(n,ok)=>{ try{ (window.__calls=window.__calls||[]).push(n+':'+ok); }catch(e){} };
  const SEC='${TOK_SECRET}';
  const mk=(n,okv,bad)=>function(t){ const ok=(t===SEC); rec(n,ok); if(ok){ (window.__eff=window.__eff||[]).push(n); } return ok?okv:bad; };
  const mkd=(n,okv)=>function(){ rec(n,true); return okv; };   // alte App ohne Token: Argument egal
  if('${mode}'==='tb'||'${mode}'==='old'||'${mode}'==='new-notok'){ const f='${mode}'==='tb'?mk:((n,o,b)=>mkd(n,o));
   window.TbView={ turnScreenOn:f('on'), turnScreenOff:f('off'), isScreenOn:f('isOn',true,false), getDeviceId:f('id','ABCDEF123456',''), setDisplayOff:f('dOff'), setSaver:f('saver'),
    setDisplayBrightness:f('bright',true,false), setAutoBrightness:f('auto'), setProximityWake:f('pw'), getProximity:f('prox',false,false), getLightLevel:f('ll',40,-1),
    getDeviceInfo:f('info','{"prox":true,"light":true,"model":"Jenna"}',''), reload:f('reload') }; }
  else if('${mode}'==='throw'){ const t=()=>{ throw new Error('boom'); }; window.TbView={ getDeviceId:t,getLightLevel:()=>-1,getDeviceInfo:()=>'',isScreenOn:()=>true,turnScreenOn(){},turnScreenOff(){},setDisplayOff(){},setSaver(){},setDisplayBrightness:()=>false,setAutoBrightness(){},setProximityWake(){},getProximity:()=>false,reload(){} }; }
  else if('${mode}'==='fully'){ window.fully={ turnScreenOff(){rec('f_off',true)}, turnScreenOn(){rec('f_on',true)}, isScreenOn(){rec('f_isOn',true);return false}, getDeviceId(){return 'FULLYID123456'} }; }
})();`;

def({ id: 'QC-B05', stage: 'pre', role: K, must: true, mode: 'auto', title: 'Bruecke Panel<->App: Token (tbtok), Fremd-iframe gesperrt, Kompatibilitaet App 5.3/5.4 ohne Token, getDeviceId wirft, Fully/Browser-Erkennung' }, async () => {
  const bad = [];
  const run = async (mode, url, ua) => openPage(url, { init: STUB(mode), ctxOpts: ua ? { userAgent: ua } : {}, readyFn: () => typeof lpHost !== 'undefined' && typeof DEVICE_UID !== 'undefined', wait: 1200 });
  // 1) App 5.4 mit Token
  let o = await run('tb', `${LPDEV}/?panel=sens&tbtok=${TOK_SECRET}&x=1`);
  const r1 = await o.pg.evaluate(() => ({ type: lpHost.type, uid: DEVICE_UID, url: location.href, sess: sessionStorage.getItem('tbtok'), calls: window.__calls || [] }));
  if (r1.type !== 'tbview') bad.push('Typ ' + r1.type + ' != tbview');
  if (r1.uid !== 'tb-ABCDEF123456') bad.push('UID ' + r1.uid);
  if (/tbtok/.test(r1.url)) bad.push('tbtok bleibt in der URL: ' + r1.url);
  if (r1.sess !== TOK_SECRET) bad.push('Token nicht in sessionStorage');
  if (r1.calls.some(c => c.endsWith(':false'))) bad.push('Panel-Aufrufe mit falschem Token: ' + r1.calls.filter(c => c.endsWith(':false')).join(','));
  await o.pg.evaluate(() => location.replace('?panel=sens2')); await o.pg.waitForTimeout(1800);
  const r1b = await o.pg.evaluate(() => ({ type: lpHost.type, ok: (window.__calls || []).filter(c => c === 'id:true').length }));
  if (r1b.type !== 'tbview' || !r1b.ok) bad.push('Token geht beim Panelwechsel verloren: ' + JSON.stringify(r1b));
  // 2) fremdes iframe (andere Origin) darf die Bruecke nicht nutzen
  await o.pg.evaluate(() => { const f = document.createElement('iframe'); f.src = location.origin.replace('127.0.0.1', 'localhost') + '/robots-x'; document.body.appendChild(f); });
  await o.pg.waitForTimeout(1500);
  const fr = o.pg.frames().find(f => f.url().startsWith('http://localhost'));
  if (!fr) bad.push('Fremd-iframe nicht geladen (Test nicht aussagekraeftig)');
  else { const f = await fr.evaluate(() => { const o = {}; if (!window.TbView) return { has: false }; o.has = true; o.id = window.TbView.getDeviceId(); o.br = window.TbView.setDisplayBrightness(5); o.info = window.TbView.getDeviceInfo();
      try { o.ss = window.top.sessionStorage.getItem('tbtok'); } catch (e) { o.ss = 'blocked'; } o.calls = window.__calls; return o; });
    if (f.has && (f.id || f.br || f.info || f.ss !== 'blocked' || (f.calls || []).some(c => c.endsWith(':true')))) bad.push('Fremd-iframe erreicht die Bruecke: ' + JSON.stringify(f)); }
  const e1 = errList(o.st); if (e1.length) bad.push('Fehler: ' + e1[0]);
  await o.close();
  // 3) App 5.3 ohne Token: Bruecke direkt; 5.4 ohne Token: Bruecke aus, keine Ausnahme
  o = await run('old', `${LPDEV}/?panel=sens`, 'Mozilla/5.0 (Linux; Android 8) TbView/5.3');
  let r = await o.pg.evaluate(() => ({ type: lpHost.type, uid: DEVICE_UID })); if (r.type !== 'tbview' || !/^tb-/.test(r.uid)) bad.push('App 5.3 ohne Token: ' + JSON.stringify(r)); const e2 = errList(o.st); if (e2.length) bad.push('5.3: ' + e2[0]); await o.close();
  o = await run('new-notok', `${LPDEV}/?panel=sens`, 'Mozilla/5.0 (Linux; Android 8) TbView/5.4');
  r = await o.pg.evaluate(() => ({ type: lpHost.type })); if (r.type !== 'browser') bad.push('App 5.4 ohne Token: Bruecke muss aus sein, Typ ' + r.type); const e3 = errList(o.st); if (e3.length) bad.push('5.4 ohne Token: ' + e3[0]); await o.close();
  // 4) getDeviceId wirft / liefert nichts: keine lp-UID dauerhaft
  o = await run('throw', `${LPDEV}/?panel=sens&tbtok=zz`);
  r = await o.pg.evaluate(() => ({ ls: localStorage.getItem('lp_uid'), ck: document.cookie.includes('lp_uid') })); if (r.ls || r.ck) bad.push('Ohne gueltige ID wird lp-UID gespeichert: ' + JSON.stringify(r)); const e4 = errList(o.st); if (e4.length) bad.push('getDeviceId wirft: ' + e4[0]); await o.close();
  // 5) Fully / Browser
  o = await run('fully', `${LPDEV}/?panel=sens`);
  r = await o.pg.evaluate(() => ({ type: lpHost.type, uid: DEVICE_UID })); if (r.type !== 'fully' || !/^fk-/.test(r.uid)) bad.push('Fully: ' + JSON.stringify(r)); await o.close();
  o = await run('none', `${LPDEV}/?panel=sens`);
  r = await o.pg.evaluate(() => ({ type: lpHost.type })); if (r.type !== 'browser') bad.push('Browser: Typ ' + r.type); await o.close();
  return bad.length ? FAIL(bad.join(' | ')) : PASS('Token, URL bereinigt, Panelwechsel, Fremd-iframe gesperrt, 5.3/5.4-Matrix, getDeviceId-Fehler, fully/browser');
});

// ---------- B06 UX Panel ----------
const MEASURE = ({ touch }) => {
  const vw = innerWidth, vh = innerHeight, out = { h: [], o: [], off: [], tap: [] };
  if (document.documentElement.scrollWidth > vw + 1) out.h.push('hscroll');
  const vis = e => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.05; };
  const lab = e => (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/).filter(c => !/^(active|on|off|sel|hover)$/.test(c)).slice(0, 2).join('.') : e.tagName.toLowerCase());
  const txt = e => (e.textContent || e.getAttribute('aria-label') || e.title || '').trim().replace(/\s+/g, ' ').slice(0, 24);
  document.querySelectorAll('.tile .name,.tile .sub,.status,.ssub,.pbig,.svw-weather-cell .now *,.svw-weather-cell .fc *,.sheet *,.tabs .tab').forEach(e => {
    if (!vis(e) || e.clientWidth < 4) return; const cs = getComputedStyle(e);   // nur echtes Abschneiden (overflow nicht visible)
    const sx = cs.overflowX !== 'visible' ? e.scrollWidth - e.clientWidth : 0, sy = cs.overflowY !== 'visible' ? e.scrollHeight - e.clientHeight : 0;
    if (sx > 1 || sy > 1) out.o.push(`${lab(e)}|${txt(e)}|${sx > 1 ? 'x' : ''}${sy > 1 ? 'y' : ''}`);
  });
  document.querySelectorAll('button,[role=button],.tab,.campill,.stsx,.wxar,.moreb,.sbtn,.ub,.tapbtn,.tb').forEach(e => {
    if (!vis(e)) return; const r = e.getBoundingClientRect();
    if (r.left < -1 || r.top < -1 || r.right > vw + 1 || r.bottom > vh + 1) out.off.push(`${lab(e)}|${txt(e)}`);
    if (touch) { let w = r.width, h = r.height;
      for (const ps of ['::before', '::after']) { const cs = getComputedStyle(e, ps); if (cs.content !== 'none' && cs.position === 'absolute') { w = Math.max(w, parseFloat(cs.width) || 0); h = Math.max(h, parseFloat(cs.height) || 0); } }
      const m = Math.round(Math.min(w, h)); if (m < 44) out.tap.push(`${lab(e)}|${m}`); }
  });
  return out;
};
const VPS = [['480x480', 480, 480, true], ['960x480', 960, 480, false], ['390x844', 390, 844, true], ['1280x800', 1280, 800, false]];
def({ id: 'QC-B06', stage: 'pre', role: U, must: true, mode: 'auto', title: 'UX Panel 480x480/960x480/390x844/1280x800 (Dashboard, Schoner, Wetter-Sheet): Fehler, hscroll, Abschneiden, ausserhalb Viewport, Tap-Ziele < 44 px - nur NEU gegenueber Baseline' }, async () => {
  const keys = { h: [], o: [], off: [], tap: [] }, errs = []; let views = 0;
  for (const [vn, w, h, touch] of VPS) for (const prof of ['g3-3x2-f18', 'g2-2x2-f32']) {
    const o = await openPage(`${LPDEV}/?panel=${prof}&device=qc`, { w, h, ctxOpts: touch ? { hasTouch: true, isMobile: w < 500 } : {}, readyFn: PANEL_READY, wait: 1200 });
    const snap = async view => { const m = await o.pg.evaluate(MEASURE, { touch }); views++; for (const k of Object.keys(keys)) keys[k].push(...m[k].map(x => `${vn}|${prof}|${view}|${x}`)); };
    await snap('dash');
    await o.pg.evaluate(() => { try { showSaver(); } catch (e) {} }); await o.pg.waitForTimeout(700); await snap('saver');
    await o.pg.evaluate(() => { try { hideSaver(); } catch (e) {} }); await o.pg.waitForTimeout(300);
    await o.pg.evaluate(() => { try { wxSheet(0); } catch (e) {} }); await o.pg.waitForTimeout(700); await snap('wxsheet');
    const e = errList(o.st); if (e.length) errs.push(`${vn} ${prof}: ${e[0]}`);
    const hx = o.st.http.filter(x => !/^404 \/(icon|loxlib|favicon)/.test(x));   // lpdev hat keinen Miniserver: Icons fehlen
    if (hx.length) errs.push(`${vn} ${prof} HTTP: ${[...new Set(hx)].slice(0, 2).join(',')}`);
    await o.close();
  }
  const nw = { h: news('ux_hscroll', keys.h), o: news('ux_overflow', keys.o), off: news('ux_offscreen', keys.off), tap: news('ux_tap', keys.tap) };
  const bad = [];
  if (errs.length) bad.push('Fehler: ' + errs.slice(0, 3).join('; '));
  if (nw.h.length) bad.push(`${nw.h.length} NEU hscroll: ` + nw.h.slice(0, 3).join('; '));
  if (nw.o.length) bad.push(`${nw.o.length} NEU abgeschnitten: ` + nw.o.slice(0, 3).join('; '));
  if (nw.off.length) bad.push(`${nw.off.length} NEU ausserhalb: ` + nw.off.slice(0, 3).join('; '));
  if (nw.tap.length) bad.push(`${nw.tap.length} NEU Tap-Ziel <44: ` + nw.tap.slice(0, 3).join('; '));
  const known = ['ux_hscroll', 'ux_overflow', 'ux_offscreen', 'ux_tap'].map(s => baseCount(s)).join('/');
  const info = `${views} Ansichten, bekannt (Baseline hscroll/abgeschnitten/ausserhalb/tap) ${known}`;
  return bad.length ? FAIL(bad.join(' | ') + ' | ' + info) : PASS(info + ', nichts Neues');
});

// ---------- B07 Config-Matrix ----------
def({ id: 'QC-B07', stage: 'pre', role: U, must: true, mode: 'auto', title: 'UX Config 1920/1280/390: alle Rubriken ohne JS-Fehler und ohne horizontales Scrollen (nur NEU gegenueber Baseline)' }, async () => {
  const hs = [], errs = []; let n = 0;
  for (const w of [1920, 1280, 390]) {
    const o = await openPage(`${LPDEV}/config`, { w, h: w === 390 ? 844 : 900, readyFn: CFG_READY, wait: 1000 });
    n += await cfgWalk(o.pg, async v => { const x = await o.pg.evaluate(() => document.documentElement.scrollWidth - innerWidth); if (x > 1) hs.push(`${w}|${v}|+${x}px`); });
    const e = errList(o.st); if (e.length) errs.push(`${w}: ${e[0]}`);
    if (o.st.writes.length) errs.push(`${w}: schreibt ${o.st.writes[0]}`);
    await o.close();
  }
  const fresh = news('cfg_hscroll', hs.map(x => x.replace(/\|\+\d+px$/, '')));
  const bad = [];
  if (errs.length) bad.push('Fehler: ' + errs.slice(0, 3).join('; '));
  if (fresh.length) bad.push(`${fresh.length} NEU hscroll: ` + fresh.slice(0, 4).join('; '));
  const info = `${n} Ansichten, ${hs.length - fresh.length} bekannte hscroll (Baseline ${baseCount('cfg_hscroll')})`;
  return bad.length ? FAIL(bad.join(' | ') + ' | ' + info) : PASS(info);
});

// ---------- B08 Begriffe im DOM ----------
def({ id: 'QC-B08', stage: 'pre', role: U, must: true, mode: 'auto', title: 'Sichtbare Begriffe im gerenderten DOM (Panel, Config alle Reiter, Settings, Titel, Manifest): kein LoxPanel/Fully/TbView ohne er, Titel tilebert (nur NEU)' }, async () => {
  const hits = [], bad = [];
  const scan = () => { const out = []; const re = /LoxPanel|Loxpanel|Fully|TbView(?!er)|Launcher/;
    document.querySelectorAll('body *').forEach(e => { if (e.children.length || !e.offsetParent && getComputedStyle(e).position !== 'fixed') return; const t = (e.textContent || '').trim(); if (t && re.test(t)) out.push(t.replace(/\s+/g, ' ').slice(0, 80)); });
    document.querySelectorAll('[title],[placeholder],[aria-label]').forEach(e => { const t = [e.title, e.placeholder, e.getAttribute('aria-label')].join(' '); if (re.test(t) && e.offsetParent) out.push('attr: ' + t.trim().slice(0, 80)); });
    return out; };
  let o = await openPage(`${LPDEV}/?panel=sens`, { readyFn: PANEL_READY, wait: 800 });
  (await o.pg.evaluate(scan)).forEach(x => hits.push('Panel: ' + x)); await o.close();
  o = await openPage(`${LPDEV}/config`, { w: 1280, h: 900, readyFn: CFG_READY, wait: 800 });
  const t2 = await o.pg.title(); if (!/tilebert/i.test(t2)) bad.push('Config-Titel "' + t2 + '"');
  await cfgWalk(o.pg, async () => { (await o.pg.evaluate(scan)).forEach(x => hits.push('Config: ' + x)); }); await o.close();
  o = await openPage(`${LPDEV}/settings`, { wait: 800 }); (await o.pg.evaluate(scan)).forEach(x => hits.push('Settings: ' + x)); await o.close();
  const fresh = news('terms_dom', hits);
  if (fresh.length) bad.push(`${fresh.length} NEU: ` + fresh.slice(0, 4).join(' | '));
  const info = `${new Set(hits).size} bekannte Fundstellen im DOM (Baseline ${baseCount('terms_dom')})`;
  return bad.length ? FAIL(bad.join(' | ') + ' | ' + info) : PASS(info + ', Titel tilebert (Config)');
});

// ---------- B09 Wetter-Matrix (nur --full) ----------
def({ id: 'QC-B09', stage: 'pre', role: P, must: false, full: true, mode: 'auto', title: 'Wetter-Kachel im Schoner: 5 Viewports x 12 Profile (nur mit --full, ca. 2-3 min)' }, async () => {
  const vps = [['X2i', 960, 480], ['4zoll', 480, 480], ['Tab-quer', 1280, 800], ['Tab-hoch', 800, 1280], ['Handy', 412, 915]];
  const profs = ['g3-3x1-f12', 'g3-3x2-f12', 'g2-2x1-f12', 'g2-2x2-f12', 'g3-3x1-f18', 'g3-3x2-f18', 'g2-2x1-f18', 'g2-2x2-f18', 'g3-3x1-f32', 'g3-3x2-f32', 'g2-2x1-f32', 'g2-2x2-f32'];
  const b = await browser(); const rows = [];
  await Promise.all(vps.map(async ([vn, w, h]) => {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: vn === 'Handy', isMobile: vn === 'Handy' });
    for (const p of profs) {
      const pg = await ctx.newPage();
      await pg.goto(`${LPDEV}/?panel=${p}`, { waitUntil: 'domcontentloaded' });
      await pg.waitForFunction(() => typeof frontData !== 'undefined' && frontData && frontData.weather && typeof saverCfg !== 'undefined' && saverCfg, null, { timeout: 20000 }).catch(() => {});
      await pg.evaluate(() => { try { showSaver(); } catch (e) {} }); await pg.waitForTimeout(700);
      const r = await pg.evaluate(() => {
        const c = document.querySelector('#svGrid .svw-weather-cell'); if (!c) return { err: 'keine Kachel' };
        const cr = c.getBoundingClientRect(); const fcs = [...c.querySelectorAll('.fc')].filter(f => getComputedStyle(f).display !== 'none');
        const fore = c.querySelector('.fore'), shown = fore && getComputedStyle(fore).display !== 'none';
        const inside = (el, box) => { const a = el.getBoundingClientRect(); return a.width > 0 && a.left >= box.left - .5 && a.right <= box.right + .5 && a.top >= box.top - 4 && a.bottom <= box.bottom + 4; };
        let mxOk = 0, dOk = 0; fcs.forEach(f => { const bx = f.getBoundingClientRect(); if (inside(f.querySelector('.mx'), bx)) mxOk++; if (inside(f.querySelector('.d'), bx)) dOk++; });
        const t = c.querySelector('.now .t');
        return { fore: shown, tage: fcs.length, mxOk, dOk, nowOk: t ? inside(t, cr) : false }; });
      rows.push({ vn, p, ...r }); await pg.close();
    }
    await ctx.close();
  }));
  const badr = rows.filter(r => r.err || (r.fore && (r.mxOk < r.tage || r.dOk < r.tage)) || !r.nowOk);
  return badr.length ? FAIL(`${badr.length}/${rows.length} auffaellig: ` + badr.slice(0, 4).map(r => `${r.vn}/${r.p} ${r.err || 'abgeschnitten'}`).join('; ')) : PASS(`${rows.length}/${rows.length} Zellen ok`);
});

def({ id: 'QC-B10', stage: 'pre', role: K, must: true, mode: 'auto', title: 'TbViewer nie aus (Leerlauf -> Dashboard, auch nachts), nachts abdunkeln; Licht an -> volle Helligkeit + Kamera live, Licht aus -> Nachlauf, dimmen' }, async () => {
  const o = await openPage(`${LPDEV}/?panel=sens`, { readyFn: () => typeof SENS !== 'undefined' && typeof armDpms === 'function' && typeof luxEval === 'function', wait: 2500 });
  const r = await o.pg.evaluate(async () => {
    const calls = [], bri = []; window.__sn = setNight; setNight = () => {}; applyDisplayCfg = () => {};   // Server-Nachrichten ignorieren
    lpHost.type = 'tbview'; lpHost.prox = true; lpHost.lightLevel = 1;
    lpHost.api = { turnScreenOff: () => calls.push('off'), turnScreenOn: () => calls.push('on'), isScreenOn: () => true, getDeviceInfo: () => '{"prox":true,"light":true,"model":"Jenna"}',
      setDisplayBrightness: p => (bri.push(p), true), setAutoBrightness() {}, setProximityWake() {}, getLightLevel: () => 1 };
    const w = ms => new Promise(r => setTimeout(r, ms)); const out = {};
    NIGHT.dim = 60; NIGHT.wake = 1; DISP.dpmsOff = 1;
    __sn(false); hideSaver(); armDpms(); await w(1400); out.tagOff = calls.filter(c => c === 'off').length; out.tagSaver = saverOn();
    __sn(true); await w(200); hideSaver(); armDpms(); await w(1400); out.nachtOff = calls.filter(c => c === 'off').length; out.nachtSaver = saverOn(); out.nachtBri = bri.at(-1);
    lpHost._ev('light', 2); await w(100); out.luxKlein = LUX.on;                 // +1 Stufe: unter Schwelle
    lpHost._ev('light', 3); await w(150); out.luxAn = LUX.on; out.luxBri = bri.at(-1); out.camnightAn = document.documentElement.classList.contains('camnight');
    lpHost._ev('light', 2); await w(150); out.luxAus = LUX.on; out.briNachlauf = bri.at(-1);
    await w(1300); out.briDanach = bri.at(-1);
    return out; });
  const e = errList(o.st); await o.close();
  const bad = [];
  if (r.tagOff || r.nachtOff) bad.push(`Display darf nie aus (Tag ${r.tagOff}, Nacht ${r.nachtOff})`);
  if (!r.tagSaver || !r.nachtSaver) bad.push('Leerlauf: Dashboard muss erscheinen');
  if (r.nachtBri !== 40) bad.push('Nacht: abdunkeln auf 40 % erwartet, war ' + r.nachtBri);
  if (r.luxKlein) bad.push('Licht +1 Stufe darf nicht wecken (Schwelle)');
  if (!r.luxAn || r.luxBri !== 100 || r.camnightAn) bad.push(`Licht an: volle Helligkeit + Kamera live erwartet (on=${r.luxAn}, bri=${r.luxBri}, camnight=${r.camnightAn})`);
  if (r.luxAus || r.briNachlauf !== 100 || r.briDanach !== 40) bad.push(`Licht aus: Nachlauf hell, dann 40 % erwartet (on=${r.luxAus}, ${r.briNachlauf} -> ${r.briDanach})`);
  if (e.length) bad.push('Fehler: ' + e[0]);
  return bad.length ? FAIL(bad.join(' | ')) : PASS('nie aus, Nacht 40 %, Licht an/aus mit Schwelle');
});
