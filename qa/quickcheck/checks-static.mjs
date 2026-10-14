// Stufe pre, statische Pruefungen (Shell/Dateien, kein Server noetig).
import fs from 'node:fs';
import path from 'node:path';
import { def, sh, R, H, WEBVISU, APK, KIOSK, scratch, read, exists, PASS, FAIL, WARN, SKIP, repoVersion, cmpVer, news, base, baseCount } from './lib.mjs';

const K = 'Kritiker', P = 'Programmierer', U = 'UX', M = 'PM';

// ---- Hilfen ----
function walk(dir, ext, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === '__pycache__' || e.name === 'node_modules' || e.name === 'build' || e.name === '.git') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, ext, out); else if (p.endsWith(ext)) out.push(p);
  }
  return out;
}
// Inline-Skripte (klassisch) einer HTML-Datei
export function inlineScripts(file) {
  const t = read(file), out = [];
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi; let m;
  while ((m = re.exec(t))) {
    const a = m[1];
    if (/\bsrc\s*=/.test(a)) continue;
    const ty = /type\s*=\s*["']?([^"'\s>]+)/i.exec(a);
    if (ty && !/^(text|application)\/(javascript|ecmascript)$/i.test(ty[1]) && ty[1] !== 'text/babel') continue;
    out.push({ code: m[2], line: t.slice(0, m.index).split('\n').length });
  }
  return out;
}
// Quelltext von Kommentaren, Strings, Template-Texten und Regex-Literalen befreien (Laenge/Zeilen bleiben)
export function blank(src) {
  const o = src.split(''); const n = src.length; let i = 0; let prev = '';   // prev: letztes signifikantes Zeichen
  const keep = c => (c === '\n' ? '\n' : ' ');
  const kw = /(?:return|typeof|case|in|of|delete|void|throw|new|else|do)$/;
  while (i < n) {
    const c = src[i], d = src[i + 1];
    if (c === '/' && d === '/') { while (i < n && src[i] !== '\n') { o[i] = ' '; i++; } continue; }
    if (c === '/' && d === '*') { while (i < n && !(src[i] === '*' && src[i + 1] === '/')) { o[i] = keep(src[i]); i++; } o[i] = ' '; o[i + 1] = ' '; i += 2; continue; }
    if (c === '"' || c === "'") { o[i] = ' '; i++; while (i < n && src[i] !== c && src[i] !== '\n') { if (src[i] === '\\') { o[i] = ' '; i++; } o[i] = ' '; i++; } if (src[i] === c) { o[i] = ' '; i++; } prev = '"'; continue; }
    if (c === '`') { o[i] = ' '; i++; let dep = 0;
      while (i < n && !(src[i] === '`' && dep === 0)) {
        if (src[i] === '\\') { o[i] = ' '; i++; o[i] = keep(src[i]); i++; continue; }
        if (src[i] === '$' && src[i + 1] === '{') { dep++; o[i] = ' '; o[i + 1] = ' '; i += 2; continue; }
        if (dep > 0 && src[i] === '}') { dep--; o[i] = ' '; i++; continue; }
        o[i] = keep(src[i]); i++; }
      o[i] = ' '; i++; prev = '"'; continue; }
    if (c === '/') {
      const before = src.slice(Math.max(0, i - 12), i).replace(/\s+$/, '');
      const isRe = prev === '' || /[(,=:\[!&|?{};+\-*%<>~^]/.test(prev) || kw.test(before);
      if (isRe) { o[i] = ' '; i++; let cls = false;
        while (i < n && src[i] !== '\n' && !(src[i] === '/' && !cls)) { if (src[i] === '\\') { o[i] = ' '; i++; } else if (src[i] === '[') cls = true; else if (src[i] === ']') cls = false; o[i] = ' '; i++; }
        if (src[i] === '/') { o[i] = ' '; i++; } while (/[a-z]/.test(src[i] || '')) { o[i] = ' '; i++; } prev = '"'; continue; }
    }
    if (!/\s/.test(c)) prev = c;
    i++;
  }
  return o.join('');
}

// ---- S01 Python ----
def({ id: 'QC-S01', stage: 'pre', role: P, must: true, mode: 'auto', title: 'Python-Syntax (ast.parse, kein __pycache__)' }, () => {
  const t0 = Date.now() - 1000;
  const files = walk(`${R}/config/app`, '.py');
  const code = `import ast,sys\nbad=0\nfor f in sys.argv[1:]:\n  try: ast.parse(open(f,encoding='utf-8').read(),f)\n  except SyntaxError as e: print(f,e); bad+=1\nsys.exit(1 if bad else 0)`;
  const r = sh(`python3 -I -c "${code.replace(/"/g, '\\"')}" ${files.map(f => `'${f}'`).join(' ')}`);
  if (r.code) return FAIL(r.out || r.err);
  // .pyc zaehlen (walk() ueberspringt __pycache__, daher eigener Lauf); gitignoriert, alte sind harmlos - neue wuerde QC selbst verursachen
  const pyc = sh(`find '${R}' -name '*.pyc' -not -path '*/.git/*' -newermt '@${Math.floor(t0 / 1000)}'`).out;
  if (pyc) return FAIL('QC hat .pyc ins Repo geschrieben: ' + pyc.split('\n')[0]);
  const old = +sh(`find '${R}' -name '*.pyc' -not -path '*/.git/*' | wc -l`).out;
  return PASS(`${files.length} Dateien` + (old ? `, ${old} alte .pyc im Repo (gitignoriert, nicht im ZIP)` : ''));
});

// ---- S02 JS-Syntax ----
def({ id: 'QC-S02', stage: 'pre', role: P, must: true, mode: 'auto', title: 'JS-Syntax: Inline-Skripte panel/config/settings + i18n.js (node --check)' }, () => {
  const bad = []; let n = 0;
  for (const f of ['panel', 'config', 'settings']) {
    inlineScripts(`${H}/${f}.html`).forEach((s, i) => {
      const p = `${scratch}/${f}-${i}.js`; fs.writeFileSync(p, s.code); n++;
      const r = sh(`node --check '${p}'`); if (r.code) bad.push(`${f}.html Block ${i + 1} (ab Zeile ${s.line}): ${r.err.split('\n').find(l => /Error/.test(l)) || r.err.slice(0, 120)}`);
    });
  }
  const r = sh(`node --check '${H}/i18n.js'`); n++; if (r.code) bad.push('i18n.js: ' + r.err.slice(0, 120));
  return bad.length ? FAIL(bad.join(' | ')) : PASS(`${n} Skripte`);
});

// ---- S03 Shell ----
def({ id: 'QC-S03', stage: 'pre', role: K, must: true, mode: 'auto', title: 'Shell-Syntax (bash -n) Install-/Update-/Daemon-Skripte; sudoers unveraendert' }, () => {
  const list = ['preroot.sh', 'postroot.sh', 'preupgrade.sh', 'postupgrade.sh', 'uninstall/uninstall', 'daemon/daemon', 'cron/cron.05min', 'bin/loxpanel-ctl.sh',
    'android/panel-launcher/build.sh', ...walk(`${R}/config/app/deploy`, '.sh').map(f => path.relative(R, f)), ...walk(`${R}/qa`, '.sh').map(f => path.relative(R, f))];
  const bad = [];
  for (const f of new Set(list)) { if (!exists(`${R}/${f}`)) { bad.push(`${f} fehlt`); continue; } const r = sh(`bash -n '${f}'`); if (r.code) bad.push(`${f}: ${r.err.slice(0, 100)}`); }
  const sd = sh('git diff --stat HEAD -- sudoers');
  if (sd.out) bad.push('sudoers geaendert (gegenueber HEAD): ' + sd.out.split('\n').pop());
  return bad.length ? FAIL(bad.join(' | ')) : PASS(`${new Set(list).size} Skripte, sudoers == HEAD`);
});

// ---- S04 Perl ----
def({ id: 'QC-S04', stage: 'pre', role: K, must: false, mode: 'auto', title: 'Perl-Syntax index.cgi (LoxBerry-Module gestubbt)' }, () => {
  const f = `${R}/webfrontend/htmlauth/index.cgi`; const lib = `${scratch}/pl`;
  const mods = [...new Set([...read(f).matchAll(/^\s*use\s+([A-Za-z][\w:]*)/gm)].map(m => m[1]))].filter(m => !['strict', 'warnings', 'utf8', 'vars', 'lib'].includes(m));
  for (const m of mods) {
    if (sh(`perl -e 'require ${m}'`).code === 0) continue;
    const p = `${lib}/${m.replace(/::/g, '/')}.pm`; fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, `package ${m}; sub import{} 1;\n`);
  }
  const r = sh(`perl -I'${lib}' -c '${f}' 2>&1`);
  const out = r.out + r.err;
  if (/syntax error|Unmatched|Missing right|Can't find string terminator|not terminated|Unterminated|Missing \$/.test(out)) return FAIL(out.split('\n')[0].slice(0, 160));
  return PASS(/syntax OK/.test(out) ? 'syntax OK' : 'keine Syntaxfehler (nur Strict-/Modulmeldungen wegen Stubs)');
});

// ---- S05 Versionen ----
export function versionInfo() {
  const v = {};
  v.plugin = repoVersion();
  v.release = (/^VERSION=(\S+)/m.exec(read(`${R}/release.cfg`)) || [])[1] || '';
  v.pre = (/^VERSION=(\S+)/m.exec(read(`${R}/prerelease.cfg`)) || [])[1] || '';
  v.app = (/^APP_VERSION\s*=\s*"([^"]+)"/m.exec(read(WEBVISU)) || [])[1] || '';
  const rd = read(`${R}/README.md`); const i = rd.indexOf('## Eigene Funktionen dieses Forks');
  const top = rd.slice(i).split('\n').find(l => l.startsWith('- **')) || '';
  v.readme = (/\((\d+\.\d+\.\d+)\)\*\*/.exec(top) || [])[1] || '';
  v.readmeTitle = top.slice(0, 60);
  return v;
}
def({ id: 'QC-S05', stage: 'pre', role: K, must: true, mode: 'auto', title: 'Versionsstellen: plugin.cfg == prerelease.cfg == APP_VERSION == README-Changelog-Kopf, release.cfg <= prerelease.cfg; ARCHIVEURL passt zur VERSION; >= letzter Tag' }, () => {
  const v = versionInfo(); const bad = [];
  const set = new Set([v.plugin, v.pre, v.app, v.readme]);
  if (set.size !== 1 || !v.plugin) bad.push(`uneinheitlich: plugin ${v.plugin}, prerelease ${v.pre || '?'}, APP_VERSION ${v.app}, README ${v.readme || '?'}`);
  if (!/^\d+\.\d+\.\d+$/.test(v.release)) bad.push('release.cfg: keine reine SemVer: ' + v.release);
  else if (/^\d+\.\d+\.\d+$/.test(v.pre) && cmpVer(v.pre, v.release) < 0) bad.push(`prerelease ${v.pre} < release ${v.release}`);
  for (const [n, ver] of [['release.cfg', v.release], ['prerelease.cfg', v.pre]]) {
    const a = (/^ARCHIVEURL=(\S+)/m.exec(read(`${R}/${n}`)) || [])[1] || '';
    if (!ver || !a.includes(ver)) bad.push(`${n}: ARCHIVEURL enthaelt nicht VERSION ${ver}`);
  }
  if (!/^PRERELEASECFG=\S*\/prerelease\.cfg$/m.test(read(`${R}/plugin.cfg`))) bad.push('plugin.cfg: PRERELEASECFG fehlt');
  if (!/^\d+\.\d+\.\d+$/.test(v.plugin)) bad.push('keine reine SemVer: ' + v.plugin);
  const tag = sh("git tag --list 'v*' --sort=-v:refname | head -1").out.replace(/^v/, '');
  let note = `${v.plugin}, letzter Tag v${tag}`;
  if (tag && /^\d+\.\d+\.\d+$/.test(v.plugin)) {
    const c = cmpVer(v.plugin, tag);
    if (c < 0) bad.push(`Version ${v.plugin} < Tag v${tag}`);
    if (c === 0) {
      const dirty = sh("git status --short | grep -v '^??' | head -3").out;
      if (dirty) return FAIL(`Version == Tag v${tag}, aber Aenderungen im Baum (Version nicht erhoeht?): ${dirty.replace(/\n/g, '; ')}`);
      note += ' (== Tag, Baum sauber)';
    }
  }
  return bad.length ? FAIL(bad.join(' | ')) : PASS(note);
});

// ---- S06 APK-Version/Manifest ----
def({ id: 'QC-S06', stage: 'pre', role: P, must: true, mode: 'auto', title: 'APK: versionCode Manifest == .version == APK; targetSdk >= 24; Label TbViewer; erhoeht bei Android-Aenderung' }, () => {
  const man = read(`${R}/android/panel-launcher/AndroidManifest.xml`);
  const code = (/versionCode="(\d+)"/.exec(man) || [])[1], name = (/versionName="([^"]+)"/.exec(man) || [])[1], tsdk = (/targetSdkVersion="(\d+)"/.exec(man) || [])[1];
  const ver = read(`${R}/config/app/android/LoxPanel-Launcher.version`).trim().split(/\s+/)[0];
  const bad = [];
  if (code !== ver) bad.push(`Manifest versionCode ${code} != .version ${ver}`);
  if (+tsdk < 24) bad.push('targetSdk ' + tsdk + ' < 24');
  const b = sh(`aapt dump badging '${APK}'`);
  const pk = /package: name='([^']+)' versionCode='(\d+)' versionName='([^']+)'/.exec(b.out) || [];
  if (pk[2] !== code || pk[3] !== name) bad.push(`APK-Metadaten (${pk[2]}/${pk[3]}) != Manifest (${code}/${name})`);
  const label = (/application-label:'([^']*)'/.exec(b.out) || [])[1];
  if (label !== 'TbViewer') bad.push('Label "' + label + '" != TbViewer');
  const chg = sh("git diff --name-only HEAD -- android | grep -v '^android/panel-launcher/build' | head -5").out;
  if (chg) {
    const old = sh("git show HEAD:android/panel-launcher/AndroidManifest.xml").out;
    const oc = (/versionCode="(\d+)"/.exec(old) || [])[1];
    if (+code <= +oc) bad.push(`android/ geaendert (${chg.replace(/\n/g, ', ')}), versionCode ${code} nicht > ${oc}`);
  }
  return bad.length ? FAIL(bad.join(' | ')) : PASS(`versionCode ${code}, ${name}, targetSdk ${tsdk}, Label ${label}`);
});

