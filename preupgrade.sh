#!/bin/sh
# No-op: Die Update-sichere Sicherung der Panel-Konfiguration passiert jetzt in
# preroot.sh (laeuft als ROOT). Grund: die Config-Dateien im Docker-Volume
# gehoeren root; ein als loxberry laufendes Skript kann sie nicht zuverlaessig
# sichern/zurueckspielen. Siehe preroot.sh / postroot.sh. Dort wird auch die
# Plugin-Einstellung loxpanelfav.cfg (Host-Port) ueber das Update gerettet.
exit 0
