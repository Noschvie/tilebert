// Stufe pm: Prozess/Release nach "commit" + Push (Lesepruefungen; Fragen als manuelle Punkte).
import fs from 'node:fs';
import os from 'node:os';
import { def, sh, http, R, scratch, read, exists, repoVersion, cmpVer, base, PASS, FAIL, WARN, SKIP } from './lib.mjs';
import { versionInfo } from './checks-static.mjs';

const M = 'PM', K = 'Kritiker';
const REL = process.env.QC_RELEASES || `${os.homedir()}/projekte/releases`;
const REPO_SLUG = 'actionhero-zz/loxohnepanel', MIRROR = 'claude/festive-sagan-avv9if';
const ver = () => repoVersion();

def({ id: 'QC-M01', stage: 'pm', role: M, must: true, mode: 'manuell', title: 'Inhaltsliste vorab (von dir beauftragt / von mir eigenstaendig) mit Abgleich zum Diff' }, () => {
  const tag = sh("git tag --list 'v*' --sort=-v:refname | head -1").out;
  const stat = sh(`git diff --stat ${tag} HEAD | tail -1`).out;
  return { r: 'SKIP', info: `MANUELL. Aenderungen seit ${tag}: ${stat || 'keine'}`, manual: [
    'Liste gruppiert: "von dir beauftragt" / "von mir eigenstaendig" (Funktionen, Fixes, Dateien, Doku) liegt vor?',
    'Jede geaenderte Datei (git diff --stat) ist einem Listenpunkt zugeordnet, nichts Ungelistetes im Diff?',
    'Eigenstaendiges einzeln zur Auswahl gestellt?'] };
});
def({ id: 'QC-M02', stage: 'pm', role: M, must: true, mode: 'manuell', title: 'Freigabe: ausdrueckliches "commit" des Nutzers nach der letzten Listenaenderung' }, () => ({ r: 'SKIP', info: 'MANUELL', manual: [
  'Wortlaut "commit" liegt vor, NACH der letzten Aenderung der Liste? (ein "ja/ok" zur Liste zaehlt nicht)'] }));
def({ id: 'QC-M03', stage: 'pm', role: M, must: true, mode: 'manuell', title: 'Delegation: Commit/Push/ZIP/Tag/Release durch guenstigen Agenten (Haiku); PM prueft Hash und ZIP' }, () => ({ r: 'SKIP', info: 'MANUELL', manual: [
  'Agent-Typ guenstig (Haiku)? Prompt enthielt Titel, Changelog, Autor actionhero-zz <najrefisch@googlemail.com>?',
  'PM hat danach git log -1 und unzip -l selbst geprueft (hier QC-M05, QC-M08)?'] }));

def({ id: 'QC-M04', stage: 'pm', role: M, must: true, mode: 'auto', title: 'Tag vX.Y.Z existiert, zeigt auf HEAD; Version == Tag; Versionsstellen einheitlich' }, () => {
  const v = ver(), vi = versionInfo(), bad = [];
  if (new Set([vi.plugin, vi.release, vi.app, vi.readme]).size !== 1) bad.push(`Versionen uneinheitlich: ${JSON.stringify([vi.plugin, vi.release, vi.app, vi.readme])}`);
  const t = sh(`git rev-parse -q --verify 'refs/tags/v${v}^{commit}'`);
  if (t.code) return FAIL(`Tag v${v} fehlt lokal` + (bad.length ? ' | ' + bad.join(' | ') : ''));
  const head = sh('git rev-parse HEAD').out; if (t.out !== head) bad.push(`Tag v${v} (${t.out.slice(0, 7)}) zeigt nicht auf HEAD (${head.slice(0, 7)})`);
  const rt = sh(`timeout 30 git ls-remote --tags origin 'v${v}' 'v${v}^{}'`).out;
  if (!rt) bad.push(`Tag v${v} fehlt auf origin`); else { const peeled = (rt.split('\n').find(l => l.includes('^{}')) || rt.split('\n')[0]).split('\t')[0]; if (peeled !== head) bad.push('Tag auf origin zeigt nicht auf HEAD'); }
  return bad.length ? FAIL(bad.join(' | ')) : PASS(`v${v} -> ${head.slice(0, 7)} lokal und origin`);
});

