# Quickcheck-Routine

Eine wiederholbare Prüfroutine für jedes tilebert-Update: ein Befehl, Kern (`pre`) rund 3–4 Minuten, klares Ergebnis. Sie liegt in `qa/quickcheck/` (nicht im Plugin-ZIP: `.gitattributes` setzt `qa/ export-ignore`).

## Aufruf

```
qa/quickcheck/qc.sh pre        # Release-Kandidat lokal, VOR „commit“
qa/quickcheck/qc.sh pm         # Prozess/Release, NACH commit + Push + ZIP + Tag + Release
qa/quickcheck/qc.sh post       # NACH der Installation auf LoxBerry, nur lesen
qa/quickcheck/qc.sh all        # pre + pm (post separat, erst nach der Installation)
qa/quickcheck/qc.sh baseline   # Baseline aus dem aktuellen Stand neu schreiben (siehe unten)
qa/quickcheck/qc.sh list       # Katalog aller Prüfungen
```

Option `--full`: zusätzlich die langen Läufe (Wetter-Matrix QC-B09, 5 Viewports × 12 Profile, ca. 2–3 Minuten). Zum Debuggen: `QC_ONLY='B0[1-5]' qa/quickcheck/qc.sh pre` führt nur Prüfungen aus, deren ID passt.

## Wann welche Stufe

| Stufe | Wann | Was sie tut |
|---|---|---|
| `pre` | Release-Kandidat fertig, bevor der Nutzer „commit“ sagt | Syntax, Versionen, Kennungen, i18n, const-Reihenfolge, Brücke, Begriffe, APK-Build in Scratch-Kopie, `lpdev` neu starten, API-Smoke, Browser-Prüfungen (Fehler, Schreibzugriffe, Sensor-/Nachtlogik, Brücke/Token, UX-Matrix) |
| `pm` | nach Commit, Push, ZIP, Tag und GitHub-Release | Tag/Commit/Push/Spiegel, ZIP-Inhalt, GitHub-Release, Update-Quelle, Dashboard, Doku-Stand; Freigabe-Fragen als manuelle Punkte |
| `post` | nach der Installation auf dem echten LoxBerry | nur lesende Abfragen: LoxBerry `192.168.1.103:8098`, Proxy `8097` (`?device=claude-audit`, keine Klicks), optional Shelly per adb (nur `dumpsys`/`screencap`) |

Reihenfolge eines Releases: `pre` → Nutzer-„commit“ → Release durch den günstigen Agenten → `pm` → Installation → `post`.

## Ergebnis lesen

- Je Prüfung eine Zeile: `ID | Stufe | Rolle | Prio | Ergebnis | Zeit | Kurzinfo`. Ergebnis: **PASS** in Ordnung, **FAIL** Fehler, **WARN** auffällig/zu klären, **SKIP** nicht ausgeführt (z. B. Gerät nicht erreichbar) oder manuell.
- **Muss** = bei FAIL endet `qc.sh` mit Exit-Code 1 (Release nicht freigeben). **Soll** = FAIL/WARN werden angezeigt, Exit-Code bleibt 0.
- **manuell**: wird als SKIP geführt und darunter als Frageliste ausgegeben („[ ] …“). Diese Punkte gehören in die Freigabe an den Nutzer.
- Bericht zusätzlich als Markdown in `/home/dietpi/projekte/audit/qc-runs/<datum>-<stufe>.md` (gleicher Tag und Stufe überschreibt).
- Bei FAIL zuerst die Kurzinfo lesen: sie nennt Datei/Zeile bzw. den Sollwert. „NEU“ heißt: nicht in der Baseline.

## Baseline

`qa/quickcheck/baseline.json` hält **bekannte, dokumentierte Befunde**; nur Neues wird gemeldet. Abschnitte: `i18n_missing` (deutsche Texte ohne EN-Eintrag, Altstexte), `terms` (Fully-Pfad-Texte im Quelltext), `terms_dom`, `ux_overflow`, `ux_offscreen`, `ux_tap`, `ux_hscroll`, `cfg_hscroll`, `tdz_order`, `bridge_doc`, `i18n_duplicate`; dazu `allow_untracked` (QC-Dateien bis zum ersten Commit). Jeder Eintrag trägt eine `ref` (Fundstelle).

- `qc.sh baseline` misst neu und **erhält vorhandene refs**; neue Schlüssel bekommen `ref: UNDOKUMENTIERT` und werden am Ende aufgelistet. Diese vor dem Einchecken prüfen: entweder Fundstelle eintragen (bekannter Befund) oder den Fehler beheben/entfernen. Nie blind übernehmen.
- Beim Beheben eines Befunds den Eintrag löschen, damit er nicht wiederkehren darf.
- Gemessen wird auf `lpdev` (keine Kameras, keine Miniserver-Bausteine): Kamera-Pills, Jalousie-/Wecker-Statustexte u. Ä. erscheinen erst auf der echten Anlage; dort bei Bedarf manuell sichten (`?device=claude-audit`, nur ansehen).

