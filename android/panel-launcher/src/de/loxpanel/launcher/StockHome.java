package de.loxpanel.launcher;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.os.Build;
import android.graphics.drawable.Drawable;

import java.util.List;

/**
 * Der urspruengliche Startbildschirm des Geraets (HOME) - auf dem Shelly Wall
 * Display die Shelly-Oberflaeche, auf Tablets der normale Android-Launcher.
 * Bewusst nicht per Paketname fest verdrahtet: der unterscheidet sich je
 * Geraet/Firmware (z.B. cloud.shelly.stargate).
 */
final class StockHome {
    private StockHome() {}

    static ResolveInfo find(Context c) {
        Intent home = new Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_HOME);
        List<ResolveInfo> all = c.getPackageManager().queryIntentActivities(home, 0);
        for (ResolveInfo ri : all) {
            String pkg = ri.activityInfo.packageName;
            // Uns selbst und den Android-Auswahldialog ("android"/Settings-Fallback) ueberspringen.
            if (!pkg.equals(c.getPackageName()) && !pkg.equals("android")
                    && !pkg.equals("com.android.settings")) {
                return ri;
            }
        }
        return null;
    }

    static boolean start(Context c) {
        ResolveInfo ri = find(c);
        if (ri == null) return false;
        Intent i = new Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_HOME)
                .setComponent(new ComponentName(ri.activityInfo.packageName, ri.activityInfo.name))
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        try {
            c.startActivity(i);
            return true;
        } catch (RuntimeException e) {
            return false;
        }
    }

    static Drawable icon(Context c) {
        ResolveInfo ri = find(c);
        return ri != null ? ri.loadIcon(c.getPackageManager()) : null;
    }

    /** Name des Startbildschirms, z.B. "Shelly"; Fallback "Android". */
    static String label(Context c) {
        ResolveInfo ri = find(c);
        CharSequence l = ri != null ? ri.loadLabel(c.getPackageManager()) : null;
        return l != null && l.length() > 0 ? l.toString() : "Android";
    }

    /** Shelly Wall Display (Modell jenna/blake/maverick/cally/dayna/stargate bzw. "shelly"/"sawd" in Modell/Hersteller/Geraet). */
    static boolean isShelly() {
        String all = (Build.MODEL + " " + Build.MANUFACTURER + " " + Build.DEVICE + " " + Build.PRODUCT).toLowerCase(java.util.Locale.ROOT);
        return all.matches(".*\\b(jenna|blake|maverick|cally|dayna|stargate)\\b.*") || all.matches(".*(shelly|sawd).*");
    }

    /** Shelly: .Home aktiv lassen. Sonst (Tablet): .Home abschalten -> reine App, kein Launcher. */
    static void ensureHome(Context c) {
        int want = isShelly() ? PackageManager.COMPONENT_ENABLED_STATE_ENABLED : PackageManager.COMPONENT_ENABLED_STATE_DISABLED;
        PackageManager pm = c.getPackageManager();
        for (String n : new String[] { "Home" }) {
            try {
                ComponentName cn = new ComponentName(c, "de.loxpanel.launcher." + n);
                if (pm.getComponentEnabledSetting(cn) != want)
                    pm.setComponentEnabledSetting(cn, want, PackageManager.DONT_KILL_APP);
            } catch (RuntimeException ignored) { }
        }
    }
}
