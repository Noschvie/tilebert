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
      // Panel-Assistent (3 Schritte)
      'Wie das Standard-Panel': 'Like the default panel',
      'Uhr, Wetter und Kalender': 'Clock, weather and calendar',
      'Uhr und Wetter': 'Clock and weather',
      'Uhr, Wetter und Kamera': 'Clock, weather and camera',
      'Uhr und Kamera': 'Clock and camera',
      'Uhr und Kalender': 'Clock and calendar',
      'Leer': 'Empty',
      'Ein Raum': 'One room',
      'Eingaben verwerfen?': 'Discard your input?',
      'Das Panel ist noch nicht angelegt. Deine Eingaben gehen verloren.': 'The panel has not been created yet. Your input will be lost.',
      'Weiter bearbeiten': 'Keep editing',
      'Schritt {n} von 3': 'Step {n} of 3',
      'z. B. Flur': 'e.g. Hallway',
      'Adresse ändern': 'Change address',
      'Kleinbuchstaben, Ziffern und Bindestrich. Leer lassen für die automatische Adresse.': 'Lowercase letters, digits and hyphens. Leave empty for the automatic address.',
      'Welches Gerät zeigt das Panel?': 'Which device shows the panel?',
      'Dashboard wie das Standard-Panel': 'Dashboard like the default panel',
      'Dashboard mit Uhr und Wetter': 'Dashboard with clock and weather',
      'Dashboard mit Uhr, Wetter und Kalender': 'Dashboard with clock, weather and calendar',
      'Was soll das Panel zeigen?': 'What should the panel show?',
      'Empfohlen': 'Recommended',
      'dazu die Tabs Favoriten und Räume.': 'plus the tabs Favorites and Rooms.',
      'Erst den Miniserver verbinden, dann stehen Räume zur Wahl.': 'Connect the Miniserver first, then rooms are available.',
      'Dashboard und ein Tab mit den Kacheln eines Raums.': 'Dashboard and one tab with the tiles of a room.',
      'Nichts vorbelegt. Du baust alles selbst.': 'Nothing preset. You build everything yourself.',
      'Weitere Optionen': 'More options',
      'Das Design der anderen Panels änderst du unter System → Alle Panels.': 'You change the design of the other panels under System → All panels.',
      'von 4': 'of 4',
      'Das Dashboard wird vom Standard-Panel kopiert. Spätere Änderungen dort gelten hier nicht.': 'The dashboard is copied from the default panel. Later changes there do not apply here.',
      'Adresse': 'Address',
      'Danach': 'Afterwards',
      'Gerät jetzt einrichten': 'Set up a device now',
      'Öffnet Geräte → Hinzufügen mit diesem Panel.': 'Opens Devices → Add with this panel.',
      'Bekanntes Gerät zuordnen': 'Assign a known device',
      'Es ist noch kein Gerät bekannt.': 'No device is known yet.',
      'Das Gerät zeigt dann dieses Panel.': 'The device then shows this panel.',
      'Gerät wählen …': 'Choose a device …',
      'Später': 'Later',
      'Das Panel öffnet sich zum Bearbeiten.': 'The panel opens for editing.',
      'Gespeichert wird nur dieses Panel.': 'Only this panel is saved.',
      'Weitere ungespeicherte Änderungen bleiben offen und lassen sich danach wie gewohnt speichern.': 'Other unsaved changes stay open and can be saved afterwards as usual.',
      'Panel anlegen und speichern': 'Create and save panel',
      'Raum wählen …': 'Choose a room …',
      'Wird gespeichert …': 'Saving …',
      'Adresse:': 'Address:',
      'Die Adresse braucht Buchstaben oder Ziffern.': 'The address needs letters or digits.',
      'Diese Adresse ist schon vergeben.': 'This address is already taken.',
      'Gib dem Panel einen Namen.': 'Give the panel a name.',
      'Der Name braucht mindestens einen Buchstaben oder eine Ziffer.': 'The name needs at least one letter or digit.',
      'Wähle mindestens einen Tab.': 'Choose at least one tab.',
      'Wähle einen Raum.': 'Choose a room.',
      'Wähle ein Gerät.': 'Choose a device.',
      'Panel „{n}“ angelegt und gespeichert': 'Panel “{n}” created and saved',
      'Panel „{n}“ angelegt, gespeichert und „{d}“ zugeordnet': 'Panel “{n}” created, saved and assigned to “{d}”',
      'Panel „{n}“ gespeichert. Die Zuordnung zu „{d}“ hat nicht geklappt. Ordne es unter Geräte zu.': 'Panel “{n}” saved. Assigning it to “{d}” did not work. Assign it under Devices.',
      'Name und Gerät': 'Name and device',
      'Zusammenfassung': 'Summary',
      '960 × 480, zwei Hälften': '960 × 480, two halves',
      'Tablet oder 4″-Display': 'Tablet or 4″ display',
      '480 × 480, eine Hälfte': '480 × 480, one half',
      'hochkant, Tabs unten': 'portrait, tabs at the bottom',
      'Zentral': 'Central',
      'Wie die anderen Panels': 'Like the other panels',
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
      'Der Name darf nur Buchstaben, Ziffern, Leerzeichen sowie - _ . enthalten.': 'The name may only contain letters, digits, spaces and - _ .',
      'Ungültiger SSH-Benutzer.': 'Invalid SSH user.',
      'Ungültige IP-Adresse.': 'Invalid IP address.',
      'Ungültige Serveradresse.': 'Invalid server address.',
      'Adresse geändert – bitte Passwort neu eingeben': 'Address changed – please enter the password again',
      'kein gültiges JSON': 'not valid JSON',
      // Werte groß auf Kacheln
      'Werte groß': 'Large values',
      // Geraete-Detail: Effekte
      'Mittel': 'Medium',
      'Viel': 'High',
      'Mittel: nur Überblendungen. Kontrast: Schatten an Kacheln. Lichtszenen: Symbol in Lichtfarbe. Werte groß: Messwerte groß, je Kachel änderbar.':
        'Medium: cross-fades only. Contrast: shadow on tiles. Light scenes: icon in light colour. Large values: measurements shown large, changeable per tile.',
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
      'Standard ist der Loxone-Wetterdienst des Miniservers.': 'The default is the Miniserver\'s Loxone weather service.',
      'Loxone-Wetterdienst': 'Loxone weather service',
      'Kein Loxone-Wetterdienst': 'No Loxone weather service',
      'aktiv': 'active',
      'wartet auf Daten': 'waiting for data',
      'Daten des Wetterdienstes nicht verwertbar': 'Weather service data not usable',
      'Ohne Wetterdienst gibt es kein Wetter. Du kannst Open-Meteo einschalten.':
        'Without a weather service there is no weather. You can switch on Open-Meteo.',
      'Open-Meteo verwenden': 'Use Open-Meteo',
      'Wetter aus dem Internet, kostenlos und ohne Konto. Aus: keine Anfrage ins Internet.':
        'Weather from the internet, free and without an account. Off: no request to the internet.',
      'Gilt für die Sonnenzeiten.': 'Applies to the sun times.',
      'Gilt für Sonnenzeiten und Open-Meteo.': 'Applies to sun times and Open-Meteo.',
      'Liefert': 'Provides',
      'Fehlt': 'Missing',
      'Temperatur': 'Temperature',
      'Gefühlt': 'Feels like',
      'Luftfeuchte': 'Humidity',
      'Wind': 'Wind',
      'Luftdruck': 'Air pressure',
      'Regenmenge': 'Rainfall',
      'Wetterlage': 'Conditions',
      'Hoch/Tief': 'High/low',
      'Stundenverlauf': 'Hourly',
      'Sonneneinstrahlung': 'Solar radiation',
      'Regenwahrscheinlichkeit': 'Chance of rain',
      'UV-Index': 'UV index',
      'Sonnenzeiten heute:': 'Sun times today:',
      'vom Miniserver': 'from the Miniserver',
      'berechnet aus dem Standort des Miniservers': 'calculated from the Miniserver\'s location',
      'berechnet aus deinem Standort': 'calculated from your location',
      'aus dem Wetter': 'from the weather',
      'Keine Sonnenzeiten: Standort fehlt.': 'No sun times: location missing.',
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

      // ---- /config (Panel-Editor) ----
      'Titel': 'Title',
      'Räume': 'Rooms',
      'Kategorien': 'Categories',
      'Panel löschen': 'Delete panel',
      'Wirklich löschen?': 'Really delete?',
      'Das Panel wird aus der Liste entfernt. Wirksam nach dem Speichern, bis dahin mit „Rückgängig“ zurückholbar.': 'The panel is removed from the list. Takes effect on save; until then you can bring it back with "Undo".',
      'Türstationen werden vom Miniserver gemeldet. Hier legst du Video, Ton und Klingelziele je Türstation fest.': 'Door stations are reported by the Miniserver. Set video, sound and ring targets for each door station here.',
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
      'Nichts tun': 'Do nothing',
      'Automatisch (Lichtsensor)': 'Automatic (light sensor)',
      'Systemeinstellung': 'System setting',
      'Sensoren': 'Sensors',
      'Präsenzerkennung': 'Presence detection',
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
      'Ohne Namen': 'Unnamed',
      'Ohne Raum': 'Without room',
      'Panel „': 'Panel “',
      'Panels': 'Panels',
      'Passend zum Design': 'Matches the design',
      'Port': 'Port',
      'Quelle: System → Kalender.': 'Source: System → Calendar.',
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
      'Leer: Standort des Miniservers.': 'Empty: location of the Miniserver.',
      'Video-Streams (MJPEG) von Loxone-Türstationen und eigenen Überwachungskameras. Alle erscheinen im Widget „Kamera“.':
        'Video streams (MJPEG) from Loxone door stations and your own surveillance cameras. All of them appear in the "Camera" widget.',
      'Türstationen aus Loxone': 'Door stations from Loxone',
      'Überwachungskameras mit MJPEG-Stream, z. B. http://192.168.1.60/mjpg/video.mjpg. Der Server holt das Bild einmal ab und gibt es an alle Panels weiter.':
        'Surveillance cameras with an MJPEG stream, e.g. http://192.168.1.60/mjpg/video.mjpg. The server fetches the image once and passes it on to all panels.',
      'Kamera hinzufügen': 'Add camera',
      'Geräte suchen …': 'Searching for devices …',
      'Bis es einen Namen hat, steht es unter „Alle Geräte“ → „Ohne Namen“. Dort vergibst du ihn.':
        'Until it has a name, it is listed under "All devices" → "Unnamed". You assign the name there.',
      'Aus Loxone, nicht löschbar': 'From Loxone, cannot be removed',
      'Audioserver': 'Audioserver',
      'Zeigt Cover, Titel und Favoriten live vom Audioserver. Den Test-Ton findest du unter System → Diagnose.':
        'Shows cover, title and favourites live from the Audioserver. You find the test tone under System → Diagnostics.',
      'Live-Daten von {n}': 'Live data from {n}',
      'startet': 'starting',
      'nicht erreichbar': 'not reachable',
      'Zeigt Termine aus iCal-Abos im Dashboard und in den Kalender-Widgets aller Panels.':
        'Shows appointments from iCal subscriptions in the dashboard and in the calendar widgets of all panels.',
      'Abo-Link (webcal:// oder https://) aus iCloud (Kalender → Teilen → Öffentlicher Kalender), Google oder einem anderen Dienst. tilebert liest nur und braucht keinen Login. Mehrere Kalender erscheinen gemeinsam in einer Liste.':
        'Subscription link (webcal:// or https://) from iCloud (Calendar → Share → Public calendar), Google or another service. tilebert only reads and needs no login. Several calendars appear together in one list.',
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
      'Nacht von Sonnenuntergang bis Sonnenaufgang. Die Zeiten kommen vom Miniserver oder werden aus seinem Standort berechnet.':
        'Night from sunset to sunrise. Times come from the Miniserver or are calculated from its location.',
      'Bitte wählen':
        'Please choose',
      'Bitte einen Betriebsmodus wählen.':
        'Please choose an operating mode.',
      'Bitte Uhrzeit von und bis angeben.':
        'Please enter a start and end time.',
      'Display & Nacht':
        'Display & night',
      'Abdunkeln, Präsenzerkennung, Helligkeit, Töne und Effekte stellst du je Gerät ein: Geräte → Alle Geräte.':
        'Dimming, presence detection, brightness, sounds and effects are set per device: Devices → All devices.',
      'Nacht-Kamera':
        'Night camera',
      'Das Dashboard bleibt immer der Startpunkt; nur Wischen oder Tippen führt zu den Tabs.':
        'The dashboard is always the starting point; only swiping or tapping leads to the tabs.',
      '„{n}“ entfernen? Typ, Einstellungen und Zoom dieses Geräts gehen verloren.':
        'Remove “{n}”? Type, settings and zoom of this device are lost.',
      '{n} Min.':
        '{n} min',
      '{n} Std.':
        '{n} h',
      '1 Tag':
        '1 day',
      '{n} Tagen':
        '{n} days',
      'Alarm aus':
        'Alarm off',
      'offline seit':
        'offline since',
      'nie':
        'never',
      'Typ ändern':
        'Change type',
      'Gerät offline. Änderungen gelten beim nächsten Verbinden.':
        'Device offline. Changes apply the next time it connects.',
      'Lade …':
        'Loading …',
      'Einstellungen nicht verfügbar.':
        'Settings not available.',
      'Am Gerät':
        'On the device',
      'Zahnrad für die Einstellungen am Gerät zeigen':
        'Show a gear for the on-device settings',
      'Die Einstellungen öffnen auch mit fünf schnellen Tipps. Nicht am Handy.':
        'The settings also open with five quick taps. Not on phones.',
      'Zahnrad am Gerät':
        'Gear on device',
      'Auf Standard zurück':
        'Back to default',
      'geändert':
        'changed',
      'Töne':
        'Sounds',
      'Nachts':
        'At night',
      'Abdunkeln':
        'Dimming',
      'Helligkeit nachts':
        'Night brightness',
      'Nachts startet das Video erst, wenn jemand kommt.':
        'At night the video only starts when someone comes.',
      'Auto':
        'Auto',
      'Fest':
        'Fixed',
      'Helligkeit min. / max.':
        'Brightness min. / max.',
      'Helligkeit fest':
        'Fixed brightness',
      'Erweitert: Zoom, Display-Treiber':
        'Advanced: zoom, display driver',
      'Neustart':
        'Restart',
      'Aktionen':
        'Actions',
      'Gerät nicht gefunden.':
        'Device not found.',
      'Alarm ausschalten?':
        'Turn alarm off?',
      'Ton aus – das Vollbild bleibt.':
        'Sound off – the full screen stays.',
      'auf {n} %': 'to {n} %',
      'Nicht ausgewählt': 'Not selected',
      'Kein Melder erreicht': 'No detector reached',
      'Ausschalten':
        'Turn off',
      'Alarm bleibt an':
        'Keep alarm on',
      'An der IP-Adresse erkannt. Mit einem Namen bleibt das Gerät dauerhaft in der Liste.':
        'Recognized by IP address. With a name the device stays in the list.',
      'Wann Nacht ist, gilt für alle Panels. Das Abdunkeln stellst du je Gerät ein: Geräte → Alle Geräte.':
        'When it is night applies to all panels. Dimming is set per device: Devices → All devices.',
      'Hinzufügen':
        'Add',
      'Hinweis':
        'Notice',
      'Klingel':
        'Doorbell',
      'Alarm':
        'Alarm',
      'Tipp':
        'Tap',
      'Erweitert':
        'Advanced',
      'Tabs & Dashboard': 'Tabs & dashboard',
      'Türstationen aus Loxone und eigene Kameras für das Widget „Kamera“.': 'Door stations from Loxone and your own cameras for the “Camera” widget.',
      'Öffnen': 'Open',
      'Panel in neuem Tab öffnen': 'Open panel in a new tab',
      'Alles, was tilebert vom Miniserver übernimmt: Zugang, Befehle, Wetter und Audio.':
        'Everything tilebert takes from the Miniserver: access, commands, weather and audio.',
      'Kein Audioserver gefunden': 'No audio server found',
      'Feiertage': 'Holidays',
      'Kalender-Anzeige': 'Calendar display',
      'Bausteintypen': 'Block types',
      'Gilt für alle Panels. Einzelne Panels können unter „Aussehen“ abweichen. Datum und Uhrzeit folgen der Sprache der Konfiguration (Seitenleiste).':
        'Applies to all panels. Individual panels can differ under "Appearance". Date and time follow the language of the configuration (sidebar).',
      'TbViewer schaltet das Display nie aus. Berührung, Annäherung, Klingel, Wecker und Nachrichten stellen die normale Helligkeit wieder her.':
        'TbViewer never turns the display off. Touch, proximity, doorbell, alarm clock and messages restore normal brightness.',
      'Nach dieser Zeit ohne Berührung zeigt das Panel das Dashboard.':
        'After this time without touch the panel shows the dashboard.',
      'Seite neu laden':
        'Reload page',
      'Gegen Einfrieren. Lädt nur neu, wenn das Dashboard offen ist.':
        'Prevents freezing. Only reloads while the dashboard is open.',
      'Wann Nacht ist, legst du unter System → Alle Panels → Nachtmodus fest.':
        'You set when it is night under System → All panels → Night mode.',
      'Nachts um 3 Uhr':
        'At 3 am',
      'Alle {n} Stunden':
        'Every {n} hours',
      'Nie':
        'Never',
      'Alles zur Fehlersuche: Server-Protokoll, Geräteprotokolle und Test-Ton.':
        'Everything for troubleshooting: server log, device logs and test tone.',
      'Server-Protokoll': 'Server log',
      'Ausführliches Protokoll schreiben': 'Write detailed log',
      'Der Server protokolliert ausführlich: Miniserver-Verbindung, empfangene Werte pro Minute, verbundene Geräte, Verbindungsabbrüche und Fehler der Geräte. Nur bei Bedarf einschalten; die Größe ist begrenzt und ältere Einträge werden überschrieben.':
        'The server logs in detail: Miniserver connection, values received per minute, connected devices, connection drops and device errors. Only switch it on when needed; the size is limited and older entries are overwritten.',
      'Geräteprotokolle': 'Device logs',
      'Für Android-Geräte (z. B. Shelly Wall Display), die per adb über WLAN erreichbar sind. Die Textdatei enthält Sensoren, Systemprotokoll, Speicher und CPU und verändert nichts am Gerät. Hol sie direkt nach einem Hänger: Das Android-Protokoll reicht nur einige Stunden zurück.':
        'The text file contains sensors, system log, memory and CPU and changes nothing on the device. Fetch it right after a hang: the Android log only goes back a few hours.',
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
      'Der Ton kommt aus dem Browser. Browser geben Ton erst nach einer Berührung frei: Tippe das Panel nach dem Laden einmal an, sonst zeigt das Vollbild „Ton gesperrt – Bildschirm antippen“. Testen kannst du ihn unter System → Diagnose → Test-Ton.':
        'The sound comes from the browser. Browsers only allow sound after a touch: tap the panel once after loading, otherwise the full screen shows "Ton gesperrt – Bildschirm antippen". You can test it under System → Diagnostics → Test tone.',
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
      'Je Kategorie eine <b>Aktiv-</b> und eine <b>OK-Farbe</b> für Hintergrund und Rahmen der Kachel. Gilt für alle Panels. ◐ an: Die Kachel zeigt den Zustand als Ampel (z. B. Alarm rot/grün, Tor gelb/grün). ◐ aus: neutral. Messwerte bleiben immer neutral.':
        'One <b>active</b> and one <b>OK colour</b> per category for the background and border of the tile. Applies to all panels. ◐ on: the tile shows the state as a traffic light (e.g. alarm red/green, gate yellow/green). ◐ off: neutral. Measured values always stay neutral.',
      'Start-Adresse:': 'Start address:',
      'Format': 'Format',
      'Legt fest, wie Tabs und Dashboard aufgebaut sind: eine Hälfte (480 × 480), zwei Hälften nebeneinander (960 × 480) oder hochkant für Handys (Tabs unten, als App nutzbar über „Zum Home-Bildschirm“).':
        'Defines how tabs and dashboard are laid out: one half (480 × 480), two halves side by side (960 × 480), or portrait for phones (tabs at the bottom, usable as an app via "Add to Home Screen").',
      'Eine Hälfte': 'One half',
      'Zwei Hälften': 'Two halves',
      'Hochkant': 'Portrait',
      'Optimiert für Handys': 'Optimized for phones',
      'z. B. 390 × 844': 'e.g. 390 × 844',
      'z. B. Shelly Wall Display X1i und andere 4″-Displays': 'e.g. Shelly Wall Display X1i and other 4″ displays',
      'z. B. Shelly Wall Display X2i, Tablets im Querformat und vergleichbare Geräte': 'e.g. Shelly Wall Display X2i, tablets in landscape and similar devices',
      'Start-Adresse': 'Start address',
      'Diese Adresse trägst du am Gerät ein.': 'You enter this address on the device.',
      'Hauptmenü': 'Main menu',
      'Du hast tilebert über localhost geöffnet. Am Gerät trägst du die Adresse des Servers im Heimnetz ein.': 'You opened tilebert via localhost. On the device you enter the server\'s home network address.',
      'Dashboard mit {x}, dazu die Tabs Favoriten und Räume.': 'Dashboard with {x}, plus the tabs Favorites and Rooms.',
      'Wie ein vorhandenes Panel': 'Like an existing panel',
      'Kopiert Tabs, Dashboard und Design.': 'Copies tabs, dashboard and design.',
      'Wie {n}: Tabs, Dashboard und Design': 'Like {n}: tabs, dashboard and design',
      'Panel wählen …': 'Choose panel …',
      'Dieses Panel hat eine andere Form. Prüfe das Dashboard danach.': 'This panel has a different shape. Check the dashboard afterwards.',
      'Wähle ein Panel.': 'Choose a panel.',
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
      'Nachts Kamerabild nur bei Präsenz zeigen': 'At night show camera image only on presence',
      'Die Reihenfolge entspricht dem Panel: <b>Dashboard</b> links, Tabs rechtsbündig, <b>Tab 1</b> ganz rechts. Zum Umsortieren Tabs ziehen.':
        'The order matches the panel: <b>dashboard</b> on the left, tabs right-aligned, <b>tab 1</b> at the far right. Drag tabs to reorder them.',
      'Bis zu <b>4 Tabs</b>. Zum Bearbeiten Tab antippen. Typen: <b>Frei</b> (du belegst selbst), <b>Raum</b>, <b>Kategorie</b> und <b>Zentral</b> (aus Loxone vorbefüllt, danach anpassbar, neue Bausteine kommen hinten dazu) sowie <b>Übersichten</b> (alle Räume oder Kategorien wie in der Loxone-App).':
        'Up to <b>4 tabs</b>. Tap a tab to edit it. Types: <b>Free</b> (you fill it yourself), <b>Room</b>, <b>Category</b> and <b>Central</b> (prefilled from Loxone, adjustable afterwards, new blocks are added at the end) and <b>Overviews</b> (all rooms or categories like in the Loxone app).',
      'Auf diesem Panel überall ausgeblendet (Tabs, Räume, Kategorien). Antippen blendet sie wieder ein.':
        'Hidden everywhere on this panel (tabs, rooms, categories). Tap to show them again.',
      'Gilt nur für dieses Panel. „Wie Standard“ übernimmt System → Alle Panels.':
        'Applies to this panel only. "Like default" takes over System → All panels.',
      'Die Farben kommen aus dem Miniserver: Fenster offen gelb, Alarm oder Rauch ausgelöst rot, Alarm scharf blau. Statusbausteine zeigen ihre Farbe aus Loxone Config.':
        'The colours come from the Miniserver: window open yellow, alarm or smoke triggered red, alarm armed blue. Status blocks show their colour from Loxone Config.',
      'Mehrere Haken sind möglich. Ohne Haken schließt nur ein Tipp auf eine freie Stelle das Dashboard.':
        'Several ticks are possible. Without ticks, only a tap on a free spot closes the dashboard.',
      'Tageslicht: morgens leicht hell, mittags hell, abends dunkler, nachts dunkel (Sonnenzeiten vom Miniserver). Außentemperatur: kalt blau, mild grün, warm gelb, heiß orange bis rot. Ohne Wetterdaten bleiben die festen Farben.':
        'Daylight: slightly bright in the morning, bright at noon, darker in the evening, dark at night (sun times from the Miniserver). Outside temperature: cold blue, mild green, warm yellow, hot orange to red. Without weather data the fixed colours stay.',
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
      'Haken zeigt die Kamera an, Ziehen ändert die Reihenfolge. Die erste Kamera startet zuerst; am Panel wechselst du per Zahlenknopf.':
        'A tick shows the camera, dragging changes the order. The first camera starts first; on the panel you switch with the number buttons.',
      'Ohne Bedienung wechselt das Widget zurück zu Kamera 1. 0 = aus.':
        'Without interaction the widget switches back to camera 1. 0 = off.',
      'Noch keine Kamera mit Video-Adresse. Trage sie unter System → Kameras ein.':
        'No camera with a video address yet. Enter one under System → Cameras.',
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
      'Welche Tabs? (höchstens 4)': 'Which tabs? (at most 4)',
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
      'MP3, OGG, WAV, M4A oder AAC, höchstens 5 MB. Wird sofort hochgeladen. „Klingeln testen“ klingelt auf allen Geräten, die das unter System → Diagnose → Test-Ton gewählte Panel zeigen.':
        'MP3, OGG, WAV, M4A or AAC, 5 MB at most. Uploaded immediately. "Test ring" rings on all devices that show the panel chosen under System → Diagnostics → Test tone.',
      'Lädt hoch …': 'Uploading …',
      'Eigene Datei hochgeladen': 'Own file uploaded',
      'Noch kein Kalender eingetragen.': 'No calendar entered yet.',
      'Den Grund nennt der jeweilige Kalender.': 'Each calendar states its reason.',
      'Kein Standort eingetragen.': 'No location entered.',
      'Tippe oder ziehe ins Bild, um den wichtigen Bereich zu wählen. Die Rahmen zeigen, was Popup und Widget davon anzeigen. Ohne Zoom lässt sich nur der Teil verschieben, den das breitere Format sonst abschneidet.':
        'Tap or drag in the image to choose the important area. The frames show what popup and widget display of it. Without zoom you can only shift the part that the wider format would otherwise cut off.',
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
      'Kein Gerät mit adb gefunden. Android-Geräte erscheinen hier, sobald der Gerätetyp gesetzt ist (Geräte → Alle Geräte) und adb über WLAN läuft.':
        'No device with adb found. Android devices appear here once the device type is set (Devices → All devices) and adb over WLAN is running.',
      'Server-Protokoll löschen? Das lässt sich nicht rückgängig machen.': 'Delete the server log? This cannot be undone.',
      'Panel': 'Panel',
      'Browser starten': 'Start browser',
      'Browser beenden': 'Stop browser',
      'Browser neu laden': 'Reload browser',
      'Display ausschalten': 'Switch display off',
      'Display einschalten': 'Switch display on',
      'Voraussetzung: ADB über WLAN ist am Gerät eingeschaltet und für diesen Server freigegeben.':
        'Requirement: ADB over WLAN is switched on at the device and approved for this server.',
      'installiert. Update verfügbar.': 'installed. Update available.',
      'Als Panel-Anzeige einrichten': 'Set up as panel display',
      'installiert, aber nicht als Panel-Anzeige aktiv': 'installed, but not active as panel display',
      'TbViewer: Status unbekannt. Das Gerät ist per adb nicht erreichbar.':
        'TbViewer: status unknown. The device cannot be reached via adb.',
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
      'Lege in Loxone Config je Betriebsmodus einen virtuellen HTTP-Ausgang mit dieser Adresse an. Am Ende steht der Modusname:':
        'In Loxone Config, create a virtual HTTP output with this address for each operating mode. The mode name goes at the end:',
      'Übernehmen': 'Apply',
      'Name fehlt. Gib einen Namen ein.': 'Name missing. Enter a name.',
      'Feste Geräte-ID. Bleibt gleich, auch wenn sich die IP-Adresse ändert.':
        'Fixed device ID. Stays the same even if the IP address changes.',
      'Ohne Treiber „keine“ wählen. Dann schaltet das Panel das Display selbst.':
        'Without a driver, choose "none". Then the panel switches the display itself.',
      'Noch kein Gerät bekannt. Es erscheint hier, sobald es das Panel mit Namen öffnet oder ein Agent läuft.':
        'No device known yet. It appears here as soon as it opens the panel with a name or an agent is running.',
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
      '“ mit einer Hälfte. Dieses Gerät hat zwei Hälften und braucht das Format „Zwei Hälften“.':
        '" with one half. This device has two halves and needs the format "Two halves".',
      '“ mit zwei Hälften. Dieses Gerät hat eine Hälfte und braucht das Format „Eine Hälfte“.':
        '" with two halves. This device has one half and needs the format "One half".',
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
      'Gespeichert, aber nicht verbunden.': 'Saved, but not connected.',
      'Miniserver nicht erreichbar. Adresse und Port prüfen': 'Miniserver not reachable. Check address and port',
      'Trotzdem speichern': 'Save anyway',
      'Anmeldung abgelehnt: Benutzer oder Kennwort falsch': 'Login rejected: wrong user or password',
      'Zertifikat des Miniservers nicht vertrauenswürdig (Zertifikat prüfen abschalten oder CA hinterlegen)': 'Miniserver certificate not trusted (turn off certificate check or install the CA)',
      'Miniserver antwortet nicht (Zeitüberschreitung). Adresse und Port prüfen': 'Miniserver does not respond (timeout). Check address and port',
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
      'Querformat, zwei Hälften nebeneinander (Panel-Format „Zwei Hälften“).':
        'Landscape, two halves side by side (panel format "Two halves").',
      'TbViewer: Gerät hinzufügen → Shelly oder Android-Tablet.': 'TbViewer: Add device → Shelly or Android tablet.',
      'Dashboard und Abdunkeln übernimmt TbViewer, die Helligkeit regelt der Lichtsensor.':
        'TbViewer handles the dashboard and dimming, the light sensor controls the brightness.',
      '720 × 720: Zoom „Automatisch“ vergrößert das 480er-Raster auf den ganzen Schirm.':
        '720 × 720: zoom "Automatic" enlarges the 480 grid to the whole screen.',
      'Panel-Format „Eine Hälfte“.': 'Panel format "One half".',
      '480 × 480: passt 1:1, kein Zoom nötig. Panel-Format „Eine Hälfte“.':
        '480 × 480: fits 1:1, no zoom needed. Panel format "One half".',
      'TbViewer mit Start-Adresse inkl. ?device=… einrichten.': 'Set up TbViewer with the start address incl. ?device=…',
      'Hochformat: Zoom „Automatisch“ füllt die Breite. Panel-Format „Eine Hälfte“.':
        'Portrait: zoom "Automatic" fills the width. Panel format "One half".',
      '480 × 480: Referenzgröße, kein Zoom. Panel-Format „Eine Hälfte“.':
        '480 × 480: reference size, no zoom. Panel format "One half".',
      '480 × 480: Referenzgröße. Agent per SSH (Gerät hinzufügen → Linux-Gerät).':
        '480 × 480: reference size. Agent via SSH (Add device → Linux device).',
      '720 × 1280 quer: Zoom „Automatisch“, Panel-Format „Zwei Hälften“.':
        '720 × 1280 landscape: zoom "Automatic", panel format "Two halves".',
      'LAN/PoE: feste IP-Adresse im Router vergeben (für ADB).':
        'LAN/PoE: assign a fixed IP address in the router (for ADB).',
      'Querformat, Panel-Format „Zwei Hälften“; Zoom „Automatisch“ füllt den Schirm.':
        'Landscape, panel format "Two halves"; zoom "Automatic" fills the screen.',
      'Mit TbViewer lassen sich Display und Helligkeit steuern; die App startet nach einem Neustart nicht von selbst. Ohne sie hält die Seite den Schirm wach, bis die Leerlaufzeit abläuft.':
        'With TbViewer you can control display and brightness; the app does not start by itself after a reboot. Without it the page keeps the screen awake until the idle time runs out.',
      'Hochkant zeigt das Tablet nur eine Hälfte; unter 600 px Breite greift der Handy-Modus.':
        'In portrait the tablet shows only one half; below 600 px width the phone mode applies.',
      'Safari: Teilen → „Zum Home-Bildschirm“. Startet ohne Adressleiste als Vollbild-App (Start-Adresse mit ?device=…).':
        'Safari: Share → "Add to Home Screen". Starts without an address bar as a full-screen app (start address with ?device=…).',
      'Querformat, Panel-Format „Zwei Hälften“; Zoom „Automatisch“ füllt den Schirm (iPad mini ≈ 118 %).':
        'Landscape, panel format "Two halves"; zoom "Automatic" fills the screen (iPad mini ≈ 118 %).',
      'Ton (Klingel) erst nach einmaligem Antippen: iOS gibt Audio nur nach Berührung frei.':
        'Sound (doorbell) only after one tap: iOS only allows audio after a touch.',
      'Panel-Format „Hochkant“ (Tabs unten, volle Höhe); hochkant greift der Handy-Modus auch automatisch.':
        'Panel format "Portrait" (tabs at the bottom, full height); in portrait the phone mode also applies automatically.',
      'Die Fenstergröße bestimmt das Format; Zoom bei Bedarf manuell setzen.':
        'The window size determines the format; set the zoom manually if needed.',
      'Statusleiste: Anzeige je Baustein': 'Status bar: display per block',
      'Aus (feste Größe)': 'Off (fixed size)',
      'Automatisch (Bildschirm füllen)': 'Automatic (fill screen)',
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
      'Wähle zuerst den Gerätetyp.': 'First choose the device type.',
      'Shelly oder Android-Tablet': 'Shelly or Android tablet',
      'Wanddisplay, Tablet oder Handy mit der App TbViewer': 'Wall display, tablet or phone with the TbViewer app',
      'Safari, Chrome … Nur die Adresse nötig': 'Safari, Chrome … Only the address is needed',
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
      'Gerät entfernen': 'Remove device',
      'Entfernen fehlgeschlagen.': 'Removing failed.',
      'Gerät „{n}“ entfernt': 'Device "{n}" removed',
      '„{n}“ komplett neu starten? Das dauert etwa eine Minute.': 'Restart "{n}" completely? This takes about a minute.',
      'Neu starten': 'Restart',
      'TbViewer einrichten': 'Set up TbViewer',
      'Installieren': 'Install',
      'Offline': 'Offline',
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
      'Alarmbausteine': 'Alarm blocks',
      'Neue Alarmbausteine werden automatisch hinzugefügt und sind aktiv.': 'New alarm blocks are added automatically and switched on.',
      'Ein aktiver Baustein zeigt auf allen Geräten ein rotes Vollbild. Den Ton schaltest du je Gerät ein oder aus.': 'An active block shows a red full screen on all devices. You switch the sound on or off per device.',
      '„{n}“ zeigt dann auf keinem Gerät ein Vollbild.': '“{n}” will then show no full screen on any device.',
      'Ausnahmen für dieses Panel': 'Exceptions for this panel',
      '{n} abgewählt': '{n} deselected',
      'keine': 'none',
      'Abgewählte Bausteine zeigen auf Geräten mit diesem Panel kein Vollbild.': 'Deselected blocks show no full screen on devices with this panel.',
      'Löst ein Alarmbaustein aus, zeigt jedes Gerät ein rotes Vollbild mit <b>Stumm</b> und <b>Quittieren</b> (Rauchmelder) bzw. <b>Quittieren</b> und <b>Unscharf</b> (Alarmanlage). Die Tasten schalten sofort, abgesicherte Bausteine fragen den PIN ab. Welche Bausteine das sind, stellst du unter System → Loxone ein.': 'When an alarm block triggers, every device shows a red full screen with <b>Mute</b> and <b>Acknowledge</b> (smoke detector) or <b>Acknowledge</b> and <b>Disarm</b> (alarm system). The buttons act immediately; secured blocks ask for the PIN. You choose the blocks under System → Loxone.',
      'Klingelt an': 'Rings on',
      'Klingelt an: Auswahl': 'Rings on: selection',
      'Alle Wandgeräte': 'All wall devices',
      'Auswahl': 'Selection',
      'Handy / PC': 'Phone / PC',
      'Noch keine Geräte': 'No devices yet',
      'Klingelt nirgends': 'Rings nowhere',
      'Wandgeräte sind alle Geräte außer Handy und PC-Browser. Den Ton schaltest du je Gerät ein oder aus.': 'Wall devices are all devices except phones and PC browsers. You switch the sound on or off per device.',
      'Keine Türstation': 'No door station',
      'Kein Wecker': 'No alarm clock',
      '1 Melder': '1 detector',
      '{n} Melder': '{n} detectors',
      'Alle Hinweise': 'All notices',
      'Passwort fehlt. Gib es bei geänderter Adresse oder geändertem Benutzer neu ein.': 'Password missing. Enter it again if the address or user was changed.',
      'Adresse fehlt.': 'Address missing.',
      'Nur JPG, PNG oder WebP erlaubt.': 'Only JPG, PNG or WebP allowed.',
      'Bild zu groß. Höchstens 12 MB.': 'Image too large. 12 MB at most.',
      'Datei zu groß. Höchstens 5 MB.': 'File too large. 5 MB at most.',
      'Dateiformat nicht unterstützt. Erlaubt: MP3, OGG, WAV, M4A, AAC.': 'File format not supported. Allowed: MP3, OGG, WAV, M4A, AAC.',
      'Keine Datei erhalten.': 'No file received.',
      'Alter und neuer Name nötig.': 'Old and new name required.',
      'IP-Adresse und Name nötig.': 'IP address and name required.',
      'Kein Gerät ohne Namen unter dieser IP gefunden.': 'No unnamed device found at this IP address.',
      'Dieser Name ist schon vergeben.': 'This name is already taken.',
      'Der neue Name fehlt.': 'The new name is missing.',
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
