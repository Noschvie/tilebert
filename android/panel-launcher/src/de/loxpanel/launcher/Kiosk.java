package de.loxpanel.launcher;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.graphics.Color;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.provider.Settings;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

import android.app.Dialog;
import android.content.DialogInterface;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.graphics.drawable.GradientDrawable;
import android.view.Gravity;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.util.Locale;
import java.nio.charset.Charset;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.List;

/**
 * TbView: eigene Kiosk-Ansicht fuer tilebert (Ersatz fuer Fully, Fully bleibt Fallback).
 * Vollbild-WebView auf die Panel-URL, JS-Bruecke "TbView" mit den Fully-Namen
 * (turnScreenOn/Off, isScreenOn) plus Naeherung, Licht und Helligkeit.
 *
 * Schoner: schwarzes Overlay + Fensterhelligkeit minimal; die Seite laeuft weiter
 * (Klingel/Websocket). Wecken per Beruehrung oder Naeherungssensor.
 * Helligkeit nur fuer dieses Fenster (Geraeteeinstellung bleibt): Auto-Helligkeit
 * aus dem Lichtsensor (X2i: Stufen 0..16, keine Lux) mal Nachtfaktor des Panels.
 */
public class Kiosk extends Activity implements SensorEventListener {
    static final String KEY_MODE = "mode";      // "tbview" | "fully" (Standard: fully)
    private static final long RETRY_MS = 3000;
    private static final long LIGHT_HOLD_MS = 3000;   // Hysterese gegen kurze Lichtwechsel
    private static final float SHELLY_MIN_BRIGHT = 0.04f;   // kleinste Fensterhelligkeit, die der Shelly wirklich minimal umsetzt

    private final Handler ui = new Handler();
    private WebView web;
    private View saver;
    private SensorManager sm;
    private Sensor prox, light;

