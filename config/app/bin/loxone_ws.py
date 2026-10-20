"""Loxone WebSocket-Live-Client (Phase 2b).

Holt die echten State-Werte, die es ueber HTTP nicht gibt. Nutzt das per
loxone-api geholte JWT zur WS-Authentifizierung (authwithtoken) und abonniert
danach die binaeren Status-Updates (enablebinstatusupdate).

Protokoll (Kurzfassung, siehe "Communicating with the Miniserver"):
  - Jede Nachricht wird von einem 8-Byte-Header eingeleitet (Byte0=0x03,
    Byte1=Identifier, Byte4..7=Laenge, little-endian).
  - Identifier: 0=Text, 2=Value-States, 3=Text-States, 6=Keepalive,
    4=Daytimer-States, 7=Weather-States (nur wenn die Anlage den Loxone-Wetterdienst hat).
  - Value-State-Eintrag: 16-Byte-UUID + 8-Byte-double (LE).
  - Text-State-Eintrag: 16-Byte-UUID + 16-Byte-Icon-UUID + 4-Byte-Laenge +
    Text + Padding auf 4-Byte-Grenze.
  - Daytimer-Eintrag ("EvDataDaytimer"): 16-Byte-UUID + 8-Byte-double
    Vorgabewert + 4-Byte nrEntries (int32), danach nrEntries Bloecke a 24 Byte:
    4 * int32 (mode, from, to, needActivate; Zeiten in Minuten ab Mitternacht)
    + double value. Weitergereicht als Text "vorgabe,anzahl,mode,von,bis,akt,wert,..."
    (so liest ihn _irc_schedule in webvisu.py).
  - Weather-Eintrag ("EvDataWeather"): 16-Byte-UUID + 4-Byte lastUpdate
    (uint32) + 4-Byte nrEntries (int32), danach nrEntries Bloecke a 68 Byte
    ("EvDataWeatherEntry"): 5 * int32 (timestamp, weatherType, windDirection,
    solarRadiation, relativeHumidity) + 6 * double (temperature,
    perceivedTemperature, dewPoint, precipitation, windSpeed,
    barometricPressure), alles little-endian.

Nicht behandelte Identifier werden einmal pro Verbindung protokolliert — sonst
bliebe unsichtbar, dass der Miniserver etwas schickt, das hier niemand liest.
"""
from __future__ import annotations

import asyncio
import calendar
import hashlib
import hmac
import json
import logging
import re
import ssl
import struct
import time
from typing import Any, Callable

import aiohttp

log = logging.getLogger("loxpanel.ws")

ValueCallback = Callable[[str, Any], None]
# uuid -> Liste von Wetter-Eintraegen (siehe _parse_weather).
WeatherCallback = Callable[[str, list], None]


KEEPALIVE_S = 30    # Abstand der "keepalive"-Kommandos an den Miniserver
DEAD_S = 3 * KEEPALIVE_S   # so lange ohne JEDE Nachricht -> Verbindung gilt als tot
# Obergrenze fuer Verbindungsaufbau + Anmeldung. Ohne sie konnte ein Miniserver, der
# TCP/WS annimmt aber nicht antwortet (halb offen, haengende Firmware), den
# Reconnect-Loop unbegrenzt blockieren: der Keepalive-Waechter laeuft erst im Stream.
HANDSHAKE_TIMEOUT_S = 20

# Token-Erneuerung vor Ablauf (wie lxcommunicator TokenHandler._startKeepAlive):
# bei 90 % der Restlaufzeit "jdev/sys/refreshjwt", hoechstens TOKEN_REFRESH_MAX_S
# warten. Ohne Erneuerung trennt der Miniserver den WS, sobald das Token ablaeuft
# (Web-Recht: ~12,5 h nach der Anmeldung).
EPOCH_2009 = 1230768000          # validUntil zaehlt Sekunden seit 1.1.2009
TOKEN_REFRESH_SHARE = 0.9
TOKEN_REFRESH_MAX_S = 24 * 3600
TOKEN_REFRESH_MIN_S = 10         # nie in kuerzerem Abstand (auch bei unklarer Restlaufzeit)
TOKEN_REFRESH_RETRY_S = 60       # nach Verbindungsfehler/Zeitueberschreitung erneut
WS_REPLY_TIMEOUT_S = 10

