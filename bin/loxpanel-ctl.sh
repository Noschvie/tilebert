#!/bin/bash
# tilebert (frueher LoxPanel Favoriten) Docker-Steuerung.
# Nutzung: loxpanel-ctl.sh start|stop|restart|check|backup|restore <datei>
#   start   baut bei Bedarf das lokale Image (aus dem mitgelieferten
#           Quellcode unter config/app) und startet den Container
#   stop    stoppt den Container (merkt sich das -> check startet ihn NICHT neu)
#   restart stop + start  (baut dabei bei Aenderungen neu = manuelles Update)
#   check   startet den Container, falls er (unerwartet) nicht laeuft
#           (fuer Boot-daemon und 5-Minuten-Cron; ein bewusst gestopptes
#            Panel wird NICHT wieder gestartet)
#   portcheck <port>  meldet, wer den Port belegt (Exit 1), frei/eigener Container = Exit 0
#   backup  sichert die Konfiguration (Panels/Theme/Miniserver) als tar.gz
#   restore <datei>  spielt ein Backup zurueck (sichert vorher den Ist-Stand)
#
# Eigenstaendiger Fork: eigener Container-Name (loxpanelfav) und eigenes,
# LOKAL gebautes Image (kein Pull von ghcr.io/lenardo1/loxpanel) - laeuft
# unabhaengig neben einer evtl. installierten Original-LoxPanel-Version.
# REPLACELBPCONFIGDIR / REPLACELBPDATADIR werden beim Install durch echte Pfade ersetzt.

COMPOSE="REPLACELBPCONFIGDIR/docker-compose.yml"
STOPPED="REPLACELBPCONFIGDIR/loxpanelfav_stopped.cfg"
# Plugin-Einstellungen (Zeile LOXPANEL_PORT=<Host-Port>), Standard-Port 8098.
# Pre-/postroot.sh retten die Datei ueber Updates (LoxBerry leert den Config-Ordner).
CFG="REPLACELBPCONFIGDIR/loxpanelfav.cfg"
# Variablen fuer docker compose: sudo verwirft die Umgebung, daher per --env-file
ENVF="REPLACELBPCONFIGDIR/.compose.env"
# Grund, warum der Start unterblieb (Port belegt) - fuer die Plugin-Seite
PORTBUSY="REPLACELBPCONFIGDIR/loxpanelfav_portbelegt.cfg"
# Konfig-Daten liegen im gemounteten Volume (panels.json, theme.json,
# loxpanel.cfg) und gehoeren root (der Container schreibt als root). Backup/
# Restore laufen deshalb als root IM Container (sonst darf der Widget-Benutzer
# loxberry die root-Dateien nicht ueberschreiben -> "tar: Cannot open: File
# exists"). Sicherungen liegen in data/backups und ueberleben Plugin-Updates
# (pre-/postroot.sh sichern die Konfiguration ueber das Update hinweg).
DATADIR="REPLACELBPDATADIR"
CONFIGDATA="REPLACELBPDATADIR/config"
BACKUPDIR="REPLACELBPDATADIR/backups"
KEEP=20                 # so viele Backups behalten, aeltere werden entfernt
# Nicht ins Backup: heruntergeladene Fully-APKs (bis 80 MB, jederzeit neu ladbar)
# und die Ein-Generationen-Sicherung panels.json.bak - sonst waechst jedes Backup.
TAREX="--exclude=./adb/fully --exclude=./panels.json.bak --exclude=./diag.log*"

# Image aus der Compose-Datei lesen (Fallback fest: lokal gebautes Tag).
_img() {
	local i
	i=$(sed -n 's/^[[:space:]]*image:[[:space:]]*//p' "$COMPOSE" | head -1)
	[ -n "$i" ] && echo "$i" || echo "loxpanelfav:local"
}

# Einen sh-Befehl als root im Container ausfuehren. $DATADIR wird nach /data
# gemountet -> config=/data/config, backups=/data/backups.
_indocker() {
	sudo docker run --rm -v "$DATADIR":/data "$(_img)" sh -c "$1"
}

# Host-Port aus loxpanelfav.cfg, sonst 8098
_port() {
	local p
	p=$(sed -n 's/^[[:space:]]*LOXPANEL_PORT=[[:space:]]*\([0-9]\{1,5\}\)[[:space:]]*$/\1/p' "$CFG" 2>/dev/null | tail -1)
	if [ -n "$p" ] && [ "$p" -ge 1 ] && [ "$p" -le 65535 ]; then echo "$p"; else echo 8098; fi
}

