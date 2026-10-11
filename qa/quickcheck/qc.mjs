// Quickcheck-Runner: waehlt Stufe, fuehrt Pruefungen aus, druckt Tabelle, schreibt Bericht, Exit-Code.
import fs from 'node:fs';
import { checks, opts, R, RUNS_DIR, scratch, closeBrowser, repoVersion, setCollect, writeBaseline, collected, base } from './lib.mjs';
import './checks-static.mjs';
import './checks-server.mjs';
import './checks-browser.mjs';
import './checks-post.mjs';
import './checks-pm.mjs';

const args = process.argv.slice(2);
const stage = args[0]; opts.full = args.includes('--full');
const stages = stage === 'all' ? ['pre', 'pm'] : stage === 'baseline' ? ['pre'] : [stage];
const ORDER = { pre: 0, post: 1, pm: 2 };

if (stage === 'list') {
  for (const s of ['pre', 'post', 'pm']) for (const c of checks.filter(c => c.stage === s))
    console.log([c.id, c.stage, c.role, c.must ? 'Muss' : 'Soll', c.mode, c.full ? 'nur --full' : '', c.title].join(' | '));
  process.exit(0);
}
if (stage === 'baseline') setCollect(true);

const sel = checks.filter(c => stages.includes(c.stage) && (opts.full || !c.full) && (!process.env.QC_ONLY || new RegExp(process.env.QC_ONLY).test(c.id))).sort((a, b) => ORDER[a.stage] - ORDER[b.stage]);
const results = []; const t0 = Date.now();
const date = new Date().toISOString().slice(0, 10);
console.log(`Quickcheck ${stage}${opts.full ? ' --full' : ''}  Repo ${R}  Version ${repoVersion()}  ${new Date().toLocaleString('de-DE')}`);
for (const c of sel) {
  const t = Date.now(); let r;
  process.stderr.write(`  ${c.id} ${c.title.slice(0, 60)} ...`);
  try { r = await c.fn({}); if (typeof r === 'string') r = { r: 'PASS', info: r }; if (!r) r = { r: 'PASS', info: '' }; }
  catch (e) { r = { r: 'FAIL', info: 'Ausnahme: ' + String(e && e.stack || e).split('\n').slice(0, 2).join(' ') }; }
  if (c.mode === 'manuell' && r.r === 'PASS') r.r = 'SKIP';
  const dt = Date.now() - t; results.push({ ...c, ...r, ms: dt });
  process.stderr.write(` ${r.r} (${(dt / 1000).toFixed(1)} s)\n`);
}
await closeBrowser();
const total = (Date.now() - t0) / 1000;

if (stage === 'baseline') {
  writeBaseline({ stand: new Date().toISOString().slice(0, 10), version: repoVersion() });
  const und = []; for (const [s, o] of Object.entries(JSON.parse(fs.readFileSync(new URL('./baseline.json', import.meta.url))))) { if (s.startsWith('_') || s === 'allow_untracked') continue; for (const [k, v] of Object.entries(o || {})) if (v.ref === 'UNDOKUMENTIERT') und.push(`${s}: ${k}`); }
  console.log(`Baseline geschrieben (${Object.keys(collected).map(s => `${s} ${collected[s].length}`).join(', ')}). UNDOKUMENTIERT: ${und.length}`);
  und.forEach(x => console.log('  ? ' + x.slice(0, 200)));
  fs.rmSync(scratch, { recursive: true, force: true }); process.exit(0);
}

const cnt = x => results.filter(r => r.r === x).length;
const mustFail = results.filter(r => r.must && r.r === 'FAIL');
const lines = [];
lines.push('| ID | Stufe | Rolle | Prio | Ergebnis | Zeit | Kurzinfo |', '|---|---|---|---|---|---|---|');
for (const r of results) lines.push(`| ${r.id} | ${r.stage} | ${r.role} | ${r.must ? 'Muss' : 'Soll'} | ${r.r}${r.mode === 'manuell' ? ' (manuell)' : ''} | ${(r.ms / 1000).toFixed(1)} s | ${String(r.info || '').replace(/\|/g, '/').replace(/\n/g, ' ')} |`);
const summary = `PASS ${cnt('PASS')}  FAIL ${cnt('FAIL')}  WARN ${cnt('WARN')}  SKIP ${cnt('SKIP')}  | Laufzeit ${Math.floor(total / 60)}:${String(Math.round(total % 60)).padStart(2, "0")} (m:ss) | Muss-FAIL: ${mustFail.length}${mustFail.length ? ' (' + mustFail.map(r => r.id).join(', ') + ')' : ''}`;
const manual = results.filter(r => r.manual);
const verdict = mustFail.length ? 'ERGEBNIS: FAIL (Muss-Punkt verletzt)' : (cnt('FAIL') || cnt('WARN') ? 'ERGEBNIS: OK mit Auffaelligkeiten (siehe FAIL/WARN)' : 'ERGEBNIS: OK');
const out = lines.join('\n');
console.log('\n' + out + '\n\n' + summary + '\n' + verdict);
for (const r of manual) console.log(`\n[MANUELL] ${r.id} ${r.title}\n${r.manual.map(q => '  [ ] ' + q).join('\n')}`);
fs.mkdirSync(RUNS_DIR, { recursive: true });
const rep = `${RUNS_DIR}/${date}-${stage}.md`;
fs.writeFileSync(rep, `# Quickcheck ${stage}${opts.full ? ' --full' : ''} - ${new Date().toLocaleString('de-DE')}\n\nRepo-Version ${repoVersion()}, ${summary}\n\n${verdict}\n\n${out}\n` +
  (manual.length ? '\n## Manuelle Punkte\n' + manual.map(r => `\n**${r.id} ${r.title}**\n${r.manual.map(q => '- [ ] ' + q).join('\n')}`).join('\n') + '\n' : ''));
console.log(`Bericht: ${rep}`);
if (!process.env.QC_SCRATCH) fs.rmSync(scratch, { recursive: true, force: true });
process.exit(mustFail.length ? 1 : 0);