# Websocket-Close-Codes des Miniservers (Loxone "Communicating with the
# Miniserver", Abschnitt "Websocket Close Codes").
WS_CLOSE_REASONS = {
    4003: "Anmeldung gesperrt (zu viele Fehlversuche)",
    4004: "ein Benutzer wurde geaendert",
    4005: "der angemeldete Benutzer wurde geaendert",
    4006: "der Benutzer wurde deaktiviert",
    4007: "Miniserver fuehrt gerade ein Update durch",
    4008: "keine freien Event-Slots (max. 31 Live-Clients)",
}
# Codes, bei denen sofortiges Wiederholen nichts bringt bzw. schadet
# (Sperre wuerde verlaengert, Benutzer deaktiviert).
WS_CLOSE_NO_HAMMER = (4003, 4006)


_cb_errors = 0   # Callback-Fehler seit Prozessstart (nur zur Log-Drosselung)


def _log_cb_error(what: str, uuid: str) -> None:
    """Die ersten Fehler mit Traceback, danach nur noch Debug: ein dauerhaft
    fehlerhafter Callback wuerde sonst bei jedem Voll-Dump tausende Zeilen schreiben."""
    global _cb_errors
    _cb_errors += 1
    if _cb_errors <= 3:
        log.exception("%s-Callback fuer %s fehlgeschlagen", what, uuid)
    else:
        log.debug("%s-Callback fuer %s fehlgeschlagen", what, uuid, exc_info=True)


class TokenRefreshFailed(Exception):
    """refreshjwt vom Miniserver abgelehnt (LL-Code != 200): Token gilt nicht mehr."""

    def __init__(self, code: str):
        super().__init__(f"refreshjwt abgelehnt (Code {code})")
        self.code = code


def _ms_off_default() -> int:
    """UTC-Abstand der Container-Uhr in s (Ersatz, solange der Aufrufer keinen liefert)."""
    t = time.time()
    return calendar.timegm(time.localtime(t)) - int(t)


def token_refresh_delay(valid_until: int | None, now: float | None = None, ms_off: int = 0) -> float:
    """Wartezeit bis zur Token-Erneuerung in s.

    validUntil zaehlt Sekunden seit 1.1.2009; lxcommunicator rechnet UTC. Ob jede
    Firmware wirklich UTC meint, ist nicht belegt (Loxone mischt UTC und Ortszeit).
    Daher vorsichtig: liegt der Miniserver oestlich von UTC, wird "jetzt" in seiner
    Ortszeit genommen (die kleinere Restlaufzeit) - zu frueh erneuern schadet nicht,
    zu spaet trennt die Verbindung. Unbekannte Laufzeit: bald erneuern (Antwort
    liefert sie dann)."""
    t = time.time() if now is None else now
    if not valid_until:
        return float(TOKEN_REFRESH_RETRY_S)
    rest = valid_until - (t - EPOCH_2009 + max(0, int(ms_off or 0)))
    return float(min(max(rest * TOKEN_REFRESH_SHARE, TOKEN_REFRESH_MIN_S), TOKEN_REFRESH_MAX_S))


def _dauer(s: float) -> str:
    return f"{s / 3600:.1f} h" if s >= 3600 else f"{round(s / 60)} min" if s >= 120 else f"{round(s)} s"


class TokenRejected(ConnectionError):
    """authwithtoken abgelehnt: Token abgelaufen, entwertet oder unbekannt.
    Der Aufrufer holt dann ein neues Token (getjwt) und verbindet erneut."""

    def __init__(self, code: str, detail: str = ""):
        super().__init__(f"authwithtoken abgelehnt (Code {code})" + (f": {detail}" if detail else ""))
        self.code = code


def ll_part(payload: Any) -> dict:
    """LL-Teil einer Miniserver-Antwort (leer, wenn keiner da ist)."""
    if isinstance(payload, dict):
        part = payload.get("LL")
        if isinstance(part, dict):
            return part
    return {}


