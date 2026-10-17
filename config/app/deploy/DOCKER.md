# Docker-Container ohne LoxBerry – Entwickler-Notiz (veraltet)

> **Veraltet / nur Entwickler-Notiz.** Stand aus der Zeit vor dem LoxBerry-Plugin
> (damals „LoxPanel“). Das Plugin **tilebert** baut und startet den Container selbst
> (`config/docker-compose.yml`, `bin/loxpanel-ctl.sh`): Host-Port **8098** (einstellbar), im
> Container 8099; Config-Volume `REPLACELBPDATADIR/config` (wird bei der
> Installation ersetzt). `.env.example` gibt es nicht mehr; die Env-Variablen
> `LOXPANEL_MS_HOST/USER/PASS/PORT/VERIFY_TLS` liest der Server weiterhin, sonst
> gilt `config/loxpanel.cfg` (Einstellungen-Seite). Die Datei ist nicht im Plugin-ZIP.


Der Server (Python/aiohttp) laeuft in einem Container; die Panels sind nur
Browser, die auf `http://<docker-host>:8099` zeigen. Verwalten der Ansichten
(Raeume/Kategorien/Kacheln/Theme) ueber die Konfig-Seite `/config`.

## Schnellstart

```bash
cp .env.example .env
nano .env                     # Miniserver-Host/User/Pass eintragen
docker compose up -d --build
```

Danach:
- Konfig-Seite:  `http://<docker-host>:8099/config`
- Panel-Ansicht: `http://<docker-host>:8099/?panel=<id>`

Auf dem Wandpanel in `deploy/loxpanel-kiosk.conf` einfach
`SERVER=<docker-host>:8099` setzen (siehe `DEPLOY.md`).

## Konfiguration

**Miniserver-Zugang** — zwei Wege (Env hat Vorrang):
- **Env-Variablen** in `.env` (`LOXPANEL_MS_HOST/USER/PASS/PORT/VERIFY_TLS`).
- oder **`config/loxpanel.cfg`** im gemounteten `./config`-Volume (wie standalone).

**Persistenz:** Der Host-Ordner `./config` ist als Volume unter `/app/config`
gemountet. Dort liegen/entstehen:
- `panels.json` — von der `/config`-Seite geschrieben (Panel-Profile, Kachel-Styles).
- `theme.json` — globales Theme (optional; sonst eingebaute Defaults).
- `loxpanel.cfg` — nur noetig fuer **Intercom/T25** (Kamera-URL + Login) und als
  Alternative zu den Env-Variablen.

> Ohne `theme.json`/`panels.json` startet LoxPanel mit Defaults (eine Standard-
> ansicht, alle Raeume/Kategorien). Die `/config`-Seite legt `panels.json` an.

## Netzwerk

Der Container muss den **Miniserver** (und ggf. die **T25**) im LAN erreichen —
per Standard-Bridge kein Problem (ausgehend). Eingehend wird nur Port **8099**
veroeffentlicht. Panels/Handys verbinden sich mit `<docker-host>:8099`.

## Betrieb

```bash
docker compose logs -f loxpanel     # Log (Struktur geladen? WS verbunden?)
docker compose pull && docker compose up -d   # Update (bei fertigem Image)
docker compose up -d --build        # Update bei lokalem Build
docker compose down                 # stoppen
```

## Verhaeltnis zum LoxBerry-Plugin

Der Container umschliesst denselben Server wie das spaetere LoxBerry-Plugin —
kein Wegwerf-Schritt. LoxBerry kann Docker-Plugins ausserdem direkt einbinden.
