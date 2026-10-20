tilebert ist eine Loxone-Visualisierung für Wandpanels ab 480 × 480 px (ein LoxPanel Fork von Lenardo1). Ruhig, freundlich, pastellig: ein dunkler Rahmen, darauf je Tab eine farbige Karte, darauf weiße Kacheln. Alles ist zum Antippen gemacht – mit dem Finger, aus einem Meter Abstand.

## Ebenen
- **Ebene 0 – Dashboard und Screensaver:** das Dashboard-Tab mit Infoleiste. Der Screensaver ist dieselbe Ebene.
- **Ebene −1 – Popups:** Alarme und Infos aus der Infoleiste. Sie legen sich bei Bedarf über Ebene 0, 1 und 2.
- **Ebene 1 – Tabseite:** die Karte `face-*` mit dem Raster. **2×2 ist Standard** für neue Panels, 3×3 ist möglich (bestehende Profile ohne Angabe bleiben 3×3). Die Zellen füllen die Karte bis auf den Innenabstand, ohne Seitenrand, und haben je Gerät ein einheitliches Seitenverhältnis (Panel ca. 1,2 : 1, Handy 1 : 1). Hier wird gewählt und überblickt, nicht eingestellt.
- **Ebene 2 – Baustein**, in zwei Formen:
  - **2a Kachel:** der Baustein im Raster mit Symbol, Raum, Name und einem Zustand. Tippen öffnet 2b. Direkt auf der Kachel schalten nur ihre **Schnellbedienungen**: Mini-Schalter (Ein/Aus), Mini-Buttons ‹ › (Stimmung/Helligkeit) und ˄ ˅ (Jalousie, Fenster). Bausteine ohne eigene Detailansicht (z. B. reiner Taster) lösen beim Tippen ihren Loxone-Befehl direkt aus.
  - **2b Detail:** derselbe Baustein geöffnet. Aufbau: Kopf, großer Wert, Einträge, Aktionen. Hier wird eingestellt.
  - **2b-Unterseite:** Was eine eigene Seite braucht (Verlauf, verknüpfte Bausteine, Quellen), öffnet über einen Nebenaktions-Knopf rechts oben im Kartenkopf (siehe „Nebenaktionen“). Ebenso öffnen **Einträge mit Pfeil ›** eine Unterseite (z. B. Wecker → Eintrag bearbeiten, Raum → Baustein). Unterseiten haben denselben Kopf wie 2b, Zurück geht genau eine Ebene zurück, Änderungen gelten sofort. Die Verschachtelung folgt der Struktur des Loxone-Bausteins; eigene zusätzliche Ebenen werden nicht erfunden.

## Grundsätze

- **Einheitliches Seitenverhältnis je Gerät:** Alle Rasterzellen eines Bildschirms haben dieselbe Form (2×1 = doppelt so breit, 2×2 = vier Zellen inkl. Fuge). Auf Panels ergibt sich das Verhältnis aus der Karte (480×480: etwa 1,2 : 1, die Zellen füllen die Karte ohne Seitenrand), auf dem Handy sind die Zellen quadratisch und es wird senkrecht gescrollt.
- **480 × 480 muss immer funktionieren.** Das Grundraster ist 3 × 3 Zellen à `cell` (160 px). Tablets (iPad mini, 7″) bekommen Anpassungen nur im gezoomten Modus (`sqfit`/`sqbig`), nie auf Kosten von 480 × 480.
- **Hardwareunabhängig.** Keine Gerätegesten, kein Hover als einzige Bedienung, keine Schatten im Panel.
- **Farben kommen aus dem Theme.** Nie Literalfarben in Komponenten: immer `tile`, `ink`, `ink-2`, `face-*`, `dot-*`, `on`, `good`, `crit`. Ein Nutzer kann jede Farbe in Config → Aussehen → Design umstellen; neue Elemente müssen das mitmachen.
- **Neue Kacheln und Widgets** übernehmen Schrift, Größen, Farben, Radius und Innenabstand der bestehenden Kacheln (`r-l`, `space-tile`, `tile-name`, `room-label`).

## Inhalt und Ton

- Sprache Deutsch. **Panel:** du-frei und knapp, Beschriftungen sind Substantive oder Zustände („Deckenlicht“, „an · 80 %“, „Fenster offen“), keine Sätze. **Config:** Du-Form, Hinweise in ganzen Sätzen, Verben „tippen“ und „ziehen“ (nie „klicken“). Wortwahl siehe „Standards für Bedienmuster“.
- Raum steht in Versalien über dem Namen (`room-label`), der Name darunter (`tile-name`), maximal zwei Zeilen.
- Werte mit Komma und schmalem Abstand vor der Einheit: „21,5 °C“, „1,8 kW“. In der Detailansicht ist die Nachkommastelle samt Einheit 60 % groß und in `ink-2`.
- Config-Rückmeldungen nennen das Ergebnis: „✓ Gespeichert (2 Bereiche)“, „Fehler: …“. Keine Entschuldigungen.
- Keine Emojis in der Oberfläche. Einzige Ausnahme: das Kaffeetassen-Symbol der Spenden-Pille.

## Farbe

- **Rahmen** `bezel` mit `bezel-ink`/`tab-idle` darauf. Der aktive Tab ist eine Fläche `tab-active` mit `tab-active-ink`.
- **Karte** je Tab: `face-1` … `face-5`, ab Tab 6 `face-n`. Der passende Akzent heißt gleich: `dot-1` gehört zu `face-1`. Pastellgelb (`face-1` / `dot-1`) ist der Markenakzent.
- **Kachel** immer `tile` mit `ink` (Name, Wert) und `ink-2` (Raum, Einheit, Zweitzeile).
- **Eingeschaltet:** Symbol in `on`. Bei Szenen und Schaltleisten kippt die Fläche: Hintergrund `ink`, Schrift `tile`.
- **Status:** `good` / `crit` nur zusammen mit Wort oder Symbol. Eine Störung kippt die Kachel zusätzlich in die gefüllte Form – Farbe allein reicht nicht (rot-grün-blind).
- **Config** hat eigene, feste Farben (`cfg-*`): heller Lavendelgrund, weiße Karten, dunkler Hauptbutton, aktive Navigation in `cfg-active`.
- Drei Vorlagen: **bunt** (Standard), **dunkel**, **hell**. Der Server leitet bei eigener Grundfarbe alle Werte her und prüft Kontraste (Hauptschrift 7:1, Rest 4,5:1, Grafik 3:1).