# docker compose mit LOXPANEL_PORT (docker-compose.yml: "${LOXPANEL_PORT:-8098}:8099")
_compose() {
	LOXPANEL_PORT=$(_port)
	export LOXPANEL_PORT
	printf 'LOXPANEL_PORT=%s\n' "$LOXPANEL_PORT" > "$ENVF"
	sudo docker compose --env-file "$ENVF" -f "$COMPOSE" "$@"
}

# Wer belegt Port $1? Ausgabe leer = frei oder von unserem eigenen Container.
# Sonst "Container <name>", der Prozessname (nur sichtbar, wenn er loxberry
# gehoert) oder "unbekannt".
_port_owner() {
	local p=$1 c l
	c=$(sudo docker ps --filter "publish=$p" --format '{{.Names}}' 2>/dev/null | head -5)
	if [ -n "$c" ]; then
		printf '%s\n' "$c" | grep -qx loxpanelfav && return 0
		echo "Container $(printf '%s\n' "$c" | head -1)"; return 0
	fi
	if command -v ss > /dev/null 2>&1; then
		l=$(ss -ltnp "sport = :$p" 2>/dev/null | tail -n +2 | head -1)
		[ -z "$l" ] && return 0
		c=$(printf '%s' "$l" | sed -n 's/.*users:(("\([^"]*\)".*/\1/p')
		echo "${c:-unbekannt}"
	elif (exec 3<> "/dev/tcp/127.0.0.1/$p") 2> /dev/null; then
		echo "unbekannt"
	fi
}

running() {
	[ -n "$(sudo docker ps --filter 'name=^/loxpanelfav$' --filter status=running -q 2>/dev/null)" ]
}

backup() {
	mkdir -p "$BACKUPDIR"     # als loxberry -> Verzeichnis bleibt loxberry-eigen (Loeschen moeglich)
	local ts f
	ts=$(date +%Y%m%d-%H%M%S)
	f="loxpanelfav-config-$ts.tar.gz"
	if _indocker "cd /data/config 2>/dev/null && tar -czf /data/backups/$f $TAREX . 2>/dev/null"; then
		echo "Backup erstellt: $f ($(du -h "$BACKUPDIR/$f" 2>/dev/null | cut -f1))"
	else
		echo "Backup fehlgeschlagen (Konfiguration vorhanden?)."; exit 1
	fi
	# aelteste ueber KEEP hinaus loeschen (Sicherungen vor Restore eingeschlossen)
	ls -1t "$BACKUPDIR"/loxpanelfav-config-*.tar.gz 2>/dev/null | tail -n +$((KEEP+1)) | xargs -r rm -f
}

# Passwortschutz der Konfiguration entfernen (Passwort vergessen). Wirkt sofort.
resetpw() {
	if _indocker "python -c 'import json;p=\"/data/config/loxpanel.cfg\";d=json.load(open(p));d.pop(\"admin\",None);open(p,\"w\").write(json.dumps(d,indent=2,ensure_ascii=False))'"; then
		echo "Passwortschutz der Konfiguration entfernt."
	else
		echo "Zuruecksetzen fehlgeschlagen (Konfiguration vorhanden?)."; exit 1
	fi
}

# Prueft ein Archiv und entpackt es nach $2 (leeres Zwischenverzeichnis im
# Container). Pflicht: nur normale Dateien/Ordner, keine absoluten/../-Pfade,
# mindestens panels.json, loxpanel.cfg oder theme.json, und alle vorhandenen
# davon muessen gueltiges JSON (Objekt) sein. Exit 0 = ok, sonst Meldung auf stdout.
CHKPY='
import sys, os, json, tarfile
arc, dst = sys.argv[1], sys.argv[2]
def fail(m):
    print(m); sys.exit(3)
try:
    t = tarfile.open(arc, "r:gz")
    ms = t.getmembers()
except Exception as e:
    fail("Archiv defekt oder kein tar.gz (%s)" % e)
if not ms:
    fail("Archiv ist leer")
if len(ms) > 5000:
    fail("Archiv hat zu viele Eintraege (%d, erlaubt 5000)" % len(ms))
if sum(m.size for m in ms if m.isreg()) > 50 * 1024 * 1024:
    fail("Archiv ist entpackt groesser als 50 MB")
for m in ms:
    n = os.path.normpath(m.name)
    if n.startswith("/") or n == ".." or n.startswith("../"):
        fail("Unzulaessiger Pfad im Archiv: %s" % m.name)
    if not (m.isreg() or m.isdir()):
        fail("Unzulaessiger Eintrag im Archiv: %s" % m.name)