    // Zustand
    private boolean saverOn, panelSaver, offEnabled, near, loaded;
    private final String tok = newToken();   // Bruecken-Token: nur das Panel (Hauptframe) kennt es
    private volatile boolean trusted;   // aktuelle Seite hat die Panel-Origin (nur dann Bruecke/Ereignisse)
    private long offMs = 0;
    private int lightLevel = -1, pendingLevel = -1;
    private long pendingSince;
    private float lightMax = 16f;
    private boolean autoOn = true;
    private int minPct = 10, maxPct = 100, nightPct = 100;
    private boolean proxWake = true;
    private int fixPct = 0;               // feste Helligkeit in % (0 = nicht gesetzt -> Systemhelligkeit)
    private boolean touchSound;           // Android-Klickton bei Tipp (Panel-Einstellung sound.touch)
    private boolean luxSensor;            // Lichtsensor meldet Lux (Bereich gross) statt Stufen (Shelly: Bereich < 100)
    private float lightNorm = -1f;        // 0..1 (Stufen: Anteil; Lux: logarithmisch)
    private float luxRef = -1f, luxMuted; // Bezug fuer die relative Lux-Aenderung (Praesenz)
    private FrameLayout rootView;
    private WebView setupWeb;
    private float shown = -2f;   // zuletzt gesetzte Fensterhelligkeit

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
                | WindowManager.LayoutParams.FLAG_FULLSCREEN
                | WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED);
        FrameLayout root = new FrameLayout(this);
        rootView = root;
        // kein eigener Hintergrund: die WebView (schwarz) deckt alles, spart eine Vollbild-Fuellung je Frame

        web = new WebView(this);
        web.setBackgroundColor(Color.BLACK);
        // kein eigener Hardware-Layer: spart Offscreen-Textur (~4 MB) + eine Vollbild-Kopie je Frame
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);
        web.setVerticalScrollBarEnabled(false);
        web.setHorizontalScrollBarEnabled(false);
        web.setHapticFeedbackEnabled(false);
        web.setLongClickable(false);   // kein Textauswahl-/Kontextmenue am Wandpanel
        web.setOnLongClickListener(new View.OnLongClickListener() {
            @Override public boolean onLongClick(View v) { return true; }
        });
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        s.setMediaPlaybackRequiresUserGesture(false);   // Klingel-Ton, Kamera
        s.setTextZoom(100);                              // Systemschrift nicht hochskalieren
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);
        s.setUseWideViewPort(true);
        s.setLoadWithOverviewMode(true);
        s.setAllowFileAccess(false);
        if (Build.VERSION.SDK_INT >= 21) s.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        if (Build.VERSION.SDK_INT >= 26) {
            s.setSafeBrowsingEnabled(false);             // LAN-Seite, spart Pruefungen
            web.setRendererPriorityPolicy(WebView.RENDERER_PRIORITY_IMPORTANT, false);
        }
        s.setUserAgentString(s.getUserAgentString() + " TbView/" + version());
        // chrome://inspect nur in debuggable Builds (Release: aus)
        if (Build.VERSION.SDK_INT >= 19 && (getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0)
            WebView.setWebContentsDebuggingEnabled(true);
        web.addJavascriptInterface(new Bridge(), "TbView");
        web.setWebViewClient(new Client());
        root.addView(web, new FrameLayout.LayoutParams(-1, -1));

        saver = new View(this);
        saver.setBackgroundColor(Color.BLACK);
        saver.setVisibility(View.GONE);
        root.addView(saver, new FrameLayout.LayoutParams(-1, -1));
        setContentView(root);
        // Fensterhintergrund (Startbild) nach dem Start nicht mehr unter der WebView mitzeichnen,
        // Fenster deckend: spart je Frame eine Vollbild-Fuellung und das Mischen im SurfaceFlinger
        getWindow().setBackgroundDrawable(null);
        getWindow().setFormat(android.graphics.PixelFormat.OPAQUE);

        sm = (SensorManager) getSystemService(SENSOR_SERVICE);
        if (sm != null) {
            // X2i: Naeherung ist ein Wake-up-Sensor -> Liste zuerst (getDefaultSensor liefert ihn nicht ueberall)
            List<Sensor> l = sm.getSensorList(Sensor.TYPE_PROXIMITY);
            prox = l.isEmpty() ? sm.getDefaultSensor(Sensor.TYPE_PROXIMITY) : l.get(0);
            light = sm.getDefaultSensor(Sensor.TYPE_LIGHT);
            if (light != null) {
                float rg = light.getMaximumRange();
                if (rg > 0 && rg < 100) lightMax = rg;   // Shelly: Stufen 0..16
                else luxSensor = true;                    // Tablet: Lux -> logarithmisch auf Stufen 0..16 abgebildet
            }
        }
        if (light == null) autoOn = false;
        load();
    }

    private String url() {
        String u = getSharedPreferences("cfg", MODE_PRIVATE).getString("url", "").trim();
        // ohne Schema (z. B. 192.168.1.10:8098) http:// ergaenzen, sonst bleibt sameOrigin dauerhaft false
        if (!u.isEmpty() && !u.matches("(?i)^[a-z][a-z0-9+.-]*://.*")) u = "http://" + u;
        return u;
    }

    private static String newToken() {
        byte[] b = new byte[16];
        new SecureRandom().nextBytes(b);
        StringBuilder sb = new StringBuilder();
        for (byte x : b) sb.append(String.format("%02x", x & 0xff));
        return sb.toString();
    }

    /** Token pruefen (konstantzeitig). */
    private boolean ok(String t) {
        if (t == null) return false;
        Charset c = Charset.forName("UTF-8");
        return MessageDigest.isEqual(tok.getBytes(c), t.getBytes(c));
    }

    /** Panel-URL plus ?tbtok=... (bestehende Query bleibt, Fragment bleibt am Ende). */
    private String urlWithToken(String u) {
        String frag = "";
        int h = u.indexOf('#');
        if (h >= 0) { frag = u.substring(h); u = u.substring(0, h); }
        return u + (u.indexOf('?') >= 0 ? (u.endsWith("?") || u.endsWith("&") ? "" : "&") : "?") + "tbtok=" + tok + frag;
    }

    private void load() {
        String u = url();
        if (u.isEmpty()) {   // Erststart ohne adb: lokale Einrichtungsseite
            trusted = false;
            showSetup();
            return;
        }
        hideSetup();
        loaded = false;
        trusted = sameOrigin(u);   // Panel-URL ist per Definition vertrauenswuerdig; kein Fenster bis onPageStarted
        web.loadUrl(urlWithToken(u));
    }

    /** Marke 96 px (Quelle design-system/logo/marke.svg), inline: kein Request, keine Datei. */
    private static final String MARKE = "<svg width='96' height='96' viewBox='0 0 48 48' aria-hidden='true'>"
            + "<rect x='4' y='4' width='19.137' height='19.137' rx='7.31' fill='#ffc145'/>"
            + "<rect x='24.863' y='4' width='19.137' height='19.137' rx='7.31' fill='#7db7ff'/>"
            + "<rect x='4' y='24.863' width='19.137' height='19.137' rx='7.31' fill='#ff9e7a'/>"
            + "<rect x='24.863' y='24.863' width='19.137' height='19.137' rx='7.31' fill='#5cd6a4'/>"
            + "<circle cx='13.569' cy='13.569' r='2.259' fill='#1f2440'/>"
            + "<rect x='28.518' y='10.612' width='11.827' height='5.914' rx='2.957' fill='#1f2440'/>"
            + "<circle cx='37.388' cy='13.569' r='1.921' fill='#7db7ff'/>"
            + "<path d='M19.276 31.475H28.724A1.07 1.07 0 0 1 29.768 32.781A5.914 5.914 0 0 1 18.232 32.781A1.07 1.07 0 0 1 19.276 31.475Z' fill='#1f2440'/></svg>";

    /** Lokale Hinweisseite; loadDataWithBaseURL statt loadData, weil '#' (Farben) sonst als Fragment gilt. */
    private void page(String html) {
        web.loadDataWithBaseURL(null, html, "text/html", "utf-8", null);
    }

    /** true, wenn u dieselbe Origin (Schema, Host, Port) wie die Panel-URL hat. */
    private boolean sameOrigin(String u) {
        if (u == null) return false;
        try {
            Uri a = Uri.parse(url()), b = Uri.parse(u);
            if (a.getScheme() == null || a.getHost() == null || b.getScheme() == null || b.getHost() == null) return false;
            return a.getScheme().equalsIgnoreCase(b.getScheme()) && a.getHost().equalsIgnoreCase(b.getHost())
                    && port(a) == port(b);
        } catch (Exception e) { return false; }
    }

    private static int port(Uri u) {
        int p = u.getPort();
        if (p >= 0) return p;
        return "https".equalsIgnoreCase(u.getScheme()) ? 443 : 80;
    }

    private final Runnable retry = new Runnable() {
        @Override public void run() { load(); }
    };

    private class Client extends WebViewClient {
        // Fremde Origin nicht laden: Bruecke und Ereignisse nur fuer die Panel-Seite
        // Nur die Hauptnavigation pruefen; iframes (Web-Kacheln) duerfen fremde Seiten laden.
        // Altes API (vor API 24) kennt keinen Frame -> dort wie Hauptframe behandeln.
        @Override public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
            if (!r.isForMainFrame()) return false;
            return blockMain(r.getUrl().toString());
        }

        @Override public boolean shouldOverrideUrlLoading(WebView v, String u) { return blockMain(u); }

        private boolean blockMain(String u) {
            if (sameOrigin(u)) return false;
            // blockierte Hauptnavigation: Fehlerbild + Neuversuch der Panel-URL statt stilles Schwarz
            ui.post(new Runnable() { public void run() { if (web != null) offline(); } });
            return true;
        }

        @Override public void onPageStarted(WebView v, String u, android.graphics.Bitmap icon) { trusted = sameOrigin(u); }

        @Override public void onPageFinished(WebView v, String u) { trusted = sameOrigin(u); loaded = trusted; if (trusted) emitState(); }

        @Override public void onReceivedError(WebView v, int code, String desc, String failingUrl) {
            // Server noch nicht da (Boot, Neustart des Containers): leise erneut versuchen
            if (failingUrl != null && failingUrl.equals(v.getUrl())) offline();
        }

        @Override public void onReceivedError(WebView v, WebResourceRequest r, WebResourceError e) {
            if (Build.VERSION.SDK_INT >= 21 && r.isForMainFrame()) offline();
        }

        @Override public boolean onRenderProcessGone(WebView v, RenderProcessGoneDetail d) {
            // Renderer abgestuerzt/beendet: Activity neu aufbauen statt App-Absturz
            recreate();
            return true;
        }
    }

    private void offline() {
        page("<body style='margin:0;background:#0d0f1a;color:#aaa;font:18px sans-serif;display:flex;flex-direction:column;"
                + "align-items:center;justify-content:center;gap:20px;height:100vh;text-align:center'>" + MARKE
                + "<div>tilebert nicht erreichbar &ndash; neuer Versuch &hellip;</div></body>");
        ui.removeCallbacks(retry);
        ui.postDelayed(retry, RETRY_MS);
    }

    @Override
    protected void onResume() {
        super.onResume();
        immersive();
        web.onResume();
        if (sm != null) {
            if (prox != null) sm.registerListener(this, prox, SensorManager.SENSOR_DELAY_UI);
            if (light != null) sm.registerListener(this, light, SensorManager.SENSOR_DELAY_NORMAL);
        }
        applyBrightness();
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (sm != null) sm.unregisterListener(this);
    }

    @Override
    protected void onDestroy() {
        ui.removeCallbacksAndMessages(null);
        if (web != null) { web.destroy(); web = null; }
        super.onDestroy();
    }

    @Override public void onWindowFocusChanged(boolean f) { super.onWindowFocusChanged(f); if (f) immersive(); }

    @Override public void onBackPressed() { /* Wandpanel: kein Zurueck aus dem Kiosk */ }

    @Override
    protected void onNewIntent(Intent i) {
        super.onNewIntent(i);
        if (i != null && i.getBooleanExtra("reload", false)) load();
    }

    private void immersive() {
        getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                | View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_STABLE | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);
    }

    // ---- Beruehrung: erster Tipp im Schoner weckt nur (loest nichts darunter aus) ----
    @Override
    public boolean dispatchTouchEvent(MotionEvent ev) {
        if (ev.getActionMasked() == MotionEvent.ACTION_DOWN) {
            countTap(ev.getEventTime());   // Tipp wird nicht verschluckt
            if (touchSound && !saverOn && web != null) web.playSoundEffect(android.view.SoundEffectConstants.CLICK);   // folgt der Systemeinstellung "Touch-Toene"
        }
        if (saverOn) {
            if (ev.getActionMasked() == MotionEvent.ACTION_DOWN) userWake();
            return true;
        }
        rearmOff();
        return super.dispatchTouchEvent(ev);
    }

    // ---- Sensoren ----
    @Override
    public void onSensorChanged(SensorEvent e) {
        if (e.sensor.getType() == Sensor.TYPE_PROXIMITY) {
            boolean n = e.values.length > 0 && e.values[0] < e.sensor.getMaximumRange();
            if (n == near) return;
            near = n;
            // Display an; ob das Dashboard schliesst, entscheidet das Panel (Ereignis "prox")
            if (near && saverOn && proxWake) { exitSaver(); rearmOff(); }
            js("prox", near ? "true" : "false");
        } else if (e.sensor.getType() == Sensor.TYPE_LIGHT) {
            float raw = e.values[0];
            if (luxSensor) luxPresence(raw);
            int lv = luxSensor ? Math.round(luxNorm(raw) * 16f) : Math.round(raw);
            long now = System.currentTimeMillis();
            if (lightLevel < 0 || Math.abs(lv - lightLevel) >= 3) { setLight(lv); return; }   // grosser Sprung sofort
            if (lv == lightLevel) { pendingLevel = -1; return; }
            if (lv != pendingLevel) { pendingLevel = lv; pendingSince = now; return; }
            if (now - pendingSince >= LIGHT_HOLD_MS) setLight(lv);
        }
    }

    /** Lux -> 0..1, logarithmisch (0 lx = 0, 1000 lx = 1). */
    private static float luxNorm(float lux) {
        return Math.max(0f, Math.min(1f, (float) (Math.log10(Math.max(0f, lux) + 1.0) / 3.0)));
    }

    /** Praesenz bei Lux-Sensoren: relative Aenderung >= 30 % und >= 5 lx gegen einen langsam nachgefuehrten Bezug. */
    private void luxPresence(float lux) {
        if (luxRef < 0f) { luxRef = lux; return; }
        float d = Math.abs(lux - luxRef);
        if (d >= 5f && d >= 0.3f * Math.max(luxRef, 1f)) { luxRef = lux; js("lux", String.valueOf(Math.round(lux))); }
        else luxRef += 0.2f * (lux - luxRef);
    }

    private void setLight(int lv) {
        lightLevel = lv;
        lightNorm = luxSensor ? lv / 16f : Math.max(0f, Math.min(1f, lv / (lightMax * 0.85f)));
        pendingLevel = -1;
        applyBrightness();
        js("light", String.valueOf(lv));
    }

    @Override public void onAccuracyChanged(Sensor s, int a) {}

    // ---- Helligkeit ----
    /** Auto-Kurve: Stufe 0..max -> Anteil min..max (Wurzel: dunkle Raeume feiner abgestuft). */
    private float autoFraction() {
        float minF = minPct / 100f, maxF = Math.max(minF, maxPct / 100f);
        float x = Math.max(0f, Math.min(1f, lightNorm));
        return minF + (maxF - minF) * (float) Math.sqrt(x);
    }

    /** Systemhelligkeit als Anteil, null bei automatischer Helligkeit (unbekannt). */
    private Float systemFraction() {
        try {
            if (Settings.System.getInt(getContentResolver(), Settings.System.SCREEN_BRIGHTNESS_MODE) == 1) return null;
            return Math.min(1f, Settings.System.getInt(getContentResolver(), Settings.System.SCREEN_BRIGHTNESS) / 255f);
        } catch (Settings.SettingNotFoundException ex) {
            return null;
        }
    }

    private void applyBrightness() {
        float b;
        if (saverOn) b = 0f;   // praktisch dunkel
        else if (nightPct < 100) b = Math.max(0.01f, nightPct / 100f);   // Nacht: Restleuchtkraft gilt direkt (nicht mal Auto)
        else {
            Float base = (autoOn && lightLevel >= 0) ? Float.valueOf(autoFraction()) : (fixPct > 0 ? Float.valueOf(fixPct / 100f) : null);
            b = base == null ? WindowManager.LayoutParams.BRIGHTNESS_OVERRIDE_NONE : Math.max(0.01f, base);
        }
        // Shelly: Werte unter dem Systemminimum (~3,5 %) setzt die Firmware NICHT auf minimal, sondern faellt auf
        // Backlight 169/255 zurueck (gemessen: 0-2 % -> 169, 4 % -> 11, 25 % -> 65). Daher dort mind. 4 %.
        if (b >= 0f && b < SHELLY_MIN_BRIGHT && StockHome.isShelly()) b = SHELLY_MIN_BRIGHT;
        if (Math.abs(b - shown) < 0.005f) return;
        shown = b;
        WindowManager.LayoutParams lp = getWindow().getAttributes();
        lp.screenBrightness = b;
        getWindow().setAttributes(lp);
    }

    // ---- Schoner ----
    private final Runnable goDark = new Runnable() {
        @Override public void run() { enterSaver(); }
    };

    private void rearmOff() {
        ui.removeCallbacks(goDark);
        if (offEnabled && panelSaver && !saverOn) ui.postDelayed(goDark, offMs);
    }

    private void enterSaver() {
        if (saverOn) return;
        saverOn = true;
        saver.setVisibility(View.VISIBLE);
        saver.bringToFront();
        applyBrightness();
        js("screen", "false");
    }

    private void exitSaver() {
        if (!saverOn) return;
        saverOn = false;
        saver.setVisibility(View.GONE);
        applyBrightness();
        js("screen", "true");
    }

    private void userWake() {
        exitSaver();
        rearmOff();
        // Panel schliesst seinen Schoner (wie Fully "onScreenOn")
        if (web != null && trusted) web.evaluateJavascript("try{ if(typeof wake==='function') wake(); }catch(e){}", null);
    }

    /** Ereignis an das Panel: window.lpHost._ev(name, wert) - nur wenn das Panel es kennt. */
    private void js(final String ev, final String val) {
        if (web == null || !loaded || !trusted) return;
        ui.post(new Runnable() {
            @Override public void run() {
                if (web != null && trusted) web.evaluateJavascript("try{ var h=window.lpHost||(typeof lpHost!=='undefined'?lpHost:null); if(h&&h._ev) h._ev('" + ev + "'," + val + "); }catch(e){}", null);
            }
        });
    }

    private void emitState() {
        js("prox", near ? "true" : "false");
        if (lightLevel >= 0) js("light", String.valueOf(lightLevel));
    }

    private String version() {
        try { return getPackageManager().getPackageInfo(getPackageName(), 0).versionName; }
        catch (Exception e) { return "?"; }
    }

    /** JS-Bruecke. Methoden laufen im Binder-Thread -> UI-Aenderungen per ui.post. */
    private class Bridge {
        // -- wie Fully Kiosk --
        @JavascriptInterface public void turnScreenOn(String t) { if (!trusted || !ok(t)) return; ui.post(new Runnable() { public void run() { exitSaver(); rearmOff(); } }); }
        @JavascriptInterface public void turnScreenOff(String t) { if (!trusted || !ok(t)) return; ui.post(new Runnable() { public void run() { enterSaver(); } }); }
        @JavascriptInterface public boolean isScreenOn(String t) { if (!trusted || !ok(t)) return false; return !saverOn; }
        @JavascriptInterface public String getDeviceId(String t) { if (!trusted || !ok(t)) return "";
            return Settings.Secure.getString(getContentResolver(), Settings.Secure.ANDROID_ID);
        }

        // -- Schoner (wie LoxKiosk) --
        /** Backlight aus n s nach Start des Panel-Schoners; 0 = nie. */
        @JavascriptInterface public void setDisplayOff(String t, final int seconds) { if (!trusted || !ok(t)) return;
            ui.post(new Runnable() { public void run() {
                offEnabled = seconds > 0;
                offMs = seconds * 1000L;
                if (offEnabled) rearmOff(); else { ui.removeCallbacks(goDark); exitSaver(); }
            } });
        }
        /** Panel meldet seinen eigenen Schoner (Uhr/Dashboard) an/aus. */
        @JavascriptInterface public void setSaver(String t, final boolean on) { if (!trusted || !ok(t)) return;
            ui.post(new Runnable() { public void run() {
                panelSaver = on;
                if (on) rearmOff(); else { ui.removeCallbacks(goDark); exitSaver(); }
            } });
        }

        // -- Helligkeit --
        /** Nachtfaktor in % (100 = normal). true = App dunkelt echt ab, false = Panel soll per Overlay abdunkeln. */
        @JavascriptInterface public boolean setDisplayBrightness(String t, final int prozent) { if (!trusted || !ok(t)) return false;
            final int p = Math.max(1, Math.min(100, prozent));
            ui.post(new Runnable() { public void run() { nightPct = p; applyBrightness(); } });
            return true;   // Fensterhelligkeit geht immer
        }
        /** Feste Helligkeit in % (ohne Auto); 0 = Systemhelligkeit. */
        @JavascriptInterface public void setFixedBrightness(String t, final int prozent) { if (!trusted || !ok(t)) return;
            ui.post(new Runnable() { public void run() { fixPct = Math.max(0, Math.min(100, prozent)); applyBrightness(); } });
        }
        /** Android-Klickton bei Tipp an/aus (wirkt nur, wenn "Touch-Toene" im System an sind). */
        @JavascriptInterface public void setTouchSound(String t, final boolean on) { if (!trusted || !ok(t)) return;
            ui.post(new Runnable() { public void run() { touchSound = on; } });
        }
        /** Auto-Helligkeit aus dem Lichtsensor an/aus, Bereich min..max in %. */
        @JavascriptInterface public void setAutoBrightness(String t, final boolean on, final int minProzent, final int maxProzent) { if (!trusted || !ok(t)) return;
            ui.post(new Runnable() { public void run() {
                autoOn = on && light != null;
                minPct = Math.max(1, Math.min(100, minProzent));
                maxPct = Math.max(minPct, Math.min(100, maxProzent));
                applyBrightness();
            } });
        }
        /** Annaeherung weckt das Display (true) oder wird nur gemeldet (false). */
        @JavascriptInterface public void setProximityWake(String t, final boolean on) { if (!trusted || !ok(t)) return;
            ui.post(new Runnable() { public void run() { proxWake = on; } });
        }

        // -- Sensoren / Geraet --
        @JavascriptInterface public boolean getProximity(String t) { if (!trusted || !ok(t)) return false; return near; }
        @JavascriptInterface public int getLightLevel(String t) { if (!trusted || !ok(t)) return -1; return lightLevel; }
        @JavascriptInterface public String getDeviceInfo(String t) { if (!trusted || !ok(t)) return "";
            return "{\"app\":\"TbViewer\",\"ver\":\"" + version() + "\",\"model\":\"" + Build.MODEL
                    + "\",\"android\":\"" + Build.VERSION.RELEASE + "\",\"sdk\":" + Build.VERSION.SDK_INT
                    + ",\"prox\":" + (prox != null) + ",\"light\":" + (light != null)
                    + ",\"shelly\":" + StockHome.isShelly() + ",\"lux\":" + luxSensor + ",\"lightMax\":" + lightMax + ",\"auto\":" + autoOn + ",\"min\":" + minPct
                    + ",\"max\":" + maxPct + ",\"fix\":" + fixPct + ",\"proxWake\":" + proxWake + "}";
        }
        @JavascriptInterface public void reload(String t) { if (!trusted || !ok(t)) return; ui.post(new Runnable() { public void run() { load(); } }); }
    }

    // ---- Erststart ohne Adresse: lokale Einrichtungsseite (assets/setup.html), Schnittstelle "TbSetup" nur hier ----
    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    private void showSetup() { showSetup(""); }

    /** prefill nicht leer: bestehende Adresse aendern (Seite zeigt sie im Feld und bietet "Abbrechen"). */
    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    private void showSetup(String prefill) {
        if (setupWeb != null || rootView == null) return;
        final WebView w = new WebView(this);
        w.setBackgroundColor(0xff0d0f1a);
        WebSettings ws = w.getSettings();
        ws.setJavaScriptEnabled(true);
        ws.setAllowFileAccess(false);        // android_asset bleibt erreichbar
        ws.setAllowContentAccess(false);
        w.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView v, String u) { return true; }
            @Override public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) { return true; }
        });
        w.addJavascriptInterface(new SetupBridge(this, w), "TbSetup");
        rootView.addView(w, new FrameLayout.LayoutParams(-1, -1));
        setupWeb = w;
        w.loadUrl("file:///android_asset/setup.html" + (prefill.isEmpty() ? "" : "#" + Uri.encode(prefill)));
    }

    void setupCancel(WebView w) { if (setupWeb == w && !url().isEmpty()) hideSetup(); }

    private void hideSetup() {
        if (setupWeb == null) return;
        rootView.removeView(setupWeb);
        setupWeb.destroy();
        setupWeb = null;
    }

    /** Adresse pruefen (GET /api/version) und speichern - aus SetupBridge, im Hintergrund-Thread. */
    void setupConnect(final String addr, final WebView out) {
        new Thread(new Runnable() {
            @Override public void run() {
                String o = "";
                String err = "";
                String keep = "/";
                try {
                    String a = addr == null ? "" : addr.trim();
                    if (!a.matches("(?i)^[a-z][a-z0-9+.-]*://.*")) a = "http://" + a;
                    Uri u = Uri.parse(a);
                    if (u.getHost() == null || u.getHost().isEmpty() || !(u.getScheme().equalsIgnoreCase("http") || u.getScheme().equalsIgnoreCase("https"))) throw new IllegalArgumentException("addr");
                    o = origin(a);
                    // Pfad + Query (?device=..&panel=..): getippte nehmen, sonst die bisherigen behalten
                    String tp = u.getEncodedPath(), tq = u.getEncodedQuery();
                    if ((tp != null && tp.length() > 1) || tq != null) {
                        keep = (tp == null || tp.isEmpty() ? "/" : tp) + (tq != null ? "?" + tq : "");
                    } else {
                        String cur = url();
                        if (!cur.isEmpty()) {
                            Uri cu = Uri.parse(cur);
                            String cp = cu.getEncodedPath(), cq = cu.getEncodedQuery();
                            keep = (cp == null || cp.isEmpty() ? "/" : cp) + (cq != null ? "?" + cq : "");
                        }
                    }
                    HttpURLConnection c = (HttpURLConnection) new java.net.URL(o + "/api/version").openConnection();
                    c.setConnectTimeout(4000);
                    c.setReadTimeout(4000);
                    BufferedReader r = new BufferedReader(new InputStreamReader(c.getInputStream(), "UTF-8"));
                    StringBuilder sb = new StringBuilder();
                    String ln;
                    while ((ln = r.readLine()) != null && sb.length() < 4096) sb.append(ln);
                    r.close();
                    if (new org.json.JSONObject(sb.toString()).optString("version", "").isEmpty()) throw new Exception("noversion");
                } catch (IllegalArgumentException e) { err = "addr";
                } catch (Exception e) { err = "conn"; }
                final String fo = o, fe = err, fk = keep;
                runOnUiThread(new Runnable() { @Override public void run() {
                    if (setupWeb != out) return;
                    if (fe.isEmpty()) {
                        Fully.saveUrl(Kiosk.this, fo + fk);
                        load();
                    } else {
                        out.evaluateJavascript("window.tbResult&&window.tbResult(false," + org.json.JSONObject.quote(fe) + ")", null);
                    }
                } });
            }
        }).start();
    }

    /** Panel oeffnen: TbView, wenn gewaehlt, sonst Fully (Fallback). force = Seite neu laden. */
    static void openPanel(Context c, boolean force) {
        if (enabled(c)) {
            Intent i = new Intent(c, Kiosk.class);
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
            if (force) i.putExtra("reload", true);
            c.startActivity(i);
        } else {
            Fully.start(c, force);
        }
    }

    static boolean enabled(Context c) {
        String m = c.getSharedPreferences("cfg", MODE_PRIVATE).getString(KEY_MODE, null);
        // nie gewaehlt (Tablet ohne adb): tilebert-Ansicht, solange Fully nicht installiert ist
        if (m == null) return c.getPackageManager().getLaunchIntentForPackage(Fully.PKG) == null;
        return "tbview".equals(m);
    }

    static void setMode(Context c, String mode) {
        c.getSharedPreferences("cfg", MODE_PRIVATE).edit()
                .putString(KEY_MODE, "tbview".equals(mode) ? "tbview" : "fully").apply();
    }

    // ---- Info-Popup: 5 oder mehr schnelle Tipps (je Abstand < 500 ms) ----
    private long tapLast;
    private int tapN;
    private Dialog info;

    private void countTap(long t) {
        tapN = (tapN > 0 && t - tapLast < 500) ? tapN + 1 : 1;
        tapLast = t;
        if (tapN >= 5) { tapN = 0; showInfo(); }
    }

    private static boolean de() { return "de".equals(Locale.getDefault().getLanguage()); }
    private static String tr(String d, String e) { return de() ? d : e; }

    private int dp(int v) { return (int) (v * getResources().getDisplayMetrics().density + 0.5f); }

    private boolean isDefaultHome() {
        try {
            Intent h = new Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_HOME);
            ResolveInfo r = getPackageManager().resolveActivity(h, PackageManager.MATCH_DEFAULT_ONLY);
            return r != null && r.activityInfo != null && getPackageName().equals(r.activityInfo.packageName);
        } catch (Exception e) { return false; }
    }

    /** Info-Seite: HTML-Asset in eigener WebView (Vollbild-Dialog, transparent). Die Schnittstelle "TbInfo"
     *  haengt NUR an dieser lokalen WebView, nicht an der Panel-WebView. */
    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    private void showInfo() {
        if (info != null && info.isShowing()) return;
        final WebView w = new WebView(this);
        w.setBackgroundColor(Color.TRANSPARENT);
        WebSettings ws = w.getSettings();
        ws.setJavaScriptEnabled(true);
        ws.setAllowFileAccess(false);        // android_asset bleibt erreichbar
        ws.setAllowContentAccess(false);
        w.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView v, String u) { return true; }
        });
        w.addJavascriptInterface(new InfoBridge(Kiosk.this, w), "TbInfo");
        Dialog dlg = new Dialog(this, android.R.style.Theme_Translucent_NoTitleBar_Fullscreen) {
            @Override public void onBackPressed() { dismiss(); }
        };
        dlg.setContentView(w, new FrameLayout.LayoutParams(-1, -1));
        dlg.getWindow().setLayout(-1, -1);
        dlg.setOnDismissListener(new DialogInterface.OnDismissListener() {
            @Override public void onDismiss(DialogInterface d) { w.destroy(); info = null; immersive(); }
        });
        info = dlg;
        dlg.show();
        dlg.getWindow().getDecorView().setSystemUiVisibility(getWindow().getDecorView().getSystemUiVisibility()
                | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION);
        // Sprache von tilebert: Panel-WebView fragen (html lang, setzt das Panel aus dem Profil), sonst Systemsprache
        infoLang = null;
        final boolean[] go = { false };
        final Runnable start = new Runnable() { @Override public void run() {
            if (go[0]) return; go[0] = true;
            if (info != null && info.isShowing()) w.loadUrl("file:///android_asset/info.html");
        } };
        if (web != null && trusted) {
            try {
                web.evaluateJavascript("(function(){try{return document.documentElement.lang||''}catch(e){return ''}})()", new android.webkit.ValueCallback<String>() {
                    @Override public void onReceiveValue(String v) {
                        String l = v == null ? "" : v.replace("\"", "").trim().toLowerCase(Locale.ROOT);
                        if (l.startsWith("de")) infoLang = "de"; else if (l.startsWith("en")) infoLang = "en";
                        start.run();
                    } });
                ui.postDelayed(start, 700);
            } catch (Exception e) { start.run(); }
        } else start.run();
    }
    private volatile String infoLang;

    // Zugriffe fuer InfoBridge (eigene Datei, nur an der Info-WebView)
    String infoData() {
        String vn = "?"; int vc = 0;
        try {
            PackageInfo pi = getPackageManager().getPackageInfo(getPackageName(), 0);
            vn = pi.versionName; vc = pi.versionCode;
        } catch (Exception ignored) { }
        try {
            org.json.JSONObject j = new org.json.JSONObject();
            j.put("vn", vn); j.put("vc", vc);
            j.put("model", Build.MODEL); j.put("android", Build.VERSION.RELEASE);
            j.put("home", isDefaultHome());
            j.put("origin", origin(url()));
            j.put("shelly", StockHome.isShelly());
            String il = infoLang; j.put("lang", il != null ? il : (de() ? "de" : "en"));
            return j.toString();
        } catch (Exception e) { return "{}"; }
    }
    void infoReady(WebView w) { fetchServerVersion(w); }
    void infoRestart() { if (info != null) info.dismiss(); recreate(); }
    void infoHome() { chooseHome(); }
    void infoClose() { if (info != null) info.dismiss(); }
    /** Einstellungen am Geraet: Info schliessen, Panel zeigt sein Overlay (lpHost-Ereignis "settings"). */
    void infoSettings() { if (info != null) info.dismiss(); js("settings", "true"); }
    /** Adresse aendern (nur Tablets): Info schliessen, Einrichtungsseite mit der aktuellen Adresse. */
    void infoAddr() {
        if (info != null) info.dismiss();
        if (!StockHome.isShelly()) showSetup(url());
    }

    private static String origin(String base) {
        try {
            Uri u = Uri.parse(base);
            if (u.getScheme() == null || u.getHost() == null) return "";
            return u.getScheme() + "://" + u.getHost() + (u.getPort() >= 0 ? ":" + u.getPort() : "");
        } catch (Exception e) { return ""; }
    }

    private void chooseHome() {
        try {
            startActivity(new Intent(Settings.ACTION_HOME_SETTINGS));
        } catch (Exception e) {
            try {
                startActivity(Intent.createChooser(new Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_HOME), null));
            } catch (Exception e2) { /* keine Auswahl verfuegbar */ }
        }
    }

    /** tilebert-Version vom Server (GET /api/version, gleiche Origin wie die Panel-URL), asynchron an die Info-Seite. */
    private void fetchServerVersion(final WebView out) {
        final String base = url();
        new Thread(new Runnable() {
            @Override public void run() {
                String v = "", cm = "";
                try {
                    String origin = origin(base);
                    if (origin.isEmpty()) throw new Exception();
                    HttpURLConnection c = (HttpURLConnection) new java.net.URL(origin + "/api/version").openConnection();
                    c.setConnectTimeout(3000);
                    c.setReadTimeout(3000);
                    BufferedReader r = new BufferedReader(new InputStreamReader(c.getInputStream(), "UTF-8"));
                    StringBuilder sb = new StringBuilder();
                    String ln;
                    while ((ln = r.readLine()) != null && sb.length() < 4096) sb.append(ln);
                    r.close();
                    org.json.JSONObject j = new org.json.JSONObject(sb.toString());
                    v = j.optString("version", "");
                    cm = j.optString("commit", "");
                    if (cm.length() >= 7) cm = cm.substring(0, 7); else cm = "";
                } catch (Exception e) { v = ""; }
                final String js = "window.tbServer&&window.tbServer(" + (!v.isEmpty()) + ","
                        + org.json.JSONObject.quote(v) + "," + org.json.JSONObject.quote(cm) + ")";
                runOnUiThread(new Runnable() { @Override public void run() {
                    if (info != null && info.isShowing()) out.evaluateJavascript(js, null);
                } });
            }
        }).start();
    }
}