## Typografie

- Zwei Familien, beide selbst gehostet: **Manrope** (`text`) für alles Lesbare, **Sora** (`num`) für Zahlen, Uhr, Titel der Detailansicht und Szenen.
- Große Werte `value-hero`, Uhr `clock`, Kachelname `tile-name` (Gewicht 450), Raum `room-label`.
- Ziffern immer `font-variant-numeric: tabular-nums`, damit Werte beim Aktualisieren nicht springen.

## Form: Kacheln und Pillen

- **Rundungen nach goldenem Schnitt, konzentrisch:** Karte `r-xl` (36) − Kartenabstand `space-card` (14) = Kachel `r-l` (22); darin Innenboxen `r-m` (14), Details `r-s` (8). Jede Stufe ist etwa φ (1,6) kleiner. Neue Elemente nehmen die Stufe ihrer Ebene, nie einen eigenen Wert.
- **Schrift** nur aus der Skala 10 · 11 · 12 · 13 · 14 · 15 · 18 · 20 · 22 · 26 · 30 px; **Symbole** 16 · 24 · 32 · 44 px.
- **Tippflächen** mindestens 44 px (Pille M), Abstand zwischen Tippflächen mindestens 8 px. Kleinere Bedienelemente (Mini-Buttons 30 px, Schalter 38×22) bekommen eine unsichtbar erweiterte Tippfläche.
- **Symbole:** Loxone-IconsFilled vom Miniserver; eigene nur, wo Loxone keins hat (Pfeile, Plus/Minus, Ein/Aus, Verlauf, Verknüpft, Liste, Ordner).
- **Schrift nie unter 11 px**, auch nicht in Badges.
- **Indikatoren** (Statuspunkt, Zahlenbadge, Hero-Symbol der Detailansicht) sind abgerundete Quadrate mit `radius-round` (32 %). Keine Kreise. Zahlenbadges bleiben quadratisch, auch zweistellig.
- **Lange Pillen** bleiben lang (`r-pill`): Verlinkungs-Pille, Filter, Config-Buttons.
- **Bedienelemente bleiben Kreise** (`radius-control`): Schalterknopf, Mini-Buttons, Regler-Daumen, Player-Tasten, Zurück, Schließen.
- Zwischen Kacheln `space-gap`, in der Kachel `space-tile`, Karte zum Rand `space-frame`.

## Detailansicht-Schema
- Reihenfolge immer, einspaltig untereinander (auch auf 960 × 480): **Kopf** (Raum in Versalien klein, darunter der Bausteinname) → **großer Zustand** (eine kurze Zeile darunter) → **Einträge** → **Aktionen**.
- Der große Wert ist der **Ist-Zustand**: Licht „An/Aus“ (siehe Auswahlbausteine), Heizung die Ist-Temperatur (Sollwerte darunter, Verstellen mit −/+), Sensor die Zahl mit Einheit (Loxone-Text wie „sehr gute Luftqualität“ als Zeile darunter), Alarm „Scharf/Unscharf/Alarm“.
- **Seiten mit Eintragsliste** (Licht-Stimmungen, Radio, Fenster/Türen, Bewässerungszonen, Zentral-Mitglieder): Zustand als EINE Zeile direkt unter dem Kopf (die bisherige Unterzeile wird zum Zusatz) – Zustandswort in Sora 22–30 px `ink`, dahinter „· aktive Auswahl“ in 60 % Größe `ink-2`, einzeilig mit „…“. Mix: „An · A, B“. Keine aktive Stimmung bekannt: nur „An“ bzw. „Aus“. Die große Hero-Stufe bleibt Zahlen ohne Liste (Sensor, Heizung) und Alarm. Die Aus-Stimmung steht nur als Aus-Knopf in der Aktionsreihe, nie zusätzlich in der Liste; bei Licht aus nennt die Zeile ihren Namen („Aus · Bereich verlassen“), sofern er nicht „Aus“ lautet. Die Liste scrollt beim Öffnen/Wechsel zur ersten aktiven Zeile (Reihenfolge wie in Loxone; nicht, solange der Nutzer gerade selbst gescrollt hat). Einen „An“-Knopf gibt es nicht – Loxone hat dafür keinen Standardbefehl, eingeschaltet wird über eine Szene.
- Ist der Zustand ein Text statt einer Zahl (Taster „Zuletzt ausgelöst“), steht er kleiner (`value-hero` · Stufe 22–30 px), die Zeit darunter.
- Zustandsfarbe des großen Werts nur aus dem Theme: heizt = Wärme-Token (`dot-3`), kühlt = kühler Token, ruht = `ink`.
- Zusatzangaben (Betriebsart, Zeitplan, „Fenster offen“) als Chips unter dem Wert: Anzeige = transparent mit Haarlinie, tippbar = gefüllt mit Pfeil ˅/›.
- Heizung wie der Rollladen aufgebaut: −/+ als runde Bedienelemente direkt links/rechts neben der Ist-Temperatur (wie ˄/˅ bei der Jalousie), darunter EINE ruhige Textzeile in `ink-2` („Soll 24,0° Komfort · Ruht · Ziel 22,0°“) plus nur die tippbaren Menü-Chips (z. B. „Automatik nur Heizen ˅“); optional die Zeitleiste 0–24 Uhr mit Komfortzeiten aus dem Loxone-Zeitplan; Betriebsarten als Pillen unten. Keine eigene Sollwert-Fläche.
- Alles passt auf ein Panel (960 × 480, 480 × 480) ohne Scrollen; Verläufe füllen den freien Platz, bei zu wenigen Messwerten steht „Noch zu wenig Messwerte“.
- Einträge (Lichtszenen, Zonen, Wecker, Ausgänge, Stimmungen) sind Listenzeilen: 46 px hoch (Tablet 52 px), `r-m`, Symbol links, Titel und Unterzeile, aktiv gefüllt in `ink`.
- **Standard zwei Spalten:** Auf Panels und Tablets stehen Einträge in zwei gleich breiten Spalten über die ganze Breite (480 × 480 ab 3 Einträgen, breit immer) – Lichtszenen genauso wie Bewässerungszonen. Nie drei Spalten (einzige Ausnahme: Handy quer, zu wenig Höhe); Handy hoch eine Spalte. Zeilen mit Zustandswort rechts (Fenster) auf 480 × 480 einspaltig, damit die Namen lesbar bleiben. Passen nicht alle Einträge, scrollt die Liste senkrecht – der Rest der Ansicht bleibt unverändert. Nie seitwärts scrollen.
- Kamera „ganzes Bild“: freie Ränder in Kartenfarbe oder als verwischtes Bild – nie weiße Streifen.

