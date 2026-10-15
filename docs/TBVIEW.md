# TbView – eigene Kiosk-App statt Fully (Stand 2026-10-12, TbViewer 5.6)

Ziel: Ersatz für Fully Kiosk. Fully bleibt Fallback. Vorbild ist `LoxKiosk` aus
Lenardo1/Loxpanel (`android/app/src/main/java/com/loxpanel/spike/KioskActivity.kt`,
`Helligkeit.kt`). LoxKiosk wird **nicht** als eigener Typ unterstützt (keine
Config, keine Erkennung) – nur Code-Teile werden übernommen (Lizenz/Notice beachten).

## Basis
- Eigener Launcher `android/panel-launcher` (Java, `build.sh`, `launcher.keystore`,
  ohne Gradle) bekommt eine Kiosk-Activity mit WebView. Original ist Kotlin+Gradle+
  Chaquopy (Server läuft dort auf dem Gerät) – das brauchen wir nicht.
- Bereich der Cloud-Instanz (adb/Android), Panel-Seite lokal.

## JS-Brücke `window.TbView`
Namen wie Fully/LoxKiosk, damit das Panel alle gleich behandelt:

| Methode | Wirkung |
|---|---|
| `turnScreenOn()` / `turnScreenOff()` / `isScreenOn()` | Schoner weg/an (schwarzes Overlay + Helligkeit 0) |
| `setDisplayOff(sek)` | Backlight aus n s nach Start des Panel-Schoners, 0 = nie |
| `setSaver(on)` | Panel meldet eigenen Schoner (Uhr); App dunkelt danach selbst |
| `setDisplayBrightness(prozent)` | Nachtwert: Fensterhelligkeit in % der vollen Helligkeit, gilt **direkt** (nicht mal Auto); 100 = Tagwert (Auto bzw. Fest). Ab 5.7 immer `true` |
| neu: `getDeviceId()`, `getDeviceInfo()` | stabile ID/Steckbrief (Ersatz für Fully-Steckbrief) |
| neu: `getProximity()`, `getLightLevel()` | Näherung (bool), Lichtstufe 0–16 (-1 = noch kein Wert) |
| neu: `setAutoBrightness(an,min,max)`, `setProximityWake(an)`, `reload()` | Auto-Helligkeit (Lichtsensor), Wecken per Näherung, Seite neu laden |
| neu (5.7): `setFixedBrightness(prozent)`, `setTouchSound(an)` | feste Helligkeit in % (0 = System; gilt ohne Auto), Android-Klickton bei Tipp (nur wenn „Touch-Töne“ im System an sind) |
| neu: Ereignis Näherung | App ruft `window.lpHost.onProximity(nah)` |

## Näherungssensor (übernehmen)
- Shelly: Wake-up-Sensor, `getDefaultSensor()` liefert ihn nicht ->
  `getSensorList(TYPE_PROXIMITY).firstOrNull() ?: getDefaultSensor(...)`.
- In `onResume` mit `SENSOR_DELAY_FASTEST` registrieren, in `onPause` abmelden.
- `nah = values[0] < maximumRange`. Nah im Schoner -> aufwecken + `wake()` im Panel.
- Befund 0.1: Sensor (`/dev/input/event5`, ABS_DISTANCE 0/1) sendet nur, wenn eine App
  ihn anmeldet -> genau das macht TbView. Firmware-Weckung greift nur beim
  Hersteller-Launcher.
- Zusätzlich an das Panel melden (Roadmap 0.5: Kamera live nur bei Näherung).

## Helligkeit (übernehmen)
- Nur Fenster: `window.attributes.screenBrightness`; Geräteeinstellung bleibt.
- Systemhelligkeit lesen (`Settings.System.SCREEN_BRIGHTNESS`, ohne Berechtigung),
  Max aus `config_screenBrightnessSettingMaximum` (AOSP 255, manche 2047).