## Prüfungen pre – Release-Kandidat lokal (vor „commit“)

26 Prüfungen im Kern: 23 Muss, 3 Soll; 24 automatisch, 2 manuell (dazu QC-B09 nur mit `--full`: 1 Soll, automatisch).

| ID | Rolle | Prüfung | Prio | Art |
|---|---|---|---|---|
| QC-S01 | Programmierer | Python-Syntax (ast.parse, kein __pycache__) | Muss | auto |
| QC-S02 | Programmierer | JS-Syntax: Inline-Skripte panel/config/settings + i18n.js (node --check) | Muss | auto |
| QC-S03 | Kritiker | Shell-Syntax (bash -n) Install-/Update-/Daemon-Skripte; sudoers unveraendert | Muss | auto |
| QC-S04 | Kritiker | Perl-Syntax index.cgi (LoxBerry-Module gestubbt) | Soll | auto |
| QC-S05 | Kritiker | Versionsstellen: plugin.cfg == prerelease.cfg == APP_VERSION == README-Changelog-Kopf; release.cfg <= prerelease.cfg (beide reine SemVer, ARCHIVEURL enthaelt VERSION, PRERELEASECFG gesetzt); >= letzter Tag | Muss | auto |
| QC-S06 | Programmierer | APK: versionCode Manifest == .version == APK; targetSdk >= 24; Label TbViewer; erhoeht bei Android-Aenderung | Muss | auto |
| QC-S07 | Kritiker | Kennungen unveraendert: NAME/FOLDER loxpanelfav, Paket de.loxpanel.launcher, X-LoxPanel-Token, Keystore, Zertifikat 80ee7b07 | Muss | auto |
| QC-S08 | Kritiker | Release-Artefakte: keine untracked Release-Dateien; HEAD-Archiv enthaelt APK/.version/favicon; qa/ export-ignore; ARCHIVEURL beider cfg = Release-ZIP | Muss | auto |
| QC-S09 | Kritiker | i18n: deutsche T()/data-i18n-Texte der Config haben EN-Eintrag (nur NEU Fehlende), keine Doppelschluessel | Muss | auto |
| QC-S10 | Kritiker | const/let-Reihenfolge im Panel: keine Nutzung auf oberster Ebene vor der Deklaration (direkt oder ueber Funktionsaufruf) | Muss | auto |
| QC-S11 | Kritiker | Bruecke: @JavascriptInterface (Kiosk.java) == Namensliste tbWrap == docs/TBVIEW.md; Token als 1. Parameter, ok(t)-Pruefung | Muss | auto |
| QC-S11b | Kritiker | Bruecke dokumentiert: jede Methode in docs/TBVIEW.md, Token (tbtok) beschrieben | Soll | auto |
| QC-S12 | UX | Sichtbare Begriffe: kein "LoxPanel"/"Fully"/"TbView " ohne "er" in Nutzertexten (ausser Baseline-Whitelist) | Muss | auto |
| QC-S13 | Programmierer | APK-Build in Scratch-Kopie (build.sh), apksigner verify, Zertifikat, byte-gleich zur eingecheckten APK | Muss | auto |
| QC-R01 | Kritiker | Diff-Lesepass (Kritiker, ca. 10 min): Fehlerpfade, Offline/leer, Races, Timer, wachsende Dateien | Muss | manuell |
| QC-R02 | UX | UX-Sichtpruefung bei UI-/Kiosk-Aenderung: Nacht/Schoner, X2i echt, DE/EN-Texte, Android-Darstellung | Soll | manuell |
| QC-V01 | Programmierer | lpdev neu starten; /api/update liefert Repo-Version; keine Tracebacks im Log | Muss | auto |
| QC-V02 | Programmierer | API-Smoke lpdev: /, /config, /settings, /api/update, /api/devices, /api/meta, /manifest.webmanifest, /favicon.ico -> 200, JSON gueltig | Muss | auto |
| QC-B01 | Programmierer | Panel laedt ohne pageerror/Konsolenfehler (g3-3x1-f18, g2-2x2-f12, sens; 960x480) - Laufzeitbeleg gegen TDZ/"not defined" | Muss | auto |
| QC-B02 | Programmierer | Config/Geraete/Settings ohne pageerror; alle Rubriken und Reiter durchgeblaettert; Assistent (#ad_go) vorhanden | Muss | auto |
| QC-B03 | UX | Config schreibt beim Oeffnen/Navigieren nichts (alle Nicht-GET abgefangen = 0; de-DE und en-US) | Muss | auto |
| QC-B04 | Kritiker | Sensor-Logik mit Sollwerten: setAutoBrightness nur mit Lichtsensor, Annaeherung (open/wake), Nacht-Kamera (Sperre, Annaeherung, Beruehrung, Nachlauf, Option aus), prox=off, Config-Sensorfelder | Muss | auto |
| QC-B05 | Kritiker | Bruecke Panel<->App: Token (tbtok), Fremd-iframe gesperrt, Kompatibilitaet App 5.3/5.4 ohne Token, getDeviceId wirft, Fully/Browser-Erkennung | Muss | auto |
| QC-B06 | UX | UX Panel 480x480/960x480/390x844/1280x800 (Dashboard, Schoner, Wetter-Sheet): Fehler, hscroll, Abschneiden, ausserhalb Viewport, Tap-Ziele < 44 px - nur NEU gegenueber Baseline | Muss | auto |
| QC-B07 | UX | UX Config 1920/1280/390: alle Rubriken ohne JS-Fehler und ohne horizontales Scrollen (nur NEU gegenueber Baseline) | Muss | auto |
| QC-B08 | UX | Sichtbare Begriffe im gerenderten DOM (Panel, Config alle Reiter, Settings, Titel, Manifest): kein LoxPanel/Fully/TbView ohne er, Titel tilebert (nur NEU) | Muss | auto |
| QC-B10 | Kritiker | TbViewer nie aus (Leerlauf -> Dashboard), nachts abdunkeln; Licht an (Schwelle) -> volle Helligkeit + Kamera live, Licht aus -> Nachlauf, dimmen | Muss | auto |
| QC-B09 | Programmierer | Wetter-Kachel im Schoner: 5 Viewports x 12 Profile (nur mit --full, ca. 2-3 min) (nur --full) | Soll | auto |

## Prüfungen post – nach der Installation (nur lesen)

5 Prüfungen: 4 Muss, 1 Soll; 5 automatisch, 0 manuell.

| ID | Rolle | Prüfung | Prio | Art |
|---|---|---|---|---|
| QC-P01 | Programmierer | LoxBerry: /api/update current == Repo-Version, newer=false | Muss | auto |
| QC-P02 | Kritiker | LoxBerry: Smoke / /config /settings /api/* /manifest /favicon.ico 200; Titel tilebert; Manifest-Name; Groesse wie lpdev | Muss | auto |
| QC-P03 | Kritiker | LoxBerry: /api/devices plausibel (Liste, eindeutige Namen/UIDs, TbViewer-Geraete type tbview, bekanntes Shelly-Geraet) | Muss | auto |
| QC-P04 | Programmierer | Proxy 8097: Panel (?device=claude-audit) und Config laden ohne JS-Fehler; keine Klicks, Nicht-GET abgefangen = 0 | Muss | auto |
| QC-P05 | Kritiker | Shelly per adb (nur lesen): Paketversion == APK im Repo, Vordergrund Kiosk, Screenshot nicht leer (optional) | Soll | auto |

## Prüfungen pm – Prozess und Release (nach „commit“/Push)

16 Prüfungen: 13 Muss, 3 Soll; 11 automatisch, 5 manuell.

| ID | Rolle | Prüfung | Prio | Art |
|---|---|---|---|---|
| QC-M01 | PM | Inhaltsliste vorab (von dir beauftragt / von mir eigenstaendig) mit Abgleich zum Diff | Muss | manuell |
| QC-M02 | PM | Freigabe: ausdrueckliches "commit" des Nutzers nach der letzten Listenaenderung | Muss | manuell |
| QC-M03 | PM | Delegation: Commit/Push/ZIP/Tag/Release durch guenstigen Agenten (Haiku); PM prueft Hash und ZIP | Muss | manuell |
| QC-M04 | PM | Tag vX.Y.Z existiert, zeigt auf HEAD; Version == Tag; Versionsstellen einheitlich | Muss | auto |
| QC-M05 | PM | Commit-Form: Betreff "x.y.z: Titel", Autor actionhero-zz, kein Fremdinhalt (Keystore, Audit-/Tool-Dateien) | Muss | auto |
| QC-M06 | PM | Arbeitsbaum sauber (git status leer, ausser bekannte QC-Einfuehrungsdateien); keine Rueckstufung (Tag > Vorgaenger) | Muss | auto |
| QC-M07 | PM | Push: origin/main == HEAD und Spiegel claude/festive-sagan-avv9if == main | Muss | auto |
| QC-M08 | PM | Release-ZIP: Praefix loxpanelfav/, VERSION, TITLE, favicon, APK, Skripte/sudoers, kein qa/ und kein __pycache__, Dateiliste == git archive HEAD | Muss | auto |
| QC-M09 | PM | GitHub-Release vX.Y.Z vorhanden (kein Draft), ZIP-Asset, Groesse == lokales ZIP, Notes nicht leer | Muss | auto |
| QC-M10 | Kritiker | Update-Quelle: ARCHIVEURL (Release-ZIP) erreichbar; raw release.cfg + prerelease.cfg auf main (release.cfg auch Spiegel) liefern die Version (raw-Cache bis 5 min) | Muss | auto |
| QC-M11 | PM | Dashboard: dash-Projekt loxpanel-favoriten zeigt die Repo-Version | Muss | auto |
| QC-M12 | PM | Doku-Stand: CLAUDE.md-Versionsschema (0.N.x) passt zur aktuellen Version; Nicht-aendern-Liste dort vorhanden | Soll | auto |
| QC-M13 | PM | Regel-Compliance (Memory): Deutsch, kurz, ein naechster Schritt, Tag/Nacht nur aus Betriebsmodus, Fully nicht in Config, keine Forum-Aktion | Muss | manuell |
| QC-M14 | PM | Rollback-Pfad: Vorgaenger-Tag erreichbar (Vorfahre von HEAD), Vorgaenger-ZIP vorhanden; Revert statt Force-Push | Soll | auto |
| QC-M15 | PM | Reihenfolge Plugin vor TbViewer: bei APK-Aenderung seit Vorgaenger-Tag nennt der Changelog "erst das Plugin", versionCode erhoeht | Muss | auto |
| QC-M16 | PM | Offene Aufgaben/Doku: dash todos gegen Release-Inhalt; offene Befunde (audit/kritik-*) als Todo oder bewusst verschoben; Doku zu geaendertem Verhalten | Soll | manuell |

## Sicherheit und Grenzen

- Keine Schreibaktionen auf LoxBerry/Proxy, keine Klicks auf Bedienelemente, kein `adb install`. `post` nutzt nur GET/HEAD, im Browser werden alle Nicht-GET-Anfragen abgefangen und gezählt (Ausnahme: das reine Berechnungs-POST `/api/tablayout` des Tab-Editors wird abgebrochen und nicht als Schreibzugriff gewertet).
- `pre` startet den Docker-Testserver `lpdev` neu (Port 8099, ohne Miniserver) und testet nur dort (Klicks/Stubs sind dort erlaubt). APK-Build, Perl-Check und JS-Extraktion laufen in einer Scratch-Kopie; im Repo entsteht nichts (`PYTHONDONTWRITEBYTECODE=1`, `ast.parse`).
- `qc.sh` ändert nur `baseline.json` (Befehl `baseline`) und schreibt Berichte nach `audit/qc-runs/`. Nie committen lassen, was `qc.sh` nicht selbst geprüft hat.

## Voraussetzungen und Umgebung

Node mit `playwright-core` aus `/home/dietpi/projekte/tools/browser/node_modules` (per `createRequire`), Chromium `/usr/bin/chromium`, `aapt`, `apksigner`, JDK + `~/projekte/tools/android`, `docker` (Container `lpdev`), `git`, `gh`, `dash`, optional `adb`. Anpassbar per Umgebungsvariable: `QC_LPDEV`, `QC_PROXY`, `QC_LOXBERRY`, `QC_SHELLY`, `QC_BROWSER_DIR`, `QC_CHROMIUM`, `QC_RUNS`, `QC_RELEASES`, `QC_SCRATCH`.

## Bekannte Lücken (nicht automatisiert)

Kontrastmessung in drei Themes, Designsystem-Tokens/Theme-Sync, Screenshot-Diff, Eingabe-Härtung per POST (Fremdwerte), Altdaten-Migration, Docker-Kaltbuild und echte Gerätescreenshots sind absichtlich nicht im Kern (Dauer/Nutzen); sie stehen in `audit/qc-ux.md` und `audit/qc-kritiker.md` als Ausbau. Die Struktur ist erweiterbar: neue Prüfung = `def({ id, stage, role, must, mode, title }, fn)` in `checks-*.mjs`.

## Beobachtung zur Config (Race)
Die Browser-Prüfungen der Config warten, bis `META` (async von `/api/meta`) geladen ist. Ohne das wirft die Geräte-Seite gelegentlich „Cannot read properties of null (reading 'deviceModels')“ (`renderDeviceList`, config.html Zeile ~4579, kein Null-Schutz auf `META`). Bisher nur beim Durchblättern vor dem Laden gesehen, kein Baseline-Eintrag.