// ---- S07 Kennungen ----
def({ id: 'QC-S07', stage: 'pre', role: K, must: true, mode: 'auto', title: 'Kennungen unveraendert: NAME/FOLDER loxpanelfav, Paket de.loxpanel.launcher, X-LoxPanel-Token, Keystore, Zertifikat 80ee7b07' }, () => {
  const bad = []; const cfg = read(`${R}/plugin.cfg`);
  for (const k of ['NAME', 'FOLDER']) { const m = new RegExp(`^${k}=(\\S+)`, 'm'); const all = [...cfg.matchAll(new RegExp(`^${k}=(\\S+)`, 'gm'))].map(x => x[1]); if (!all.includes('loxpanelfav')) bad.push(`${k} != loxpanelfav`); }
  if (!/package="de\.loxpanel\.launcher"/.test(read(`${R}/android/panel-launcher/AndroidManifest.xml`))) bad.push('Manifest-Paket != de.loxpanel.launcher');
  const pk = /package: name='([^']+)'/.exec(sh(`aapt dump badging '${APK}'`).out); if (!pk || pk[1] !== 'de.loxpanel.launcher') bad.push('APK-Paket ' + (pk && pk[1]));
  const cnt = (cmd) => +sh(cmd).out || 0;
  for (const pat of ['X-LoxPanel-Token', 'LOXPANEL_']) {
    const now = cnt(`git grep -c -E '${pat}' -- . ':!qa' ':!docs/QUICKCHECK.md' | awk -F: '{s+=$NF} END{print s+0}'`);
    const head = cnt(`git grep -c -E '${pat}' HEAD -- . ':!qa' ':!docs/QUICKCHECK.md' | awk -F: '{s+=$NF} END{print s+0}'`);
    if (now < head) bad.push(`${pat}: ${now} Treffer < HEAD ${head} (Kennung entfernt/umbenannt?)`);
  }
  if (sh('git diff --quiet HEAD -- android/panel-launcher/launcher.keystore').code) bad.push('launcher.keystore geaendert');
  const cert = sh(`apksigner verify --print-certs '${APK}'`).out;
  const sha = (/SHA-256 digest: ([0-9a-f]+)/i.exec(cert) || [])[1] || '';
  if (!sha.startsWith('80ee7b07')) bad.push('Zertifikat-SHA256 ' + sha.slice(0, 12) + ' != 80ee7b07');
  return bad.length ? FAIL(bad.join(' | ')) : PASS('Kennungen + Keystore + Zertifikat ' + sha.slice(0, 8) + '..');
});