- Auto-Helligkeit -> Wert unbekannt -> `false`.
- Nachtmodus: 70 % abdunkeln = 7 % der Systemhelligkeit (gleiche Leuchtdichte wie Overlay).
- `FLAG_KEEP_SCREEN_ON`, damit der Sensor aktiv bleibt; Schoner = eigenes Overlay.

## Panel / Server
- `lpHost` in `panel.html`: Erkennung `TbView` -> `fully` -> Browser (kein LoxKiosk).
  Stellen: Geräte-ID (`fk-` Fully, `tb-` TbView), Steckbrief `deviceInfo`, `kiosk=`-Meldung,
  Kamera `isScreenOn`, `kiosk()` (Zeilen siehe docs/ARCHITEKTUR.md).
- `webvisu.py`: `kiosk=tbview` annehmen, Typ in Geräteliste.

## ShellyElevate (RapierXbox/ShellyElevate) – bessere Vorlage
Java, Apache-2.0 (Code übernehmbar mit Notice), aktiv gepflegt, alle Shelly-Displays inkl. X2i (Jenna).
Kiosk-WebView als Fully-Ersatz, Lite-Modus neben Fully möglich. Gefunden über rtho782/shelly-x2i-root.
- **Näherung X2i:** nicht zuverlässig über SensorManager (LoxKiosk-Weg!). Drei Wege nacheinander:
  1. `SensorManager TYPE_PROXIMITY`, 2. JNI `libshellyinput.so` liest `/dev/input/event*`
  (`KEY_F5` nah / `KEY_F6` fern), 3. Fallback `getevent -l` parsen. Unser Befund 0.1
  (event5 ABS_DISTANCE, kein F5/F6 gesehen) passt nur teilweise -> alle Wege einbauen.
- **Helligkeit:** sysfs-Backlight (`/sys/devices/platform/leds-mt65xx/leds/lcd-backlight/brightness` u. a.),
  Auto-Helligkeit aus Lux (<30 lx -> min 48, >500 lx -> 255, 3 s Hysterese, Animation 50 ms).
- **JS-Brücke `ShellyElevate`:** `getLux/getProximity/getTemperature/getHumidity`, `get/setScreenBrightness`,
  `sleep/wake`, `keepScreenAlive`, `getRelay/setRelay`, Ereignisse per `bind()` (`onMotion`, `onScreenOn/Off`,
  `onButtonPressed`) – nur mit „Extended JavaScript Interface“.
- Zusätzlich HTTP-API :8080, MQTT, Relais, Taster, Temperatur/Feuchte.

## Code-Befund ShellyElevate (Stand 0043c23) und Folgen für TbView
- Jenna (`DeviceModel.java:28-35`): Näherung `invertProximity`, Eingabegeräte `/dev/input/event4,5,7`
  (dort: event4 = gpio_keys KEY_F5/F6). Unser Log 0.1: event4 = lightsensor-level, event5 = proximity
  (ABS_DISTANCE). -> beide Formate auswerten (EV_KEY 63/64 und EV_ABS ABS_DISTANCE).
- JNI-Lib nur Komfort: `open()` lesend auf `/dev/input/eventN`. Geht auch in reinem Java
  (FileInputStream, `input_event` 24 Byte auf 64 bit / 16 Byte auf 32 bit) -> kein NDK nötig.
  Ob eine normale App das auf dem X2i lesen darf, belegt niemand -> **erst Gerätetest**.
- Helligkeit Jenna: sysfs gesperrt (EACCES); ShellyElevate nutzt `Settings.System.SCREEN_BRIGHTNESS`
  (+ `adb shell appops set <pkg> WRITE_SETTINGS allow`). TbView nimmt die Fensterhelligkeit
  (`screenBrightness`, keine Berechtigung, Geräteeinstellung bleibt) wie LoxKiosk.
- Lux: nur `SensorManager TYPE_LIGHT` (1 s / 15 % gedrosselt). Auto-Kurve <30 lx min, >500 lx max, 3 s Hysterese.
- Installation: normale App per `adb install -g`, kein Root.

## Plan TbView (Variante A, auf tilebert zugeschnitten) – erledigt
Umgesetzt mit Launcher 5.0 (siehe „Stand Launcher 5.0“); bleibt als Herkunftsnotiz stehen.