## Nebenaktionen
- Knöpfe, die eine Unterseite öffnen (Verlauf, Verknüpft, Quellen), stehen **rechts oben im Kartenkopf** der Detailansicht und ihrer Unterseiten, auf Höhe von Raum + Name – auf allen Geräten gleich. Raum + Name bleiben mittig.
- Form: Kreis 44 px (`radius-control`), Fläche `tile` 55 %, ohne Umriss, Symbol 22 px, mit Beschriftung als Tooltip. Abstand 8 px. Reihenfolge von rechts: Verlauf, Verknüpft, Quellen.
- **Höchstens zwei sichtbar.** Bei mehr: Verlauf plus „⋯“ mit Menü (Popup-Standard). Ein Knopf wird nie weggelassen.
- Sofortbefehle (z. B. „Erzwingen“ der Bewässerung) sind keine Nebenaktion, sondern Pillen in der Aktionsreihe.
- Die Aktionsreihe unten enthält nur Hauptaktionen. Die Kopfleiste (Zurück, Pfad, Tabs) bleibt reine Navigation.

## Sammelbausteine (Zentral-Licht, -Rollladen, -Alarm, -Audio, Fenster/Türen)
- Kachel und Detail nennen denselben Zustand mit denselben Worten („2 offen · 1 gekippt“, „3 Räume an“, „0 von 2 scharf“) – keine Festtexte wie „Beschattung“.
- Steht der Zustand als Wort in der Zeile (rechts, „offen“/„gekippt“ in `ink` fett, Ruhezustand in `ink-2`), gibt es keinen Indikator-Punkt. Der Punkt bleibt Zeilen ohne Zustandstext vorbehalten.
- Zeilen, die einen Einzelbaustein öffnen, sind gefüllt mit Pfeil ›; reine Anzeigen nur Haarlinie – nie gemischt.
- Abweichler stehen oben (offen/an vor zu/aus); Unterzeile nur der Raum.
- Sammelaktionen (Alle aus, Alle auf …) als Pillen unten, nur Loxone-Standardbefehle.

## Kacheltext und Seiten
- **Gemeinsame Grundlinie:** Der Textblock der Kachel hat drei feste Plätze – Raumzeile, Name (Platz für zwei Zeilen, sonst „…“), Zustand unten. Kacheln einer Reihe stehen dadurch bündig, egal ob der Name ein- oder zweizeilig ist.
- **Seiten:** Raster, die mehr als eine Bildschirmhöhe brauchen, werden exakt in Seiten geschnitten (keine angeschnittene Folgereihe). Die Position zeigen **Seitenpunkte** rechts in einer eigenen Spur (9 px, aktiv `ink` 75 %, sonst 32 %) – einen klassischen Scrollbalken gibt es im Kachelraster nicht.
- **Aufbau fest:** Piktogramm oben links, darunter Raum, Name, Zustand unten auf der festen Zustandslinie. Rechts oben gehört ausschließlich der Schnellbedienung (bzw. dem Sensor-Pfeil); keine Zustandsangaben neben dem Piktogramm. In Raumansichten bleibt der Platz der Raumzeile reserviert, Name und Zustand stehen an derselben Stelle wie im Favoriten-Tab.
- **Werte groß (Option):** Reine Wert-Kacheln (Zahl + Einheit, ohne Bedienung) zeigen den Wert kachelfüllend: Sora 600, tabular-nums, auf allen Wert-Kacheln eines Bildschirms GLEICH groß (22,5 % der Zellbreite, ≈ 49 px bei 216 px), Einheit hochgestellt mit 32 % der Wertgröße in `ink-2`; Raum + Name klein einzeilig oben links; Piktogramm als Wasserzeichen rechts unten (8 %). Texte bleiben normal. Globale Option wie Animation/Kontrast (System → Darstellung → Effekte: „Werte groß auf Kacheln“ An/Aus, Standard aus), am Panel „Wie Standard / An / Aus“, je Kachel überschreibbar (Panel-Standard / immer groß / nie groß).
- Kachel-Bedienelemente: Mini-Buttons 30 px, Schalter 38 × 22, je mit unsichtbar erweiterter Tippfläche. Eingeschaltet ist **eine** Farbe: Schalter, Symbol und Zustand in `on`.

## Popups
- **Blatt** (Status, Wetter, PIN): Hintergrund abgedunkelt, mittig, `r-xl` (sehr hoch: `r-l`), Kopf 56 px mit Titel links und Schließen-Kreis rechts (≥ 44 px Tippfläche). Breite 440 px auf 960 × 480 (breiter Inhalt 720), sonst Bildschirm − 32 px; Höhe nach Inhalt, auf Panels ohne Scrollen. Zeilen nach „Fläche heißt tippbar“, Aktionen als Pillen L, aktiv `ink`. Schließt über ✕, Tippen daneben, Wischen nach unten (Handy) und immer beim Navigieren.
- **Menü** (Auswahl an einem Knopf): `r-m`, Einträge 44 px, mind. 160 px breit, aktive Wahl `ink`; schließt bei Wahl oder Tippen daneben.
- **Hinweis** (Meldung, Verbindung, Test-Ton): oben, `r-m`, Theme-Schrift, Stufenfarbe als Token, nicht tippbar, verschwindet selbst.
- **Vollbild nur für Alarm:** über allem, schließt nur über „Ausblenden“ oder eine Aktion. Die Klingel bleibt ein Hinweis in der Türstation.
- Reihenfolge von hinten nach vorn: Menü < Blatt < Hinweis < Alarm < Nachtabdunklung.

## Fläche heißt tippbar
- Alles Tippbare hat eine Fläche; der Rang zeigt sich an Größe und Deckkraft: Hauptaktion `tile` deckend (aktiv `ink`), Nebenaktion (Kreis 44 px, rechts oben im Kartenkopf) und Chips `tile` 55 %, ohne Umriss.
- Reine Anzeigen (z. B. Bewässerungszonen) haben keine Fläche, nur eine Haarlinie. „Läuft/aktiv“ zeigt eine leichte Tönung plus Indikator-Quadrat in `dot-*` – nie die dunkle `ink`-Füllung, die ist Bedienelementen vorbehalten.
- Einträge, die eine Ansicht öffnen, sind Bedienelemente und tragen rechts einen Pfeil ›.
- Keine eigene Logik: Was ein Eintrag kann, bestimmt allein der Loxone-Baustein (Standardbefehle).

