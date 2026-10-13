package de.loxpanel.launcher;

import android.webkit.JavascriptInterface;
import android.webkit.WebView;

/** Schnittstelle "TbInfo" - haengt NUR an der lokalen Info-WebView (assets/info.html), nie an der Panel-WebView. */
final class InfoBridge {
    private final Kiosk k;
    private final WebView w;
    InfoBridge(Kiosk k, WebView w) { this.k = k; this.w = w; }

    @JavascriptInterface public String data() { return k.infoData(); }
    @JavascriptInterface public void ready() { k.infoReady(w); }
    @JavascriptInterface public void restart() { run(0); }
    @JavascriptInterface public void chooseHome() { run(1); }
    @JavascriptInterface public void close() { run(2); }

    private void run(final int what) {
        k.runOnUiThread(new Runnable() { @Override public void run() {
            if (what == 0) k.infoRestart(); else if (what == 1) k.infoHome(); else k.infoClose();
        } });
    }
}