1. Gerätetest-APK: liest `/dev/input/event4,5,7` + Proximity/Light-Sensor, zeigt Werte an. Klärt Leserecht und Format.
2. Launcher um Kiosk-Activity erweitern: WebView auf Panel-URL, Brücke `TbView`, Schoner (Overlay + Helligkeit 0),
   Wecken per Berührung/Näherung, Fensterhelligkeit + Auto-Helligkeit (Lux) + Nachtfaktor.
   Modus im Launcher: TbView oder Fully (Fallback).
3. Panel `lpHost` (TbView -> fully -> Browser) inkl. `onProximity`, Server `kiosk=tbview`.
Build auf dem Pi: aapt/apksigner/zipalign (apt) + `~/projekte/tools/android/{r8.jar,p28/android.jar}` (siehe `android/panel-launcher/build.sh`).

## Gerätetest X2i (192.168.1.247, 2026-10-10, Test-App ~/projekte/tools/tbtest)
- SELinux permissive, `/dev/input/event0-6` für alle lesbar -> normale App liest event4/5 ohne Root.
- Näherung über `SensorManager` funktioniert (auch `getDefaultSensor`, Wake-up, max 1.0):
  `0.0` = nah, `1.0` = fern. 15 Wechsel sauber erkannt. -> **SensorManager reicht**.
  `event5` (ABS_DISTANCE, code 25) liefert parallel invertiert: `1` = nah, `0` = fern. Nur Reserve.
  Kein KEY_F5/F6 auf diesem Gerät (ShellyElevate-Angabe gilt hier nicht).
- Licht: `TYPE_LIGHT` liefert **Stufen 0–16**, keine echten Lux (gleich `event4`, ABS_MISC code 40).
  -> eigene Kurve Stufe -> Helligkeit, ShellyElevates 30/500-lx-Schwellen passen nicht.
- Build-Kette auf dem Pi: javac 21 (-source/-target 8) + **r8 8.5.35** (`tools/android/r8.jar`);
  d8 aus build-tools 33/34 stürzt bei anonymen Klassen ab.

## Stand Launcher 5.0 (2026-10-10, getestet auf X2i)
- `Kiosk.java`: WebView (Hardware-Layer, kein Zoom/Long-Press, Safe Browsing aus, Renderer-Prio hoch,
  Renderer-Absturz -> neu aufbauen, Offline-Seite mit Neuversuch alle 3 s), Brücke `TbView`.
- Getestet: lädt Panel (~84 MB PSS), `turnScreenOff/On`, `isScreenOn`, Helligkeit, Wecken per
  Näherung (21 s Test), `lpHost` im Panel (`type=tbview`), Nachtmodus über echte Helligkeit,
  Server erkennt `kiosk=tbview` und Modell `shelly-x2` (Codename Jenna).
- Umschalten: `adb shell am start -n de.loxpanel.launcher/.Main --es mode tbview|fully [--es url …]`.
  Config bietet nur „TbViewer installieren“ (Fully nur noch Fallback per adb, nicht in der Oberfläche).
- Geräte-ID unter TbView: `tb-<ANDROID_ID>` (Fully: `fk-…`) -> Gerät erscheint beim Wechsel neu.
- Lichtsensor meldet erst bei Änderung; bis dahin Systemhelligkeit.
- Offen: Lichtkurve (Stufe -> Helligkeit) am Gerät abstimmen; Kamera live nur bei Näherung (0.5).

## Sensor-Optionen in der Config (Panel -> Display & Nacht -> Sensoren)
- `ui.prox` (Schlüssel unverändert): **Präsenzerkennung** `wake` (Standard, an) | `off` (Aus). Altwert `open` gilt wie `wake`. **Regel: Das Dashboard (`saver`) ist immer der Startpunkt, zu jeder Tageszeit; Präsenz schließt es nie, nur Wischen/Tippen führt zu den Tabs.**
- `ui.autoBright` (false = Systemeinstellung), `ui.brightMin`/`ui.brightMax` in % (Standard 10/100).
- Server -> Panel: `sensors {prox, auto, min, max}`; Panel -> App: `setProximityWake`, `setAutoBrightness(on,min,max)`.
- Auto-Helligkeit gilt nur für Shelly mit TbViewer: dort regelt nachts der Lichtsensor statt „Abdunkeln um“ (solange noch kein Sensorwert vorliegt, gilt „Abdunkeln um“).