def({ id: 'QC-M05', stage: 'pm', role: M, must: true, mode: 'auto', title: 'Commit-Form: Betreff "x.y.z: Titel", Autor actionhero-zz, kein Fremdinhalt (Keystore, Audit-/Tool-Dateien)' }, () => {
  const v = ver(), l = sh("git log -1 --format='%an <%ae>|%s'").out, [au, subj] = l.split('|'), bad = [];
  if (au !== 'actionhero-zz <najrefisch@googlemail.com>') bad.push('Autor ' + au);
  if (!new RegExp('^' + v.replace(/\./g, '\\.') + ': \\S').test(subj)) bad.push(`Betreff "${subj}" nicht "${v}: Titel"`);
  const files = sh('git show --name-only --format= HEAD').out.split('\n');
  const odd = files.filter(f => /launcher\.keystore$|^audit\/|\.pyc$|__pycache__|\.zip$|node_modules/.test(f));
  if (odd.length) bad.push('Fremd-/Sperrdateien im Commit: ' + odd.join(', '));
  return bad.length ? FAIL(bad.join(' | ')) : PASS(`${subj.slice(0, 60)} (${files.length} Dateien)`);
});

def({ id: 'QC-M06', stage: 'pm', role: M, must: true, mode: 'auto', title: 'Arbeitsbaum sauber (git status leer, ausser bekannte QC-Einfuehrungsdateien); keine Rueckstufung (Tag > Vorgaenger)' }, () => {
  const allow = base.allow_untracked || [];
  const st = sh('git status --short --untracked-files=all').out.split('\n').filter(Boolean).filter(l => { const f = l.slice(3); return !(l.startsWith('??') && allow.some(a => f === a || (a.endsWith('/') && f.startsWith(a)))); });
  if (st.length) return FAIL('nicht sauber: ' + st.slice(0, 5).join('; '));
  const tags = sh("git tag --list 'v*' --sort=-v:refname").out.split('\n').filter(Boolean);
  const prev = tags[1]; if (prev && cmpVer(ver(), prev.slice(1)) <= 0) return FAIL(`Version ${ver()} nicht > Vorgaenger ${prev}`);
  return PASS('sauber' + (prev ? `, Vorgaenger ${prev}` : ''));
});

def({ id: 'QC-M07', stage: 'pm', role: M, must: true, mode: 'auto', title: 'Push: origin/main == HEAD und Spiegel claude/festive-sagan-avv9if == main' }, () => {
  const head = sh('git rev-parse HEAD').out;
  const r = sh(`timeout 30 git ls-remote origin main ${MIRROR}`); if (r.code) return FAIL('git ls-remote: ' + r.err.slice(0, 100));
  const m = {}; r.out.split('\n').forEach(l => { const [h, ref] = l.split('\t'); m[ref] = h; });
  const bad = [];
  if (m['refs/heads/main'] !== head) bad.push(`origin/main ${String(m['refs/heads/main']).slice(0, 7)} != HEAD ${head.slice(0, 7)}`);
  if (m['refs/heads/' + MIRROR] !== m['refs/heads/main']) bad.push(`Spiegel ${String(m['refs/heads/' + MIRROR]).slice(0, 7)} != main (Branch nicht loeschen, bis alle Installationen >= 0.19.114)`);
  return bad.length ? FAIL(bad.join(' | ')) : PASS(`main und Spiegel == HEAD ${head.slice(0, 7)}`);
});

