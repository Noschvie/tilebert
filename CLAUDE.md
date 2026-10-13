# tilebert (früher LoxPanel) – Regeln für Claude

LoxBerry-Plugin „tilebert“ (früher „LoxPanel Favoriten“; ein LoxPanel Fork von Lenardo1/Loxpanel), läuft als eigener
Docker-Container (Port 8098). Server: `config/app/bin/webvisu.py`, Config-Seite:
`config/app/webfrontend/html/config.html`, Panel: `config/app/webfrontend/html/`.
TbView (eigene Kiosk-App): `docs/TBVIEW.md`.

## Stil
- Antworten Deutsch, ultrakurz.
- Code-Kommentare deutsch **ohne Umlaute**, knapp. UI-Texte mit Umlauten über `T('…')`.
- Vor jedem Commit kurz den Nutzer fragen.

## Arbeitsort
- Seit 2026-10-10 alles auf claude-pi (`/home/dietpi/projekte/loxohnepanel`), inkl. Android/adb.
  Teile dürfen in die Cloud ausgelagert werden. Commit/Push/Release macht ein günstiger Agent.
- Testserver: Docker `lpdev` (Port 8099, Quellcode eingebunden), Browser-Tests mit Chromium +
  `~/projekte/tools/browser/*.mjs`. Shelly X2i Test-Gerät: 192.168.1.247 (adb).

## Git / Release
- Release nur auf „commit“ des Nutzers, ausgeführt von einem günstigen Agenten:
  1. Version erhöhen in `plugin.cfg`, `release.cfg`, `prerelease.cfg`, `APP_VERSION` (webvisu.py);
     `ARCHIVEURL`/`INFOURL` in release.cfg und prerelease.cfg auf den neuen Tag `v0.20.x`
     (`.../releases/download/v0.20.x/loxpanelfav-0.20.x.zip`, `.../releases/tag/v0.20.x`). Nummern rein numerisch.
  2. Changelog-Eintrag ganz oben in `README.md` unter „Eigene Funktionen dieses
     Forks“ (neueste zuerst, nichts angepinnt): `- **Titel (0.20.x)** — Text`
  3. Englische Übersetzung nachziehen (i18n.js, günstiger Agent) – `qa/quickcheck/qc.sh pre` muss QC-S09 grün melden;
     dann `python3 -m py_compile config/app/bin/webvisu.py`
  4. Commit `0.20.x: Titel`, push `main` und Spiegel `claude/festive-sagan-avv9if`
     (alte Installationen lesen dort `release.cfg`; Spiegel bleibt, bis alle ≥ 0.19.114 haben)
  5. Plugin-ZIP: `git archive --format=zip --prefix=loxpanelfav/ -o loxpanelfav-0.20.x.zip HEAD`
     nach `~/projekte/releases/`, dann Tag `v0.20.x` + GitHub-Release mit dem ZIP
- Prerelease (Vorabversion): nur `prerelease.cfg` (VERSION/ARCHIVEURL/INFOURL) + `plugin.cfg`/`APP_VERSION`
  auf die neue Nummer, `release.cfg` bleibt; sonst Schritte 2–5, GitHub-Release mit
  `gh release create v0.20.x <zip> --prerelease`. Freigabe zum Release: `release.cfg` auf dieselbe
  Nummer ziehen (gleiches ZIP, Tag bleibt), commit/push, `gh release edit v0.20.x --prerelease=false --latest`.
  LoxBerry vergleicht per SemVer (`plugin_version_compare`); prerelease.cfg nie niedriger als release.cfg.
- Commit-Autor: `actionhero-zz <najrefisch@googlemail.com>`.

## Android-Launcher / TbView
- APK auf dem Pi bauen: `android/panel-launcher/build.sh` (aapt, apksigner, zipalign, JDK,
  dazu `~/projekte/tools/android/{p28/android.jar,r8.jar}`). TbView: `docs/TBVIEW.md`.
- `launcher.keystore` nie ersetzen – sonst klappt `adb install -r` nicht mehr.
- Bei Änderungen `versionCode`/`versionName` im Manifest erhöhen; `targetSdkVersion` ≥ 24.
