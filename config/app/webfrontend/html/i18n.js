/* tilebert Admin-UI Uebersetzung (i18n) fuer /settings und /config.
 *
 * Ansatz: Schluessel = deutscher Quelltext (de ist die Referenz, kein Eintrag
 * noetig). Zusatzsprachen liefern eine Map deutsch->uebersetzt; fehlt ein
 * Eintrag, bleibt der deutsche Text stehen (sichtbarer, aber unschaedlicher
 * Fallback). Gebaeude-/Geraete-/Raum-/Kategorienamen kommen aus dem Miniserver
 * und werden NICHT uebersetzt -> nur explizit markierte Elemente
 * ([data-i18n]) bzw. per T() erzeugte Texte werden angefasst.
 */
(function () {
  var LANGS = [['de', 'Deutsch'], ['en', 'English']];

  var CAT = {
    en: {
      // Gerätemodelle, Nachtquelle, Neues Gerät (Kritik-Umbau)
      'Shelly Wall Display X2 / X2i': 'Shelly Wall Display X2 / X2i',
      'Shelly Wall Display X1i': 'Shelly Wall Display X1i',
      'Sonoff NSPanel Pro 86': 'Sonoff NSPanel Pro 86',
      'Sonoff NSPanel Pro 120': 'Sonoff NSPanel Pro 120',
      '4″-Standardgerät YC-SM41 (Android)': '4″ standard device YC-SM41 (Android)',
      '4″-Standardgerät YC-SM41 (Debian + Agent)': '4″ standard device YC-SM41 (Debian + agent)',
      'YC-SM55P': 'YC-SM55P',
      'Android-Tablet (7–10″)': 'Android tablet (7–10″)',
      'iPad / iPad mini': 'iPad / iPad mini',
      'Smartphone': 'Smartphone',
      'Anderes Gerät / PC-Browser': 'Other device / PC browser',
      'TbViewer per ADB (Gerät hinzufügen).': 'TbViewer via ADB (Add device).',
      'Display und Neustart übernimmt der Agent.': 'The agent handles the display and restarts.',
      'Die Seite hält den Schirm wach bis zur Leerlaufzeit (Display & Nacht); danach greift die iOS-Sperre.': 'The page keeps the screen awake until the idle time (Display & Night); after that the iOS lock applies.',
      'Für Wandbetrieb: Einstellungen → Bedienungshilfen → Geführter Zugriff (App fixieren), Automatische Sperre nach Wunsch.': 'For wall mounting: Settings → Accessibility → Guided Access (pin the app); set Auto-Lock as you like.',
      'Als App installieren: iPhone Safari → Teilen → „Zum Home-Bildschirm“, Android Chrome → Menü → „App installieren“.': 'Install as an app: iPhone Safari → Share → “Add to Home Screen”, Android Chrome → Menu → “Install app”.',
      'Nacht ab und Nacht bis sind gleich. Dann ist nie Nacht.': '“Night from” and “Night until” are the same. Then it is never night.',
      'Trotzdem speichern?': 'Save anyway?',
      'Geräte, die nie gesehen wurden, bleiben stehen.': 'Devices that have never been seen are kept.',
      'Der Name darf nur Buchstaben, Ziffern, Leerzeichen sowie - _ . enthalten.': 'The name may only contain letters, digits, spaces and - _ .',
      'Ungültiger SSH-Benutzer.': 'Invalid SSH user.',
      'Ungültige IP-Adresse.': 'Invalid IP address.',
      'Ungültige Serveradresse.': 'Invalid server address.',
      'Adresse geändert – bitte Passwort neu eingeben': 'Address changed – please enter the password again',
      'kein gültiges JSON': 'not valid JSON',
      // Werte groß auf Kacheln
      'Kacheln': 'Tiles',
      'Werte groß auf Kacheln': 'Large values on tiles',
      'Werte groß': 'Large values',
      'Panel-Standard': 'Panel default',
      'immer groß': 'always large',
      'nie groß': 'never large',
      'Symbol + Text': 'Icon + text',
      'Loxone-Statussymbol statt festem Symbol': 'Loxone status icon instead of fixed icon',
      'kein Status-Baustein': 'not a status block',
      'Beides': 'Both',
      'Loxone-Symbol': 'Loxone icon',
      // Rahmen / Navigation
      'Betriebsmodus': 'Operating mode',
      'Konfiguration': 'Configuration',
      'bald': 'soon',
      // Miniserver
      'Benutzer': 'User',
      'Passwort': 'Password',
      'Verbinden & Speichern': 'Connect & save',
      // Kamera / Tuerstation
      'Speichern': 'Save',
      // Panels
      '(Standard)': '(Default)',
      'Start': 'Start',
      'Reload': 'Reload',
      'Stop': 'Stop',
      'Status:': 'Status:',
      'Passwörter werden als •••••• angezeigt. Zum Ändern überschreiben.': 'Passwords are shown as ••••••. Type over them to change.',
      // Audio
      'Test-Ton': 'Test tone',
      'Test-Ton senden': 'Send test tone',
      'Alle Panels': 'All panels',
      // Kalender & Wetter (Front / Screensaver)
      'Kalender & Wetter': 'Calendar & weather',
      'iCal-Kalender': 'iCal calendars',
      'Überschrift am Panel': 'Heading on the panel',
      // Kalenderzeile
      'Kalender': 'Calendar',
      'Name': 'Name',
      'Farbe': 'Color',
      'Entfernen': 'Remove',
      // Status der Kalender
      'noch nicht geladen': 'not loaded yet',
      'geladen': 'loaded',
      'Termine': 'events',
      'Fehler:': 'Error:',
      'Kalender geladen': 'Calendar loaded',
      'aus {n} Kalendern': 'from {n} calendars',
      '{n} von {gesamt} Kalendern nicht geladen': '{n} of {gesamt} calendars not loaded',
      'Das Panel zeigt weiter den Stand von {zeit} Uhr.':
        'The panel still shows the data from {zeit}.',
      // Wetter
      'Wetter': 'Weather',
      'Breitengrad': 'Latitude',
      'Längengrad': 'Longitude',
      'Open-Meteo wird nicht abgefragt.': 'Open-Meteo is not queried.',
      'Wetter geladen': 'Weather loaded',
      'Standort vom Miniserver wird verwendet.': 'The location from the Miniserver is used.',
      'Automatisch vom Miniserver:': 'Automatically from the Miniserver:',
      // Anzeige am Panel
      'Anzeige': 'Display',
      'Kalenderfarben am Panel zeigen': 'Show calendar colors on the panel',
      // Verlaufs-Diagramme (Detailseite, Split-Haelfte, Kachel)
      'Verlauf': 'History',
      'Zeitraum': 'Period',
      'Trend': 'Trend',
      'Tagesmuster': 'Daily pattern',
      'Tagesspanne': 'Daily range',
      'Kurve mit Tief, Hoch und Änderung': 'Curve with low, high and change',
      'Verbrauch als Balken, dazu die Summe': 'Consumption as bars, plus the total',
      'Ein/Aus als Stufen, dazu die Einschaltdauer': 'On/off as steps, plus the time switched on',
      '7 Tage × 24 Stunden als Farbraster': '7 days × 24 hours as a color grid',
      'Tief bis Hoch je Tag, 7 Tage': 'Low to high per day, 7 days',
      '7 Tage': '7 days',
      '30 Tage': '30 days',
      // Neues Panel
      'SSH-Benutzer': 'SSH user',
      'Befehl erzeugen': 'Generate command',
      'Fehler': 'Error',
      'verbunden': 'connected',
      'nicht verbunden': 'not connected',

      // ---- Betriebsmodus-Automatik (/settings) ----
      'Betriebsmodus-Automatik': 'Operating-mode automation',
      'Automatik aktiv': 'Automation active',
      'Zeile entfernen': 'Remove row',

      // ---- /config (Panel-Editor) ----
      'Titel': 'Title',
      'Räume': 'Rooms',
      'Kategorien': 'Categories',
      'Panel löschen': 'Delete panel',
      'Kein Panel gewählt.': 'No panel selected.',
      // Labels
      'Schriftart': 'Font',
      'Schriftfarbe (Name)': 'Text color (name)',
      'Sprache': 'Language',
      'Rahmen': 'Border',
      'Hintergrund': 'Background',
      'Icon-Farbe': 'Icon color',
      'Textfarbe': 'Text color',
      'Schrift': 'Font',
      // Optionen
      'System (Sans)': 'System (Sans)',
      'Eigene…': 'Custom…',
      // Icon-Reiter / Kachel-Editor
      'Google · Upload': 'Google · Upload',
      'Kachel zurücksetzen': 'Reset tile',
      'Standard': 'Default',
      'neutral': 'neutral',
      'Aktiv': 'Active',
      // Global-Editor
      'Kategorie-Farben (Ampel)': 'Category colors (traffic light)',
      // Gerät hinzufügen / Meine Geräte (Vereinheitlichung)
      'Welches Gerät?': 'Which device?',
      'Shelly Wall Display': 'Shelly Wall Display',
      'Sonoff NSPanel Pro': 'Sonoff NSPanel Pro',
      'Agent per SSH': 'Agent via SSH',
      'iPad, iPhone oder Browser': 'iPad, iPhone or browser',
      'Safari, Chrome …': 'Safari, Chrome …',
      '‹ Anderes Gerät wählen': '‹ Choose another device',
      'Status': 'Status',
      'Gerätetyp': 'Device type',
      'Steuerung': 'Controls',
      'Wartung': 'Maintenance',
      'Display einschalten und Dashboard schließen': 'Switch display on and close the dashboard',
      'Nichts tun': 'Do nothing',
      'Automatisch (Lichtsensor)': 'Automatic (light sensor)',
      'Systemeinstellung': 'System setting',
      'Sensoren': 'Sensors',
      'Präsenzerkennung': 'Presence detection',
      'Präsenz = Annäherung oder Änderung des Lichtwerts: weckt nachts kurz auf und zeigt die Kamera live.': 'Presence = proximity or a change of the light value: briefly wakes the display at night and shows the camera live.',
      'Helligkeit': 'Brightness',
      'TbViewer installieren': 'Install TbViewer',
      'TbViewer ist nicht installiert': 'TbViewer is not installed',
      'TbViewer': 'TbViewer',
      'installiert und aktiv': 'installed and active',
      'Update installieren': 'Install update',
      'Erneut installieren': 'Reinstall',
      'TbViewer auf „{n}“ aktualisieren?': 'Update TbViewer on “{n}”?',
      'TbViewer auf „{n}“ erneut installieren?': 'Reinstall TbViewer on “{n}”?',
      'TbViewer auf „{n}“ installieren?': 'Install TbViewer on “{n}”?',
      'Installiere TbViewer …': 'Installing TbViewer …',
      'TbViewer auf „': 'Install TbViewer on “',
      'Erweitert: Display-Steuerung (externer Treiber)': 'Advanced: display control (external driver)',
      'Das Gerät regelt die Helligkeit selbst nach dem Umgebungslicht': 'The device adjusts brightness itself according to ambient light',
      '“ installieren?': '”?',
      'Gerät offline': 'Device offline',
      'Kalender „': 'Calendar “',
      'Hintergrundbild entfernen?': 'Remove background image?',
      'Eigenen Klingelton entfernen? Danach gilt wieder der Standardton.': 'Remove custom ring tone? The default tone applies again.',
      'Seite': 'Page',
      'So geht’s': 'How it works',
      'Eigene Farben dieser Vorlage zurücksetzen?': 'Reset custom colours of this template?',
      'Kachel auf Standard zurücksetzen?': 'Reset tile to default?',

      // Nachgezogen 2026-10-11
      '0 = aus': '0 = off',
      '0 = nie': '0 = never',
      '1 Änderung': '1 change',
      '<b>✕</b> oder <b>Entf</b> entfernt, <b>Strg+Z</b> macht rückgängig.': '<b>✕</b> or <b>Del</b> removes, <b>Ctrl+Z</b> undoes.',
      'Abmelden': 'Log out',
      'Adresse am Gerät:': 'Address on the device:',
      'Adresse kopieren': 'Copy address',
      'Adresse kopiert': 'Address copied',
      'Adressen kopieren': 'Copy addresses',
      'Adressen kopiert': 'Addresses copied',
      'Aktion': 'Action',
      'Aktuell': 'Current',
      'Aktuellen Zustand vom Gerät lesen': 'Read current state from the device',
      'Aktuelles Passwort': 'Current password',
      'Alarm-Vollbild': 'Alarm full screen',
      'Alarmanlage': 'Alarm system',
      'Alle': 'All',
      'Alle Kategorien': 'All categories',
      'Alle Räume': 'All rooms',
      'Alles gespeichert': 'Everything saved',
      'Allgemein': 'General',
      'Als': 'As',
      'An (hochzoomen)': 'On (zoom in)',
      'Android spielt bei jedem Antippen eines Bedienelements einen Klick ab': 'Android plays a click for every tap on a control',
      'Animation': 'Animation',
      'Animierte Symbole': 'Animated icons',
      'Anlegen': 'Create',
      'Auf diesem Panel überall ausblenden': 'Hide everywhere on this panel',
      'Aus': 'Off',
      'Ausgeblendete Kacheln': 'Hidden tiles',
      'Ausrichtung': 'Alignment',
      'Automatisch': 'Automatic',
      'Automatisch erkannt': 'Detected automatically',
      'Baustein': 'Block',
      'Baustein oder Widget links suchen und <b>ins Raster ziehen</b>.': 'Search for a block or widget on the left and <b>drag it into the grid</b>.',
      'Baustein suchen…': 'Search blocks…',
      'Baustein wählen': 'Choose block',
      'Baustein-Kachel': 'Block tile',
      'Bausteine': 'Blocks',
      'Betriebsmodus-Assistent': 'Operating-mode wizard',
      'Bibliothek': 'Library',
      'Bild verwischt': 'Image blurred',
      'Bildausschnitt': 'Image section',
      'Bildausschnitt einstellen': 'Set image section',
      'Bildschirm': 'Screen',
      'Bildschirm füllen': 'Fill screen',
      'Breite × Höhe in Feldern.': 'Width × height in fields.',
      'Browser': 'Browser',
      'CPU': 'CPU',
      'Das Dashboard lässt sich danach im Raster-Editor frei belegen.': 'The dashboard can then be freely assigned in the grid editor.',
      'Dashboard': 'Dashboard',
      'Dashboard schließen': 'Close dashboard',
      'Dashboard-Einstellungen': 'Dashboard settings',
      'Datum': 'Date',
      'Derzeit Standard:': 'Currently default:',
      'Design': 'Design',
      'Detailansicht beim Antippen eines Tages': 'Detail view when tapping a day',
      'Die Konfiguration ist nur mit Passwort erreichbar.': 'The configuration is only reachable with a password.',
      'Display': 'Display',
      'Display &amp; Nacht': 'Display &amp; night',
      'Effekte': 'Effects',
      'Eigene Datei': 'Own file',
      'Eigene Farben zurücksetzen': 'Reset custom colors',
      'Eigene hochgeladene Datei': 'Own uploaded file',
      'Eigener Modus': 'Own mode',
      'Eigenes Bild': 'Own image',
      'Einrichtung': 'Setup',
      'Entfernen (Entf)': 'Remove (Del)',
      'Entfernt': 'Removed',
      'Erkannte Audioserver': 'Detected audio servers',
      'Farbig (Ampel)': 'Colored (traffic light)',
      'Farbverlauf': 'Gradient',
      'Fenster': 'Window',
      'Fertig': 'Done',
      'Fett': 'Bold',
      'Firmware': 'Firmware',
      'Fokus': 'Focus',
      'Freie Ränder füllen': 'Fill free edges',
      'Freier Tab': 'Free tab',
      'Für welche Geräte?': 'For which devices?',
      'Ganzes Bild zeigen (nicht beschneiden)': 'Show entire image (do not crop)',
      'Ganzes Gerät neu starten, wenn das Display hängt': 'Restart entire device if the display freezes',
      'Gelöscht': 'Deleted',
      'Gerät neu starten': 'Restart device',
      'Gerät startet neu': 'Device restarting',
      'Gerät verbinden': 'Connect device',
      'Gerät „': 'Device “',
      'Geräte': 'Devices',
      'Geräte:': 'Devices:',
      'Getrennt seit': 'Disconnected since',
      'GitHub öffnen': 'Open GitHub',
      'Größe': 'Size',
      'Größe ändern': 'Change size',
      'Handy': 'Phone',
      'Herunterladen': 'Download',
      'Hilfe': 'Help',
      'Hintergrundbild entfernt': 'Background image removed',
      'Hintergrundbild gespeichert': 'Background image saved',
      'Höchstens': 'At most',
      'Höchstens 4 Tabs': 'At most 4 tabs',
      'In diesem Tab': 'In this tab',
      'Inhalt': 'Content',
      'Kachel': 'Tile',
      'Kachel überall ausgeblendet': 'Tile hidden everywhere',
      'Kachelnamen': 'Tile names',
      'Kamera': 'Camera',
      'Kamera entfernen': 'Remove camera',
      'Kamera „': 'Camera “',
      'Kameras': 'Cameras',
      'Kartenfarbe': 'Map color',
      'Kategorie': 'Category',
      'Kategorie-Farben': 'Category colors',
      'Kein Audioserver in der Loxone-Struktur gefunden.': 'No audio server found in the Loxone structure.',
      'Kein Platz für': 'No room for',
      'Keine': 'None',
      'Keine passenden Bausteine in der Anlage.': 'No matching blocks in the system.',
      'Kennung (für die Adresse)': 'ID (for the address)',
      'Kennung:': 'ID:',
      'Kerne': 'Cores',
      'Klingeln testen': 'Test doorbell',
      'Klingelton': 'Ring tone',
      'Kontrast': 'Contrast',
      'Leer anlegen': 'Create empty',
      'Leeren': 'Empty',
      'Lichtszenen': 'Light scenes',
      'Loxone sendet': 'Loxone sends',
      'Löschen': 'Delete',
      'Menü ausklappen': 'Expand menu',
      'Menü ein-/ausklappen': 'Expand/collapse menu',
      'Menü einklappen': 'Collapse menu',
      'Mindestens 6 Zeichen': 'At least 6 characters',
      'Mindestens ein Eintrag muss in der Übersicht bleiben.': 'At least one entry must remain in the overview.',
      'Miniserver': 'Miniserver',
      'Miniserver verbinden': 'Connect Miniserver',
      'Minuten': 'Minutes',
      'Mit Assistent': 'With wizard',
      'Nach Außentemperatur': 'By outside temperature',
      'Nach Tageslicht': 'By daylight',
      'Nacht': 'Night',
      'Nachtmodus': 'Night mode',
      'Name des Panels': 'Panel name',
      'Namen vergeben': 'Assign name',
      'Neu laden': 'Reload',
      'Neue Version': 'New version',
      'Nicht gespeicherte Änderungen': 'Unsaved changes',
      'Noch kein Gerät verbunden': 'No device connected yet',
      'Noch keine weiteren Kameras.': 'No further cameras.',
      'Normal': 'Normal',
      'Nächster Versuch in': 'Next attempt in',
      'Ohne Kennung': 'Without ID',
      'Ohne Raum': 'Without room',
      'Panel „': 'Panel “',
      'Panels': 'Panels',
      'Passend zum Design': 'Matches the design',
      'Port': 'Port',
      'Quelle: System → Kalender & Kameras.': 'Source: System → Calendar & cameras.',
      'Quelle: System → Loxone → Wetter.': 'Source: System → Loxone → Weather.',
      'Raster auf': 'Grid on',
      'Rauchmelder': 'Smoke detector',
      'Raum': 'Room',
      'Rückgängig': 'Undo',
      'Rückgängig (Strg+Z)': 'Undo (Ctrl+Z)',
      'Schließen': 'Close',
      'Schrift & Größen': 'Font & sizes',
      'Schritt': 'Step',
      'So sieht die Tab-Leiste aus': 'This is what the tab bar looks like',
      'Speicher': 'Memory',
      'Standard (Mitte)': 'Default (center)',
      'Standardraster': 'Default grid',
      'Standardton (Wecker-Piep)': 'Default tone (alarm beep)',
      'Statusleiste': 'Status bar',
      'Statusleiste oben anzeigen': 'Show status bar at top',
      'Suchen': 'Search',
      'Suchen…': 'Search…',
      'Symbol': 'Icon',
      'System': 'System',
      'Tab': 'Tab',
      'Tab 1 · Start': 'Tab 1 · Start',
      'Tab entfernen': 'Remove tab',
      'Tab geleert': 'Tab cleared',
      'Tab „': 'Tab “',
      'Tab-Einstellungen': 'Tab settings',
      'Tage': 'Days',
      'Tipp-Töne': 'Tap tones',
      'Tipps für': 'Tips for',
      'Ton an': 'Sound on',
      'Touch': 'Touch',
      'Typ': 'Type',
      'Türstation': 'Door station',
      'Uhrzeit': 'Time',
      'Umbenannt in „': 'Renamed to “',
      'Umbenennen': 'Rename',
      'Umbenennen fehlgeschlagen': 'Rename failed',
      'Update': 'Update',
      'Verbinde …': 'Connecting …',
      'Verbinde per adb …': 'Connecting via adb …',
      'Verbindung wird aufgebaut …': 'Connection being established …',
      'Video': 'Video',
      'Vorschau (Tage)': 'Preview (days)',
      'Weiter': 'Next',
      'Weitere Kameras': 'Further cameras',
      'Welche Betriebsmodi?': 'Which operating modes?',
      'Welches Design?': 'Which design?',
      'Welches Gerät ist das?': 'Which device is this?',
      'Wetterdaten aus dem Miniserver übernehmen': 'Take over weather data from the Miniserver',
      'Widgets': 'Widgets',
      'Wie Gerätetyp': 'Like device type',
      'Wie alle Panels': 'Like all panels',
      'Wie heißt das Panel?': 'What is the panel called?',
      'Wie möchtest du anfangen?': 'How would you like to start?',
      'Ziehen zum Umsortieren': 'Drag to reorder',
      'Zoom': 'Zoom',
      'tilebert – Übersicht': 'tilebert – Overview',
      'Zuordnung': 'Assignment',
      'Zurück': 'Back',
      'Zurück zur ersten Kamera nach': 'Back to the first camera after',
      'Zurücksetzen': 'Reset',
      'Zustellung jedes Befehls überwachen': 'Monitor delivery of every command',
      'alle 12 Stunden': 'every 12 hours',
      'alle 24 Stunden': 'every 24 hours',
      'alle 6 Stunden': 'every 6 hours',
      'als App': 'as app',
      'angepasst': 'customized',
      'aus': 'off',
      'auto': 'auto',
      'breit': 'wide',
      'eigener Klingelton': 'own ring tone',
      'fest links': 'fixed left',
      'ganzes Bild': 'whole image',
      'gelöscht': 'deleted',
      'gerade eben': 'just now',
      'heruntergeladen': 'downloaded',
      'hoch': 'high',
      'hochkant · Tabs unten · als App': 'portrait · tabs at bottom · as app',
      'installiert': 'installed',
      'kein Panel': 'no panel',
      'kein Verlauf': 'no history',
      'kein Video': 'no video',
      'keine (nur über die Seite)': 'none (only via the page)',
      'letzte Meldung vor': 'last message before',
      'läuft': 'running',
      'mehr Kacheln auf einen Blick': 'more tiles at a glance',
      'mind. 6 Zeichen': 'min. 6 characters',
      'nachts um 3 Uhr': 'at 3 am at night',
      'neu': 'new',
      'neu angelegt': 'newly created',
      'nur für dieses Panel': 'only for this panel',
      'oben': 'top',
      'offiziell': 'official',
      'offline': 'offline',
      'online': 'online',
      'schließen': 'close',
      'schon im Tab': 'already in tab',
      'seit': 'since',
      'umgestellt': 'switched',
      'und': 'and',
      'unten': 'bottom',
      'verbindet …': 'connecting …',
      'von max.': 'of max.',
      'weitere': 'more',
      'wie „': 'as “',
      'wählen': 'choose',
      'z. B. Garten': 'e.g. garden',
      'z. B. Kino': 'e.g. cinema',
      'z. B. Küche': 'e.g. kitchen',
      'z. B. Shelly Wall Display X2': 'e.g. Shelly Wall Display X2',
      'zuletzt': 'last',
      'zuletzt geladen': 'last loaded',
      'Änderungen': 'Changes',
      'Öffnet ein Fenster mit Temperaturverlauf, Regen je Stunde, Wind, UV und Sonnenzeiten des Tages.': 'Opens a window with temperature history, rain per hour, wind, UV and sun times of the day.',
      'Übersicht': 'Overview',
      'öffnen': 'open',
      'übernehmen': 'apply',
      '– Gerätetyp wählen –': '– choose device type –',
      '“ angelegt': '” created',
      '“ entfernt': '” removed',
      '“ gelöscht': '” deleted',
      '“ komplett neu starten? Das dauert etwa eine Minute.': '” restart completely? This takes about one minute.',
      '„Übernehmen“ speichert das für alle gewählten Geräte.': '“Apply” saves this for all selected devices.',

      // Nachgezogen 2026-10-11 (T()-Reste: Design-Labels, Tabs, Passwort, Fragmente mit Leerzeichen)
      'Schrift auf Rahmen': 'Text on border',
      'Tab-Symbol': 'Tab icon',
      'Tab aktiv': 'Tab active',
      'Karte Tab 1': 'Card tab 1',
      'Karte Tab 2': 'Card tab 2',
      'Karte Tab 3': 'Card tab 3',
      'Karte Tab 4': 'Card tab 4',
      'Karte Tab 5': 'Card tab 5',
      'Punkt Tab 1': 'Dot tab 1',
      'Punkt Tab 2': 'Dot tab 2',
      'Punkt Tab 3': 'Dot tab 3',
      'Punkt Tab 4': 'Dot tab 4',
      'Punkt Tab 5': 'Dot tab 5',
      'Nebenschrift': 'Secondary text',
      'Symbol „an“': 'Icon “on”',
      'Standard · ändern': 'Default · change',
      'ändern': 'change',
      'Passwort ändern': 'Change password',
      'Passwort setzen': 'Set password',
      'Neues Passwort': 'New password',
      'Wie Standard': 'As default',
      'Bereich': 'Area',
      'Bereiche': 'Areas',
      'Ersetzen…': 'Replace…',
      'Eigene Datei…': 'Own file…',
      'Bedienung': 'Operation',
      'Diagnose': 'Diagnostics',
      'Unterstützte Geräte': 'Supported devices',
      'Fehler: ': 'Error: ',
      'Raster auf ': 'Grid on ',
      ' umgestellt': ' switched',
      'Anwesend': 'Present',
      'Abwesend': 'Absent',
      'Gäste': 'Guests',
      'Putzen': 'Cleaning',
      'Urlaub': 'Holiday',

      // Nachgezogen 2026-10-11 (T()-Reste: Design-Labels, Tabs, Passwort, Fragmente mit Leerzeichen)
      'Kacheln & Schrift': 'Tiles & font',
      'Schrift für Zahlen & Titel': 'Font for numbers & titles',

      // Nachgezogen 2026-10-11 (T()-Reste: Design-Labels, Tabs, Passwort, Fragmente mit Leerzeichen)
      'Passwort eingeben': 'Enter password',
      'Speichern (Strg/⌘ + S)': 'Save (Ctrl/⌘ + S)',
      'Bausteintypen der Anlage anzeigen': 'Show block types of the system',
      'Uhr & Datum': 'Clock & date',
      'Loxone-Kachel': 'Loxone tile',
      'Wetter-Details': 'Weather details',
      'Energiefluss': 'Energy flow',
      'Status (Ampel)': 'Status (traffic light)',
      'Audio': 'Audio',
      'Manrope (Standard-Schrift)': 'Manrope (default font)',
      'Sora (Zahlen & Titel)': 'Sora (numbers & titles)',
      'Georgia (Serif)': 'Georgia (serif)',
      'Times (Serif)': 'Times (serif)',
      'Monospace': 'Monospace',
      // Texte-Review: Begriffe Panel / Gerät / Hälfte, Fehlermeldungen, kürzere Infotexte
      'Zugang zum Loxone Miniserver. Nach dem Speichern verbindet sich der Server sofort neu.':
        'Access to the Loxone Miniserver. After saving, the server reconnects immediately.',
      'Zugangsdaten': 'Credentials',
      'Adresse (Host oder IP)': 'Address (host or IP)',
      'Zertifikat prüfen (bei Miniserver Gen 2 mit selbstsigniertem Zertifikat ausschalten)':
        'Verify certificate (turn off for a Miniserver Gen 2 with a self-signed certificate)',
      'Zeigt, welche Typen vorkommen und welche tilebert noch nicht unterstützt.':
        'Shows which types occur and which ones tilebert does not support yet.',
      'Standard ist das Wetter des Loxone-Wetterdienstes. Ohne Wetterdienst im Miniserver abwählen, dann kommt es von Open-Meteo (kostenlos, ohne Konto).':
        'The default is the weather from the Loxone weather service. Without a weather service in the Miniserver, untick this and the weather comes from Open-Meteo (free, no account).',
      'Leer: Standort des Miniservers.': 'Empty: location of the Miniserver.',
      'Befehlskontrolle': 'Command check',
      'Das Panel prüft nach jedem Tastendruck im Hintergrund, ob der Miniserver den Befehl angenommen hat. Kommt nach 12 s keine Antwort (z. B. bei WLAN-Aussetzern), meldet es „Keine Antwort – Befehl evtl. nicht ausgeführt“; abgelehnte Befehle meldet es immer.':
        'After every tap the panel checks in the background whether the Miniserver accepted the command. If no answer arrives within 12 s (e.g. WLAN dropouts), it shows "Keine Antwort – Befehl evtl. nicht ausgeführt"; rejected commands are always reported.',
      'Video-Streams (MJPEG) von Loxone-Türstationen und eigenen Überwachungskameras. Alle erscheinen im Widget „Kamera“.':
        'Video streams (MJPEG) from Loxone door stations and your own surveillance cameras. All of them appear in the "Camera" widget.',
      'Türstationen aus Loxone': 'Door stations from Loxone',
      'Überwachungskameras mit MJPEG-Stream, z. B. http://192.168.1.60/mjpg/video.mjpg. Der Server holt das Bild einmal ab und gibt es an alle Panels weiter.':
        'Surveillance cameras with an MJPEG stream, e.g. http://192.168.1.60/mjpg/video.mjpg. The server fetches the image once and passes it on to all panels.',
      'Kamera hinzufügen': 'Add camera',
      'Alle Geräte auf einen Blick: Status, Aktionen und Einstellungen je Gerät.':
        'All devices at a glance: status, actions and settings for each device.',
      'Legt für mehrere Geräte gleichzeitig fest, welches Panel zu welchem Betriebsmodus gehört.':
        'Sets which panel belongs to which operating mode for several devices at once.',
      'Geräte suchen …': 'Searching for devices …',
      'Ohne Namen erscheint es unter „Alle Geräte“ → „Ohne Kennung“ und bekommt dort einen Namen.':
        'Without a name it appears under "All devices" → "Without ID" and gets a name there.',
      'Der Gerätetyp bestimmt, ob die Knöpfe „TbViewer installieren“ und „Gerät neu starten“ erscheinen (Android per adb, Shelly zuerst über die eigene Schnittstelle).':
        'The device type decides whether the buttons "Install TbViewer" and "Restart device" appear (Android via adb, Shelly first via its own interface).',
      'Aus Loxone, nicht löschbar': 'From Loxone, cannot be removed',
      'Lege in Loxone Config einen virtuellen HTTP-Ausgang an, der je Betriebsart den Modusnamen sendet. Je Gerät bestimmst du, welches Panel bei welchem Modus erscheint; ohne Eintrag bleibt das Panel unverändert.':
        'In Loxone Config, create a virtual HTTP output that sends the mode name for each operating mode. For each device you choose which panel appears for which mode; without an entry the panel stays unchanged.',
      'Zeigt Cover, Titel und Favoriten vom Loxone-Audioserver. Den Test-Ton für die Lautsprecher findest du unter System → Diagnose.':
        'Shows cover, title and favourites from the Loxone Audioserver. You find the test tone for the speakers under System → Diagnostics.',
      'Audioserver': 'Audioserver',
      'Loxone-Audioserver (Gen 2) senden Cover, Titel, Interpret und Favoriten über einen Live-Kanal (Port 7091). tilebert hört ihn ab, erkennt die Adresse automatisch aus der Loxone-Struktur und zeigt die Infos bei der passenden Zone, auch bei Nachbauten wie Audioserver4Home.':
        'Loxone Audioservers (Gen 2) send cover, title, artist and favourites over a live channel (port 7091). tilebert listens to it, detects the address automatically from the Loxone structure and shows the info at the matching zone, also for clones such as Audioserver4Home.',
      'Live-Daten vom Audioserver nutzen': 'Use live data from the Audioserver',
      'Zeigt Termine aus iCal-Abos im Dashboard und in den Kalender-Widgets aller Panels.':
        'Shows appointments from iCal subscriptions in the dashboard and in the calendar widgets of all panels.',
      'Abo-Link aus iCloud (Kalender → Teilen → Öffentlicher Kalender), Google oder einem anderen Dienst, beginnend mit webcal:// oder https://. tilebert liest nur und braucht keinen Login; mehrere Kalender erscheinen gemeinsam in einer Liste.':
        'Subscription link from iCloud (Calendar → Share → Public calendar), Google or another service, starting with webcal:// or https://. tilebert only reads and needs no login; several calendars appear together in one list.',
      'Kalender hinzufügen': 'Add calendar',
      'Feiertagskalender (optional)': 'Holiday calendar (optional)',
      'z. B. Feiertage aus Google Kalender (basic.ics)': 'e.g. holidays from Google Calendar (basic.ics)',
      'Ein zweiter Kalender nur für Feiertage. Diese Tage erscheinen im Monatsraster rot, wie Sonntage.':
        'A second calendar just for holidays. These days appear in red in the month grid, like Sundays.',
      'Zeitraum (Tage)': 'Period (days)',
      'Termine im Dashboard (höchstens)': 'Appointments in the dashboard (at most)',
      'Aus: alle Termine einfarbig, daneben steht der Kalendername. An: Jeder Kalender hat einen Farbpunkt, auch im Monatsraster.':
        'Off: all appointments in one colour, with the calendar name next to them. On: each calendar gets its own colour dot, also in the month grid.',
      '„Termine im Dashboard“ ist eine Obergrenze: Was neben Wetter und Uhr nicht mehr passt, bleibt weg (auf 480 × 480 etwa drei). Die vollständige Liste steht im Kalender-Widget.':
        '"Appointments in the dashboard" is an upper limit: whatever no longer fits next to weather and clock is left out (about three on 480 × 480). The full list is in the calendar widget.',
      'Wann Nacht ist, gilt für alle Panels. Was nachts passiert, stellst du je Panel ein: Panel → Display & Nacht.':
        'Night applies to all panels. What happens at night is set per panel: Panel → Display & night.',
      'Nacht erkennen über':
        'Detect night by',
      'Loxone-Betriebsmodus (oder Baustein)':
        'Loxone operating mode (or block)',
      'Sonnenuntergang bis Sonnenaufgang':
        'Sunset to sunrise',
      'Feste Uhrzeit':
        'Fixed time',
      'Betriebsmodus oder Baustein':
        'Operating mode or block',
      'Nacht gilt, solange dieser Modus läuft.':
        'Night applies while this mode is running.',
      'Nacht ab':
        'Night from',
      'Nacht bis':
        'Night until',
      'Auch über Mitternacht möglich, z. B. 22:00 bis 06:30.':
        'Past midnight works too, e.g. 22:00 to 06:30.',
      'Nacht von Sonnenuntergang bis Sonnenaufgang. Die Zeiten kommen vom Miniserver, sonst vom Wetterdienst.':
        'Night from sunset to sunrise. Times come from the Miniserver, otherwise from the weather service.',
      'Bitte wählen':
        'Please choose',
      'Bitte einen Betriebsmodus wählen.':
        'Please choose an operating mode.',
      'Bitte Uhrzeit von und bis angeben.':
        'Please enter a start and end time.',
      'Display & Nacht':
        'Display & night',
      'Tabs & Dashboard': 'Tabs & dashboard',
      'Kalender & Kameras': 'Calendar & cameras',
      'Alles, was tilebert vom Miniserver übernimmt: Zugang, Befehle, Wetter und Audio.':
        'Everything tilebert takes from the Miniserver: access, commands, weather and audio.',
      'Kein Audioserver gefunden': 'No audio server found',
      'Feiertage': 'Holidays',
      'Kalender-Anzeige': 'Calendar display',
      'Bausteintypen': 'Block types',
      'Gilt für alle Panels. Ein einzelnes Panel (links wählen) kann unter „Aussehen“ abweichen. Datum und Uhrzeit nutzen die Sprache der Konfiguration (Seitenleiste, „Sprache“).':
        'Applies to all panels. A single panel (choose on the left) can differ under "Appearance". Date and time use the language of the configuration (sidebar, "Language").',
      'TbViewer schaltet das Display nie aus. Berührung, Annäherung, Klingel, Wecker und Nachrichten stellen die normale Helligkeit wieder her.':
        'TbViewer never turns the display off. Touch, proximity, doorbell, alarm clock and messages restore normal brightness.',
      'Nach dieser Zeit ohne Berührung zeigt das Panel das Dashboard.':
        'After this time without touch the panel shows the dashboard.',
      'Seite neu laden':
        'Reload page',
      'Gegen Einfrieren. Nur, wenn das Dashboard steht.':
        'Prevents freezing. Only while the dashboard is shown.',
      'Helligkeit und Tipp-Töne direkt am Gerät: Geräte → Alle Geräte.':
        'Brightness and tap sounds directly on the device: Devices → All devices.',
      'Wann Nacht ist, legst du unter System → Alle Panels → Nachtmodus fest.':
        'You set when it is night under System → All panels → Night mode.',
      'Kein Gerät mit TbViewer zeigt dieses Panel. Diese Optionen wirken erst dann.':
        'No device with TbViewer shows this panel. These options only take effect then.',
      'Nur mit TbViewer auf Geräten mit Sensoren (z. B. Shelly Wall Display). Die automatische Helligkeit gilt tagsüber, nachts gilt „Abdunkeln nachts“.':
        'Only with TbViewer on devices with sensors (e.g. Shelly Wall Display). Automatic brightness applies by day, at night "Dim at night" applies.',
      'Nachts um 3 Uhr':
        'At 3 am',
      'Alle {n} Stunden':
        'Every {n} hours',
      'Nie':
        'Never',
      'Gilt sofort. Dauerhaft: Panel → Display & Nacht.':
        'Applies immediately. Permanent: Panel → Display & night.',
      'Gilt sofort. Dauerhaft: Panel → Display &amp; Nacht.':
        'Applies immediately. Permanent: Panel → Display &amp; night.',
      'Alles zur Fehlersuche: Server-Protokoll, Geräteprotokolle und Test-Ton.':
        'Everything for troubleshooting: server log, device logs and test tone.',
      'Server-Protokoll': 'Server log',
      'Ausführliches Protokoll schreiben': 'Write detailed log',
      'Der Server protokolliert ausführlich: Miniserver-Verbindung, empfangene Werte pro Minute, verbundene Geräte, Verbindungsabbrüche und Fehler der Geräte. Nur bei Bedarf einschalten; die Größe ist begrenzt und ältere Einträge werden überschrieben.':
        'The server logs in detail: Miniserver connection, values received per minute, connected devices, connection drops and device errors. Only switch it on when needed; the size is limited and older entries are overwritten.',
      'Geräteprotokolle': 'Device logs',
      'Für Android-Geräte (z. B. Shelly Wall Display), die per adb über WLAN erreichbar sind. Die Textdatei enthält Sensoren, Systemprotokoll, Hänger, Speicher und CPU und verändert nichts am Gerät; am besten direkt nach einem Hänger holen, denn das Android-Protokoll reicht nur einige Stunden zurück.':
        'For Android devices (e.g. Shelly Wall Display) reachable via adb over WLAN. The text file contains sensors, system log, hangs, memory and CPU and changes nothing on the device; best fetched right after a hang, because the Android log only goes back a few hours.',
      'Spielt drei kurze Pieptöne auf allen Geräten, die das gewählte Panel zeigen. So prüfst du, ob Wecker und Klingel zu hören sind.':
        'Plays three short beeps on all devices that show the chosen panel. This shows whether alarm clock and doorbell are audible.',
      'Gerät': 'Device',
      'Schützt diese Konfiguration mit einem Passwort.': 'Protects this configuration with a password.',
      'Aussehen': 'Appearance',
      'Standard-Aussehen': 'Default appearance',
      'Passwortschutz': 'Password protection',
      'Alle Geräte': 'All devices',
      'Einstellungen': 'Settings',
      'Zu „Alle Geräte“': 'Go to "All devices"',
      'Linux-Gerät': 'Linux device',
      'Einrichten': 'Set up',
      'Kopieren': 'Copy',
      'IP-Adresse des Geräts': 'IP address of the device',
      'Gerätename': 'Device name',
      'Danke! Ein Kaffee geht auch, aber Tokens schmecken besser.': 'Thanks! Coffee works too, but tokens taste better.',
      'Spendier mir Claude-Code-Tokens': 'Buy me Claude Code tokens',
      'Löst ein gewählter Baustein aus, zeigt dieses Panel ein rotes Vollbild mit <b>Stumm</b> und <b>Quittieren</b> (Rauchmelder) bzw. <b>Quittieren</b> und <b>Unscharf</b> (Alarmanlage). Die Tasten schalten sofort, abgesicherte Bausteine fragen den PIN ab.':
        'If a selected block triggers, this panel shows a red full screen with <b>Mute</b> and <b>Acknowledge</b> (smoke detector) or <b>Acknowledge</b> and <b>Disarm</b> (alarm system). The buttons act immediately, protected blocks ask for the PIN.',
      'Vorgewählt sind alle Alarm- und Rauchmelder-Bausteine aus den Räumen dieses Panels, außer ausgeblendeten.':
        'Preselected are all alarm and smoke detector blocks from the rooms of this panel, except hidden ones.',
      '1 Baustein': '1 block',
      '{n} Bausteine': '{n} blocks',
      'Piepton an': 'Beep on',
      'Piepton aus': 'Beep off',
      'Piepton, bis „Stumm“ oder „Quittieren“ gedrückt wird oder der Alarm endet':
        'Beep until "Mute" or "Acknowledge" is pressed or the alarm ends',
      'Der Piepton kommt aus dem Browser und läuft auf Tablets, NSPanel und Shelly. Browser geben Ton erst nach einer Berührung frei: Tippe das Panel nach dem Laden einmal an, sonst zeigt das Vollbild „Ton gesperrt – Bildschirm antippen“. Testen kannst du das je Gerät unter System → Diagnose → Test-Ton.':
        'The beep is generated in the browser and works on tablets, NSPanel and Shelly. Browsers only allow sound after a touch: tap the panel once after loading, otherwise the full screen shows "Ton gesperrt – Bildschirm antippen". You can test this per device under System → Diagnostics → Test tone.',
      'Wirkt sofort, ohne Speichern': 'Takes effect immediately, without saving',
      'Gerätetyp festlegen': 'Set device type',
      'Panel gestalten': 'Design panel',
      'Passwort gesetzt': 'Password set',
      'Adresse und Zugangsdaten prüfen': 'Check address and credentials',
      'Gerät hinzufügen': 'Add device',
      'Verbunden seit': 'Connected since',
      'Aufgaben': 'Tasks',
      'Antwortzeit': 'Response time',
      'Anmeldung abgelehnt. Prüfe Benutzer und Passwort unter System → Loxone.':
        'Sign-in rejected. Check user and password under System → Loxone.',
      'Anmeldung am Miniserver gesperrt (zu viele Fehlversuche). Prüfe die Zugangsdaten und warte etwas.':
        'Sign-in at the Miniserver is blocked (too many failed attempts). Check the credentials and wait a moment.',
      'Der Miniserver hat keine freien Live-Verbindungen mehr (höchstens 31).':
        'The Miniserver has no free live connections left (at most 31).',
      'Die Benutzer am Miniserver wurden geändert. Es wird neu angemeldet.':
        'The users on the Miniserver were changed. Signing in again.',
      'Der Miniserver ist nicht erreichbar. Prüfe Adresse, Port und Netzwerk.':
        'The Miniserver is not reachable. Check address, port and network.',
      'Ohne Passwort kann jeder im Heimnetz diese Konfiguration öffnen.':
        'Without a password, anyone on the home network can open this configuration.',
      'Panels, Kamerabilder und Loxone-Befehle (z. B. Betriebsmodus) funktionieren weiter ohne Passwort. Passwort vergessen? LoxBerry → Plugin → „Passwort zurücksetzen“.':
        'Panels, camera images and Loxone commands (e.g. operating mode) keep working without a password. Forgot the password? LoxBerry → Plugin → "Passwort zurücksetzen".',
      'Passwort wiederholen': 'Repeat password',
      'Passwortschutz entfernen': 'Remove password protection',
      'Das Passwort braucht mindestens 6 Zeichen.': 'The password needs at least 6 characters.',
      'Die beiden Passwörter sind nicht gleich.': 'The two passwords do not match.',
      'Passwort gespeichert. Die Konfiguration ist geschützt.': 'Password saved. The configuration is protected.',
      'Passwortschutz entfernen? Danach kann jeder im Heimnetz die Konfiguration öffnen.':
        'Remove password protection? Afterwards anyone on the home network can open the configuration.',
      'Passwortschutz entfernt.': 'Password protection removed.',
      'Panel öffnen': 'Open panel',
      'Panel hinzufügen': 'Add panel',
      'Seite, Panel, Tab, Gerät oder Aktion suchen': 'Search for a page, panel, tab, device or action',
      'Keine Treffer': 'No results',
      'Keine Treffer.': 'No results.',
      'Doppeltipp auf eine Lichtkachel schaltet das Licht aus': 'Double tap on a light tile switches the light off',
      'Gilt nur bei eingeschaltetem Licht. Ein einfacher Tipp öffnet die Kachel dann erst nach 0,35 s.':
        'Only applies while the light is on. A single tap then opens the tile only after 0.35 s.',
      'Wecker darf Panels aufwecken und umschalten': 'Alarm clock may wake and switch panels',
      'Betrifft nur die Weckmeldung: Ton, Bildschirm an, Wechsel zum Wecker. Wecker-Kacheln bleiben überall bedienbar.':
        'Only affects the wake-up notification: sound, screen on, switch to the alarm clock. Alarm clock tiles stay usable everywhere.',
      'Vorlage und Farben': 'Template and colours',
      'Vorlage wählen, danach einzelne Farben anpassen.': 'Choose a template, then adjust individual colours.',
      'Farben anpassen': 'Adjust colours',
      'Größen (px, leer: Standard)': 'Sizes (px, empty: default)',
      'Vorlage, Farben und Schrift aller Panels.': 'Template, colours and font of all panels.',
      'Animierte Symbole: Klingel und Wecker wackeln, Jalousiepfeile wippen, die Heizung flackert, Symbole ploppen beim Einschalten, neue Werte ticken ein':
        'Animated icons: bell and alarm clock wobble, blind arrows bob, the heating flickers, icons pop when switched on, new values tick in',
      'Animation: Keine, Mittel (nur Überblendungen) oder Viel (mit Zoom). Kontrast: weicher Schatten an Kacheln und Knöpfen. Lichtszenen: Das Symbol zeigt Lichtfarbe und Helligkeit und lernt jede Szene beim ersten Einschalten. Auf schwachen Geräten helfen Animation „Mittel“ und Kontrast „Aus“.':
        'Animation: None, Medium (cross-fades only) or High (with zoom). Contrast: soft shadow on tiles and buttons. Light scenes: the icon shows light colour and brightness and learns each scene the first time it is switched on. On weak devices, animation "Medium" and contrast "Off" help.',
      'Je Kategorie eine <b>Aktiv-</b> und eine <b>OK-Farbe</b> für Hintergrund und Rahmen der Kachel. Gilt für alle Panels. ◐ an: Die Kachel zeigt den Zustand als Ampel (z. B. Alarm rot/grün, Tor gelb/grün). ◐ aus: neutral. Messwerte bleiben immer neutral.':
        'One <b>active</b> and one <b>OK colour</b> per category for the background and border of the tile. Applies to all panels. ◐ on: the tile shows the state as a traffic light (e.g. alarm red/green, gate yellow/green). ◐ off: neutral. Measured values always stay neutral.',
      'Start-Adresse:': 'Start address:',
      'Format': 'Format',
      'Legt fest, wie Tabs und Dashboard aufgebaut sind: quadratisch (480 × 480), breit mit zwei Hälften nebeneinander oder Handy (zwei Hälften untereinander, Tabs unten, als App nutzbar über „Zum Home-Bildschirm“).':
        'Defines how tabs and dashboard are laid out: square (480 × 480), wide with two halves side by side, or phone (two halves stacked, tabs at the bottom, usable as an app via "Add to Home Screen").',
      'Quadratisch': 'Square',
      'Breit (2 Hälften)': 'Wide (2 halves)',
      'Gilt für neue Tabs und das Dashboard. Einzelne Tabs können abweichen (Tab-Einstellungen).':
        'Applies to new tabs and the dashboard. Individual tabs can differ (tab settings).',
      '9 Kacheln (3 × 3), fein': '9 tiles (3 × 3), fine',
      '4 große Kacheln (2 × 2)': '4 large tiles (2 × 2)',
      'Versatz horizontal (px)': 'Horizontal offset (px)',
      'Bildschirm füllen: Auf größeren Displays wird hochgezoomt, statt im 480er-Raster zu bleiben. Den Versatz nur ändern, wenn das Bild am Rand abgeschnitten ist.':
        'Fill screen: on larger displays the picture is zoomed up instead of staying in the 480 grid. Only change the offset if the picture is cut off at the edge.',
      'Dashboard nach Leerlauf (s)': 'Dashboard after idle (s)',
      'Abdunkeln nachts (%)': 'Dim at night (%)',
      'Hell nach Antippen (s)': 'Bright after tap (s)',
      'Helligkeit min. (%)': 'Brightness min. (%)',
      'Helligkeit max. (%)': 'Brightness max. (%)',
      'Nachts Kamerabild nur bei Annäherung zeigen': 'At night show camera image only on proximity',
      'Die Reihenfolge entspricht dem Panel: <b>Dashboard</b> links, Tabs rechtsbündig, <b>Tab 1</b> (Startseite) ganz rechts. Zum Umsortieren Tabs ziehen.':
        'The order matches the panel: <b>dashboard</b> on the left, tabs right-aligned, <b>tab 1</b> (start page) at the far right. Drag tabs to reorder them.',
      'Bis zu <b>4 Tabs</b>, der erste ist die Startseite (★). Zum Bearbeiten Tab antippen. Typen: <b>Frei</b> (du belegst selbst), <b>Raum</b>, <b>Kategorie</b> und <b>Zentral</b> (aus Loxone vorbefüllt, danach anpassbar, neue Bausteine kommen hinten dazu) sowie <b>Übersichten</b> (alle Räume oder Kategorien wie in der Loxone-App).':
        'Up to <b>4 tabs</b>, the first is the start page (★). Tap a tab to edit it. Types: <b>Free</b> (you fill it yourself), <b>Room</b>, <b>Category</b> and <b>Central</b> (prefilled from Loxone, adjustable afterwards, new blocks are added at the end) and <b>Overviews</b> (all rooms or categories like in the Loxone app).',
      'Auf diesem Panel überall ausgeblendet (Tabs, Räume, Kategorien). Antippen blendet sie wieder ein.':
        'Hidden everywhere on this panel (tabs, rooms, categories). Tap to show them again.',
      'Gilt nur für dieses Panel. „Wie Standard“ übernimmt System → Alle Panels.':
        'Applies to this panel only. "Like default" takes over System → All panels.',
      'Auf schwachen Geräten helfen Animation „Mittel“ oder „Keine“ und Kontrast „Aus“.':
        'On weak devices, animation "Medium" or "None" and contrast "Off" help.',
      'Reine Messwert-Kacheln (Temperatur, Feuchte, CO₂, Leistung, Zähler) zeigen den Wert groß und das Symbol als blasses Wasserzeichen, Zahl und Einheit kommen unverändert aus Loxone. Textkacheln und Kacheln mit Schnellbedienung bleiben unverändert; pro Kachel änderbar unter Raster-Editor → Kachel → Aussehen.':
        'Pure measurement tiles (temperature, humidity, CO₂, power, meters) show the value large and the icon as a faint watermark, number and unit come unchanged from Loxone. Text tiles and tiles with quick control stay unchanged; changeable per tile under Grid editor → Tile → Appearance.',
      'Die Farben kommen aus dem Miniserver: Fenster offen gelb, Alarm oder Rauch ausgelöst rot, Alarm scharf blau. Statusbausteine zeigen ihre Farbe aus Loxone Config.':
        'The colours come from the Miniserver: window open yellow, alarm or smoke triggered red, alarm armed blue. Status blocks show their colour from Loxone Config.',
      'Mehrere Haken sind möglich. Ohne Haken schließt nur ein Tipp auf eine freie Stelle das Dashboard.':
        'Several ticks are possible. Without ticks, only a tap on a free spot closes the dashboard.',
      'Tageslicht: morgens leicht hell, mittags hell, abends dunkler, nachts dunkel (Sonnenzeiten aus dem Wetter). Außentemperatur: kalt blau, mild grün, warm gelb, heiß orange bis rot. Ohne Wetterdaten bleiben die festen Farben.':
        'Daylight: slightly bright in the morning, bright at noon, darker in the evening, dark at night (sun times from the weather). Outside temperature: cold blue, mild green, warm yellow, hot orange to red. Without weather data the fixed colours stay.',
      'Feste Farben (Vorlage)': 'Fixed colours (template)',
      'Bild wählen …': 'Choose image …',
      'JPG, PNG oder WebP, höchstens 12 MB. Wird sofort hochgeladen. Querformat passt am besten.':
        'JPG, PNG or WebP, 12 MB at most. Uploaded immediately. Landscape works best.',
      'Anhaken zum Anzeigen, ziehen zum Sortieren': 'Tick to show, drag to sort',
      'Symbol je Baustein (zum Ändern antippen)': 'Icon per block (tap to change)',
      'Mitgeliefert': 'Built in',
      'Die Symbole stehen oben und bleiben neutral, bis etwas passiert.':
        'The icons sit at the top and stay neutral until something happens.',
      'Standard-Dashboard': 'Default dashboard',
      'Als Standard für neue Panels verwenden': 'Use as default for new panels',
      'Ziehe zuerst Widgets ins Dashboard.': 'First drag widgets into the dashboard.',
      'Neue Panels starten mit diesem Dashboard. Nur ein Dashboard kann Standard sein.':
        'New panels start with this dashboard. Only one dashboard can be the default.',
      'Dieser Tab ist schon vorhanden. Wähle einen anderen.': 'This tab already exists. Choose another one.',
      'In Loxone gibt es dafür keine Einträge. Prüfe Räume und Kategorien in Loxone Config.':
        'There are no entries for this in Loxone. Check rooms and categories in Loxone Config.',
      'Lade Kacheln …': 'Loading tiles …',
      'So sieht das Dashboard am Panel aus. Ohne Belegung zeigt es das klassische Dashboard (Uhr, Wetter, Termine).':
        'This is how the dashboard looks on the panel. Without any tiles it shows the classic dashboard (clock, weather, appointments).',
      'So sieht der Tab am Panel aus. Weitere Seiten folgen darunter, wie beim Wischen nach unten. Unten liegt immer eine leere Seite zum Ablegen.':
        'This is how the tab looks on the panel. More pages follow below, as when swiping down. There is always an empty page at the bottom for dropping tiles.',
      'Linke Hälfte': 'Left half',
      'Rechte Hälfte': 'Right half',
      'Hierher ziehen: neue Seite': 'Drag here: new page',
      'Aus Loxone neu füllen': 'Refill from Loxone',
      'Aus Loxone neu gefüllt': 'Refilled from Loxone',
      'Ziehe ein Widget ins Raster und wähle rechts Baustein oder Quelle.':
        'Drag a widget into the grid and choose the block or source on the right.',
      'Kachel <b>antippen</b>: Hier erscheinen Größe, Inhalt und Aussehen.':
        '<b>Tap</b> a tile: size, content and appearance appear here.',
      '<b>Ecke</b> ziehen: Größe ändern. Auf eine andere Kachel ziehen: <b>tauschen</b>.':
        'Drag a <b>corner</b>: resize. Drag onto another tile: <b>swap</b>.',
      'Kein Baustein gewählt. Ohne Baustein wird die Kachel nicht gespeichert.':
        'No block chosen. Without a block the tile is not saved.',
      'Keine vorhanden': 'None available',
      'Status (max. 4)': 'Status (max. 4)',
      '„Passend zum Design“ übernimmt die Farben des Tabs oder Dashboards, die Ampel erscheint als Akzentfarbe. „Farbig“ färbt die ganze Kachel.':
        '"Match design" takes over the colours of the tab or dashboard, the traffic light appears as an accent colour. "Colourful" colours the whole tile.',
      'Haken: anzeigen. Ziehen: Reihenfolge. Die erste Kamera startet, die Zahlen stehen als Schaltflächen am Panel.':
        'Tick: show. Drag: order. The first camera starts, the numbers appear as buttons on the panel.',
      'Ohne Bedienung springt das Widget wieder auf Kamera 1. 0: aus.':
        'Without interaction the widget jumps back to camera 1. 0: off.',
      'Noch keine Kamera mit Video-Adresse. Trage sie unter System → Kalender & Kameras ein.':
        'No camera with a video address yet. Enter one under System → Calendar & cameras.',
      'Abgewählte Bausteine zeigt dieses Panel nirgends an, auch nicht in anderen Räumen oder Kategorien.':
        'This panel does not show deselected blocks anywhere, not even in other rooms or categories.',
      'Keine Bausteine vorhanden.': 'No blocks available.',
      'Mindestens eine Kamera muss sichtbar bleiben.': 'At least one camera must stay visible.',
      'Standard-Aussehen (alle Panels)': 'Default appearance (all panels)',
      'Nicht alles gespeichert. Details stehen in der markierten Karte.':
        'Not everything was saved. Details are in the marked card.',
      'Nicht gespeichert:': 'Not saved:',
      'Symbol suchen, z. B. Licht': 'Search icon, e.g. light',
      'Keine Loxone-Symbole gefunden. Ist das Plugin „LoxoneIcons“ installiert?':
        'No Loxone icons found. Is the "LoxoneIcons" plugin installed?',
      'Weitere Treffer. Suche eingrenzen.': 'More results. Narrow down the search.',
      'In 6 Schritten: Format, Tabs, Dashboard, Design, Name, Gerät.':
        'In 6 steps: format, tabs, dashboard, design, name, device.',
      'Ohne Assistent. Das neue Panel ist leer und öffnet sich direkt zum Bearbeiten.':
        'Without the wizard. The new panel is empty and opens right away for editing.',
      'Welches Format hat das Display?': 'Which format does the display have?',
      'z. B. 4″-Display': 'e.g. 4″ display',
      'hochkant, Tabs unten, als App auf dem Home-Bildschirm':
        'portrait, tabs at the bottom, as an app on the home screen',
      'Raster': 'Grid',
      '4 große Kacheln, leicht zu treffen': '4 large tiles, easy to hit',
      'Welche Tabs? (höchstens 4, der erste ist die Startseite)': 'Which tabs? (at most 4, the first is the start page)',
      'Die Tabs stehen in der Reihenfolge deiner Auswahl. Später lässt sie sich per Ziehen ändern.':
        'The tabs follow the order of your selection. You can change it later by dragging.',
      'Was zeigt das Dashboard?': 'What does the dashboard show?',
      'System → Alle Panels': 'System → All panels',
      'Diese Kennung ist schon vergeben.': 'This ID is already taken.',
      'Trage diese Start-Adresse in der App oder im Browser des Geräts ein. Mit „&device=Name“ erscheint das Gerät unter „Alle Geräte“.':
        'Enter this start address in the app or in the browser of the device. With "&device=Name" the device appears under "All devices".',
      'Shelly Wall Display und andere Android-Geräte richtest du nach dem Anlegen per adb ein: Geräte → Gerät hinzufügen.':
        'You set up Shelly Wall Display and other Android devices via adb after creating the panel: Devices → Add device.',
      'Weiter zu „Gerät hinzufügen“': 'Continue to "Add device"',
      'Panel anlegen': 'Create panel',
      'verfügbar. Installation in der LoxBerry-Pluginverwaltung.':
        'available. Install it in the LoxBerry plugin management.',
      'Keine Türstationen gefunden. Ist der Miniserver verbunden?': 'No door stations found. Is the Miniserver connected?',
      'Video-Adresse (MJPEG)': 'Video address (MJPEG)',
      'Kameraverbindung automatisch erneuern': 'Renew the camera connection automatically',
      'Ton beim Klingeln (das Panel piept, solange es klingelt)': 'Sound on ring (the panel beeps while it rings)',
      'MP3, OGG, WAV, M4A oder AAC, höchstens 5 MB. Wird sofort hochgeladen. „Klingeln testen“ löst ein echtes Klingeln auf den Geräten aus, die das unter System → Diagnose → Test-Ton gewählte Panel zeigen.':
        'MP3, OGG, WAV, M4A or AAC, 5 MB at most. Uploaded immediately. "Test ring" triggers a real ring on the devices that show the panel chosen under System → Diagnostics → Test tone.',
      'Lädt hoch …': 'Uploading …',
      'Eigene Datei hochgeladen': 'Own file uploaded',
      'Ohne Haken holt tilebert keine Live-Daten von diesem Audioserver, z. B. wenn es ihn nicht mehr gibt. Die Zonen lassen sich weiter über den Miniserver bedienen.':
        'Without the tick tilebert fetches no live data from this Audioserver, e.g. if it no longer exists. The zones can still be controlled via the Miniserver.',
      'Noch kein Kalender eingetragen.': 'No calendar entered yet.',
      'Den Grund nennt der jeweilige Kalender.': 'Each calendar states its reason.',
      'Wetter vom Loxone-Wetterdienst': 'Weather from the Loxone weather service',
      'Kein Standort eingetragen.': 'No location entered.',
      'Tippe oder ziehe ins Bild, um den wichtigen Bereich festzulegen; die Rahmen zeigen, was Popup und Widget davon zeigen. Ohne Zoom lässt sich nur verschieben, was das breitere Format ohnehin abschneidet.':
        'Tap or drag in the image to set the important area; the frames show what popup and widget display of it. Without zoom you can only shift what the wider format cuts off anyway.',
      'Einfarbig, passend zum Tab. Belastet das Gerät nicht.':
        'Single colour, matching the tab. Puts no load on the device.',
      'Das Bild läuft unscharf in die Ränder aus und passt immer zum Motiv.':
        'The image fades out blurred into the edges and always suits the subject.',
      '„Bild verwischt“ braucht kaum Rechenleistung und keine zweite Kameraverbindung. Auf sehr schwachen Geräten (z. B. Shelly) besser „Kartenfarbe“ wählen.':
        '"Blurred image" needs hardly any computing power and no second camera connection. On very weak devices (e.g. Shelly) rather choose "Card colour".',
      'Gilt nach dem Speichern für Popup, Dashboard-Widget und Kameraansicht.':
        'Applies after saving to popup, dashboard widget and camera view.',
      'Gespeichert': 'Saved',
      'Das Panel zeigt den Stand von {zeit} Uhr.': 'The panel shows the state from {zeit}.',
      'Noch kein Kalender. Klicke auf „Kalender hinzufügen“ und trage den Abo-Link ein.':
        'No calendar yet. Click "Add calendar" and enter the subscription link.',
      'z. B. Müllabfuhr': 'e.g. waste collection',
      'iCal-Abo-Link': 'iCal subscription link',
      'Es sind höchstens {max} Kalender möglich.': 'At most {max} calendars are possible.',
      'Lese Geräteprotokoll per adb (bis zu 1 Minute). Halte in den nächsten 10 s die Hand ans Gerät und nimm sie wieder weg (Test des Näherungssensors).':
        'Reading the device log via adb (up to 1 minute). In the next 10 s hold your hand to the device and take it away again (proximity sensor test).',
      'Protokoll von': 'Log of',
      'Protokoll holen': 'Fetch log',
      'Kein Gerät mit adb gefunden. Android-Geräte erscheinen hier, wenn ihr Gerätetyp gesetzt (Geräte → Alle Geräte) und adb über WLAN eingeschaltet ist.':
        'No device with adb found. Android devices appear here once their device type is set (Devices → All devices) and adb over WLAN is switched on.',
      'Server-Protokoll löschen? Das lässt sich nicht rückgängig machen.': 'Delete the server log? This cannot be undone.',
      'Panel': 'Panel',
      'Panel wechseln': 'Switch panel',
      'Panel wählen, dann „Panel wechseln“. Wirkt sofort am Gerät.':
        'Choose a panel, then "Switch panel". Takes effect immediately on the device.',
      'Wechseln geht erst, wenn das Panel am Gerät geöffnet ist.':
        'Switching only works once the panel is open on the device.',
      'Browser starten': 'Start browser',
      'Browser beenden': 'Stop browser',
      'Browser neu laden': 'Reload browser',
      'Display ausschalten': 'Switch display off',
      'Display einschalten': 'Switch display on',
      'Gerät offline. Die Steuerung ist nicht verfügbar.': 'Device offline. Control is not available.',
      'Gerät verbindet sich. Die Steuerung ist gleich verfügbar.':
        'Device is connecting. Control will be available shortly.',
      'Voraussetzung: ADB über WLAN ist am Gerät eingeschaltet und für diesen Server freigegeben.':
        'Requirement: ADB over WLAN is switched on at the device and approved for this server.',
      'installiert. Update verfügbar.': 'installed. Update available.',
      'Als Panel-Anzeige einrichten': 'Set up as panel display',
      'installiert, aber nicht als Panel-Anzeige aktiv': 'installed, but not active as panel display',
      'TbViewer: Status unbekannt. Das Gerät ist per adb nicht erreichbar.':
        'TbViewer: status unknown. The device cannot be reached via adb.',
      'An der IP-Adresse erkannt. Mit einem Namen bleibt das Gerät dauerhaft in der Liste und lässt sich per Betriebsmodus umschalten.':
        'Recognised by its IP address. With a name the device stays in the list permanently and can be switched by operating mode.',
      'Das Gerät startet dabei kurz neu.': 'The device restarts briefly in the process.',
      'Voraussetzung: ADB über WLAN (Port 5555) ist eingeschaltet. Beim ersten Mal fragt das Gerät „USB-Debugging zulassen?“. Bestätige mit „Immer erlauben“ und starte die Aktion noch einmal.':
        'Requirement: ADB over WLAN (port 5555) is switched on. The first time, the device asks "Allow USB debugging?". Confirm with "Always allow" and start the action again.',
      'IP-Adresse des Geräts unbekannt. Öffne das Panel einmal am Gerät.':
        'IP address of the device unknown. Open the panel once on the device.',
      'Richte die Anzeige ein …': 'Setting up the display …',
      'TbViewer eingerichtet. Das Gerät startet neu.': 'TbViewer set up. The device is restarting.',
      'Noch kein Gerät bekannt. Öffne das Panel einmal am Gerät mit ?device=<name> oder installiere den Agent.':
        'No device known yet. Open the panel once on the device with ?device=<name> or install the agent.',
      'Verbunden, aber ohne Namen. Vergib zuerst einen Namen, dann wähle das Gerät aus:':
        'Connected, but without a name. Give it a name first, then select the device:',
      'Name vergeben. Das Gerät verbindet sich neu und erscheint gleich oben:':
        'Name assigned. The device reconnects and appears right at the top:',
      'Die Zuordnung gilt für alle gewählten Geräte gleich. Feinabstimmung danach unter „Alle Geräte“.':
        'The assignment applies to all selected devices alike. Fine-tune afterwards under "All devices".',
      'Welches Panel bei welchem Modus?': 'Which panel for which mode?',
      'Bei „nichts ändern“ schaltet dieser Modus die Geräte nicht um.':
        'With "change nothing" this mode does not switch the devices.',
      'Keine Zuordnung gewählt. Es würde nichts umgeschaltet.': 'No assignment chosen. Nothing would be switched.',
      'Fertig. Jetzt in Loxone einrichten': 'Done. Now set it up in Loxone',
      'Lege in Loxone Config je Betriebsart einen virtuellen HTTP-Ausgang mit dieser Adresse an. Am Ende steht der Modusname:':
        'In Loxone Config, create a virtual HTTP output with this address for each operating mode. The mode name goes at the end:',
      'Übernehmen': 'Apply',
      'Name fehlt. Gib einen Namen ein.': 'Name missing. Enter a name.',
      '— Panel wählen —': '— choose panel —',
      'Modus, z. B. gaeste': 'Mode, e.g. gaeste',
      'Wähle zuerst den Gerätetyp. Dann erscheinen die passenden Funktionen.':
        'Choose the device type first. Then the matching functions appear.',
      'Für größere Schirme (7–8″-Tablet, iPad mini): Beide Hälften werden gleichmäßig auf die volle Größe gezoomt statt mit Rand gezeigt. Geräte mit 480 × 480 bleiben unverändert.':
        'For larger screens (7–8″ tablet, iPad mini): both halves are zoomed evenly to full size instead of being shown with a border. Devices with 480 × 480 stay unchanged.',
      'Panel automatisch nach Betriebsmodus wechseln': 'Switch panel automatically by operating mode',
      'Modus hinzufügen': 'Add mode',
      'Welches Panel bei welchem Modus erscheint. Loxone sendet den Modus per HTTP (siehe Karte „Betriebsmodus“ oben).':
        'Which panel appears for which mode. Loxone sends the mode via HTTP (see card "Operating mode" above).',
      'Feste Geräte-ID. Bleibt gleich, auch wenn sich die IP-Adresse ändert.':
        'Fixed device ID. Stays the same even if the IP address changes.',
      'Ohne Treiber „keine“ lassen. Dann schaltet das Panel das Display selbst.':
        'Without a driver leave "none". Then the panel switches the display itself.',
      'Noch kein Gerät bekannt. Es erscheint hier, sobald es das Panel mit Kennung öffnet oder ein Agent läuft.':
        'No device known yet. It appears here as soon as it opens the panel with an ID or an agent is running.',
      'Zeile entfernt. Wirksam nach dem Speichern.': 'Row removed. Takes effect after saving.',
      '“ gelöscht. Wirksam nach dem Speichern.': '" deleted. Takes effect after saving.',
      '“ entfernt. Wirksam nach dem Speichern.': '" removed. Takes effect after saving.',
      'Display-Passwort nicht gespeichert, weil Adresse oder Treiber geändert wurden:':
        'Display password not saved because address or driver were changed:',
      'Kopiert': 'Copied',
      'Kopieren nicht möglich. Markiere den Text und kopiere ihn von Hand.':
        'Copying is not possible. Select the text and copy it by hand.',
      'Sobald das Gerät das Panel geöffnet hat, erscheint es unter „Alle Geräte“.':
        'As soon as the device has opened the panel, it appears under "All devices".',
      'Keine Änderungen': 'No changes',
      'Geändert und zurückgesetzt': 'Changed and reset',
      'Tab aktiv, Symbol': 'Tab active, icon',
      'Karte Detailansicht': 'Card detail view',
      'Dashboard nach Leerlauf': 'Dashboard after idle',
      'An': 'On',
      '/ (Standard-Panel)': '/ (default panel)',
      'Raster ': 'Grid ',
      ' auch für alle bestehenden Tabs und das Dashboard übernehmen? OK: ja, alle. Abbrechen: nur für neue Tabs.':
        ' for all existing tabs and the dashboard as well? OK: yes, all of them. Cancel: new tabs only.',
      'Verkleinere oder entferne zuerst andere Widgets.': 'Shrink or remove other widgets first.',
      'Folgt später': 'Coming later',
      'Farbschema der Konfiguration': 'Colour scheme of the configuration',
      // P3 Kopf/Seitenleiste, Start, Suche
      'Farbschema': 'Colour scheme',
      'Bunt': 'Colourful',
      'Hell': 'Light',
      'Dunkel': 'Dark',
      'Suchen (Strg/⌘ + K)': 'Search (Ctrl/⌘ + K)',
      'Kennung': 'ID',
      'Start-Adresse kopieren': 'Copy start address',
      'Miniserver getrennt': 'Miniserver disconnected',
      'Gerät seit über 1 h offline': 'device offline for more than 1 h',
      'Geräte seit über 1 h offline': 'devices offline for more than 1 h',
      'verfügbar': 'available',
      'Kalender einrichten': 'Set up calendar',
      'Optional': 'Optional',
      'Ausblenden': 'Hide',
      'Tabs': 'Tabs',
      'Geräteliste': 'Device list',
      'Agenten': 'Agents',
      'Türstationen': 'Door stations',
      'Zugriffsschutz': 'Access protection',
      'Doppeltipp': 'Double tap',
      'Wecker': 'Alarm clock',
      'Panel neu laden': 'Reload panel',
      'Zeigt gerade Panel „': 'Currently shows panel "',
      '“ quadratisch. Dieses Gerät ist breit und braucht das Format „Breit (2 Hälften)“.':
        '" as square. This device is wide and needs the format "Wide (2 halves)".',
      '“ breit. Dieses Gerät ist quadratisch und braucht das Format „Quadratisch“.':
        '" as wide. This device is square and needs the format "Square".',
      'Leer lassen, um das Passwort zu behalten': 'Leave empty to keep the password',
      'nichts ändern': 'change nothing',
      'Der Server ist nicht erreichbar.': 'The server is not reachable.',
      'Der Server antwortet nicht (Zeitüberschreitung).': 'The server is not responding (timeout).',
      'Prüfe, ob tilebert läuft, und versuche es noch einmal.': 'Check that tilebert is running and try again.',
      'Prüfe die Netzwerkverbindung und ob tilebert läuft.':
        'Check the network connection and whether tilebert is running.',
      'ADB ist nicht freigegeben.': 'ADB is not approved.',
      'Bestätige am Gerät „USB-Debugging zulassen“ und versuche es noch einmal.':
        'Confirm "Allow USB debugging" on the device and try again.',
      'Das Gerät ist offline.': 'The device is offline.',
      'Prüfe Strom und WLAN, bei Android außerdem „ADB über WLAN“.':
        'Check power and WLAN, and for Android also "ADB over WLAN".',
      'Ungültige Eingabe.': 'Invalid input.',
      'Prüfe die Felder und versuche es noch einmal.': 'Check the fields and try again.',
      'Grund:': 'Reason:',
      'Versuche es noch einmal oder prüfe System → Diagnose.': 'Try again or check System → Diagnostics.',
      'Unbekannte Ursache.': 'Unknown cause.',
      'Verbunden. {n} Bausteine gefunden.': 'Connected. {n} blocks found.',
      'Tipp-Töne ändern fehlgeschlagen.': 'Changing tap sounds failed.',
      'Helligkeit ändern fehlgeschlagen.': 'Changing brightness failed.',
      'Einrichten fehlgeschlagen.': 'Setup failed.',
      'Neustart fehlgeschlagen.': 'Restart failed.',
      'Erledigt.': 'Done.',
      'Aktion fehlgeschlagen.': 'Action failed.',
      'Namen vergeben fehlgeschlagen.': 'Assigning the name failed.',
      'Umbenennen fehlgeschlagen.': 'Renaming failed.',
      'Löschen fehlgeschlagen.': 'Deleting failed.',
      'Hochladen fehlgeschlagen.': 'Upload failed.',
      'Kein Gerät verbunden. Das Panel muss am Gerät geöffnet sein.':
        'No device connected. The panel must be open on the device.',
      'Gesendet, aber ohne Ton: „Ton beim Klingeln“ ist nicht gespeichert. Haken setzen und speichern.':
        'Sent, but without sound: "Sound on ring" is not saved. Tick it and save.',
      'Gesendet an 1 Gerät': 'Sent to 1 device',
      'Gesendet an {n} Geräte': 'Sent to {n} devices',
      'Klingeln fehlgeschlagen.': 'Ring failed.',
      'Die Geräte laden das Panel automatisch neu.': 'The devices reload the panel automatically.',
      'Speichern fehlgeschlagen.': 'Saving failed.',
      'Verbindung fehlgeschlagen.': 'Connection failed.',
      'Passwort speichern fehlgeschlagen.': 'Saving the password failed.',
      'Passwortschutz entfernen fehlgeschlagen.': 'Removing password protection failed.',
      'Test-Ton fehlgeschlagen.': 'Test tone failed.',
      'Protokoll holen fehlgeschlagen.': 'Fetching the log failed.',
      'tilebert läuft auf <b>Android-Wanddisplays</b> (App TbViewer, Installation per <code>adb</code>) im Format <b>480 × 480</b>. Diese Geräte sind erprobt: 4″-Geräte 1:1, höher aufgelöste oder größere per Zoom, breite Geräte mit zwei Hälften.':
        'tilebert runs on <b>Android wall displays</b> (TbViewer app, installed via <code>adb</code>) in the format <b>480 × 480</b>. These devices are tested: 4″ devices 1:1, higher-resolution or larger ones with zoom, wide devices with two halves.',
      'Quadratische Geräte': 'Square devices',
      '4″-Standardgerät <span class="badge ref">Referenz</span>':
        '4″ standard device <span class="badge ref">Reference</span>',
      '480 × 480 · Android 11 oder Debian 11 · WLAN oder LAN/PoE': '480 × 480 · Android 11 or Debian 11 · WLAN or LAN/PoE',
      'YC-SM41P / YC-SM41xx (Portworld) und baugleiche Geräte, die <b>xx</b>-Varianten mit <b>LAN/PoE</b> (Strom und Netzwerk über ein Kabel). Native Auflösung; Debian mit Chromium ist das Hauptziel.':
        'YC-SM41P / YC-SM41xx (Portworld) and identical devices, the <b>xx</b> variants with <b>LAN/PoE</b> (power and network over one cable). Native resolution; Debian with Chromium is the main target.',
      'Sonoff NSPanel Pro 86 <span class="badge">Fest</span>': 'Sonoff NSPanel Pro 86 <span class="badge">Fixed</span>',
      '3,95″ · 480 × 480 · Android': '3.95″ · 480 × 480 · Android',
      'Natives Format, 1:1. Android ist gesperrt, TbViewer kommt per adb; 2 Relais eingebaut.':
        'Native format, 1:1. Android is locked, TbViewer is installed via adb; 2 relays built in.',
      'Shelly Wall Display X1i <span class="badge">Gezoomt</span>':
        'Shelly Wall Display X1i <span class="badge">Zoomed</span>',
      '4″ · 720 × 720 · Android 11': '4″ · 720 × 720 · Android 11',
      'Quadratisch und höher aufgelöst: Die 480 × 480 werden sauber auf 720 × 720 gezoomt.':
        'Square and higher resolution: the 480 × 480 are cleanly zoomed to 720 × 720.',
      'Sonoff NSPanel Pro 120 <span class="badge">Gezoomt</span>':
        'Sonoff NSPanel Pro 120 <span class="badge">Zoomed</span>',
      '4,7″ · Hochformat 76 × 120 mm': '4.7″ · portrait 76 × 120 mm',
      'Anderer Formfaktor als die quadratischen 4″-Geräte: höher als breit, mit Zoom.':
        'Different form factor than the square 4″ devices: taller than wide, with zoom.',
      'Breite Geräte · zwei Hälften': 'Wide devices · two halves',
      'Shelly Wall Display X2 / X2i <span class="badge">2 Hälften</span>':
        'Shelly Wall Display X2 / X2i <span class="badge">2 halves</span>',
      '6,95″ · 87 × 176 mm · Android 11': '6.95″ · 87 × 176 mm · Android 11',
      'Breites Gerät (etwa 2:1) mit zwei Hälften zu je 480 × 480, wie zwei 4″-Displays in einem Rahmen.':
        'Wide device (about 2:1) with two halves of 480 × 480 each, like two 4″ displays in one frame.',
      'YC-SM55P (Portworld) <span class="badge">2 Hälften · LAN/PoE</span>':
        'YC-SM55P (Portworld) <span class="badge">2 halves · LAN/PoE</span>',
      '5,5″ · 720 × 1280 · Android 11 (RK3566) · PoE': '5.5″ · 720 × 1280 · Android 11 (RK3566) · PoE',
      '5,5″-Gerät, ähnlich dem Shelly X2: zwei Hälften zu je 480 × 480, dazu <b>LAN/PoE</b> (Strom und Netzwerk über ein Kabel). Hoch- und Querformat sind möglich, das Hochformat wird noch verfeinert.':
        '5.5″ device, similar to the Shelly X2: two halves of 480 × 480 each, plus <b>LAN/PoE</b> (power and network over one cable). Portrait and landscape are possible, portrait will be refined.',
      'Tablets · zwei Hälften': 'Tablets · two halves',
      '7–8″-Tablet <span class="badge">2 Hälften oder Zoom</span>':
        '7–8″ tablet <span class="badge">2 halves or zoom</span>',
      '1024 × 600 oder 1280 × 800 · Android oder iPad mini · quer':
        '1024 × 600 or 1280 × 800 · Android or iPad mini · landscape',
      'Zwei Hälften nebeneinander (links das Panel, rechts eine Zusatzanzeige) oder Zoom auf den ganzen Schirm.':
        'Two halves side by side (the panel on the left, an extra display on the right) or zoom to the full screen.',
      '"IP-Adresse des Geräts unbekannt. Öffne das Panel einmal am Gerät."':
        'IP address of the device unknown. Open the panel once on the device.',
      '"Gerät per adb nicht erreichbar. Ist ADB über WLAN am Gerät eingeschaltet?"':
        'Device not reachable via adb. Is ADB over WLAN switched on at the device?',
      '"adb nicht freigegeben. Bestätige am Gerät „USB-Debugging zulassen“."':
        'adb not approved. Confirm "Allow USB debugging" on the device.',
      'Querformat, zwei Hälften nebeneinander (Panel-Format „Breit (2 Hälften)“).':
        'Landscape, two halves side by side (panel format "Wide (2 halves)").',
      'TbViewer: Gerät hinzufügen → Shelly oder Android-Tablet.': 'TbViewer: Add device → Shelly or Android tablet.',
      'Dashboard und Abdunkeln übernimmt TbViewer, die Helligkeit regelt der Lichtsensor.':
        'TbViewer handles the dashboard and dimming, the light sensor controls the brightness.',
      '720 × 720: Zoom „Automatisch“ vergrößert das 480er-Raster auf den ganzen Schirm.':
        '720 × 720: zoom "Automatic" enlarges the 480 grid to the whole screen.',
      'Panel-Format „Quadratisch“.': 'Panel format "Square".',
      '480 × 480: passt 1:1, kein Zoom nötig. Panel-Format „Quadratisch“.':
        '480 × 480: fits 1:1, no zoom needed. Panel format "Square".',
      'TbViewer mit Start-Adresse inkl. ?device=… einrichten.': 'Set up TbViewer with the start address incl. ?device=…',
      'Hochformat: Zoom „Automatisch“ füllt die Breite. Panel-Format „Quadratisch“.':
        'Portrait: zoom "Automatic" fills the width. Panel format "Square".',
      '480 × 480: Referenzgröße, kein Zoom. Panel-Format „Quadratisch“.':
        '480 × 480: reference size, no zoom. Panel format "Square".',
      '480 × 480: Referenzgröße. Agent per SSH (Gerät hinzufügen → Linux-Gerät).':
        '480 × 480: reference size. Agent via SSH (Add device → Linux device).',
      '720 × 1280 quer: Zoom „Automatisch“, Panel-Format „Breit (2 Hälften)“.':
        '720 × 1280 landscape: zoom "Automatic", panel format "Wide (2 halves)".',
      'LAN/PoE: feste IP-Adresse im Router vergeben (für ADB).':
        'LAN/PoE: assign a fixed IP address in the router (for ADB).',
      'Querformat, Panel-Format „Breit (2 Hälften)“; Zoom „Automatisch“ füllt den Schirm.':
        'Landscape, panel format "Wide (2 halves)"; zoom "Automatic" fills the screen.',
      'Mit TbViewer funktionieren Autostart und Display-Steuerung; ohne die App hält die Seite den Schirm wach, bis die Leerlaufzeit abläuft.':
        'With TbViewer, autostart and display control work; without the app the page keeps the screen awake until the idle time runs out.',
      'Hochkant zeigt das Tablet nur eine Hälfte; unter 600 px Breite greift der Handy-Modus.':
        'In portrait the tablet shows only one half; below 600 px width the phone mode applies.',
      'Safari: Teilen → „Zum Home-Bildschirm“. Startet ohne Adressleiste als Vollbild-App (Start-Adresse mit ?device=…).':
        'Safari: Share → "Add to Home Screen". Starts without an address bar as a full-screen app (start address with ?device=…).',
      'Querformat, Panel-Format „Breit (2 Hälften)“; Zoom „Automatisch“ füllt den Schirm (iPad mini ≈ 118 %).':
        'Landscape, panel format "Wide (2 halves)"; zoom "Automatic" fills the screen (iPad mini ≈ 118 %).',
      'Ton (Klingel) erst nach einmaligem Antippen: iOS gibt Audio nur nach Berührung frei.':
        'Sound (doorbell) only after one tap: iOS only allows audio after a touch.',
      'Panel-Format „Handy“ (Tabs unten, volle Höhe); hochkant greift der Handy-Modus auch automatisch.':
        'Panel format "Phone" (tabs at the bottom, full height); in portrait the phone mode also applies automatically.',
      'Die Fenstergröße bestimmt das Format; Zoom bei Bedarf manuell setzen.':
        'The window size determines the format; set the zoom manually if needed.',
      'Statusleiste: Anzeige je Baustein': 'Status bar: display per block',
      'Aus (feste Größe)': 'Off (fixed size)',
      'Automatisch (Schirm ausfüllen)': 'Automatic (fill screen)',
      'Verlauf (ab 2 × 2)': 'History (from 2 × 2)',
      'Popup breit': 'Popup wide',
      'Popup quadratisch': 'Popup square',
      'Widget 2 × 1': 'Widget 2 × 1',
      'eigene Datei': 'own file',
      'Standardton': 'default tone',
      'Bild entfernen': 'Remove image',
      'Datei entfernen': 'Remove file',
      // Geräte: Hinzufügen-Formular, Karte, Offline-Bereich
      'Abbrechen': 'Cancel',
      'Wähle den Gerätetyp. Danach brauchst du nur ein Formular.': 'Choose the device type. Then you only need one form.',
      'Shelly oder Android-Tablet': 'Shelly or Android tablet',
      'Wanddisplay, Tablet oder Handy mit der App TbViewer': 'Wall display, tablet or phone with the TbViewer app',
      'Safari, Chrome … Nur die Adresse nötig': 'Safari, Chrome … Only the address is needed',
      'Welche Geräte gehen?': 'Which devices work?',
      'ADB über WLAN am Gerät einschalten': 'Turn on ADB over Wi-Fi on the device',
      'Am Gerät: Einstellungen, Entwickleroptionen, „ADB über WLAN“ einschalten (Port 5555). Beim ersten Mal fragt das Gerät „USB-Debugging zulassen?“. Bestätige mit „Immer erlauben“ und drücke danach noch einmal „TbViewer installieren“.': 'On the device: Settings, Developer options, turn on "ADB over Wi-Fi" (port 5555). The first time, the device asks "Allow USB debugging?". Confirm with "Always allow", then press "Install TbViewer" again.',
      'Name und Panel': 'Name and panel',
      'Welches Panel soll das Gerät zeigen?': 'Which panel should the device show?',
      'Gerätemodell': 'Device model',
      'Shelly Wall Display (X2, X2i, X1i)': 'Shelly Wall Display (X2, X2i, X1i)',
      'Sonoff NSPanel Pro, Tablet oder Handy': 'Sonoff NSPanel Pro, tablet or phone',
      'Adresse dieses Servers': 'Address of this server',
      'Unter dieser Adresse erreicht das Gerät tilebert.': 'The device reaches tilebert at this address.',
      'Du hast tilebert über localhost geöffnet. Das Gerät erreicht den Server nur über seine Adresse im Heimnetz. Trage sie ein, z. B. 192.168.1.10:8099.': 'You opened tilebert via localhost. The device can only reach the server by its home network address. Enter it, e.g. 192.168.1.10:8099.',
      'Du hast tilebert über localhost geöffnet. Trage unter „Gerät hinzufügen“ die Adresse des Servers im Heimnetz ein.': 'You opened tilebert via localhost. Enter the server\'s home network address under "Add device".',
      'Bitte ausfüllen:': 'Please fill in:',
      'IP-Adresse': 'IP address',
      'Server-Adresse fehlt.': 'Server address missing.',
      'Adresse am Gerät öffnen': 'Open the address on the device',
      'Befehl im Terminal ausführen': 'Run the command in a terminal',
      'tilebert installiert die App TbViewer per ADB und trägt die Start-Adresse ein. Das Gerät startet dabei kurz neu.': 'tilebert installs the TbViewer app via ADB and sets the start address. The device restarts briefly.',
      'Öffne diese Adresse im Browser des Geräts (Safari, Chrome …). Mit „Zum Home-Bildschirm“ startet sie wie eine App. Mit Namen erscheint das Gerät unter „Alle Geräte“.': 'Open this address in the device\'s browser (Safari, Chrome …). With "Add to Home Screen" it starts like an app. With a name the device appears under "All devices".',
      'Der Befehl überträgt Agent und Konfiguration aufs Gerät und richtet den Autostart ein. Führe ihn einmal im Terminal aus; er fragt nach dem SSH- und sudo-Passwort des Geräts.': 'The command copies the agent and configuration to the device and sets up autostart. Run it once in a terminal; it asks for the device\'s SSH and sudo password.',
      'Display live': 'Display live',
      'Neu lesen': 'Read again',
      'Bestimmt, welche Steuerung angeboten wird.': 'Determines which controls are offered.',
      'Änderungen hier gelten nach „Speichern“.': 'Changes here apply after "Save".',
      'Gerät entfernen': 'Remove device',
      'Entfernt Einstellungen und Erkennung des Geräts. Ist es verbunden, meldet es sich neu an.': 'Removes the device\'s settings and detection. If it is connected, it registers again.',
      'Entfernen fehlgeschlagen.': 'Removing failed.',
      'Entfernen fehlgeschlagen:': 'Removing failed:',
      'Gerät „{n}“ entfernt': 'Device "{n}" removed',
      '„{n}“ entfernen? Typ, Betriebsmodus und Zoom dieses Geräts gehen verloren.': 'Remove "{n}"? Type, operating mode and zoom of this device are lost.',
      '„{n}“ komplett neu starten? Das dauert etwa eine Minute.': 'Restart "{n}" completely? This takes about a minute.',
      'Neu starten': 'Restart',
      'TbViewer einrichten': 'Set up TbViewer',
      'Installieren': 'Install',
      'Geräteprotokoll per ADB als Datei laden': 'Download the device log as a file via ADB',
      'zeigt Panel': 'shows panel',
      'zuletzt gesehen vor 1 Tag': 'last seen 1 day ago',
      'zuletzt gesehen vor {n} Tagen': 'last seen {n} days ago',
      'Offline': 'Offline',
      'Seit mehr als 7 Tagen offline entfernen': 'Remove devices offline for more than 7 days',
      'Nichts wird automatisch gelöscht. Vor dem Entfernen siehst du die Namen, danach kannst du es rückgängig machen.': 'Nothing is deleted automatically. You see the names before removing and can undo afterwards.',
      'Alte Geräte entfernen': 'Remove old devices',
      'Diese Geräte waren seit mehr als 7 Tagen nicht online. Sie werden entfernt:': 'These devices have not been online for more than 7 days. They will be removed:',
      'Du kannst es danach 10 Sekunden lang rückgängig machen.': 'You can undo this for 10 seconds afterwards.',
      '1 Gerät entfernen': 'Remove 1 device',
      '{n} Geräte entfernen': 'Remove {n} devices',
      '1 Gerät entfernt': '1 device removed',
      '{n} Geräte entfernt': '{n} devices removed',
      // Kritik 0.20.7: Speicherleiste, Nachtmodus, Aenderungsliste, Kategorie-Farben
      'Verwerfen': 'Discard',
      'Nicht gespeichert.': 'Not saved.',
      'Miniserver-Voreinstellung übernehmen': 'Use Miniserver preset',
      'Farbverlauf Hintergrund': 'Gradient background',
      'Farbverlauf Uhrzeit': 'Gradient time',
      'Kachelname': 'Tile name',
      'Statuszeile': 'Status line',
      'Wettervorschau': 'Weather forecast',
      'Kachel-Schatten': 'Tile shadow',
      'Kategorie-Farbe': 'Category colour',
      'Alarm-Ton': 'Alarm sound',
      'Tabs (Auswahl/Reihenfolge)': 'Tabs (selection/order)',
      'Tab-Symbole': 'Tab icons',
      'Favoriten': 'Favorites',
      'Kachel-Reihenfolge': 'Tile order',
      'Zustandsfarben': 'State colours',
      'Zustands-Ampel an/aus': 'State traffic light on/off',
      'Diese Kategorie auf neutral zurücksetzen': 'Reset this category to neutral',
      'Kursiv': 'Italic',
      'OK': 'OK',
      'z. B. Pacifico, cursive': 'e.g. Pacifico, cursive',
    }
  };

  function detect() {
    try { var s = localStorage.getItem('lp_ui_lang'); if (s && (s === 'de' || CAT[s])) return s; } catch (e) {}
    var n = (navigator.language || 'de').toLowerCase().split('-')[0];
    return (n === 'de' || CAT[n]) ? n : 'de';
  }

  var LANG = detect();

  function T(s) {
    if (s == null) return s;
    if (LANG === 'de') return s;
    var m = CAT[LANG];
    return (m && m[s] != null) ? m[s] : s;
  }

  function apply(root) {
    root = root || document;
    root.querySelectorAll('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n') || el.textContent.trim();
      if (k) el.textContent = T(k);
    });
    root.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
      var k = el.getAttribute('data-i18n-ph') || el.getAttribute('placeholder') || '';
      if (k) el.setAttribute('placeholder', T(k));
    });
    // Gemischter Inhalt (Tags wie <b>, <code>): Schluessel = innerHTML (serialisiert)
    root.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var k = el.innerHTML.trim();
      var t = T(k);
      if (t !== k) el.innerHTML = t;
    });
    root.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      var k = el.getAttribute('data-i18n-title'); if (k) el.setAttribute('title', T(k));
    });
  }

  function mountSwitcher() {
    var host = document.querySelector('[data-langsel]');
    if (!host) return;
    var sel = document.createElement('select');
    sel.className = 'langsel';
    sel.setAttribute('aria-label', T('Sprache'));
    sel.title = T('Sprache');
    LANGS.forEach(function (l) {
      var o = document.createElement('option');
      o.value = l[0]; o.textContent = l[1];
      if (l[0] === LANG) o.selected = true;
      sel.appendChild(o);
    });
    sel.onchange = function () {
      try { localStorage.setItem('lp_ui_lang', sel.value); } catch (e) {}
      // Konfiguration: Sprache auch fuer Datum/Uhr der Panels uebernehmen, dann neu laden
      var p = (typeof window.syncPanelLang === 'function') ? window.syncPanelLang(sel.value) : null;
      Promise.resolve(p).then(function () { location.reload(); }, function () { location.reload(); });
    };
    host.appendChild(sel);
    // Kuerzel fuer die eingeklappte Seitenleiste (nur dort per CSS sichtbar)
    var ab = document.createElement('span');
    ab.className = 'langab'; ab.hidden = true; ab.setAttribute('aria-hidden', 'true');
    ab.textContent = LANG.toUpperCase();
    host.appendChild(ab);
  }

  // ---- Auto-Uebersetzer fuer JS-generierte Seiten (z.B. /config) ----
  // Uebersetzt nur BLATT-Elemente (reiner Text, keine Kind-Elemente) der
  // angegebenen Chrome-Selektoren und nur, wenn es eine Uebersetzung gibt
  // (sonst bleibt der deutsche Text). Miniserver-Namen sind nicht im Katalog
  // -> bleiben unangetastet. Reagiert per MutationObserver auf Neu-Rendern.
  var _sel = null, _pending = false;

  function applyChrome(root) {
    if (!_sel) return;
    (root || document).querySelectorAll(_sel).forEach(function (el) {
      if (el.children.length) return;             // nur reine Textknoten
      var k = (el.textContent || '').trim();
      if (!k) return;
      var t = T(k);
      if (t !== k) el.textContent = t;            // nur bei echter Uebersetzung schreiben
    });
  }

  function _schedule() {
    if (_pending) return;
    _pending = true;
    var raf = window.requestAnimationFrame || function (f) { setTimeout(f, 16); };
    raf(function () { _pending = false; applyChrome(document); });
  }

  function autoChrome(selectors) {
    _sel = selectors;
    applyChrome(document);
    try {
      new MutationObserver(_schedule).observe(document.body,
        { childList: true, subtree: true, characterData: true });
    } catch (e) {}
  }

  // Global verfuegbar fuer die Seiten-Skripte (T fuer dynamisch erzeugte Texte).
  window.I18N = { lang: LANG, t: T, apply: apply, applyChrome: applyChrome,
                  autoChrome: autoChrome, langs: LANGS };
  window.T = T;

  document.addEventListener('DOMContentLoaded', function () {
    document.documentElement.setAttribute('lang', LANG);
    mountSwitcher();
    apply(document);
  });
})();