## Bewegung

- Dezent und abschaltbar: alle Dauern sind `anim-*` × `--anim-scale`; „Animationen aus“ in der Config bzw. `prefers-reduced-motion` setzt 0. Neue Animationen hängen an `html.ianim`.
- Kachel-Einblendung nur über `opacity` (schwache Panel-Hardware wie Shelly). Tippen: `scale(.97)`. Zoom Kachel → Detail `anim-zoom`.

## Ikonografie

- Kachelsymbole sind Linien-Icons (24er Raster, Strich 1,7, runde Enden) in `currentColor`; die Kachel färbt sie über `ink-2` bzw. `on`.
- Loxone-Icons (IconsFilled, ~550, vom Miniserver) werden per CSS-Maske in derselben Farbe gezeigt – nie als buntes Bild.
- **Regel Hintergrund-Piktogramm:** Detailansichten von **Anzeigen ohne Schaltelemente** (Sensoren, Zustände, Messwerte) tragen das Bausteinsymbol übergroß im Hintergrund – 85 % der kleineren Kartenseite, links unten, bewusst angeschnitten (rund zwei Drittel sichtbar), 8 % Deckkraft. Es lockert die sonst leere Seite auf. Nie hinter Bedienelementen, nie bei Bausteinen mit Schaltern/Pillen.

## Config

- Zwei Ebenen: dunkle Seitenleiste (`cfg-bezel`) und heller Inhalt (`cfg-bg`) mit Karten (`cfg-panel`, `r-l`, `shadow-cfg`) in Masonry-Spalten.
- **Seitenleiste:** oben die Marke (28 px, `marke-klein`) mit „tilebert“, ohne Zusatz „Konfiguration“ (den Ort zeigen Favicon, Fenstertitel und Hauptnavigation); die Zeile hat 4 px Innenabstand oben, Marke, Überschriften und Karten stehen auf einer linken Kante; die Marke ist ein Knopf zur Übersicht (aria-label „tilebert – Übersicht“). Der Abschnittstitel „PANELS“ steht 28 px unter der Markenzeile (Lücke 14 px + `margin-top` 14 px). Unten steht die Version einzeilig nur als Nummer („0.20.39“); Commit und Installationszeit nur im `title`.
- Eine gemeinsame Speicherleiste unten. Der Speichern-Knopf ist `cfg-prim`; bei Erfolg wird er 2 s grün mit „✓ Gespeichert“, bei Fehler rot.
- Lange Einstellungsblöcke sind zusammenklappbar; selten Genutztes eingeklappt.
- **Seitenkopf mit Untermenü:** eine Zeile `.pagehead`. Links der Objektname (22 px, einzeilig mit …, voller Name im `title`), davor optional eine Art-Marke (11 px Versalien, `muted`, z. B. „PANEL“). Mit 16 px Abstand, mittig ausgerichtet, folgt das Untermenü als Pillen (32 px, aktiv `prim`, bei Touch bzw. bis 760 px Breite unsichtbar auf 44 px erweitert); das Menü schrumpft nie, bei Platzmangel bricht es in die nächste Zeile. Einen Titel gibt es nur, wenn die Hauptnavigation den Ort nicht schon zeigt (Panel ja; System und Geräte nein – dort gleicher Kopf ohne Titel, gleiche Pillen). Bis 760 px steht das Menü in eigener Zeile unter dem Namen und scrollt seitlich.
- **Dichte Editor-Spalte** (Raster-Editor, Seitenleisten von Editoren): Bedienelemente 32 px am Desktop, 44 px bei Touch bzw. bis 760 px Breite.
- Die Config ist für PC/Monitor optimiert. Icon-Knöpfe haben trotzdem mindestens 44 × 44 px Trefferfläche (Tablets, Standalone-Geräte); Textknöpfe dürfen 32–40 px hoch sein.
- **Speichermodell:** Primär (`cfg-prim` gefüllt, Schrift `prim-ink`) ist nur „Speichern“ in der Speicherleiste – und „Weiter“ in Assistenten. Alles andere ist Nebenaktion: Fläche `field`, Rand `line`, Schrift `fg`. Sofort wirkende Aktionen (Test-Ton, Passwort, Log, Geräteaktionen …) tragen ein kleines Blitz-Symbol (11 px) mit Hinweis „Wirkt sofort“. Gefährliches (Entfernen, Löschen): `.btn.del` – Schrift `crit`, rote Kontur, keine Füllung, rechts abgesetzt bzw. in eigener Zeile mit Trennlinie; Rückfrage oder Rückgängig nach „Standards für Bedienmuster“. Zurücksetzen bleibt neutral (`.minibtn`); fragt es nach, ist erst der Bestätigen-Knopf im Dialog rot.
- **Auswahl:** Ausgewählt = 2 px Ring in `prim` (ohne Layoutsprung) plus Häkchen-Quadrat 18 px (`radius-round`) oben rechts in `prim`, Häkchen in `prim-ink`; an Pillen als 16-px-Marke an der Ecke. Kleine Wahlfelder (< 44 px) und Tab-Chips nur Ring. Akzent-/Orangetöne sind für „ausgewählt“ nicht erlaubt.
- **Karten:** Eine einzelne Karte füllt die Breite; Text steht immer in Karten; jeder Aufklapper trägt denselben Pfeil ›. Hilfe „?“ öffnet ein schwebendes Popover (`r-m`) statt Inhalt zu verschieben.
- **Feldhilfe:** Braucht ein einzelnes Feld mehr als einen Satz Erklärung, steht der Text als `p.fhelp` direkt im `.field` (Feldname `.lbl` mit `id`); `helpify` setzt daraus ein „?“ (`.qhelp`, aria-label „Hilfe zu „<Feld>““, `aria-expanded`/`aria-controls`) hinter den Feldnamen und öffnet das schwebende `.qpop`. Kein ⓘ und kein `title` als einzige Hilfe.
- **Reihenfolge im Einstellungsblock:** Kurze Felder stehen als Spalten nebeneinander, das Häufigste links (Dashboard: Raster mit Standard | Schließen | Farbstimmung); große Unterabschnitte folgen darunter über die volle Breite. Schmal (Container ≤ 900 px, Handy) einspaltig in derselben Reihenfolge.
- **Unterabschnitt im Faltblock:** Ein großer Teil eines Einstellungsblocks klappt eigens auf (Beispiel Statusleiste: `.dbarbox` mit Kopf `.dbarhd` (Name, Kurzinfo „n/max“ bzw. „aus“, Pfeil, `aria-expanded`/`aria-controls`) und Inhalt `.dbarbody`), der Inhalt ist `inert`, solange er zu ist; standardmäßig zu, Trennlinie oben. Ein An/Aus-Schalter des Abschnitts ist die erste Zeile im Inhalt, nie im Kopf.

