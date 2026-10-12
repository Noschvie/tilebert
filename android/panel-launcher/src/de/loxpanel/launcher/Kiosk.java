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
    private float shown = -2f;   // zuletzt gesetzte Fensterhelligkeit

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
                | WindowManager.LayoutParams.FLAG_FULLSCREEN
                | WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED);
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.BLACK);

        web = new WebView(this);
        web.setBackgroundColor(Color.BLACK);
        web.setLayerType(View.LAYER_TYPE_HARDWARE, null);
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

        sm = (SensorManager) getSystemService(SENSOR_SERVICE);
        if (sm != null) {
            // X2i: Naeherung ist ein Wake-up-Sensor -> Liste zuerst (getDefaultSensor liefert ihn nicht ueberall)
            List<Sensor> l = sm.getSensorList(Sensor.TYPE_PROXIMITY);
            prox = l.isEmpty() ? sm.getDefaultSensor(Sensor.TYPE_PROXIMITY) : l.get(0);
            light = sm.getDefaultSensor(Sensor.TYPE_LIGHT);
            if (light != null && light.getMaximumRange() > 0 && light.getMaximumRange() < 100) lightMax = light.getMaximumRange();
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
        if (u.isEmpty()) {
            page("<body style='margin:0;background:#0d0f1a;color:#aaa;font:20px sans-serif;padding:40px'>" + MARKE
                    + "<p>TbViewer: keine Panel-URL gesetzt.</p><p>adb shell am start -n de.loxpanel.launcher/.Main --es url http://&lt;LoxBerry&gt;:8098/</p></body>");
            return;
        }
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
            int lv = Math.round(e.values[0]);
            long now = System.currentTimeMillis();
            if (lightLevel < 0 || Math.abs(lv - lightLevel) >= 3) { setLight(lv); return; }   // grosser Sprung sofort
            if (lv == lightLevel) { pendingLevel = -1; return; }
            if (lv != pendingLevel) { pendingLevel = lv; pendingSince = now; return; }
            if (now - pendingSince >= LIGHT_HOLD_MS) setLight(lv);
        }
    }

    private void setLight(int lv) {
        lightLevel = lv;
        pendingLevel = -1;
        applyBrightness();
        js("light", String.valueOf(lv));
    }

    @Override public void onAccuracyChanged(Sensor s, int a) {}

    // ---- Helligkeit ----
    /** Auto-Kurve: Stufe 0..max -> Anteil min..max (Wurzel: dunkle Raeume feiner abgestuft). */
    private float autoFraction() {
        float minF = minPct / 100f, maxF = Math.max(minF, maxPct / 100f);
        float x = Math.max(0f, Math.min(1f, lightLevel / (lightMax * 0.85f)));
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
        else {
            Float base = (autoOn && lightLevel >= 0) ? Float.valueOf(autoFraction()) : (nightPct < 100 ? systemFraction() : null);
            b = base == null ? WindowManager.LayoutParams.BRIGHTNESS_OVERRIDE_NONE
                    : Math.max(0.01f, base * nightPct / 100f);
        }
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
            boolean ok = p >= 100 || (autoOn && lightLevel >= 0) || systemFraction() != null;
            if (ok) ui.post(new Runnable() { public void run() { nightPct = p; applyBrightness(); } });
            return ok;
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
                    + ",\"lightMax\":" + lightMax + ",\"auto\":" + autoOn + ",\"min\":" + minPct
                    + ",\"max\":" + maxPct + ",\"proxWake\":" + proxWake + "}";
        }
        @JavascriptInterface public void reload(String t) { if (!trusted || !ok(t)) return; ui.post(new Runnable() { public void run() { load(); } }); }
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
        return "tbview".equals(c.getSharedPreferences("cfg", MODE_PRIVATE).getString(KEY_MODE, "fully"));
    }

    static void setMode(Context c, String mode) {
        c.getSharedPreferences("cfg", MODE_PRIVATE).edit()
                .putString(KEY_MODE, "tbview".equals(mode) ? "tbview" : "fully").apply();
    }
}
