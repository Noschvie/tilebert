package de.loxpanel.launcher;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** Nach App-Update (MY_PACKAGE_REPLACED) und Boot: HOME-Komponenten abgleichen (Shelly an, sonst aus). */
public class HomeGuard extends BroadcastReceiver {
    @Override
    public void onReceive(Context c, Intent i) {
        StockHome.ensureHome(c);
    }
}