## Standards für Bedienmuster

Gilt für die Config (`config.html`), Grundsätze auch für das Panel. Neue Elemente nutzen diese Bausteine, keine eigenen Varianten. Prüfskript: `audit/scripts/standards-0238.mjs`.

**Grundsatz Panel:** tilebert schaltet und informiert, konfiguriert nicht. Einstellen gehört in die Config (Ausnahme: Einrichtung am Standalone-Gerät).

### Wortwahl
- **Entfernen** = aus Konfiguration oder Liste nehmen (bis zum Speichern rückholbar). **Löschen** = Daten am Server endgültig weg (Server-Protokoll, hochgeladene Datei – nur im Rückfragetext).
- **Zurücksetzen** ist das einzige Verb für „zurück zur Vorgabe“. **Standard** heißt immer tilebert-Vorgabe; Vorgaben aus Loxone heißen „Loxone-…“ (z. B. „Loxone-Farbe“). Nicht: „wiederherstellen“, „neutral“ als Knopf, „Auf Standard zurück“.
- Knopfnamen in Hinweisen exakt wie am Knopf, in „…“, inkl. „+“: „Tippe auf „+ Kalender hinzufügen“ …“.
- Rückmeldungen (Snackbar, Hinweise) sind ganze Sätze mit Punkt und nennen das Ergebnis: „Adresse kopiert.“, „Kamera „Garten“ entfernt. Wirksam nach dem Speichern.“; Fehler beginnen mit „Fehler: “.

### Entfernen (genau zwei Formen)
- **✕ an einem Eintrag** – Listenzeile, Chip, Kopf einer Faltkarte (rechts, neben dem Aufklapper), Bild/Datei (direkt hinter Vorschau bzw. Dateiname): `rmBtn(attrs, name, badge, label, cls)` → `button.rmx`, 44 × 44, gedämpftes ✕, beim Zeigen rot. aria-label/title „<Name> entfernen“ bzw. eigenes `label` („Kamera „{n}“ entfernen“). Chip mit ✕: `.chip.rmchip` (nur das ✕ entfernt). Auf gewählten Objekten im Raster (Tab, Kachel, Panel): `rmBtn(…, badge=true)` → `.rmx.badge` (24 px rote Marke, unsichtbar auf 44 px erweitert). Steckt das ✕ in einem selbst tippbaren `<button>` (Tab-Chip `.tbchip`), dann `rmBtn(attrs, name, true, '', '', span=true)` → `span.rmx[role=button][tabindex=0]` (kein `<button>` im `<button>`); Tastatur: Enter/Leertaste.
- **Textknopf für das ganze Objekt**, dessen Einstellungen gerade offen sind (Panel, Kachel, Gerät, Passwortschutz): `.btn.del` „<Objekt> entfernen“ als letzte Zeile `.delrow` (Trennlinie oben, Hinweis `.hint` links, Knopf rechts) oder rechts abgesetzt in `.actions`.
- Nicht mehr verwenden: `.btn.del.sm`, `.minibtn.del`, Zwei-Klick-Bestätigung (`.arm`), Entfernen-Knopf im Fuß einer Faltkarte.

### Rückfrage oder Rückgängig
- **Wirkt sofort am Server oder Gerät und ist nicht rückholbar** (Datei löschen, Protokoll löschen, Gerät entfernen, Neustart, Passwortschutz) → `dlgAsk(title, text, okLabel, danger, noLabel)`.
- **Entfernt etwas nur im Entwurf** (wirkt erst mit „Speichern“) → sofort ausführen, dann Snackbar mit „Rückgängig“ (7 s). Das gilt für **jedes** ✕ an einem Eintrag (Panel, Tab, Kachel, Kamera, Kalender, Baustein einer Liste oder Chip-Reihe) und für `.btn.del` im Entwurf. Text: „<Objekt> „<Name>“ entfernt. Wirksam nach dem Speichern.“ Umsetzung: Tabs, Kacheln und Dashboard-Raster mit `undoable(p, msg, fn)` (stellt das ganze Panel-Profil wieder her und zeichnet die Tab-Liste neu). Listen, die über `o.get()`/`o.set()` gebaut sind (`sbListBind`: Statusleiste, Status-Ampel), mit `snack(msg, ()=>o.set(alterStand))`. Alles andere mit `snack(msg, undoFn)`, `undoFn` stellt den alten Stand her und zeichnet neu. Ausnahme ohne Snackbar: Einblenden/Abwählen, das man mit einem Tipp zurücknimmt (Haken, „wieder einblenden“). Ein Schalter, der beim Ausschalten Einträge mitnimmt (Statusleiste „Oben im Dashboard anzeigen“), ist keine solche Ausnahme: Snackbar mit „Rückgängig“ („Statusleiste mit {n} Bausteinen ausgeschaltet. Wirksam nach dem Speichern.“).
- **Ganze Gruppe zurücksetzen** (Kachel, eigene Farben) → `dlgAsk` „<Objekt> zurücksetzen?“ / Knopf „Zurücksetzen“, `danger=true`. **Einzelwert zurücksetzen** (↺, Bildausschnitt, Kategorie-Farbe, Symbol) → sofort, ohne Rückfrage.
- `dlgAsk`: Titel = Ja/Nein-Frage mit Objekt + Verb und „?“ („Gerät entfernen?“, „Nachtmodus trotzdem speichern?“); Text = Folge in einem Satz, ohne die Frage zu wiederholen; OK-Knopf = Verb aus dem Titel („Entfernen“, „Neu starten“); `danger=true` nur bei Datenverlust oder beim Abschalten einer Sicherheitsfunktion (Alarm) (roter Knopf); Gegenknopf „Abbrechen“, bei Verwerfen-Fragen „Weiter bearbeiten“ bzw. „Weiter auswählen“, fachliche Gegenoption erlaubt („Nur neue Tabs“). Nie `confirm()`/`alert()`.
- Zurück-Taste in Dialogen/Assistenten: `dlgHist` legt einen Verlaufseintrag an; Rückfrage („… verwerfen?“) nur bei ungespeicherten Eingaben, sonst schließt Zurück still.