// ---- S08 Release-Artefakte ----
def({ id: 'QC-S08', stage: 'pre', role: K, must: true, mode: 'auto', title: 'Release-Artefakte: keine untracked Release-Dateien; HEAD-Archiv enthaelt APK/.version/favicon; qa/ export-ignore; ARCHIVEURL Release-ZIP' }, () => {
  const bad = [], warn = [];
  const allow = base.allow_untracked || [];
  const un = sh("git status --short --untracked-files=all | grep '^??' | sed 's/^?? //'").out.split('\n').filter(Boolean);
  for (const f of un) {
    if (allow.some(a => f === a || (a.endsWith('/') && f.startsWith(a)))) continue;
    if (/^(config|webfrontend|android)\//.test(f)) bad.push('untracked: ' + f); else warn.push('untracked: ' + f);
  }
  const ls = sh('git archive HEAD | tar t').out;
  for (const re of [/favicon\.ico$/, /LoxPanel-Launcher\.apk$/, /LoxPanel-Launcher\.version$/, /^plugin\.cfg$/, /^release\.cfg$/, /^prerelease\.cfg$/, /^sudoers\/sudoers$/])
    if (!ls.split('\n').some(l => re.test(l))) bad.push('HEAD-Archiv ohne ' + re.source);
  if (/(^|\n)qa\//.test(ls)) warn.push('qa/ im HEAD-Archiv (.gitattributes noch nicht eingecheckt?)');
  const ca = sh("git check-attr export-ignore -- qa/").out;
  if (!/export-ignore: set/.test(ca)) bad.push('qa/ ist nicht export-ignore (.gitattributes)');
  for (const n of ['release.cfg', 'prerelease.cfg'])
    if (!/^ARCHIVEURL=https:\/\/github\.com\/[^/]+\/[^/]+\/releases\/download\/v[\d.]+\/loxpanelfav-[\d.]+\.zip$/m.test(read(`${R}/${n}`))) bad.push(`${n}: ARCHIVEURL zeigt nicht auf das Release-ZIP`);
  if (bad.length) return FAIL(bad.join(' | '));
  return warn.length ? WARN(warn.join(' | ')) : PASS(`${ls.split('\n').length} Dateien im HEAD-Archiv, qa/ export-ignore`);
});

// ---- S09 i18n ----
export function i18nData() {
  const src = read(`${H}/i18n.js`);
  const a = src.indexOf('var CAT = {'), b = src.indexOf('function detect()');
  const reg = src.slice(a, b);
  const keys = [...reg.matchAll(/^ {6}('(?:[^'\\]|\\.)*')\s*:/gm)].map(m => new Function('return ' + m[1])());
  const dup = keys.filter((k, i) => keys.indexOf(k) !== i);
  const set = new Set(keys);
  // verwendete Texte
  const used = new Map();   // text -> "datei:zeile"
  // exakt: keine Trim-/Leerraum-Normalisierung (T()-Schluessel muessen Leerzeichen am Rand treffen); nur Element-Text wird wie apply() getrimmt
  const add = (t, f, line, raw) => { if (!raw) t = t.replace(/\s+/g, ' ').trim(); if (t && /[A-Za-zÄÖÜäöüß]/.test(t) && !used.has(t)) used.set(t, `${f}:${line}`); };
  for (const f of ['config.html', 'settings.html']) {
    const t = read(`${H}/${f}`); const lineOf = i => t.slice(0, i).split('\n').length;
    for (const m of t.matchAll(/\bT\(\s*('(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*")/g)) { try { add(new Function('return ' + m[1])(), f, lineOf(m.index), true); } catch (e) {} }
    for (const m of t.matchAll(/\bdata-i18n(?:-ph|-title)?="([^"]*)"/g)) add(m[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"'), f, lineOf(m.index), true);
    for (const m of t.matchAll(/<([a-z][a-z0-9]*)\b[^>]*\bdata-i18n-html(?![-\w])(?!=)[^>]*>([\s\S]*?)<\/\1>/gi)) add(m[2].trim(), f, lineOf(m.index), true);
    for (const m of t.matchAll(/<([a-z][a-z0-9]*)\b[^>]*\bdata-i18n(?![-\w])(?!=)[^>]*>([\s\S]*?)<\/\1>/gi)) add(m[2].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&middot;/g, '·').replace(/&lt;/g, '<').replace(/&gt;/g, '>'), f, lineOf(m.index));
  }
  return { keys, set, dup, used, regionStart: src.slice(0, a).split('\n').length };
}
def({ id: 'QC-S09', stage: 'pre', role: K, must: true, mode: 'auto', title: 'i18n: deutsche T()/data-i18n-Texte der Config haben EN-Eintrag (nur NEU Fehlende), keine Doppelschluessel' }, () => {
  const d = i18nData();
  const missing = [...d.used.keys()].filter(t => !d.set.has(t) && !/^[\d\s.,:;()\/%°·–—+\-=<>|*&]*$/.test(t));
  const fresh = news('i18n_missing', missing);
  const dups = news('i18n_duplicate', d.dup);
  const used = new Set(d.used.keys());
  const dead = d.keys.filter(k => !used.has(k)).length;
  const bad = [];
  if (fresh.length) bad.push(`${fresh.length} NEU ohne EN: ` + fresh.slice(0, 6).map(t => `"${t.slice(0, 50)}" (${d.used.get(t)})`).join('; ') + (fresh.length > 6 ? ' ...' : ''));
  if (dups.length) bad.push(`${dups.length} Doppelschluessel: ` + dups.slice(0, 4).map(t => `"${t.slice(0, 40)}"`).join('; '));
  const info = `${d.used.size} Texte, ${d.keys.length} EN-Schluessel, ${missing.length - fresh.length} bekannt ohne EN (Baseline ${baseCount('i18n_missing')}), ${dead} ungenutzte EN-Schluessel (nur Hinweis, teils dynamische Texte)`;
  return bad.length ? FAIL(bad.join(' | ') + ' | ' + info) : PASS(info);
});

// ---- S10 const/TDZ ----
def({ id: 'QC-S10', stage: 'pre', role: K, must: true, mode: 'auto', title: 'const/let-Reihenfolge im Panel: keine Nutzung auf oberster Ebene vor der Deklaration (direkt oder ueber Funktionsaufruf)' }, () => {
  const bad = []; let ndecl = 0; const watch = new Set(['lpHost', 'TB_TOK', 'TB_API', 'SENS', 'NIGHT']);
  for (const s of inlineScripts(`${H}/panel.html`)) {
    const raw = s.code, b = blank(raw); const lines = b.split('\n');
    // Tiefe je Zeichen
    const depth = new Int32Array(b.length); let d = 0; for (let i = 0; i < b.length; i++) { if (b[i] === '}') d--; depth[i] = d; if (b[i] === '{') d++; }
    const lineAt = i => b.slice(0, i).split('\n').length + s.line - 1;
    // oberste Deklarationen
    const decl = new Map();
    for (const m of b.matchAll(/(?:^|[;}\n])\s*(?:const|let)\s+([A-Za-z_$][\w$]*)/g)) { const i = m.index + m[0].lastIndexOf(m[1]); if (depth[i] === 0 && !decl.has(m[1])) decl.set(m[1], i); }
    for (const m of b.matchAll(/(?:^|[;}\n])\s*(?:const|let)\s+[A-Za-z_$][\w$]*\s*=[^;\n]*?,\s*([A-Za-z_$][\w$]*)\s*=/g)) { const i = m.index + m[0].lastIndexOf(m[1]); if (depth[i] === 0 && !decl.has(m[1])) decl.set(m[1], i); }
    for (const m of b.matchAll(/(?:^|\n)\s*let\s+([^;\n=]+(?:=[^;\n]*)?);/g)) for (const nm of m[1].split(',')) { const n = nm.split('=')[0].trim(); if (/^[A-Za-z_$][\w$]*$/.test(n) && !decl.has(n)) decl.set(n, m.index + m[0].indexOf(n)); }
    ndecl += decl.size;
    // Funktionen oberster Ebene mit Rumpf
    const funcs = []; for (const m of b.matchAll(/(?:^|\n)\s*(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g)) {
      const open = b.indexOf('{', m.index + m[0].length); if (open < 0) continue; let dd = 0, j = open; for (; j < b.length; j++) { if (b[j] === '{') dd++; else if (b[j] === '}') { dd--; if (!dd) break; } }
      funcs.push({ name: m[1], from: open, to: j }); }
    const uses = (name, from, to) => { const re = new RegExp(`(?<![\\w$.])${name.replace(/\$/g, '\\$')}(?![\\w$])`, 'g'); re.lastIndex = from; const r = []; let m; while ((m = re.exec(b)) && m.index < to) r.push(m.index); return r; };
    for (const [name, di] of decl) {
      if (!(watch.has(name) || /^CAM_/.test(name))) continue;
      // direkte Top-Level-Nutzung vor Deklaration
      for (const i of uses(name, 0, di)) {
        if (depth[i] !== 0) continue;
        if (/typeof\s*$/.test(b.slice(Math.max(0, i - 8), i))) continue;
        bad.push(`${name}: Top-Level-Nutzung Zeile ${lineAt(i)} vor Deklaration Zeile ${lineAt(di)}`); break;
      }
      // Funktionsaufruf auf oberster Ebene vor Deklaration, Funktion benutzt den Namen
      for (const f of funcs) {
        if (!uses(name, f.from, f.to).length) continue;
        for (const i of uses(f.name, 0, di)) { if (depth[i] === 0 && !(i >= f.from - 80 && i <= f.from) && /^\s*\(/.test(b.slice(i + f.name.length, i + f.name.length + 3)) && !/function\s+$/.test(b.slice(Math.max(0, i - 12), i))) { bad.push(`${name}: Top-Level-Aufruf ${f.name}() Zeile ${lineAt(i)} vor Deklaration Zeile ${lineAt(di)}`); break; } }
      }
    }
  }
  const fresh = news('tdz_order', bad.map(x => x.replace(/ Zeile \d+/g, '')));
  return fresh.length ? FAIL(fresh.slice(0, 5).join(' | ')) : PASS(`${ndecl} Top-Level-const/let geprueft (Watchlist lpHost, TB_TOK, TB_API, SENS, NIGHT, CAM_*), Laufzeitbeleg in QC-B01`);
});

// ---- S11 Bruecke ----
export function bridgeNames() {
  const java = read(KIOSK);
  const jn = [...java.matchAll(/@JavascriptInterface\s+public\s+[\w<>\[\]]+\s+(\w+)\s*\(([^)]*)\)/g)].map(m => ({ name: m[1], p: m[2].trim() }));
  const panel = read(`${H}/panel.html`);
  const nm = /const names=\[([^\]]*)\]/.exec(panel);
  const wrap = nm ? [...nm[1].matchAll(/'(\w+)'/g)].map(m => m[1]) : [];
  return { jn, wrap };
}
def({ id: 'QC-S11', stage: 'pre', role: K, must: true, mode: 'auto', title: 'Bruecke: @JavascriptInterface (Kiosk.java) == Namensliste tbWrap == docs/TBVIEW.md; Token als 1. Parameter, ok(t)-Pruefung' }, () => {
  const { jn, wrap } = bridgeNames(); const bad = [];
  const doc = read(`${R}/docs/TBVIEW.md`);
  const jset = new Set(jn.map(x => x.name)), wset = new Set(wrap);
  for (const n of jset) if (!wset.has(n)) bad.push(`${n}: in Kiosk.java, nicht in tbWrap`);
  for (const n of wset) if (!jset.has(n)) bad.push(`${n}: in tbWrap, nicht in Kiosk.java`);
  for (const x of jn) if (!/^String t\b/.test(x.p)) bad.push(`${x.name}: Token nicht 1. Parameter (${x.p.slice(0, 30)})`);
  const java = read(KIOSK);
  const bodies = [...java.matchAll(/@JavascriptInterface[\s\S]*?(?=@JavascriptInterface|\n    \}\s*$)/g)];
  const noOk = bodies.filter(b => !/ok\(t\)/.test(b[0].slice(0, 400))).length;
  if (noOk) bad.push(`${noOk} Methode(n) ohne ok(t)-Pruefung`);
  const dbg = /setWebContentsDebuggingEnabled\(\s*true/.exec(java);
  if (dbg && !/FLAG_DEBUGGABLE/.test(java.slice(Math.max(0, dbg.index - 250), dbg.index))) bad.push('setWebContentsDebuggingEnabled(true) ohne FLAG_DEBUGGABLE-Bedingung');
  return bad.length ? FAIL(bad.join(' | ')) : PASS(`${jn.length} Java == ${wrap.length} tbWrap, Token 1. Parameter, ok(t) ueberall, Debugging nur debuggable`);
});
def({ id: 'QC-S11b', stage: 'pre', role: K, must: false, mode: 'auto', title: 'Bruecke dokumentiert: jede Methode in docs/TBVIEW.md, Token (tbtok) beschrieben' }, () => {
  const { jn } = bridgeNames(); const doc = read(`${R}/docs/TBVIEW.md`); const bad = [];
  const miss = jn.map(x => x.name).filter(n => !new RegExp('\\b' + n + '\\b').test(doc));
  const fresh = news('bridge_doc', miss);
  if (fresh.length) bad.push('nicht in docs/TBVIEW.md: ' + fresh.join(', '));
  if (!/tbtok/.test(doc)) bad.push('docs/TBVIEW.md nennt tbtok nicht');
  return bad.length ? WARN(bad.join(' | ')) : PASS(`${jn.length} Methoden dokumentiert (${miss.length} bekannte Luecken in Baseline)`);
});

// ---- S12 Begriffe ----
def({ id: 'QC-S12', stage: 'pre', role: U, must: true, mode: 'auto', title: 'Sichtbare Begriffe: kein "LoxPanel"/"Fully"/"TbView " ohne "er" in Nutzertexten (ausser Baseline-Whitelist)' }, () => {
  const hits = [];
  const scan = (txt, where) => {
    for (const m of txt.matchAll(/LoxPanel|Loxpanel|Fully|TbView(?!er)/g)) {
      // TbView als Kennung (window.TbView, kiosk=tbview, TbView/5.4) ist technisch
      if (m[0] === 'TbView') { const a = txt.slice(Math.max(0, m.index - 8), m.index + 8); if (/window\.|\.TbView|TbView\/|TbView\.|TbView[.(]/.test(a)) continue; }
      hits.push(`${where}: ${txt.slice(Math.max(0, m.index - 25), m.index + 35).replace(/\s+/g, ' ').trim()}`);
    }
  };
  const d = i18nData();
  // deutsche Texte (T/data-i18n)
  for (const [t, where] of d.used) scan(t, where.split(':')[0]);
  // EN-Werte aus i18n.js
  const js = read(`${H}/i18n.js`);
  for (const m of js.matchAll(/:\s*\n?\s*'((?:[^'\\]|\\.)*)'\s*,?\s*$/gm)) scan(m[1], 'i18n.js(EN)');
  // sichtbarer HTML-Text (ohne Skript/Style/Attribute-Kontext): grob
  for (const f of ['panel.html', 'config.html', 'settings.html']) {
    const t = read(`${H}/${f}`).replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<!--[\s\S]*?-->/g, ' ');
    for (const m of t.matchAll(/>([^<>]{2,})</g)) scan(m[1], f);
    for (const m of t.matchAll(/\b(?:title|placeholder|aria-label|alt)="([^"]+)"/g)) scan(m[1], f);
  }
  // Android: Toasts/Titel/Strings mit Sichtbarkeit
  for (const f of walk(`${R}/android/panel-launcher/src`, '.java')) for (const m of read(f).matchAll(/(?:Toast\.makeText\([^"]*|setText\(|setTitle\(|\.append\()\s*"((?:[^"\\]|\\.)*)"/g)) scan(m[1], path.basename(f));
  // Python-Hinweise (tips) und Perl-Texte
  for (const m of read(WEBVISU).matchAll(/"tips?":\s*"((?:[^"\\]|\\.)*)"/g)) scan(m[1], 'webvisu.py');
  const uniq = [...new Set(hits)];
  const keyOf = h => h.replace(/\s+/g, ' ');
  const fresh = news('terms', uniq.map(keyOf));
  const known = uniq.length - fresh.length;
  return fresh.length ? FAIL(`${fresh.length} NEU: ` + fresh.slice(0, 5).join(' | ') + (fresh.length > 5 ? ' ...' : '')) : PASS(`${known} bekannte Fundstellen (Baseline ${baseCount('terms')}), keine neuen`);
});

// ---- S13 APK-Build ----
def({ id: 'QC-S13', stage: 'pre', role: P, must: true, mode: 'auto', title: 'APK-Build in Scratch-Kopie (build.sh), apksigner verify, Zertifikat, byte-gleich zur eingecheckten APK' }, () => {
  const w = `${scratch}/apkbuild`; fs.rmSync(w, { recursive: true, force: true }); fs.mkdirSync(`${w}/config/app/android`, { recursive: true });
  const cp = sh(`cp -r '${R}/android' '${w}/' && rm -rf '${w}/android/panel-launcher/build'`);
  if (cp.code) return FAIL('Kopie: ' + cp.err);
  const b = sh(`cd '${w}/android/panel-launcher' && bash build.sh 2>&1`, { timeout: 180000 });
  if (b.code || !/^OK:/m.test(b.out)) return FAIL('build.sh: ' + b.out.split('\n').slice(-3).join(' / '));
  const built = `${w}/config/app/android/LoxPanel-Launcher.apk`;
  const v = sh(`apksigner verify --print-certs '${built}'`).out; const sha = (/SHA-256 digest: ([0-9a-f]+)/i.exec(v) || [])[1] || '';
  const bad = [];
  if (!sha.startsWith('80ee7b07')) bad.push('Zertifikat ' + sha.slice(0, 8));
  const same = sh(`cmp '${built}' '${APK}'`).code === 0;
  const pk = /package: name='([^']+)' versionCode='(\d+)' versionName='([^']+)'/.exec(sh(`aapt dump badging '${built}'`).out) || [];
  if (pk[1] !== 'de.loxpanel.launcher') bad.push('Paket ' + pk[1]);
  fs.rmSync(w, { recursive: true, force: true });
  if (bad.length) return FAIL(bad.join(' | '));
  return same ? PASS(`OK, ${pk[2]}/${pk[3]}, byte-identisch zur eingecheckten APK`) : FAIL('frisch gebaute APK != eingecheckte APK (APK nach Quelltext-Aenderung nicht neu gebaut?)');
});

// ---- R01/R02 manuelle Lesepaesse (werden als Fragen ausgegeben) ----
def({ id: 'QC-R01', stage: 'pre', role: K, must: true, mode: 'manuell', title: 'Diff-Lesepass (Kritiker, ca. 10 min): Fehlerpfade, Offline/leer, Races, Timer, wachsende Dateien' }, () => {
  const st = sh('git diff --stat HEAD | tail -1').out || 'keine Aenderungen gegenueber HEAD';
  return { r: 'SKIP', info: 'MANUELL. ' + st, manual: [
    'git diff HEAD gelesen: leere catch-Bloecke, Rueckgabewerte bei Offline/leer, neue Timer ohne Clear?',
    'Races (asynchron onPageStarted vs. Skriptstart), unbegrenzt wachsende Dateien/Maps (JSON-Persistenz)?',
    'Neue Befunde >= mittel: keine; Rest als niedrig im Changelog/Backlog?'] };
});
def({ id: 'QC-R02', stage: 'pre', role: U, must: false, mode: 'manuell', title: 'UX-Sichtpruefung bei UI-/Kiosk-Aenderung: Nacht/Schoner, X2i echt, DE/EN-Texte, Android-Darstellung' }, () => ({ r: 'SKIP', info: 'MANUELL (nur bei betroffener Aenderung)', manual: [
  'Nachtmodus/Schoner (480x480, 960x480): Uhr vollstaendig, Schliessen >= 44 px, Nachtlayer ueber Alarm/Sheet - Screenshots sichten (Uhrzeit fixieren)?',
  'X2i 960x480 echt (adb screencap): nichts an Raendern abgeschnitten, Schrift >= 11 px lesbar?',
  'Neue/geaenderte UI-Texte in DE und EN gesichtet (keine gemischten Seiten, Textexpansion ~30 %)?',
  'TbViewer-Darstellung (Kiosk.java geaendert): Vollbild, Fehlerseite lesbar, Zurueck-Verhalten?'] }));