try:
    t.extractall(dst, members=ms, filter="data")
except Exception as e:
    fail("Entpacken fehlgeschlagen (%s)" % e)
vorhanden = 0
for f in ("panels.json", "loxpanel.cfg", "theme.json"):
    p = os.path.join(dst, f)
    if not os.path.isfile(p):
        continue
    vorhanden += 1
    try:
        d = json.load(open(p, encoding="utf-8"))
    except Exception as e:
        fail("%s ist kein gueltiges JSON (%s)" % (f, e))
    if not isinstance(d, dict):
        fail("%s hat unerwarteten Inhalt" % f)
if not vorhanden:
    fail("Pflichtdateien fehlen (panels.json, loxpanel.cfg oder theme.json)")
'

# Nur pruefen (z.B. nach Upload): entpackt in Zwischenordner, loescht ihn wieder.
verify() {
	local bn
	bn=$(basename "$1")
	[ -f "$BACKUPDIR/$bn" ] || { echo "Backup nicht gefunden: $bn"; exit 1; }
	sudo docker run --rm -e CHK="$CHKPY" -v "$DATADIR":/data "$(_img)" sh -c \
		'printf "%s" "$CHK" > /tmp/chk.py; mkdir -p /tmp/v; python -I /tmp/chk.py "/data/backups/$0" /tmp/v' "$bn"
}

restore() {
	local bn ts out
	bn=$(basename "$1")     # nur Dateiname, keine Pfad-Tricks
	[ -f "$BACKUPDIR/$bn" ] || { echo "Backup nicht gefunden: $bn"; exit 1; }
	mkdir -p "$BACKUPDIR"
	ts=$(date +%Y%m%d-%H%M%S)
	echo "Pruefe $bn ..."
	# Schritt 1+2 im Container: Archiv in Zwischenordner (neben config, gleiches
	# Volume) entpacken und pruefen. Erst wenn alles stimmt, wird config angefasst;
	# bei Fehler bleibt die alte Konfiguration unveraendert.
	# Schritt 3: Sperre gegen Doppellaeufe, Ist-Stand sichern, alte Dateien
	# beiseite schieben, neue einsetzen, bei Fehler alte zurueck.
	# adb/ (Schluessel + Fully-Cache) bleibt stehen: der Schluessel kommt aus dem
	# Backup zurueck, die APK muss nicht erneut geladen werden.
	out=$(sudo docker run --rm -e CHK="$CHKPY" -e BN="$bn" -e TS="$ts" -e TAREX="$TAREX" -v "$DATADIR":/data "$(_img)" sh -c '
		mkdir -p /data/config
		# Sperre mit Verfall: aelter als 10 Minuten = verwaist (Abbruch/Neustart), wird aufgehoben
		if [ -d /data/.restore.lock ] && [ -n "$(find /data/.restore.lock -maxdepth 0 -mmin +10)" ]; then
			echo "Veraltete Sperre aufgehoben."; rm -rf /data/.restore.lock
		fi
		if ! mkdir /data/.restore.lock 2>/dev/null; then echo "Es laeuft bereits eine Wiederherstellung."; exit 4; fi
		T=/data/.restore-neu; O=/data/.restore-alt
		trap "rm -rf /data/.restore.lock $T" EXIT
		rm -rf "$T" "$O"; mkdir -p "$T"
		printf "%s" "$CHK" > /tmp/chk.py
		python -I /tmp/chk.py "/data/backups/$BN" "$T" || exit 3
		echo "OK_GEPRUEFT"
		(cd /data/config && tar -czf "/data/backups/loxpanelfav-config-$TS-vor-restore.tar.gz" $TAREX . 2>/dev/null) && echo "OK_GESICHERT"
		# Eintraege einzeln per Glob (Leerzeichen im Namen sind unkritisch); adb/ bleibt stehen
		mvalt() { for g in /data/config/* /data/config/.[!.]*; do [ -e "$g" ] || continue; [ "${g##*/}" = adb ] && continue; mv "$g" "$O"/ || return 1; done; }
		wipe() { for g in /data/config/* /data/config/.[!.]*; do [ -e "$g" ] || continue; [ "${g##*/}" = adb ] || rm -rf "$g"; done; }
		back() { for g in "$O"/* "$O"/.[!.]*; do [ -e "$g" ] || continue; rm -rf "/data/config/${g##*/}"; mv "$g" /data/config/; done; }
		# Fehlt dem Archiv loxpanel.cfg oder panels.json, bleibt die aktuelle Datei erhalten
		for f in loxpanel.cfg panels.json; do
			if [ ! -e "$T/$f" ] && [ -e "/data/config/$f" ]; then cp -a "/data/config/$f" "$T/$f"; fi
		done
		mkdir "$O"
		if ! mvalt; then back; echo "Austausch fehlgeschlagen, alter Stand zurueck."; exit 5; fi
		if cp -a "$T"/. /data/config/; then rm -rf "$O"; else
			wipe; back
			echo "Einspielen fehlgeschlagen, alter Stand zurueck."; exit 5
		fi
		echo OK_FERTIG' 2>&1)
	local rc=$?
	case "$out" in *OK_GESICHERT*) echo "Aktuellen Stand gesichert (loxpanelfav-config-$ts-vor-restore.tar.gz).";; esac
	if [ $rc -ne 0 ] || [ "${out%OK_FERTIG*}" = "$out" ]; then
		echo "Wiederherstellung abgebrochen, alte Konfiguration unveraendert (oder zurueckgesetzt):"
		echo "$out" | grep -v '^OK_'
		exit 1
	fi
	echo "Konfiguration wiederhergestellt."
	# Container neu starten, damit die App die Panels frisch einliest (ohne Neu-Build)
	sudo docker restart loxpanelfav 2>&1 && echo "Panel neu gestartet."
}