### Zurücksetzen
- Knopf „Zurücksetzen“, wenn Karte/Gruppe den Bezug klar macht (Kachel, Bildausschnitt, Kategorie-Farbe); sonst „<Objekt> zurücksetzen“ („Symbol zurücksetzen“, „Eigene Farben zurücksetzen“).
- Icon ↺ nur in dichten Geräte-Zeilen (`.gdreset`, 44 × 44, neben „geändert“), title/aria-label „Auf Standard zurücksetzen“.

### Auswahl
- **Einzeloption an/aus = Schalter** (38 × 22): im Formular `label.chk > input[type=checkbox] + span` (Schalter links, Text rechts); in Geräte-Zeilen `.gr` der Schalter `.gdsw` (Text links, Schalter rechts, aria-label = Zeilentext).
- **Mehrfachauswahl aus einer Liste = Häkchen-Liste:** jede Zeile `label.apit > input[type=checkbox] + span` (Text, optional `<small>` als zweite Zeile). Fläche `field`, Rand `line`, 48 px (in schmalen Spalten `.tbblk`/`.dexits`/`.icrdevs` 40 px), Häkchen-Quadrat 20 px; gewählt = Ring + Häkchen in `sel`/`prim`. Kein Schalter in Listen.
- **Mit Reihenfolge (Sortier-Komponente):** Pfeilpaar `sortBtns(i, n, name, attr, so)` → `.sortg` mit zwei 44-px-Knöpfen `.sortb`; senkrechte Liste ↑ ↓ („{n} nach oben/unten“), Chip-/Tab-Reihe mit `so={axis:'x'}` ‹ › („{n} nach links/rechts“). In einem tippbaren `<button>` zusätzlich `so.span=true` (Span-Knöpfe mit `role=button`). Verdrahtung `sortBind({root, item, btn, name, move, axis})` (`axis:'x'` für Reihen): Klick, Pfeiltasten, Pos1/Ende; das Pfeilpaar ist zugleich Ziehgriff (Maus/Touch: daran ziehen); Ansage „{n}: Position a von b“ über `name`. Erster/letzter Platz: Knopf `disabled` bzw. `aria-disabled`. Häkchen-Liste mit Reihenfolge: `.camopt`-Zeile = Häkchen + Nummer `.cnum` + Pfeilpaar.
- **Chip-Reihe** (gewählte Objekte nebeneinander): Chip `.tbchip` (Fläche `field`, Rand `line`, `r-m`, ≥ 44 px hoch, Text `.tbtx` mit `<b>` Name und `<small>` Zusatz, Namen über `hyHtml`). Ist der Chip selbst tippbar (wählen), ist er ein `<button>`; ✕ und Pfeile darin in Span-Form (s. o.). Ist er nur Anzeige, ist er ein `span.chip.rmchip` mit echtem `<button>`-✕ (`.rmchip .rmx`, 44 px). Reihenfolge der Reihe = gespeicherte Reihenfolge; „+ … hinzufügen“ steht als letzter Chip `.tbchip.add` am Ende der Reihe (siehe „Hinzufügen“; Sonderfall Tab-Leiste: dort steht er nach dem festen Dashboard-Chip vor den Tabs, weil die Tabs von rechts gezählt werden); ist die Reihe leer, steht der Leerzustand `leerHtml` vor dem Hinzufügen-Chip.
- **Chip-Reihe mit Reihenfolge und Detailkarte** (Statusleiste, Status-Ampel; Funktionen `sbListHTML`/`sbDetHTML`/`sbListBind`): Es ist immer genau ein Chip gewählt (`aria-pressed`, Standard der erste, nach „+“ der erste neue mit kurzem Aufleuchten `sortfl`). Nur der gewählte Chip trägt das Pfeilpaar und das ✕-Badge (Span-Form); Wählen ändert keine Daten. Chip: Symbol 24 px (`aria-hidden`), Name über `hyHtml` höchstens zwei Zeilen, `<small>` eine Zusatzzeile; Name des Chips per `aria-labelledby` nur aus Name + Zusatz (ohne die Knöpfe darin). Zwischen Pfeilpaar und Chip-Rand 12 px, damit die Trefferflächen von › und ✕ nicht überlappen. Einstellungen des gewählten Eintrags stehen in EINER Detailkarte `.sbdet` darunter (12 px Abstand, `r-m`, `role=group` mit `aria-labelledby` auf den Namen): Kopf = Symbolbox 44 px, Name, „Typ · Raum“, rechts „Platz a von max“ (nur Text, kein zweiter Griff; max = Höchstzahl wie im Zähler „n/max“ am „+“-Chip); darunter Zeilen `.sbdrow` (Label links, Bedienelement rechts, schmal untereinander). Ein Aufklapper in der Karte („Symbol ändern ˅“, `aria-expanded`/`aria-controls`) öffnet seinen Inhalt in der Karte; „Symbol zurücksetzen“ steht daneben und ist `disabled`, solange die Vorgabe gilt (dann Hinweis „Standard: Loxone-Symbol“). Gelöschter Eintrag (in Loxone nicht mehr vorhanden): Chip gestrichelt ohne Fläche, „?“-Quadrat statt Symbol, Text in `fg`, Zusatz „In Loxone gelöscht. Mit ✕ entfernen.“; die Detailkarte ist dann nur ein Hinweis. Bei Maximum: „+“-Chip `disabled` mit title und zusätzlich `.hintp` unter der Reihe.
- **Handy (≤ 600 px):** Chip-Reihen mit Reihenfolge stehen einspaltig in voller Breite; das Pfeilpaar wechselt dann auf ↑ ↓ („nach oben/unten“, Pfeiltasten ↑/↓) – die Pfeilrichtung folgt immer der sichtbaren Anordnung. (Die Tab-Leiste bleibt beim zweispaltigen Raster, da sie von rechts gezählt wird.)
- **Zugehöriger Schalter:** Ein Schalter, der nur ein Feld ergänzt (z. B. „Als Standard für neue Panels verwenden“ zu „Raster“), bekommt keine eigene Überschrift. Er steht unter dem Bedienelement des Feldes (`.mt12`), sein Hinweis direkt darunter (`aria-describedby`).
- **Richtungswahl** (mehrere Richtungen unabhängig an/aus, z. B. Wischen zum Schließen): Häkchen-Raster `.apgrid` (2 × 2) aus `label.apit`, Reihenfolge ↑ Nach oben, ↓ Nach unten / ← Nach links, → Nach rechts; Pfeil `aria-hidden`; das Raster trägt `role=group` und `aria-labelledby` auf die Unterzeile `.fsub` (Gruppenname, z. B. „Wischen“). Eine Einzeloption derselben Gruppe (✕-Knopf) steht als eigene Häkchenzeile darüber; Zeichen wie ✕ im Text bekommen ein sprechendes `aria-label` („Schließen-Knopf oben rechts“). Keine `aria-pressed`-Toggles.
- **Anzeigeart** eines Statusbausteins heißt überall gleich: „Symbol“ / „Text“ / „Symbol + Text“ (Segment in der Detailkarte und Unterzeile des Chips; nicht „Beides“).
- **Symbol eines Loxone-Bausteins** in der Config immer wie im Panel: eigenes Symbol > Loxone-Symbol des Bausteins (`iconUrl`) > Ersatzsymbol je Typ.
- **Alle/Keine:** Häkchen-Listen von Objekten (Bausteine, Alarm-Ausnahmen) ab 2 Einträgen (`SEL_MIN`) bekommen über der Liste „Alle auswählen“ / „Keine auswählen“: `selAllHtml(listId, on, n)` + `selAllBind(listEl, onAll)` (`.selall`, `.minibtn`, Knopf ohne Wirkung `disabled`). Nicht bei Optionslisten (z. B. „Dashboard schließen“) und nicht bei Listen, deren Haken sofort wirken oder einzeln nachfragen.
- **Filter:** Chip-Reihe `.mzchip` mit „Alle“ zuerst (`aria-pressed`). Ausnahme: viele Werte (ab etwa 12, z. B. Räume) in einer schmalen Spalte → `select` „Alle <Mehrzahl> (n)“ mit Anzahl je Wert; die Anzahl folgt Suche und übrigen Filtern (nicht dem eigenen).
- **Ein Baustein wählen:** `pickFld(id, c, lblId)` öffnet den Auswahldialog `ctlPick` (Suche, Filter-Chips, Liste). Dialog bei Loxone-Bausteinen und bei durchsuchbaren Listen ab etwa 12 Einträgen; `select` für kurze, feste Optionen (Betriebsart, Format, Raster).
- **Durchsuchbare Bausteinliste (eine Logik, 0.20.39):** Jede Liste von Loxone-Bausteinen mit Suche – Auswahldialog `ctlPick` und Bausteinbibliothek im Raster-Editor – nutzt dasselbe Modul: `pickIdx(list, {chip, chipOrder, tlabel})` (Suche über Name, Raum, Kategorie, Typ; mehrere Wörter UND; ohne Groß/klein, Akzente, ß = ss; Relevanz: Name beginnt mit > Wortanfang > im Namen > nur Raum/Kategorie/Typ), `pickChipsHtml` (Chips „Alle“, „Zuletzt“, je Typ bzw. Kategorie mit Anzahl, die Suche und übrigen Filtern folgt; Chips ohne Treffer gedämpft; erst ab 3 Typen oder mit „Zuletzt“) und `pickView` (ohne Suche Gruppenköpfe nach Raum, mit Suche/„Zuletzt“ flache Liste mit zweiter Zeile „Raum · Kategorie“ und `<mark>`-Treffern über `hyHtml`; Blöcke zu `PICK_CHUNK` = 80 beim Scrollen, Entprellung ab 200 Einträgen; genau eine Zeile per Tab, ↓ aus der Suche, ↑/↓/Pos1/Ende, ↑ aus der ersten Zeile zurück; Enter in der Suche bei genau einem Treffer; Live-Region „{n} Bausteine“ nur nach Eingabe; Leerzustand `pickEmpty`). Keine eigene Such- oder Filterlogik daneben.
- **Bibliothek im Raster-Editor:** Kategorie als Chip-Reihe (wie Typ-Chips im Dialog, eine Zeile, seitlich scrollend; 32 px am Desktop, 44 px bei Touch), Raum als `select` „Alle Räume (n)“ mit Anzahl je Raum (folgt Suche und Kategorie) – Räume sind zu viele für Chips in der schmalen Spalte und ohne Suche ohnehin die Gruppenköpfe. Ohne Suche steht die Gruppe „In diesem Tab“ zuerst (Haken rechts, Raum als zweite Zeile). Zeilen sind Knöpfe: **Ziehen** legt an die Zielstelle, **Antippen/Klick/Enter** legt auf den ersten freien Platz (Alternative zum Ziehen), wählt die neue Kachel und meldet „„<Name>“ ins Raster gelegt.“ mit „Rückgängig“ (auch Strg+Z bzw. „↶ Rückgängig“). Hinweis unter der Liste „Ins Raster ziehen, antippen oder Enter drücken.“ (`aria-describedby`, bei leerer Liste ausgeblendet). Platzhalter in der schmalen Spalte kurz „Name, Raum, Typ …“, das `aria-label` trägt den vollen Text wie im Dialog. Kategorie-Chips: größte Kategorie zuerst. Typsuche wie im Dialog über den deutschen Typnamen (`ctlTypeName`: Rollladen, Fenster …) und den Loxone-Typ. Zeilen bleiben Karten (Ziehquelle braucht Fläche), der Dialog bleibt eine flache Liste. Beim Neuzeichnen bleiben Suche, Filter, Scrollstelle (Anker-Zeile) und Fokus erhalten. Übersichts-Tabs (Räume/Kategorien) haben nur das Suchfeld „Name suchen …“ mit eigenem Suchtext; schon gezeigte Einträge sind `aria-disabled`; ohne Treffer „Kein Raum passt zu „x“.“ (ohne Knopf).