def({ id: 'QC-M08', stage: 'pm', role: M, must: true, mode: 'auto', title: 'Release-ZIP: Praefix loxpanelfav/, VERSION, TITLE, favicon, APK, Skripte/sudoers, kein qa/ und kein __pycache__, Dateiliste == git archive HEAD' }, () => {
  const v = ver(), zip = `${REL}/loxpanelfav-${v}.zip`, bad = [];
  if (!exists(zip)) return FAIL('ZIP fehlt: ' + zip);
  const ls = sh(`unzip -Z1 '${zip}'`).out.split('\n').filter(Boolean);
  if (ls.some(f => !f.startsWith('loxpanelfav/'))) bad.push('Eintraege ausserhalb loxpanelfav/');
  const need = ['plugin.cfg', 'release.cfg', 'preroot.sh', 'postroot.sh', 'preupgrade.sh', 'postupgrade.sh', 'sudoers/sudoers', 'config/app/android/LoxPanel-Launcher.apk', 'config/app/android/LoxPanel-Launcher.version'];
  for (const n of need) if (!ls.includes('loxpanelfav/' + n)) bad.push(n + ' fehlt');
  if (!ls.some(f => /favicon\.ico$/.test(f))) bad.push('favicon.ico fehlt');
  if (ls.some(f => /^loxpanelfav\/qa\//.test(f))) bad.push('qa/ im ZIP');
  if (ls.some(f => /__pycache__|\.pyc$|\.git\//.test(f))) bad.push('pycache/.git im ZIP');
  const cfg = sh(`unzip -p '${zip}' loxpanelfav/plugin.cfg`).out;
  if ((/^VERSION=(\S+)/m.exec(cfg) || [])[1] !== v) bad.push('plugin.cfg-VERSION im ZIP != ' + v);
  if ((/^TITLE=(\S+)/m.exec(cfg) || [])[1] !== 'tilebert') bad.push('TITLE != tilebert');
  if (!/^NAME=loxpanelfav/m.test(cfg)) bad.push('NAME != loxpanelfav');
  const arc = sh(`git archive --format=tar --prefix=loxpanelfav/ HEAD | tar t`).out.split('\n').filter(f => f && !f.endsWith('/'));
  const zs = new Set(ls.filter(f => !f.endsWith('/'))); const diff = arc.filter(f => !zs.has(f)), extra = [...zs].filter(f => !arc.includes(f));
  if (diff.length || extra.length) bad.push(`ZIP != git archive HEAD (fehlt ${diff.length}${diff.length ? ': ' + diff.slice(0, 2) : ''}, zu viel ${extra.length}${extra.length ? ': ' + extra.slice(0, 2) : ''})`);
  const tags = sh("git tag --list 'v*' --sort=-v:refname").out.split('\n').filter(Boolean), prev = tags[1] && `${REL}/loxpanelfav-${tags[1].slice(1)}.zip`;
  let note = ''; if (prev && exists(prev)) { const a = fs.statSync(zip).size, b = fs.statSync(prev).size; note = `, ${(a / 1024).toFixed(0)} KB (Vorgaenger ${(b / 1024).toFixed(0)} KB)`; if (Math.abs(a - b) / b > 0.3) bad.push('Groesse weicht >30% vom Vorgaenger ab'); }
  return bad.length ? FAIL(bad.join(' | ')) : PASS(`${arc.length} Dateien == git archive HEAD${note}`);
});

def({ id: 'QC-M09', stage: 'pm', role: M, must: true, mode: 'auto', title: 'GitHub-Release vX.Y.Z vorhanden (kein Draft), ZIP-Asset, Groesse == lokales ZIP, Notes nicht leer' }, () => {
  const v = ver(), r = sh(`timeout 40 gh release view v${v} --repo ${REPO_SLUG} --json tagName,isDraft,isPrerelease,assets,body`);
  if (r.code) return FAIL(`gh release view v${v}: ${(r.err || r.out).slice(0, 100)}`);
  const j = JSON.parse(r.out), bad = [];
  if (j.isDraft) bad.push('Release ist Entwurf');
  const a = (j.assets || []).find(x => x.name === `loxpanelfav-${v}.zip`);
  if (!a) bad.push(`Asset loxpanelfav-${v}.zip fehlt`); else { const zip = `${REL}/loxpanelfav-${v}.zip`; if (exists(zip) && fs.statSync(zip).size !== a.size) bad.push(`Asset ${a.size} B != lokales ZIP ${fs.statSync(zip).size} B`); }
  if (!(j.body || '').trim()) bad.push('Release-Notes leer (Changelog erwartet)');
  return bad.length ? FAIL(bad.join(' | ')) : PASS(`v${v}, ${a.name} ${(a.size / 1024).toFixed(0)} KB`);
});

def({ id: 'QC-M10', stage: 'pm', role: K, must: true, mode: 'auto', title: 'Update-Quelle: main.zip erreichbar; raw release.cfg auf main und Spiegel liefert die Version (raw-Cache bis 5 min)' }, async () => {
  const v = ver(), bad = [], warn = [];
  const z = await http(`https://github.com/${REPO_SLUG}/archive/refs/heads/main.zip`, { head: true, method: 'HEAD', redirect: 'manual' });
  if (![200, 302].includes(z.status)) bad.push('main.zip -> ' + (z.status || z.err));
  for (const br of ['main', MIRROR]) {
    const h = await http(`https://raw.githubusercontent.com/${REPO_SLUG}/${br}/release.cfg`);
    if (!h.ok) { bad.push(`raw ${br} -> ${h.status || h.err}`); continue; }
    const got = (/^VERSION=(\S+)/m.exec(h.text()) || [])[1];
    if (got !== v) warn.push(`raw ${br} liefert ${got} statt ${v} (Cache bis ca. 5 min? sonst Push pruefen)`);
  }
  if (bad.length) return FAIL(bad.join(' | '));
  return warn.length ? WARN(warn.join(' | ')) : PASS(`main.zip ${z.status}, raw main + Spiegel = ${v}`);
});

def({ id: 'QC-M11', stage: 'pm', role: M, must: true, mode: 'auto', title: 'Dashboard: dash-Projekt loxpanel-favoriten zeigt die Repo-Version' }, () => {
  if (sh('which dash').code) return SKIP('dash nicht installiert');
  const r = sh('dash ls'); const l = r.out.split('\n').find(x => /loxpanel-favoriten/.test(x));
  if (!l) return FAIL('Projekt loxpanel-favoriten nicht in dash ls');
  const got = l.trim().split(/\s+/).pop(), v = ver();
  return got === v ? PASS(l.trim().replace(/\s+/g, ' ')) : FAIL(`dash zeigt ${got} statt ${v}: dash set / dash log nachziehen`);
});

def({ id: 'QC-M12', stage: 'pm', role: M, must: false, mode: 'auto', title: 'Doku-Stand: CLAUDE.md-Versionsschema (0.N.x) passt zur aktuellen Version; Nicht-aendern-Liste dort vorhanden' }, () => {
  const c = read(`${R}/CLAUDE.md`), v = ver(), [maj, min] = v.split('.');
  const pats = [...new Set([...c.matchAll(/\b(\d+)\.(\d+)\.x\b/g)].map(m => m[0]))];
  const old = pats.filter(p => { const [a, b] = p.split('.'); return a !== maj || b !== min; });
  const bad = []; if (old.length) bad.push(`CLAUDE.md nennt Schema ${old.join(', ')} (aktuell ${maj}.${min}.x) - Release-Beispiele veraltet`);
  const arch = exists(`${R}/docs/ARCHITEKTUR.md`) ? read(`${R}/docs/ARCHITEKTUR.md`) : '';
  if (/Arbeitsteilung.*Mac|\bMac\b.*Cloud/i.test(c + arch)) bad.push('Doku nennt noch die alte Arbeitsteilung Mac/Cloud');
  return bad.length ? WARN(bad.join(' | ')) : PASS('Versionsschema aktuell');
});

def({ id: 'QC-M13', stage: 'pm', role: M, must: true, mode: 'manuell', title: 'Regel-Compliance (Memory): Deutsch, kurz, ein naechster Schritt, Tag/Nacht nur aus Betriebsmodus, Fully nicht in Config, keine Forum-Aktion' }, () => {
  const lux = sh("git grep -n -i -E 'lux.*nacht|nacht.*lux' -- config/app/bin config/app/webfrontend | head -3").out;
  return { r: 'SKIP', info: 'MANUELL' + (lux ? ' (Hinweis Lux-Nachtlogik: ' + lux.split('\n')[0].slice(0, 80) + ')' : ''), manual: [
    'Antworten Deutsch, kurz, hoechstens ein naechster Schritt, keine Optionsmenues?',
    'Tag/Nacht nur aus dem Betriebsmodus (keine Lux-Schwelle) - Stichprobe im Diff?',
    'Fully nicht in der Config-Oberflaeche beworben (siehe QC-S12/QC-B08 Baseline)?',
    'Keine Forum-Texte oder -Aktionen (Thread 489664) im Release ohne Auftrag?'] };
});

def({ id: 'QC-M14', stage: 'pm', role: M, must: false, mode: 'auto', title: 'Rollback-Pfad: Vorgaenger-Tag erreichbar (Vorfahre von HEAD), Vorgaenger-ZIP vorhanden; Revert statt Force-Push' }, () => {
  const tags = sh("git tag --list 'v*' --sort=-v:refname").out.split('\n').filter(Boolean), prev = tags[1]; if (!prev) return SKIP('kein Vorgaenger-Tag');
  const bad = [];
  if (sh(`git merge-base --is-ancestor ${prev} HEAD`).code) bad.push(`${prev} ist kein Vorfahre von HEAD (History umgeschrieben?)`);
  if (!exists(`${REL}/loxpanelfav-${prev.slice(1)}.zip`)) bad.push(`Vorgaenger-ZIP loxpanelfav-${prev.slice(1)}.zip fehlt in ${REL}`);
  return bad.length ? WARN(bad.join(' | ')) : PASS(`${prev} + ZIP vorhanden. Rollback: Fix-Release x.y.z+1 mit altem Stand oder ZIP manuell einspielen (LoxBerry erkennt Rueckstufung nicht)`);
});

def({ id: 'QC-M15', stage: 'pm', role: M, must: true, mode: 'auto', title: 'Reihenfolge Plugin vor TbViewer: bei APK-Aenderung seit Vorgaenger-Tag nennt der Changelog "erst das Plugin", versionCode erhoeht' }, () => {
  const tags = sh("git tag --list 'v*' --sort=-v:refname").out.split('\n').filter(Boolean), prev = tags[1]; if (!prev) return SKIP('kein Vorgaenger-Tag');
  const chg = sh(`git diff --name-only ${prev} HEAD -- android config/app/android | grep -v '/build/'`).out;
  if (!chg) return PASS(`keine Android-Aenderung seit ${prev}`);
  const rd = read(`${R}/README.md`), top = rd.slice(rd.indexOf('## Eigene Funktionen dieses Forks')).split('\n').find(l => l.startsWith('- **')) || '';
  const bad = []; if (!/erst das Plugin|zuerst das Plugin|Plugin.{0,40}dann/i.test(top)) bad.push('Changelog-Kopf nennt die Reihenfolge "erst Plugin, dann APK" nicht');
  const oc = (/versionCode="(\d+)"/.exec(sh(`git show ${prev}:android/panel-launcher/AndroidManifest.xml`).out) || [])[1], nc = (/versionCode="(\d+)"/.exec(read(`${R}/android/panel-launcher/AndroidManifest.xml`)) || [])[1];
  if (!(+nc > +oc)) bad.push(`versionCode ${nc} nicht > ${oc} (Vorgaenger)`);
  return bad.length ? FAIL(bad.join(' | ')) : PASS(`Android geaendert (versionCode ${oc}->${nc}), Reihenfolge im Changelog genannt`);
});

def({ id: 'QC-M16', stage: 'pm', role: M, must: false, mode: 'manuell', title: 'Offene Aufgaben/Doku: dash todos gegen Release-Inhalt; offene Befunde (audit/kritik-*) als Todo oder bewusst verschoben; Doku zu geaendertem Verhalten' }, () => {
  const t = sh('dash todos loxpanel-favoriten 2>&1 | head -12').out;
  return { r: 'SKIP', info: 'MANUELL', manual: [
    'Offene Aufgaben (dash todos) gegen Release-Inhalt: nichts erledigt markiert ohne Beleg?' + (t ? ' (' + t.split('\n').length + ' Zeilen unten)' : ''),
    'Befunde aus audit/kritik-*.md sind Todo oder bewusst verschoben, QC-Ergebnis im dash log?',
    'Geaendertes Verhalten/Endpunkte in docs/ARCHITEKTUR.md, docs/TBVIEW.md, README nachgezogen?',
    'Update-Pfad Bestandsnutzer: nach LoxBerry-Update Version, Profile und Geraete unveraendert (qc.sh post)?', ...(t ? ['dash todos:', ...t.split('\n').map(x => '    ' + x)] : [])] };
});
