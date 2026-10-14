package de.loxpanel.launcher;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;

/** App-Symbol (LAUNCHER): Tablet -> tilebert direkt (HOME-Komponenten abgeschaltet); Shelly -> Startbildschirm. */
public class App extends Activity {
    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        StockHome.ensureHome(this);
        if (StockHome.isShelly()) startActivity(new Intent(this, Home.class));
        else Kiosk.openPanel(this, false);
        finish();
    }
}