### Ziehen braucht eine Tipp-Alternative
- Alles, was man ziehen kann (Bibliothek → Raster), geht auch mit einem Tipp, Klick oder Enter (WCAG 2.5.7): Es landet auf dem ersten freien Platz, das Neue ist gewählt, Rückmeldung als Satz „„<Name>“ ins Raster gelegt.“ mit „Rückgängig“ in der Snackbar. Doppelklick legt nicht doppelt ab. Kein Platz: „Kein freier Platz. Erst eine Kachel entfernen.“ Schon vorhanden und nicht doppelt erlaubt: „„<Name>“ ist schon in der Übersicht.“
- Listen mit Tastatur: Zeilen sind `<button>`, genau eine per Tab erreichbar (roving tabindex), ↑/↓/Pos1/Ende, ↓ aus der Suche, ↑ aus der ersten Zeile zurück; ein Hinweis zur Bedienung hängt per `aria-describedby` an der Liste. Wandert eine Zeile nach der Aktion weg, bleibt der Fokus sichtbar auf der Nachbarzeile.

### Hinzufügen
- Unter einer Liste: `button.minibtn.qsadd` „+ <Objekt> hinzufügen“ (gestrichelt, volle Breite, 44 px, 8 px Abstand zur Liste). Hat die Liste eine Grenze, steht der Zähler im Knopf: `+ Baustein hinzufügen <span class="sbcnt">n/max</span>`; bei Maximum `disabled` und darunter `.hintp` „Höchstens {n}. Erst einen entfernen.“
- In Chip-Reihen dasselbe als letzter Chip: `<button class="tbchip add"><span class="tbtx"><b>+ <Objekt> hinzufügen</b><small class="sbcnt">n/max</small></span></button>` (gestrichelt), bei Maximum `disabled` mit title „Höchstens {n}. Erst einen entfernen.“

