#!/bin/bash
# Laeuft als ROOT NACH der Installation.
# Args: <TEMPFOLDER> <NAME> <FOLDER> <VERSION> <BASEFOLDER>
ARGV3=$3
ARGV5=$5
BINDIR="$ARGV5/bin/plugins/$ARGV3"

chmod +x "$BINDIR/loxpanel-ctl.sh" 2>/dev/null

# Vor dem Start die in preroot.sh gesicherte Panel-Konfiguration zurueckspielen
# (als root -> keine Rechteprobleme). Muss VOR dem Container-Start passieren.
LPBK="/tmp/loxpanelfav-upgrade-backup"
DATADIR="$ARGV5/data/plugins/$ARGV3"
if [ -d "$LPBK" ] && [ -n "$(ls -A "$LPBK" 2>/dev/null)" ]; then
	mkdir -p "$DATADIR/config"
	cp -a "$LPBK/." "$DATADIR/config/" 2>/dev/null
	rm -rf "$LPBK"
	echo "<OK> Panel-Konfiguration wiederhergestellt (Update-sicher)."
fi

# Plugin-Einstellungen (Host-Port) zurueck, bevor der Container startet
LPCFG="/tmp/loxpanelfav-upgrade-plugin.cfg"
CFGFILE="$ARGV5/config/plugins/$ARGV3/loxpanelfav.cfg"
if [ -f "$LPCFG" ]; then
	cp -a "$LPCFG" "$CFGFILE" 2>/dev/null && chown loxberry:loxberry "$CFGFILE" 2>/dev/null
	rm -f "$LPCFG"
	echo "<OK> Plugin-Einstellungen wiederhergestellt."
fi
PORT=$(sed -n 's/^[[:space:]]*LOXPANEL_PORT=[[:space:]]*\([0-9]\{1,5\}\)[[:space:]]*$/\1/p' "$CFGFILE" 2>/dev/null | tail -1)
PORT=${PORT:-8098}

# Sicherungen zurueck (siehe preroot.sh), Besitzer loxberry -> auf der
# Plugin-Seite loeschbar und herunterladbar
LPBB="/tmp/loxpanelfav-upgrade-backups"
if [ -d "$LPBB" ] && [ -n "$(ls -A "$LPBB" 2>/dev/null)" ]; then
	mkdir -p "$DATADIR/backups"
	cp -a "$LPBB/." "$DATADIR/backups/" 2>/dev/null
	chown -R loxberry:loxberry "$DATADIR/backups" 2>/dev/null
	rm -rf "$LPBB"
	echo "<OK> Sicherungen wiederhergestellt."
fi

# Reste eines alten Containers entfernen (Daten liegen im Volume -> verlustfrei).
docker rm -f loxpanelfav > /dev/null 2>&1

# tilebert starten – Docker wurde (falls noetig) bereits in preroot.sh selbst
# installiert, ein Reboot ist dafuer nicht mehr noetig. Die Pruefung bleibt als
# Sicherheitsnetz stehen, falls die Docker-Installation dort ausnahmsweise
# fehlgeschlagen sein sollte.
if which docker > /dev/null 2>&1; then
	echo "<INFO> Starte tilebert (Favoriten-Fork)..."
	if su -s /bin/bash loxberry -c "$BINDIR/loxpanel-ctl.sh start" && [ ! -f "$ARGV5/config/plugins/$ARGV3/loxpanelfav_portbelegt.cfg" ]; then
		echo "<OK> tilebert laeuft – Oberflaeche: http://<LoxBerry-IP>:$PORT/config"
	else
		echo "<WARN> tilebert nicht gestartet (Port $PORT belegt?) - Details auf der Plugin-Seite."
	fi
else
	echo "<WARN> Docker ist nicht verfuegbar - tilebert konnte nicht gestartet werden. Bitte preroot.sh-Log pruefen."
fi

exit 0
