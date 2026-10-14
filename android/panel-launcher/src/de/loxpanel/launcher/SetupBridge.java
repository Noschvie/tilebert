package de.loxpanel.launcher;

import android.webkit.JavascriptInterface;
import android.webkit.WebView;

/** Schnittstelle "TbSetup" - haengt NUR an der lokalen Einrichtungs-WebView (assets/setup.html), nie an der Panel-WebView. */
final class SetupBridge {
    private final Kiosk k;
    private final WebView w;
    SetupBridge(Kiosk k, WebView w) { this.k = k; this.w = w; }

    /** Adresse pruefen (GET /api/version) und bei Erfolg speichern + Panel laden; Fehler kommen per window.tbResult(false, "addr"|"conn"). */
    @JavascriptInterface public void connect(String addr) { k.setupConnect(addr, w); }
    /** Abbrechen (nur beim Aendern einer vorhandenen Adresse): Seite schliessen, alte Adresse bleibt. */
    @JavascriptInterface public void cancel() {
        k.runOnUiThread(new Runnable() { @Override public void run() { k.setupCancel(w); } });
    }
}