## Anwendungsfälle Sensoren (Panel, ab Launcher 5.1)
- **Nachts Kamera nur bei Präsenz** (`ui.nightCam`, Standard an): bei Nacht + TbView mit Näherungssensor
  sind alle Kamerabilder (Dashboard, Schoner, Widget, Türstation; alle über `camStream`) angehalten.
  Sichtbar: abgedunkeltes, unscharfes Standbild + Mond + „Live-Bild bei Annäherung“ (`html.camnight`).
  Live bei Annäherung, Berührung oder Klingel (`wake()`), 30 s Nachlauf nach „fern“.
- **Präsenzerkennung** (`presence(src)` im Panel): Annäherung „nah“ **oder** Änderung der Lichtstufe (0–16, ≥ 1 Stufe; Lux-Sensoren: ≥ 30 % und ≥ 5 lx gegenüber dem letzten Wert, max. 1 Ereignis je 2 s, nach eigener Helligkeitsänderung 2,5 s stumm) = Präsenz. Präsenz hellt nachts kurz auf (wie Berührung, `nightWake`) und schaltet die Nacht-Kamera live (30 s Nachlauf). Das Dashboard bleibt dabei sichtbar. Lichtänderung zählt nur nachts. Bei `prox=off` keine Reaktion. Es gibt keine Lux-Schwelle mehr (Licht an hält nicht mehr dauerhaft wach).
- Tag/Nacht kommt **nur** aus dem Betriebsmodus der Config (Nutzervorgabe), nicht vom Lichtsensor.
- **Dynamische Helligkeit** (`ui.autoBright`, min/max): nur Shelly mit TbView + Lichtsensor regelt nach dem Sensor (ohne „Abdunkeln um“); alle anderen Geräte und Option aus: Abdunkeln nach Betriebsmodus.
- Ereignisse App -> Panel: `window.lpHost._ev(name, wert)`; Fix 5.1: `lpHost` ist `const`, daher
  `window.lpHost=lpHost` im Panel (vor 5.1 kamen keine Ereignisse an).

## Namen (ab 0.20.0)
- App (Launcher + Kiosk-Ansicht): **TbViewer**; sie zeigt die Web-App **tilebert** an.
- Technisch bleiben: JS-Brücke `window.TbView`, `kiosk=tbview`, Geräte-ID `tb-`, Paket `de.loxpanel.launcher`, Datei `LoxPanel-Launcher.apk`.

## Brücken-Token (ab TbViewer 5.4)
- Die App erzeugt je Start ein Zufallstoken und hängt es als `tbtok` an die Panel-URL. Jede Brücken-Methode
  nimmt das Token als ersten Parameter; ohne gültiges Token passiert nichts. So kann eine fremde Seite in einem
  iframe (Loxone-Baustein „Webpage“) den TbViewer nicht steuern.
- Das Panel liest `tbtok` beim Start, legt es in `sessionStorage` und entfernt es aus der sichtbaren URL;
  `lpHost.api` hängt es automatisch an. Ohne Token: TbViewer ≤ 5.3 -> Brücke direkt, ≥ 5.4 -> Brücke aus.
- Reihenfolge beim Update: erst Plugin (Server/Panel), dann TbViewer installieren (5.4 braucht das neue Panel).
- Bekannt: Auf Android < 7 (API < 24) gibt es nur den alten `shouldOverrideUrlLoading`-Overload; Link-Klicks in
  fremden Web-Kacheln könnten dort als Hauptnavigation gewertet werden (ungetestet).