def ll_code(payload: Any) -> str:
    """LL-Code als Text. Die Firmware liefert "Code": "200" oder "code": 200
    (Loxone-Bibliothek lxcommunicator liest beides)."""
    part = ll_part(payload)
    code = part.get("Code")
    if code is None:
        code = part.get("code")
    return "" if code is None else str(code).strip()


def ll_obj(value: Any) -> Any:
    """Objekt-Wert einer Antwort. Manche Firmware liefert ihn als JSON-Text,
    teils mit \\" statt " (lxcommunicator getLxResponseValue: "fix for
    Miniserver bug"). Text, der kein JSON-Objekt/-Feld ist, bleibt unveraendert."""
    if isinstance(value, str):
        txt = value.strip()
        if txt[:1] in ("{", "["):
            for cand in (txt, txt.replace('\\"', '"')):
                try:
                    return json.loads(cand)
                except ValueError:
                    continue
    return value


# Restzeit der Sperre steht im Close-Grund in Klammern, z. B. "... (178)"
# (lxcommunicator WebSocket._closeHandler, Close-Code 4003).
_LOCK_RE = re.compile(r"\((\d+)\)\s*$")


def lock_seconds(reason: str | None) -> int | None:
    """Restsperre in Sekunden aus dem Close-Grund, sonst None."""
    m = _LOCK_RE.search(reason or "")
    return int(m.group(1)) if m else None


def describe_close(code: int | None) -> str:
    """Lesbarer Text zu einem WS-Close-Code (leer, wenn nichts Besonderes)."""
    if code is None:
        return ""
    return WS_CLOSE_REASONS.get(code, "")


# Ein Wetter-Eintrag: 5 * int32, dann 6 * double, ohne Padding.
_WX_ENTRY = struct.Struct("<5i6d")
_WX_FIELDS = ("ts", "type", "wind_dir", "radiation", "humidity",
              "temp", "feels", "dew", "precip", "wind", "pressure")
# Daytimer: Kopf (Vorgabewert, Anzahl) nach der UUID, je Eintrag 4 * int32 + double.
_DT_HEAD = struct.Struct("<di")
_DT_ENTRY = struct.Struct("<4id")


def format_uuid(b: bytes) -> str:
    d1 = struct.unpack("<I", b[0:4])[0]
    d2 = struct.unpack("<H", b[4:6])[0]
    d3 = struct.unpack("<H", b[6:8])[0]
    d4 = b[8:16].hex()
    return f"{d1:08x}-{d2:04x}-{d3:04x}-{d4}"


