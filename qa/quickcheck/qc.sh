#!/bin/bash
# Quickcheck-Routine tilebert. Aufruf: qa/quickcheck/qc.sh {pre|post|pm|all|baseline|list} [--full]
#   pre      Release-Kandidat lokal (vor "commit")
#   post     nach Installation, NUR LESEN (LoxBerry, Proxy, optional Shelly per adb)
#   pm       Prozess/Release (nach commit+push)
#   all      pre + pm
#   baseline schreibt qa/quickcheck/baseline.json aus dem aktuellen Stand neu (Befunde danach pruefen!)
#   list     Katalog aller Pruefungen
# Exit 1, wenn ein Muss-Punkt FAIL ist. Bericht: audit/qc-runs/<datum>-<stufe>.md
set -u
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export PYTHONDONTWRITEBYTECODE=1
export NODE_PATH="${QC_BROWSER_DIR:-/home/dietpi/projekte/tools/browser}/node_modules${NODE_PATH:+:$NODE_PATH}"
STAGE="${1:-}"
case "$STAGE" in pre|post|pm|all|baseline|list) shift ;; *) sed -n '2,9p' "$0" | sed 's/^# \{0,1\}//'; exit 2 ;; esac
exec node "$HERE/qc.mjs" "$STAGE" "$@"