## Logo (TbViewer 5.5, versionCode 10)
- App-Symbol in allen Dichten (`res/drawable-{m,h,xh,xxh,xxxh}dpi/icon.png`, 48–192 px, aus `icons/icon.svg`);
  `res/drawable/icon.png` bleibt als Basis.
- Kaltstart: Theme `KioskSplash` setzt nur `windowBackground` (`res/drawable/splash.xml`: #0d0f1a + Symbol mittig),
  keine Overlay-Logik; die Kiosk-Ansicht deckt es ab, sobald sie steht.
- Hinweisseiten „keine Panel-URL“ und „tilebert nicht erreichbar“ zeigen die Marke (inline-SVG, `Kiosk.MARKE`)
  über dem Text; geladen per `loadDataWithBaseURL` (sonst gilt `#` in Farben als Fragment).
- Brücke/Token unverändert.

## Info-Popup (TbViewer 5.6, versionCode 11)
- Bedienung: 5 oder mehr Mal schnell aufs Display tippen (je Abstand < 500 ms). Die Tipps gehen
  unverändert an die Seite weiter (`Kiosk.dispatchTouchEvent` zählt nur `ACTION_DOWN`).
- HTML-Infoseite `android/panel-launcher/assets/info.html` (+ `Sora.woff2`, `Manrope.woff2`, `Sora-OFL.txt`; Marke inline),
  `build.sh` packt `assets/` per `aapt -A`. Anzeige in transparentem Vollbild-`Dialog` mit eigener WebView
  (`file:///android_asset/info.html`, kein Dateizugriff sonst, Navigation gesperrt). Taps im Dialog zählen nicht.
- Schnittstelle `TbInfo` hängt nur an dieser lokalen WebView (nicht an der Panel-WebView; TbView/Token/sameOrigin unverändert):
  `data()` (JSON: Version, Build, `Build.MODEL`, Android, Launcher-Status, Server-Origin, Sprache), `ready()`, `restart()`,
  `chooseHome()`, `close()`. Server-Version holt weiter nativ `fetchServerVersion` (`GET <Origin>/api/version`, 3 s) und gibt
  sie per `evaluateJavascript` → `window.tbServer(ok, version, commit)` an die Seite.
- Zwei Spalten (960×480), unter 600 CSS-px einspaltig (480×480). Zustände: Server nicht erreichbar / Launcher „nein“ in Fehlerrot
  mit Wort + Symbol; bei „nein“ ist „Launcher wählen“ der gelbe Primärknopf, sonst sind beide Knöpfe sekundär.
- Neustart: erster Tap → „Nochmal tippen zum Neustart“ (3 s), zweiter Tap = `recreate()` (neue WebView, neues Token; Panel-URL bleibt).
  Schließen: × (60×60), Tap neben die Karte, Zurück-Taste. Immersive-Modus wird danach wiederhergestellt.
- „Launcher wählen“ öffnet `Settings.ACTION_HOME_SETTINGS`, Fallback Home-Chooser. Sprache folgt tilebert (Panel `html lang`), sonst Systemsprache.
- Test: `audit/scripts/tbinfo.mjs` (Chromium, Stub-`TbInfo`), Screenshots `audit/shots/tbinfo/`.
- Nachtlogik/Helligkeit/Schoner und Brücke/Token/sameOrigin bleiben unverändert.

## TbViewer 5.7 (Geräte-Werte, Tablet ohne adb)

- **Startbildschirm nur auf dem Shelly (ab 5.10):** Nur `.Home` trägt den `HOME`-Filter (wie bis 5.6, damit eine gespeicherte Startbildschirm-Wahl jedes Update übersteht). Auf Nicht-Shelly schaltet die App `.Home` beim ersten Start, nach Update und Boot ab (reine App, Symbol über `.App`). Der Alias aus 5.9 ist entfernt. Am Shelly getestet: Update und Neustart behalten TbViewer als Startbildschirm.
- **App-Symbol auf Tablets:** `.Home` leitet ohne Shelly und ohne HOME-Intent direkt an die Kiosk-Ansicht weiter. Ohne gewählten Modus ist die Anzeige TbView, solange Fully nicht installiert ist.
- **Erststart ohne Adresse:** lokale Seite `assets/setup.html` (DE/EN nach Systemsprache): Feld „tilebert-Adresse“ + „Verbinden“. Geprüft wird `GET <Origin>/api/version`; bei Erfolg wird die Adresse gespeichert (Einstellung `url`) und das Panel geladen. Die Schnittstelle `TbSetup` (`connect(adresse)`) hängt nur an dieser lokalen WebView (wie `TbInfo`), nie an der Panel-WebView, daher kein Token.
- **Lichtsensor generisch:** Shelly meldet Stufen (Bereich < 100, 0–16). Tablets melden Lux (Bereich groß): die App bildet logarithmisch ab (`log10(lux+1)/3`, 1000 lx = 1) und liefert dem Panel Stufen 0–16 (`light`-Ereignis, `getLightLevel`) und die Auto-Helligkeit. Präsenz bei Lux-Sensoren: relative Änderung ≥ 30 % und ≥ 5 lx (App-Ereignis `lux`, Panel: gleiche Entprellung/Stummzeit wie bisher); `getDeviceInfo` meldet dafür `lux:true`.
- **Helligkeit:** Nachts gilt der Nachtwert direkt (z. B. 35 %), bei Präsenz-Wecken wieder Tagwert: Auto (Lichtsensor, min–max) oder Fest (`sensors.fix`, z. B. 80 %).
- **Tipp-Ton** (`sound.touch`): `setTouchSound` spielt `SoundEffectConstants.CLICK`; die App kann „Touch-Töne“ im System nicht einschalten (kein Recht) – ist die Systemeinstellung aus, bleibt es stumm.

## TbViewer 5.8 (Einstellungen am Gerät)

- **Infoseite** (`assets/info.html`, 5×Tippen wie bisher) bekommt den Knopf „Einstellungen“: `TbInfo.settings()` schließt die Infoseite und ruft im Panel `lpHost._ev('settings', true)`. Das Panel zeigt sein Einstellungs-Overlay (Panel, Töne, Nachts abdunkeln, Präsenzerkennung, Helligkeit). Im Panel öffnet 5×Tippen das Overlay im TbViewer nicht selbst – hier bleibt die native Infoseite zuständig. Keine neue Methode an der Panel-Brücke `TbView` (QC-S11 unverändert), nur ein Ereignis wie `prox`/`light`/`screen`.
- **Adresse ändern** (nur Tablets, `StockHome.isShelly()` = false): `TbInfo.changeAddr()` öffnet `assets/setup.html` mit der aktuellen Adresse im Fragment (`#<Adresse>`), vorbelegt, mit „Abbrechen“ (`TbSetup.cancel()`, die alte Adresse bleibt). „Verbinden“ prüft `GET <Origin>/api/version`, speichert und lädt das Panel neu. Auf dem Shelly fehlt der Knopf (Adresse per Config/adb).
- `InfoBridge` (`TbInfo`): neu `settings()`, `changeAddr()`; `data()` liefert zusätzlich `shelly`. `SetupBridge` (`TbSetup`): neu `cancel()`. Beide hängen nur an lokalen Asset-WebViews, nie an der Panel-WebView.
- Version 5.8 (versionCode 13). Signatur unverändert (SHA-256 `80ee7b07…`). Test: `audit/scripts/tbinfo.mjs`, `tbsetup.mjs` (Stub-Bridges).
- Version 5.10 (versionCode 15): HOME-Filter wieder auch auf `.Home`, beide HOME-Komponenten standardmäßig aktiv, neues LAUNCHER-Symbol `.App`, Abschalten auf Nicht-Shelly. Signatur unverändert (SHA-256 `80ee7b07…`).
- Version 5.11 (versionCode 16): nur Texte der Info- und Einrichtungsseite überarbeitet (Linguisten-Prüfung). Signatur unverändert.
- Version 5.12 (versionCode 17): Infoseite: Zeile wieder „Standard-Launcher“. Signatur unverändert.