class LoxoneWS:
    def __init__(self, host: str, port: int, user: str, jwt: str,
                 hash_alg: str = "SHA1", verify_tls: bool = False, secure: bool = True):
        self.host = host
        self.port = port
        self.user = user
        self.jwt = jwt
        self.hash_alg = (hash_alg or "SHA1").upper()
        self.verify_tls = verify_tls
        self.secure = secure          # False = Gen1 (ws:// statt wss://)
        self._session: aiohttp.ClientSession | None = None
        self._ws: aiohttp.ClientWebSocketResponse | None = None
        self._last_rx = 0.0           # monotonic: letzte Nachricht vom Miniserver
        self.close_code: int | None = None   # WS-Close-Code der letzten Trennung
        self.close_reason = ""               # Close-Grund (Text) der letzten Trennung
        self.out_of_service = False          # Miniserver hat Kennung 5 (Neustart/Update) gemeldet
        self.valid_until: int | None = None  # Token-Ablauf laut authwithtoken (s seit 2009)
        self._table_errors = 0               # uebersprungene Tabellen (nur fuer Log-Drosselung)
        # Token-Erneuerung: on_token(altes, neues, validUntil) meldet ein per refreshjwt
        # erneuertes Token an den Besitzer (HTTP-Anfragen, killtoken); ms_off() liefert den
        # UTC-Abstand des Miniservers (None = unbekannt -> Container-Zeitzone).
        self.on_token: Callable[[str, str, int | None], None] | None = None
        self.ms_off: Callable[[], int | None] | None = None
        self._reply: asyncio.Future | None = None   # wartet auf eine Text-Antwort im Stream
        self._reply_match = ""
        self._cmd_lock = asyncio.Lock()

    def _ssl(self) -> ssl.SSLContext:
        ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
        if not self.verify_tls:
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE
        else:
            ctx.load_default_certs(ssl.Purpose.SERVER_AUTH)   # System-CAs, sonst scheitert jedes Zertifikat
        return ctx

    async def connect(self) -> None:
        """Verbindung + Anmeldung, hart begrenzt auf HANDSHAKE_TIMEOUT_S."""
        try:
            await asyncio.wait_for(self._connect(), timeout=HANDSHAKE_TIMEOUT_S)
        except asyncio.TimeoutError:
            raise ConnectionError(
                f"Miniserver antwortet beim Verbindungsaufbau nicht ({HANDSHAKE_TIMEOUT_S}s)"
            ) from None

    async def _connect(self) -> None:
        self._session = aiohttp.ClientSession()
        scheme = "wss" if self.secure else "ws"
        url = f"{scheme}://{self.host}:{self.port}/ws/rfc6455"
        log.info("WS verbinde %s", url)
        self._ws = await self._session.ws_connect(
            url, ssl=((await asyncio.to_thread(self._ssl)) if self.secure else None),
            protocols=["remotecontrol"], max_msg_size=0)

        # 1) getkey -> HMAC(token) -> authwithtoken
        key_hex = await self._cmd_value("jdev/sys/getkey")
        digestmod = hashlib.sha256 if self.hash_alg == "SHA256" else hashlib.sha1
        token_hash = hmac.new(bytes.fromhex(key_hex), self.jwt.encode(), digestmod).hexdigest()
        auth = await self._cmd_json(f"authwithtoken/{token_hash}/{self.user}")   # roh wie lxcommunicator
        code = ll_code(auth)
        if code != "200":
            # 401/400/403: Token gilt nicht (mehr). Kein Token-Inhalt ins Log.
            raise TokenRejected(code or "?")
        val = ll_obj(ll_part(auth).get("value"))
        if isinstance(val, dict):
            try:
                self.valid_until = int(val.get("validUntil"))
            except (TypeError, ValueError):
                self.valid_until = None
        log.info("WS authentifiziert")

        # 2) Status-Updates einschalten (loest sofort einen Voll-Dump aus)
        await self._ws.send_str("jdev/sps/enablebinstatusupdate")

    async def _recv_text(self) -> str:
        assert self._ws is not None
        while True:
            msg = await self._ws.receive()
            if msg.type == aiohttp.WSMsgType.BINARY:
                continue  # 8-Byte-Header ueberspringen
            if msg.type == aiohttp.WSMsgType.TEXT:
                return msg.data
            if msg.type in (aiohttp.WSMsgType.CLOSE, aiohttp.WSMsgType.CLOSED,
                            aiohttp.WSMsgType.CLOSING, aiohttp.WSMsgType.ERROR):
                if msg.type == aiohttp.WSMsgType.CLOSE:
                    self.close_reason = str(msg.extra or "")
                self.close_code = self._ws.close_code if self._ws.close_code is not None else \
                    (msg.data if msg.type == aiohttp.WSMsgType.CLOSE else None)
                why = describe_close(self.close_code)
                raise ConnectionError(
                    f"WS geschlossen im Handshake ({msg.type}, Code {self.close_code}"
                    + (f": {why}" if why else "") + ")")

    async def _cmd_json(self, command: str) -> dict:
        assert self._ws is not None
        await self._ws.send_str(command)
        return json.loads(await self._recv_text())

    async def _cmd_value(self, command: str) -> str:
        payload = await self._cmd_json(command)
        return str(ll_part(payload).get("value") or "")

    async def stream(self, on_value: ValueCallback,
                     on_weather: WeatherCallback | None = None) -> None:
        """Empfaengt Status-Tabellen und ruft on_value(uuid, wert) je Aenderung.

        on_weather(uuid, eintraege) wird zusaetzlich gerufen, wenn die Anlage
        Wetterdaten schickt (nur mit Loxone-Wetterdienst)."""
        assert self._ws is not None
        self._last_rx = time.monotonic()
        ka = asyncio.create_task(self._keepalive())
        tk = asyncio.create_task(self._token_keeper()) if self.on_token is not None else None
        try:
            await self._receive_loop(on_value, on_weather)
        finally:
            ka.cancel()
            if tk is not None:
                tk.cancel()
            if self._reply is not None and not self._reply.done():
                self._reply.cancel()

    def _off(self) -> int:
        try:
            off = self.ms_off() if self.ms_off is not None else None
        except Exception:
            off = None
        return _ms_off_default() if off is None else int(off)

    async def _token_keeper(self) -> None:
        """Token vor Ablauf erneuern (refreshjwt ueber diesen WS), solange er lebt.
        Abgelehnt (LL-Fehler): Token gilt nicht mehr - nichts weiter tun, der Abbruch
        beim Ablauf fuehrt ueber den normalen Neuaufbau zu einem neuen Token.
        Verbindungsfehler/Zeitueberschreitung: Token behalten, spaeter erneut."""
        delay = token_refresh_delay(self.valid_until, ms_off=self._off())
        log.info("Miniserver-Token: Erneuerung in %s", _dauer(delay))
        while self._ws is not None and not self._ws.closed:
            await asyncio.sleep(delay)
            if self._ws is None or self._ws.closed:
                return
            old = self.jwt
            try:
                new, vu = await self.refresh_token()
            except TokenRefreshFailed as err:
                log.warning("Miniserver-Token nicht erneuert (%s) - neue Anmeldung beim naechsten Verbindungsaufbau", err)
                return
            except asyncio.CancelledError:
                raise
            except Exception as err:
                delay = float(TOKEN_REFRESH_RETRY_S)
                log.info("Miniserver-Token-Erneuerung fehlgeschlagen (%s) - neuer Versuch in %d s",
                         type(err).__name__, TOKEN_REFRESH_RETRY_S)
                continue
            delay = token_refresh_delay(vu, ms_off=self._off())
            log.info("Miniserver-Token erneuert - naechste Erneuerung in %s", _dauer(delay))
            if self.on_token is not None:
                try:
                    self.on_token(old, new, vu)
                except Exception:
                    log.exception("Token-Callback fehlgeschlagen")

    async def _request(self, command: str, match: str) -> dict:
        """Befehl ueber den laufenden WS senden und die passende Text-Antwort abwarten
        (die liest _receive_loop und reicht sie hierher weiter)."""
        assert self._ws is not None
        fut = asyncio.get_running_loop().create_future()
        self._reply, self._reply_match = fut, match
        try:
            await self._ws.send_str(command)
            return await asyncio.wait_for(fut, WS_REPLY_TIMEOUT_S)
        finally:
            if self._reply is fut:
                self._reply = None

    async def refresh_token(self) -> tuple[str, int | None]:
        """jdev/sys/refreshjwt/{HMAC(token, getkey)}/{user} ueber den laufenden WS
        (Doku 16.0 "Refreshing tokens"). -> (neues Token, validUntil). Das neue Token
        gilt ab sofort fuer diesen WS und weitere Anmeldungen."""
        async with self._cmd_lock:
            key_hex = str(ll_part(await self._request("jdev/sys/getkey", "sys/getkey")).get("value") or "")
            digestmod = hashlib.sha256 if self.hash_alg == "SHA256" else hashlib.sha1
            h = hmac.new(bytes.fromhex(key_hex), self.jwt.encode(), digestmod).hexdigest()
            res = await self._request(f"jdev/sys/refreshjwt/{h}/{self.user}", "sys/refreshjwt")
            code = ll_code(res)
            if code != "200":
                raise TokenRefreshFailed(code or "?")
            val = ll_obj(ll_part(res).get("value"))
            tok = val.get("token") if isinstance(val, dict) else None
            if not isinstance(tok, str) or not tok:
                raise TokenRefreshFailed("ohne Token")
            try:
                vu = int(val.get("validUntil"))
            except (TypeError, ValueError):
                vu = None
            self.jwt, self.valid_until = tok, vu
            return tok, vu

    async def _keepalive(self) -> None:
        """Loxone-Protokoll: der Client meldet sich regelmaessig mit "keepalive"
        (Antwort: Header mit Kennung 6), sonst kann der Miniserver eine
        Verbindung ohne Client-Aktivitaet nach einigen Minuten schliessen.
        Kommt DEAD_S lang gar nichts zurueck (auch keine keepalive-Antwort), ist
        die Verbindung halb offen/tot: schliessen, damit der Aufrufer neu verbindet
        statt mit eingefrorenen Werten weiterzulaufen."""
        while self._ws is not None and not self._ws.closed:
            await asyncio.sleep(KEEPALIVE_S)
            if time.monotonic() - self._last_rx > DEAD_S:
                log.warning("Miniserver antwortet seit %ds nicht -> Verbindung wird neu aufgebaut",
                            int(time.monotonic() - self._last_rx))
                try:
                    await asyncio.wait_for(self._ws.close(), 5)   # halb offen: nicht ewig auf close warten
                except Exception:
                    pass
                return
            try:
                await self._ws.send_str("keepalive")
            except Exception as err:
                log.debug("keepalive nicht gesendet: %s", err)
                return

    async def _receive_loop(self, on_value: ValueCallback,
                            on_weather: WeatherCallback | None) -> None:
        assert self._ws is not None
        pending_ident: int | None = None
        seen_unknown: set[int] = set()
        while True:
            # receive() statt async for: nur so kommt der Close-Grund an (Restsperre bei 4003)
            msg = await self._ws.receive()
            if msg.type == aiohttp.WSMsgType.CLOSE:
                self.close_reason = str(msg.extra or "")
                break
            if msg.type in (aiohttp.WSMsgType.CLOSING, aiohttp.WSMsgType.CLOSED):
                break
            self._last_rx = time.monotonic()
            if msg.type == aiohttp.WSMsgType.BINARY:
                data = msg.data
                if len(data) == 8 and data[0] == 0x03:
                    # Kennung 6 = keepalive-Antwort: nur Header, keine Nutzdaten
                    if data[1] == 5:
                        # Out-of-Service: Miniserver startet neu / wird aktualisiert.
                        # Es folgt KEIN Payload, danach schliesst er die Verbindung
                        # (Loxone-Doku). Wie lxcommunicator selbst sofort schliessen:
                        # bleibt das Close aus (halb offen), liefe sonst DEAD_S ab.
                        self.out_of_service = True
                        log.info("Miniserver meldet Out-of-Service (Neustart/Update) "
                                 "- Verbindung wird getrennt, Neuaufbau mit Pause")
                        try:
                            await asyncio.wait_for(self._ws.close(), 5)
                        except Exception:
                            pass
                        break
                    pending_ident = None if data[1] == 6 else data[1]
                    continue
                ident, pending_ident = pending_ident, None
                if ident in (2, 3, 4, 7):
                    # Ein kaputtes/unerwartetes Paket oder ein Fehler im Callback darf
                    # nicht die ganze Verbindung samt Voll-Dump kippen: Tabelle
                    # verwerfen, melden, weiterlesen (vgl. PyLoxone #517).
                    try:
                        if ident == 2:
                            self._parse_values(data, on_value)
                        elif ident == 3:
                            self._parse_texts(data, on_value)
                        elif ident == 4:
                            self._parse_daytimer(data, on_value)
                        elif on_weather is not None:
                            self._parse_weather(data, on_weather)
                    except Exception as err:
                        self._table_errors += 1
                        if self._table_errors <= 3:
                            log.warning("WS-Tabelle (Kennung %s, %d Byte) uebersprungen: %s",
                                        ident, len(data), err, exc_info=True)
                        else:
                            log.debug("WS-Tabelle (Kennung %s) uebersprungen: %s", ident, err)
                elif ident is not None and ident not in seen_unknown:
                    # Einmal pro Verbindung melden: sonst bliebe unbemerkt, dass
                    # der Miniserver eine Tabelle schickt, die hier keiner liest.
                    seen_unknown.add(ident)
                    log.info("WS-Tabelle mit unbekannter Kennung %s (%d Byte) ignoriert",
                             ident, len(data))
            elif msg.type == aiohttp.WSMsgType.TEXT:
                pending_ident = None  # Kommando-Antwort im Stream: nur fuer eine wartende Anfrage
                fut = self._reply
                if fut is not None and not fut.done():
                    try:
                        payload = json.loads(msg.data)
                    except ValueError:
                        payload = None
                    part = ll_part(payload)
                    if self._reply_match in str(part.get("control") or part.get("Control") or ""):
                        fut.set_result(payload)
            elif msg.type in (aiohttp.WSMsgType.CLOSED, aiohttp.WSMsgType.ERROR):
                log.warning("WS-Stream beendet (%s)", msg.type)
                break
        # aiohttp beendet die Iteration bei Close ohne weitere Nachricht: Code merken,
        # damit der Aufrufer begruendet (und passend lange) wartet.
        self.close_code = self._ws.close_code

    @staticmethod
    def _parse_values(data: bytes, on_value: ValueCallback) -> None:
        for off in range(0, len(data) - 23, 24):
            uuid = format_uuid(data[off:off + 16])
            val = struct.unpack("<d", data[off + 16:off + 24])[0]
            try:
                on_value(uuid, val)
            except Exception:
                # Fehler fuer EINE UUID darf die restlichen Werte der Tabelle nicht kosten.
                _log_cb_error("Wert", uuid)

    @staticmethod
    def _parse_weather(data: bytes, on_weather: WeatherCallback) -> None:
        """Wetter-Tabelle (Kennung 7) in Eintragslisten je UUID zerlegen.

        Aufbau siehe Modul-Docstring. Laengen werden vor jedem Zugriff geprueft:
        ein abgeschnittenes oder unerwartet aufgebautes Paket wird verworfen,
        nicht halb gelesen."""
        off = 0
        while off + 24 <= len(data):
            uuid = format_uuid(data[off:off + 16])
            count = struct.unpack("<i", data[off + 20:off + 24])[0]
            off += 24
            if count < 0 or off + count * _WX_ENTRY.size > len(data):
                log.warning("Wetter-Tabelle unplausibel (%s Eintraege, %d Byte Rest) — verworfen",
                            count, len(data) - off)
                return
            entries = []
            for _ in range(count):
                entries.append(dict(zip(_WX_FIELDS, _WX_ENTRY.unpack_from(data, off))))
                off += _WX_ENTRY.size
            on_weather(uuid, entries)

    @staticmethod
    def _parse_daytimer(data: bytes, on_value: ValueCallback) -> None:
        """Daytimer-Tabelle (Kennung 4) -> on_value(uuid, "vorgabe,anzahl,mode,von,bis,akt,wert,...").
        Laengen werden vor jedem Zugriff geprueft; ein unplausibles Paket wird verworfen."""
        def num(v: float) -> str:
            return str(int(v)) if float(v).is_integer() else repr(float(v))
        off = 0
        while off + 16 + _DT_HEAD.size <= len(data):
            uuid = format_uuid(data[off:off + 16])
            dflt, count = _DT_HEAD.unpack_from(data, off + 16)
            off += 16 + _DT_HEAD.size
            if count < 0 or off + count * _DT_ENTRY.size > len(data):
                log.warning("Daytimer-Tabelle unplausibel (%s Eintraege, %d Byte Rest) — verworfen",
                            count, len(data) - off)
                return
            parts = [num(dflt), str(count)]
            for _ in range(count):
                mode, frm, to, need, val = _DT_ENTRY.unpack_from(data, off)
                off += _DT_ENTRY.size
                parts += [str(mode), str(frm), str(to), str(need), num(val)]
            try:
                on_value(uuid, ",".join(parts))
            except Exception:
                _log_cb_error("Daytimer", uuid)

    @staticmethod
    def _parse_texts(data: bytes, on_value: ValueCallback) -> None:
        off = 0
        while off + 36 <= len(data):
            uuid = format_uuid(data[off:off + 16])
            tlen = struct.unpack("<I", data[off + 32:off + 36])[0]
            text = data[off + 36:off + 36 + tlen].decode("utf-8", "replace")
            try:
                on_value(uuid, text)
            except Exception:
                _log_cb_error("Text", uuid)
            off += (36 + tlen + 3) & ~3  # auf 4-Byte-Grenze aufrunden

    async def close(self) -> None:
        if self._ws is not None:
            await self._ws.close()
        if self._session is not None:
            await self._session.close()
        self._ws = self._session = None