### Leerzustände
- Eine Form: `leerHtml(text, knopfHtml, live, cls)` → `div.leer` (`text` ist HTML: Namen und Eingaben vorher mit `esc()` maskieren) (`muted`, 13 px, Text und darunter höchstens ein `.minibtn`). `live=true` (`role="status"`) nur bei Such- und Filterergebnissen. `cls` ist nur Ortskennung (`qsnone`, `libnone`, `sbempty`, `palnone`, `lxnote`), ohne eigene Optik.
- Wortlaut, immer ganzer Satz mit Punkt: Suche/Filter ohne Ergebnis „Keine Treffer.“ (mit Suchbegriff „Kein Baustein passt zu „x“.“) + Knopf „Suche zurücksetzen“ / „Filter zurücksetzen“ / „Suche und Filter zurücksetzen“ – nur wenn Filter oder mehrere Felder aktiv sind; bei einem einzelnen Suchfeld ohne Knopf (das Feld leert sich mit ✕/Escape). Zu viele Treffer: „{n} weitere Treffer. Grenze die Suche ein.“; noch nichts angelegt „Noch keine <Mehrzahl>.“ / „Noch kein <Objekt>.“ (Hinweis „Tippe auf „+ … hinzufügen“.“ nur, wenn der Knopf nicht direkt darunter steht); Laden „Lädt …“; Fehler „Fehler: …“ + Knopf „Erneut laden“.

### Größen, Zahlen, Text
- Fokusring: 2 px `sel`; auf gefüllten Marken (✕-Badge) außen mit 2 px Abstand in `fg`.
- Jeder Icon-Knopf (✕, ↺, ↑↓, Schließen) hat mindestens 44 × 44 px Trefferfläche; sichtbar ab 24 px, Rest unsichtbar erweitert (wie `.rmx.badge`). Abstand zwischen Trefferflächen ≥ 8 px oder ohne Überlappung. Einzige Ausnahme: das Hover-✕ `.pitem .pdel` in der Panel-Liste (nur Maus, 24 px); gleichwertiger Weg ist „Panel entfernen“ in den Panel-Einstellungen.
- **−/+:** Minus links, Plus rechts (auch ‹ › und ˅ ˄: verringern links, erhöhen rechts).
- Lange Namen in schmalen Feldern (Chips, Kacheln, Listen) über `hyHtml(name)` trennen (weiche Trennstellen), nie mitten im Wort abschneiden.

### Sichtbarkeit und Stil
- Ein- und ausblenden nur über das Attribut `hidden` (`el.hidden = …`); global gilt `[hidden]{display:none !important}`. Nie `style.display`.
- Inline-Styles nur für berechnete Werte (Farbe, Position, CSS-Variable `--…`). Feste Abstände über Klassen (`.mt4`, `.mt8`, `.mt10`, `.mt12`, `.m0`, `.fw` = volle Zeile im Flex). Gilt für neuen Code; Bestand wird beim Anfassen umgestellt.

### Ruhe und Bewegung
- Animation nur als Antwort auf eine Aktion (Tippen, Speichern, neue Meldung); kein Dauerblinken oder Pulsieren im Ruhezustand. Ausnahme: aktiver Alarm.
- Ruhezustände sind neutral (`ink-2`, Symbole ohne Akzent); Farbe (`on`, `good`, `crit`) erst, wenn etwas an ist oder passiert.

## Logo

Der Name steht immer klein geschrieben: **tilebert**. Die Marke sind vier Kacheln (Gelb, Blau, Koralle, Mint) mit Augen und Mund. Dateien unter `logo/`, Vorschau und Regeln in der Komponente **Logo**.

- **Marke** `logo/marke.svg` (mit Mund) ab 32 px; darunter (16–31 px) `logo/marke-klein.svg`.
- **Einfarbig:** `marke-einfarbig-tinte.svg` auf hellem, `marke-einfarbig-weiss.svg` auf dunklem Grund – nur wenn Farbe nicht möglich ist.
- **Wortmarke** `wortmarke-hell.svg` (Grund hell) und `wortmarke-dunkel.svg` (Grund dunkel): Sora 600, klein, Laufweite −3 %, als Kurven; mindestens 100 px breit.
- **Schutzzone:** eine Kachelkante `s` rundum frei.
- **Favicons:** Web-App = gelbe Kachel mit Auge (`logo/favicons/webapp/`), Konfiguration = blaue Kachel mit Schalter (`logo/favicons/konfig/`).
- **Farben:** Tinte `#1f2440`, Gelb `#ffc145`, Blau `#7db7ff`, Koralle `#ff9e7a`, Mint `#5cd6a4`. Nicht umfärben, strecken oder drehen.