start() {
	rm -f "$STOPPED"
	# Port vorher pruefen: belegt (nicht von uns) -> nicht starten, Grund ablegen.
	# Der 5-Minuten-Cron versucht es weiter und startet, sobald der Port frei ist.
	local p by
	p=$(_port)
	by=$(_port_owner "$p")
	if [ -n "$by" ]; then
		printf 'PORT=%s\nBY=%s\n' "$p" "$by" > "$PORTBUSY"
		echo "Port $p ist belegt ($by) - tilebert startet nicht. Anderen Port auf der Plugin-Seite waehlen."
		return 1
	fi
	rm -f "$PORTBUSY"
	# Lokal bauen (nutzt den Build-Cache -> nur beim ersten Mal bzw. nach
	# Quellcode-Aenderungen dauert es laenger), danach starten. Kein 'pull':
	# es gibt kein Registry-Image, der Code kommt aus config/app/.
	# --provenance=false --sbom=false: spart die BuildKit-Standard-Attestationen
	# (Lieferketten-Metadaten) beim Export - bei einem rein lokal gebauten und
	# gestarteten Image (nie in eine Registry gepusht, nie von dort geprueft)
	# ungenutzt, kostet aber bei jedem Build ein, zwei Sekunden.
	_compose build --provenance=false --sbom=false 2>&1
	_compose up -d 2>&1
	# Vorgaengerversion des Images (nach dem Neubau namenlos, ~200 MB) entfernen -
	# nur verwaiste Images mit unserem Label, sonst sammeln sie sich je Update an.
	sudo docker image prune -f --filter "label=de.loxpanelfav.image=1" > /dev/null 2>&1 || true
	# Build-Cache: Schichten, die 30 Tage nicht mehr gebraucht wurden (alte
	# pip-Staende frueherer Updates) - waechst sonst mit jedem Update.
	sudo docker builder prune -f --filter "until=720h" > /dev/null 2>&1 || true
}

stop() {
	touch "$STOPPED"
	rm -f "$PORTBUSY"
	_compose down 2>&1
}

case "$1" in
	start)   start ;;
	stop)    stop ;;
	restart) stop; start ;;
	check)
		[ -f "$STOPPED" ] && exit 0     # bewusst gestoppt -> nichts tun
		if ! running; then start
		# laeuft, antwortet aber nicht mehr (Healthcheck "unhealthy") -> neu starten
		elif [ "$(sudo docker inspect -f '{{.State.Health.Status}}' loxpanelfav 2>/dev/null)" = "unhealthy" ]; then
			echo "tilebert antwortet nicht (unhealthy) - Neustart."
			sudo docker restart loxpanelfav 2>&1
		fi
		;;
	portcheck)
		case "$2" in ''|*[!0-9]*) echo "Ungueltiger Port"; exit 2 ;; esac
		by=$(_port_owner "$2")
		[ -n "$by" ] && { echo "$by"; exit 1; }
		;;
	backup)  backup ;;
	restore) restore "$2" ;;
	verify)  verify "$2"; exit $? ;;
	resetpw) resetpw ;;
	*) echo "Nutzung: $0 start|stop|restart|check|portcheck <port>|backup|restore <datei>|resetpw"; exit 1 ;;
esac
exit 0
