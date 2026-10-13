#!/usr/bin/perl
# LoxBerry-Plugin-Seite fuer tilebert – laeuft im LoxBerry-Rahmen (lbheader/
# lbfooter) und LoxBerry-Design (Bootstrap-Klassen).
#  - zeigt den Container-Status
#  - Miniserver-Zugang -> wird an den laufenden Container weitergereicht
#    (POST http://localhost:8098/api/settings/miniserver)
#  - Buttons zur vollen Oberflaeche (/config, /settings) und Container-Steuerung
use strict;
use warnings;
use CGI;
use JSON qw(encode_json decode_json);
use LWP::UserAgent;
use POSIX qw(strftime);
use LoxBerry::System;
use LoxBerry::Web;

my $cgi     = CGI->new;
my $version = LoxBerry::System::pluginversion() // "";
my $api     = "http://localhost:8098";
my $ctl     = "REPLACELBPBINDIR/loxpanel-ctl.sh";
my $log     = "REPLACELBPDATADIR/last_action.log";   # Verlauf der letzten Container-Aktion
my $bdir    = "REPLACELBPDATADIR/backups";           # Konfig-Sicherungen (ueberleben Plugin-Updates)
my $lbhost  = LoxBerry::System::get_localip() // "localhost";
# Lokales Token des Containers: damit darf diese (LoxBerry-geschuetzte) Seite die
# Einstellungs-API auch dann nutzen, wenn die Konfiguration ein Passwort hat.
my $tok = '';
if (open(my $tfh, '<', "REPLACELBPDATADIR/config/.cgi_token")) { local $/; $tok = <$tfh> // ''; close($tfh); }
$tok =~ s/\s+//g;

# HTML-escapen. Texte aus decode_json sind Perl-Zeichenketten (Unicode) - als
# UTF-8-Bytes ausgeben, sonst erscheinen Umlaute (z. B. "Küche") als Zeichensalat.
sub h { my $s = shift; $s = "" unless defined $s; utf8::encode($s) if utf8::is_utf8($s); $s =~ s/&/&amp;/g; $s =~ s/</&lt;/g; $s =~ s/>/&gt;/g; $s =~ s/"/&quot;/g; return $s; }

# Eine Steuer-Aktion nicht-blockierend im Hintergrund starten (Ausgabe -> $log,
# das unten live angezeigt wird). Alle drei Standard-Fds umleiten, damit Apache
# die Anfrage sofort abschliesst (sonst Timeout/Fehler 500 bei laengeren Docker-
# Aktionen). Argumente muessen vorab geprueft/shell-sicher sein.
sub launch_bg {
    my ($label, @args) = @_;
    my $q = join(' ', map { "'$_'" } @args);
    my $sh = "{ date '+[%d.%m %H:%M:%S] $label gestartet'; $q; "
           . "date '+[%d.%m %H:%M:%S] $label abgeschlossen'; } "
           . "> '$log' 2>&1 < /dev/null &";
    system("/bin/bash", "-c", $sh);
}

# LoxBerry-Zugangsdaten robust auslesen: bevorzugt die dekodierte *_RAW-Variante,
# sonst die (moeglicherweise URL-kodierte) Standardvariante selbst dekodieren.
sub _lox_cred {
    my ($raw, $enc) = @_;
    return $raw if defined $raw && $raw ne '';
    $enc = '' unless defined $enc;
    $enc =~ s/\+/ /g;
    $enc =~ s/%([0-9A-Fa-f]{2})/chr(hex($1))/ge;
    return $enc;
}

# Miniserver-Zugang an den Container weiterreichen und Ergebnis-HTML liefern.
sub apply_miniserver {
    my ($data) = @_;
    my $ua = LWP::UserAgent->new(timeout => 25);
    my $r  = $ua->post("$api/api/settings/miniserver", 'X-LoxPanel-Token' => $tok,
        'Content-Type' => 'application/json', Content => encode_json($data));
    if ($r->is_success) {
        my $j = eval { decode_json($r->decoded_content) };
        return "<div class='alert alert-success'>Verbunden &ndash; " . ($j->{nControls} // 0) . " Controls geladen.</div>"
            if $j && $j->{ok};
        return "<div class='alert alert-danger'>Fehler: " . h($j ? ($j->{error} // 'unbekannt') : 'ungueltige Antwort') . "</div>";
    }
    return "<div class='alert alert-danger'>Container nicht erreichbar &ndash; l&auml;uft er? (unten &bdquo;Starten&ldquo;)</div>";
}

# Android-Panel (Shelly Wall Display u.a.) per adb einrichten: der Container
# installiert den LoxPanel-Launcher und traegt diese LoxBerry-Adresse ein.
sub setup_panel {
    my ($ip, $panel, $device, $name) = @_;
    my $ua = LWP::UserAgent->new(timeout => 180);   # Installation per WLAN kann dauern
    my $r  = $ua->post("$api/api/panel/launcher", 'X-LoxPanel-Token' => $tok, 'Content-Type' => 'application/json',
        Content => encode_json({ ip => $ip, panel => $panel, device => $device, name => $name, display => 'tbview', server => "$lbhost:8098" }));
    return "<div class='alert alert-danger'>Container nicht erreichbar &ndash; l&auml;uft er?</div>"
        unless $r->is_success || $r->code == 400;
    my $j = eval { decode_json($r->decoded_content) };
    return "<div class='alert alert-danger'>Ung&uuml;ltige Antwort vom Container.</div>" unless $j;
    my $steps = join('', map {
        "<li>" . ($_->{ok} ? "&#10004;" : "&#10008;") . " " . h($_->{step})
        . ($_->{out} ne '' ? " <small style='opacity:.8'>" . h($_->{out}) . "</small>" : "") . "</li>"
    } @{ $j->{steps} // [] });
    my $list = $steps ? "<ul style='margin:8px 0 0;padding-left:18px'>$steps</ul>" : "";
    return "<div class='alert alert-success'>Launcher eingerichtet &ndash; "
         . "das tilebert-Symbol &ouml;ffnet " . h($j->{url}) . " in TbViewer.$list</div>" if $j->{ok};
    return "<div class='alert alert-danger'>" . h($j->{error} // 'Fehler') . "$list</div>";
}

# ---- Backup herunterladen (GET ?download=<datei>) - vor jeder anderen Ausgabe ----
if (defined(my $dl = $cgi->param('download'))) {
    $dl =~ s{.*[\\/]}{};
    if ($dl =~ /^loxpanelfav-config-[\w.\-]+\.tar\.gz$/ && -f "$bdir/$dl" && open(my $fh, '<:raw', "$bdir/$dl")) {
        binmode STDOUT;
        print "Content-Type: application/gzip\r\nContent-Disposition: attachment; filename=\"$dl\"\r\n"
            . "Content-Length: " . (-s "$bdir/$dl") . "\r\n\r\n";
        local $/ = \65536;
        while (my $chunk = <$fh>) { print $chunk; }
        close $fh;
    } else {
        print "Status: 404 Not Found\r\nContent-Type: text/plain\r\n\r\nBackup nicht gefunden.\n";
    }
    exit 0;
}

# ---- POST verarbeiten (vor jeder Ausgabe) ----
my $msg = "";
my $refresh = 0;   # nach einer Aktion die Seite per GET nachladen (Live-Verlauf)
my $action = $cgi->param('action') // '';

if ($action eq 'miniserver') {
    $msg = apply_miniserver({
        host       => scalar($cgi->param('host')) // '',
        user       => scalar($cgi->param('user')) // '',
        pass       => scalar($cgi->param('pass')) // '',
        port       => int((scalar($cgi->param('port')) || 443)),
        verify_tls => ($cgi->param('tls') ? JSON::true : JSON::false),
    });
}
elsif ($action eq 'fromlox') {
    # Miniserver-Zugang aus der zentralen LoxBerry-Konfiguration uebernehmen
    # (erster/niedrigster Miniserver). Admin_RAW/Pass_RAW sind die dekodierten
    # Zugangsdaten.
    my %ms = LoxBerry::System::get_miniservers();
    my $m;
    for my $k (sort { $a <=> $b } keys %ms) { $m = $ms{$k}; last; }
    if ($m && ($m->{IPAddress} // '') ne '') {
        $msg = apply_miniserver({
            host       => $m->{IPAddress},
            user       => _lox_cred($m->{Admin_RAW}, $m->{Admin}),
            pass       => _lox_cred($m->{Pass_RAW},  $m->{Pass}),
            port       => int($m->{Port} || 443),   # LoxBerry-Port spiegeln (80=Gen1/HTTP, 443=Gen2/HTTPS)
            verify_tls => JSON::false,
        });
    } else {
        $msg = "<div class='alert alert-danger'>In LoxBerry ist kein Miniserver konfiguriert (Hauptmen&uuml; &rarr; Miniserver).</div>";
    }
}
elsif ($action eq 'panelsetup') {
    my $ip    = scalar($cgi->param('panelip')) // '';
    my $panel = scalar($cgi->param('panelid')) // '';
    my $dev   = (scalar($cgi->param('paneldev')) // '') eq 'android' ? 'android' : 'shelly';
    my $pname = scalar($cgi->param('panelname')) // '';   # Geraetename aus dem Formular (fuer den Fully-Reset)
    $ip =~ s/^\s+|\s+$//g;
    $pname =~ s/^\s+|\s+$//g;
    $msg = setup_panel($ip, $panel, $dev, $pname);
}
elsif ($action =~ /^(start|stop|restart)$/) {
    my $act = $1;   # durch Regex begrenzt -> shell-sicher
    launch_bg("Aktion \"$act\"", $ctl, $act);
    $msg = "<div class='alert alert-info'>Aktion &bdquo;$act&ldquo; l&auml;uft &hellip; "
         . "der Start kann 1&ndash;2&nbsp;Min dauern. "
         . "Der Verlauf erscheint unten unter &bdquo;Letzte Aktion&ldquo; und aktualisiert sich automatisch.</div>";
    $refresh = 1;
}
elsif ($action eq 'resetpw') {
    launch_bg("Passwort zuruecksetzen", $ctl, "resetpw");
    $msg = "<div class='alert alert-info'>Passwortschutz der Konfiguration wird entfernt &hellip; Ergebnis unten unter &bdquo;Letzte Aktion&ldquo;.</div>";
    $refresh = 1;
}
elsif ($action eq 'backup') {
    launch_bg("Backup", $ctl, "backup");
    $msg = "<div class='alert alert-info'>Backup wird erstellt &hellip; Ergebnis unten unter &bdquo;Letzte Aktion&ldquo;.</div>";
    $refresh = 1;
}
elsif ($action eq 'restore') {
    my $file = scalar($cgi->param('file')) // '';
    $file =~ s{.*[\\/]}{};   # nur Basename, keine Pfad-Tricks
    if ($file =~ /^loxpanelfav-config-[\w.\-]+\.tar\.gz$/ && -f "$bdir/$file") {
        launch_bg("Wiederherstellen ($file)", $ctl, "restore", $file);
        $msg = "<div class='alert alert-info'>Wiederherstellung l&auml;uft &hellip; das Panel startet dabei neu. Verlauf unten.</div>";
        $refresh = 1;
    } else {
        $msg = "<div class='alert alert-danger'>Ung&uuml;ltiger oder unbekannter Backup-Name.</div>";
    }
}
elsif ($action eq 'upload_backup') {
    # Gesicherte Konfiguration (vom PC) wieder hochladen -> erscheint in der Liste
    my $fh = $cgi->upload('bfile');
    my $orig = scalar($cgi->param('bfile')) // '';
    if (!$fh) {
        $msg = "<div class='alert alert-danger'>Keine Datei ausgew&auml;hlt.</div>";
    } else {
        binmode $fh;
        my $data = do { local $/; <$fh> } // '';
        if (length($data) < 20 || substr($data, 0, 2) ne "\x1f\x8b") {
            $msg = "<div class='alert alert-danger'>Keine tilebert-Sicherung (.tar.gz) &ndash; Datei verworfen.</div>";
        } elsif (length($data) > 50 * 1024 * 1024) {
            $msg = "<div class='alert alert-danger'>Datei zu gro&szlig; (max. 50 MB).</div>";
        } else {
            mkdir $bdir unless -d $bdir;
            my $ts = strftime("%Y%m%d-%H%M%S", localtime);
            my $name = "loxpanelfav-config-$ts-upload.tar.gz";
            if (open(my $out, '>:raw', "$bdir/$name")) {
                print $out $data; close $out;
                $msg = "<div class='alert alert-success'>Sicherung hochgeladen: " . h($name) . " &ndash; mit &bdquo;Wiederherstellen&ldquo; einspielen.</div>";
            } else {
                $msg = "<div class='alert alert-danger'>Speichern fehlgeschlagen.</div>";
            }
        }
    }
}
elsif ($action eq 'delete_backup') {
    my $file = scalar($cgi->param('file')) // '';
    $file =~ s{.*[\\/]}{};
    if ($file =~ /^loxpanelfav-config-[\w.\-]+\.tar\.gz$/ && -f "$bdir/$file") {
        unlink "$bdir/$file";
        $msg = "<div class='alert alert-success'>Backup gel&ouml;scht: " . h($file) . "</div>";
    } else {
        $msg = "<div class='alert alert-danger'>Backup nicht gefunden.</div>";
    }
}

# ---- Status vom Container holen ----
my ($running, $conn, $mhost, $muser, $mport, $haspass) = (0, 0, '', '', 443, 0);
my $sr = LWP::UserAgent->new(timeout => 5)->get("$api/api/settings", 'X-LoxPanel-Token' => $tok);
if ($sr->is_success) {
    $running = 1;
    my $j = eval { decode_json($sr->decoded_content) };
    if ($j) {
        $conn = $j->{connected} ? 1 : 0;
        my $m = $j->{miniserver} // {};
        $mhost = $m->{host} // ''; $muser = $m->{user} // '';
        $mport = $m->{port} // 443; $haspass = $m->{hasPass} ? 1 : 0;
    }
}
# Laufender Code-Stand (Version/Commit) fuer die Statuskachel
my ($av, $ac) = ($version, '');
if ($running) {
    my $vr = LWP::UserAgent->new(timeout => 4)->get("$api/api/version");
    if ($vr->is_success) { my $vj = eval { decode_json($vr->decoded_content) };
        if ($vj) { $av = $vj->{version} // $av; $ac = substr($vj->{commit} // '', 0, 7); } }
}
my $repo = "https://github.com/actionhero-zz/tilebert";
# Panel-Profile fuer die Auswahl "Web-App oeffnen" (id -> Titel)
my @plist;
if ($running) {
    my $pr = LWP::UserAgent->new(timeout => 6)->get("$api/api/meta", 'X-LoxPanel-Token' => $tok);
    if ($pr->is_success) { my $pj = eval { decode_json($pr->decoded_content) };
        if ($pj && ref $pj->{panels} eq 'HASH') {
            for my $id (sort keys %{ $pj->{panels} }) {
                next if $id =~ /^__/;
                my $t = (ref $pj->{panels}{$id} eq 'HASH' ? $pj->{panels}{$id}{title} : '') || $id;
                push @plist, [$id, $t];
            } } }
}
my $popts = join('', map { "<option value='" . h($_->[0]) . "'>" . h($_->[1]) . "</option>" } @plist)
    || "<option value=''>Standard</option>";
my $stat = !$running ? "<span style='color:#a94442'>Container l&auml;uft nicht</span>"
    : $conn ? "<span style='color:#3c763d'>l&auml;uft &middot; Miniserver verbunden</span>"
    : "<span style='color:#8a6d3b'>l&auml;uft &middot; noch kein Miniserver</span>";

my ($hh, $hu, $hp) = (h($mhost), h($muser), h($mport));
my $passph = $haspass ? "unver&auml;ndert lassen" : "Passwort eingeben";

# ---- Verlauf der letzten Aktion (Tail) ----
my ($logtail, $busy) = ("", 0);
if (open(my $lf, '<', $log)) {
    my @lines = <$lf>;
    close $lf;
    # "busy", solange die Abschluss-Zeile noch fehlt -> Seite pollt dann weiter.
    my $last = @lines ? $lines[-1] : '';
    $busy = ($last !~ /abgeschlossen/) ? 1 : 0;
    @lines = splice(@lines, -25) if @lines > 25;
    $logtail = h(join('', @lines));
}
# Waehrend eine Aktion laeuft (frisch angestossen ODER Log noch offen) die Seite
# per GET nachladen (kein erneutes POST -> keine Doppel-Aktion).
my $poll = ($refresh || $busy) ? 1 : 0;
my $refresh_html = $poll
    ? "<script>setTimeout(function(){location.replace(location.pathname);},4000);</script>"
    : "";

my $log_html = "";
if ($logtail ne "") {
    my $spin = $busy ? " &middot; l&auml;uft&hellip;" : "";
    $log_html = <<"LOGH";
<section class="lpx-card lpx-wide">
  <div class="lpx-h"><h3>Letzte Aktion$spin</h3>
    <a class="lpx-btn lpx-ghost lpx-sm" href="#" data-role="none" data-ajax="false" onclick="location.replace(location.pathname);return false;">Aktualisieren</a></div>
  <pre class="lpx-log">$logtail</pre>
</section>
LOGH
}

# ---- Vorhandene Backups auflisten (neueste zuerst) ----
my @backups;
if (opendir(my $dh, $bdir)) {
    @backups = sort { $b cmp $a }
               grep { /^loxpanelfav-config-.*\.tar\.gz$/ } readdir($dh);
    closedir($dh);
}
my $blist = "";
for my $b (@backups) {
    my @st  = stat("$bdir/$b");
    my $kb  = @st ? int(($st[7] + 1023) / 1024) : 0;
    my $when= @st ? strftime("%d.%m.%Y %H:%M", localtime($st[9])) : "";
    my $hb  = h($b);
    $blist .= "<tr>"
        . "<td class='lpx-mono'>$hb</td>"
        . "<td class='lpx-mut'>$when</td>"
        . "<td class='lpx-mut'>${kb}&nbsp;KB</td>"
        . "<td class='lpx-act'>"
          . "<form method='post' style='display:inline;margin:0' "
          . "onsubmit=\"return confirm('Diesen Stand wiederherstellen? Die aktuellen Panels werden ersetzt (der jetzige Stand wird vorher automatisch gesichert). Das Panel startet neu.');\">"
          . "<input type='hidden' name='action' value='restore'>"
          . "<input type='hidden' name='file' value='$hb'>"
          . "<button class='lpx-btn lpx-sec lpx-sm' data-role='none' type='submit'>Wiederherstellen</button></form> "
          . "<a class='lpx-btn lpx-sec lpx-sm' data-role='none' data-ajax='false' href='?download=$hb' title='Herunterladen'>&#8615;</a> "
          . "<form method='post' style='display:inline;margin:0' "
          . "onsubmit=\"return confirm('Dieses Backup l&#246;schen?');\">"
          . "<input type='hidden' name='action' value='delete_backup'>"
          . "<input type='hidden' name='file' value='$hb'>"
          . "<button class='lpx-x' data-role='none' type='submit' title='Backup l&ouml;schen' aria-label='Backup l&ouml;schen'>&#215;</button></form>"
        . "</td></tr>";
}
my $backups_html = $blist
    ? "<div class='lpx-tbl'><table><tr><th>Datei</th><th>Datum</th><th>Gr&ouml;&szlig;e</th><th></th></tr>$blist</table></div>"
    : "<p class='lpx-note'>Noch keine Sicherung vorhanden.</p>";

# ---- Ausgabe im LoxBerry-Rahmen ----
LoxBerry::Web::lbheader("tilebert V$version", $repo, "");

# Status-Kacheln (Punkte als viereckige Pillen, Farben wie im Panel)
my ($cst, $ccl) = $running ? ("l&auml;uft", "ok") : ("gestoppt", "bad");
my ($mst, $mcl) = !$running ? ("&ndash;", "off") : $conn ? ("verbunden", "ok") : ("nicht verbunden", "warn");
my $msub = ($running && $mhost ne '') ? $hh : "noch nicht eingerichtet";
my $ver_html = h($av) . ($ac ne '' ? " <small>&middot; $ac</small>" : "");
my $nb = scalar(@backups);
my $bcl = $nb ? "ok" : "off";
my $bsub = "noch keine";
if ($nb) { (my $n = $backups[0]) =~ s/^loxpanelfav-config-//; $n =~ s/\.tar\.gz$//; $bsub = "neueste: " . h($n); }

print <<"HTML";
<style>
  /* tilebert-Design (design-system/tokens.json): Karten 22, Hero 36, Felder 14, Pillen; Manrope/Sora nur wenn lokal vorhanden */
  .lpx{--ink:#1f2440;--mut:#5d6282;--line:#e2dcf3;--bg:#f7f5fd;--face:#ffedb8;--bezel:#0d0f1a;--bz-ink:#ecebff;--bz-mut:#9ea5c4;--bz-act:#262a45;
    --ok:#2b8055;--warn:#9a6700;--bad:#c4473d;
    color:var(--ink);max-width:1180px;margin:0 auto;padding:4px 0 24px;}
  .lpx,.lpx *{box-sizing:border-box;text-shadow:none !important;
    font-family:"Manrope","Segoe UI",system-ui,-apple-system,Roboto,Helvetica,Arial,sans-serif;letter-spacing:normal;}
  .lpx code,.lpx pre,.lpx .lpx-mono{font-family:ui-monospace,"Cascadia Code",Consolas,Menlo,monospace;}
  .lpx b,.lpx strong{font-weight:700;} .lpx p{margin:0;}
  .lpx h3,.lpx .lpx-stat .v{font-family:"Sora","Manrope","Segoe UI",system-ui,sans-serif;}
  .lpx h3{margin:0;font-size:18px;line-height:1.25;font-weight:600;color:var(--ink);}
  .lpx-open{display:inline-flex;align-items:center;gap:6px;background:var(--bz-act);border-radius:999px;padding:4px;}
  .lpx .lpx-open select.lpx-sel{display:inline-block !important;width:auto !important;min-width:110px;height:36px !important;margin:0 !important;border:0 !important;border-radius:999px !important;padding:0 32px 0 16px !important;
    font-size:14px !important;font-weight:600 !important;line-height:36px !important;color:#fff !important;cursor:pointer;box-shadow:none !important;
    background:#363b5c url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23fff' stroke-width='1.6' fill='none'/%3E%3C/svg%3E") no-repeat right 13px center !important;
    -webkit-appearance:none !important;-moz-appearance:none !important;appearance:none !important;max-width:180px;}
  .lpx-sel option{color:#1f2440;background:#fff;}
  .lpx-open .lpx-btn{height:36px;}
  .lpx-hero{position:relative;overflow:hidden;border-radius:36px;padding:24px 26px;margin-bottom:16px;background:var(--bezel);color:var(--bz-ink);}
  .lpx-top{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;position:relative;z-index:1;}
  .lpx-brand{display:flex;align-items:center;gap:16px;flex-wrap:wrap;}
  .lpx-wm{width:116px;flex:none;} .lpx-wm svg{display:block;width:100%;height:auto;}
  .lpx-brand span{font-size:13px;color:var(--bz-mut);max-width:420px;line-height:1.4;}
  .lpx-ver{color:var(--bz-ink) !important;text-decoration:none !important;background:var(--bz-act);border-radius:999px;padding:8px 16px;font-size:13px;font-weight:600;}
  .lpx-ver small{color:var(--bz-mut);font-weight:400;font-size:12px;} .lpx-ver:hover{background:#363b5c;}
  .lpx-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;margin-top:20px;position:relative;z-index:1;}
  .lpx-stat{background:var(--bz-act);border-radius:22px;padding:14px 16px;}
  .lpx-stat .k{font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--bz-mut);}
  .lpx-stat .v{display:flex;align-items:center;gap:8px;font-size:18px;font-weight:600;margin-top:6px;color:#fff;}
  .lpx-stat .s{font-size:12px;color:var(--bz-mut);margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .lpx-dot{width:11px;height:11px;border-radius:32%;flex:none;background:var(--bz-mut);}
  .lpx-dot.ok{background:#5cd6a4;} .lpx-dot.warn{background:#ffc145;} .lpx-dot.bad{background:#ff9e7a;}
  .lpx-go{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px;position:relative;z-index:1;align-items:center;}
  .lpx-msg:empty{display:none;} .lpx-msg{margin-bottom:16px;}
  .lpx-msg .alert{border-radius:14px;margin:0;padding:12px 16px;font-size:14px;line-height:1.5;border:1px solid var(--line);background:var(--bg);color:var(--ink);}
  .lpx-msg .alert-success{background:#e3f6ec;border-color:#b9e3cd;color:#1c5a3b;}
  .lpx-msg .alert-danger{background:#fdeceb;border-color:#f3c5c1;color:#8f2b23;}
  .lpx-msg .alert-info{background:#eaf2ff;border-color:#c4dbfb;color:#1f2440;}
  .lpx-msg .alert small{color:inherit !important;opacity:.85;}
  .lpx-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;align-items:start;}
  .lpx-card{background:#fff;border:1px solid var(--line);border-radius:22px;padding:20px 22px;box-shadow:0 1px 2px rgba(31,36,64,.05),0 8px 24px rgba(31,36,64,.06);}
  .lpx-card{min-width:0;} .lpx code{word-break:break-all;} .lpx-tbl table{min-width:480px;}
  .lpx-wide{grid-column:1/-1;margin-top:16px;}
  .lpx-h{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px;flex-wrap:wrap;}
  .lpx-h small{color:var(--mut);font-weight:400;font-size:13px;font-family:"Manrope","Segoe UI",system-ui,sans-serif;}
  .lpx-note{color:var(--mut);font-size:13px;line-height:1.55;margin:0 0 12px;}
  .lpx-f{display:grid;grid-template-columns:minmax(0,2fr) minmax(70px,.7fr);gap:10px;}
  .lpx-f2{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px;}
  .lpx label.l{display:block;font-size:12px;font-weight:600;color:var(--mut);margin:0 0 4px;}
  .lpx input.i{width:100%;height:44px;border:1px solid var(--line);border-radius:14px;padding:0 14px;font:inherit;font-size:14px;background:var(--bg);color:var(--ink);box-shadow:none;margin:0;}
  .lpx input.i:focus{outline:none;border-color:var(--ink);box-shadow:0 0 0 3px rgba(255,193,69,.5);background:#fff;}
  .lpx .lpx-chk{display:flex !important;align-items:center;gap:8px;font-size:13px !important;line-height:1.4 !important;margin:12px 0 2px !important;padding:0 !important;color:var(--ink) !important;font-weight:400 !important;text-shadow:none;cursor:pointer;}
  .lpx .lpx-chk input{position:static !important;opacity:1 !important;flex:none;width:18px !important;height:18px !important;accent-color:var(--ink);margin:0 !important;}
  .lpx-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px;} .lpx-row form{margin:0;display:contents;}
  .lpx-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:44px;padding:0 22px;border-radius:999px;border:1px solid transparent;
    font:inherit;font-size:14px;font-weight:600;cursor:pointer;text-decoration:none !important;white-space:nowrap;transition:background .12s,transform .1s;box-shadow:none;margin:0;}
  .lpx-btn:active{transform:scale(.98);}
  .lpx-btn:focus-visible,.lpx-sel:focus-visible,.lpx-ver:focus-visible,.lpx-x:focus-visible{outline:2px solid #ffc145;outline-offset:2px;}
  .lpx-pri{background:var(--ink);color:#fff !important;} .lpx-pri:hover{background:#2f365e;}
  .lpx-acc{background:var(--face);color:var(--ink) !important;} .lpx-acc:hover{background:#ffe59a;}
  .lpx-sec{background:#fff;color:var(--ink) !important;border-color:var(--line);} .lpx-sec:hover{background:var(--bg);}
  .lpx-ghost{background:#363b5c;color:#fff !important;} .lpx-ghost:hover{background:#454b72;}
  .lpx-card .lpx-ghost{background:var(--bg);color:var(--ink) !important;border-color:var(--line);}
  .lpx-warnbtn{background:#fff;color:#a8372d !important;border-color:#f0c4c0;} .lpx-warnbtn:hover{background:#fdf1f0;}
  .lpx-sm{height:36px;padding:0 16px;font-size:13px;}
  .lpx-sep{height:1px;background:var(--line);margin:18px 0;}
  .lpx-tbl{overflow-x:auto;margin-top:4px;} .lpx-tbl table{width:100%;border-collapse:collapse;font-size:13px;}
  .lpx-tbl th{text-align:left;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--mut);font-weight:600;padding:6px 8px;}
  .lpx-tbl td{padding:8px;border-top:1px solid var(--line);vertical-align:middle;}
  .lpx-mono{font-size:12px;word-break:break-all;} .lpx-mut{color:var(--mut);white-space:nowrap;}
  .lpx-act{white-space:nowrap;text-align:right;} .lpx-act form{display:inline;margin:0;}
  .lpx-x{width:32px;height:32px;border-radius:32%;border:1px solid var(--line);background:#fff;color:var(--mut);cursor:pointer;font-size:16px;line-height:1;vertical-align:middle;padding:0;}
  .lpx-x:hover{color:#a8372d;border-color:#f0c4c0;background:#fdf1f0;}
  .lpx-log{max-height:260px;overflow:auto;background:var(--bezel);color:var(--bz-ink);padding:14px 16px;border-radius:14px;font-size:12px;line-height:1.55;white-space:pre-wrap;margin:0;border:0;text-shadow:none;}
  \@media (max-width:760px){ .lpx-grid{grid-template-columns:1fr;} }
  \@media (max-width:560px){ .lpx-hero{padding:20px 18px;border-radius:28px;} .lpx-card{padding:18px;} .lpx-f,.lpx-f2{grid-template-columns:1fr;} .lpx-btn{flex:1 1 auto;} .lpx-tbl .lpx-btn,.lpx-h .lpx-btn{flex:none;} .lpx-open{width:100%;} .lpx-sel{flex:1;max-width:none;} }
</style>
<div class="lpx">
  <section class="lpx-hero">
    <div class="lpx-top">
      <div class="lpx-brand"><div class="lpx-wm"><svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="tilebert" viewBox="-15.14 -15.14 216.75 78.27" ><rect x="4.000" y="4.000" width="19.137" height="19.137" rx="7.310" fill="#ffc145"/><rect x="24.863" y="4.000" width="19.137" height="19.137" rx="7.310" fill="#7db7ff"/><rect x="4.000" y="24.863" width="19.137" height="19.137" rx="7.310" fill="#ff9e7a"/><rect x="24.863" y="24.863" width="19.137" height="19.137" rx="7.310" fill="#5cd6a4"/><circle cx="13.569" cy="13.569" r="2.259" fill="#1f2440"/><rect x="28.518" y="10.612" width="11.827" height="5.914" rx="2.957" fill="#1f2440"/><circle cx="37.388" cy="13.569" r="1.921" fill="#7db7ff"/><path d="M19.276 31.475H28.724A1.070 1.070 0 0 1 29.768 32.781A5.914 5.914 0 0 1 18.232 32.781A1.070 1.070 0 0 1 19.276 31.475Z" fill="#1f2440"/><path transform="translate(59.279 36.361)" d="M10.650503532155723 0.23705413267119255Q8.110637824964373 0.23705413267119255 6.468191334313968 -0.4233109511985581Q4.825744843663562 -1.0836760350683088 4.021454036386302 -2.649926554502974Q3.2171632291090417 -4.216177073937639 3.2171632291090417 -6.8915022855125265L3.234095667156984 -23.569953762735715H7.636529559621988L7.619597121574047 -6.603650838697507Q7.619597121574047 -5.24905579486212 8.347691957635567 -4.5209609588006Q9.075786793697086 -3.7928661227390807 10.430381837532472 -3.7928661227390807H13.308896305682667V0.23705413267119255ZM0.3047838848629618 -14.934410358285131V-18.388627720065365H13.308896305682667V-14.934410358285131ZM17.135627304517634 0.0V-18.388627720065365H21.8428450818456V0.0ZM14.561896721230399 -14.866680606093361V-18.388627720065365H21.8428450818456V-14.866680606093361ZM18.85426976638378 -20.589844666297868Q17.47427606547648 -20.589844666297868 16.813910981606732 -21.309473283335414Q16.15354589773698 -22.029101900372964 16.15354589773698 -23.14664281153716Q16.15354589773698 -24.26418372270135 16.815926748041008 -24.9838123397389Q17.478307598345037 -25.70344095677645 18.845803547359807 -25.70344095677645Q20.23426346729108 -25.70344095677645 20.88616233213686 -24.9838123397389Q21.53806119698264 -24.26418372270135 21.53806119698264 -23.14664281153716Q21.53806119698264 -22.029101900372964 20.88616233213686 -21.309473283335414Q20.23426346729108 -20.589844666297868 18.85426976638378 -20.589844666297868ZM26.482333106981795 0.0V-24.721359549995793H31.18955088430976V0.0ZM24.17952153246164 -21.199412436023792V-24.721359549995793H31.18955088430976V-21.199412436023792ZM43.787284791978855 0.6434326458218084Q41.416743465266926 0.6434326458218084 39.638837470232986 -0.16932438047942322Q37.86093147519904 -0.9820814067806548 36.69259324989102 -2.345142669640012Q35.524255024583 -3.708203932499369 34.93161969290502 -5.401447737293601Q34.338984361227034 -7.094691542087834 34.338984361227034 -8.872597537121779V-9.516030182943586Q34.338984361227034 -11.344733492121357 34.93161969290502 -13.046443515939561Q35.524255024583 -14.748153539757764 36.684127030867046 -16.094282364569178Q37.84399903715109 -17.440411189380594 39.579573937065184 -18.236235777633883Q41.315148836979276 -19.032060365887173 43.58409553540355 -19.032060365887173Q46.56420463184139 -19.032060365887173 48.57069854052256 -17.719796417171644Q50.57719244920372 -16.40753246845611 51.601604951104235 -14.299443931487293Q52.62601745300475 -12.191355394518474 52.62601745300475 -9.753084315614778V-8.042908072772605H36.337012050884226V-10.9214225409228H49.66284079461484L48.223583560539744 -9.516030182943586Q48.223583560539744 -11.277003739929588 47.7071442000775 -12.530004155477322Q47.19070483961526 -13.783004571025053 46.16629233771475 -14.460302092942745Q45.14187983581424 -15.137599614860438 43.58409553540355 -15.137599614860438Q42.00937879694491 -15.137599614860438 40.9257027618766 -14.41797099782289Q39.84202672680829 -13.698342380785341 39.291722490250166 -12.369145994021869Q38.74141825369204 -11.039949607258396 38.74141825369204 -9.17738142198474Q38.74141825369204 -7.4333403030466805 39.27479005220222 -6.095677697259237Q39.80816185071241 -4.758015091471793 40.9257027618766 -4.00452159833836Q42.04324367304079 -3.2510281052049264 43.787284791978855 -3.2510281052049264Q45.49746103482103 -3.2510281052049264 46.58113706988934 -3.9452580651705618Q47.664813104957645 -4.639488025136197 47.96959698982061 -5.638501869964794H52.30430113009385Q51.914855054991165 -3.759001246643196 50.75498304870712 -2.3366764506160407Q49.59511104242307 -0.9143516545888856 47.825671266413096 -0.1354595043835386Q46.05623149040312 0.6434326458218084 43.787284791978855 0.6434326458218084ZM66.34129227183803 0.6095677697259236Q64.07234557341376 0.6095677697259236 62.345236892523644 -0.35558119900678886Q60.618128211633525 -1.3207301677395014 59.627580585828895 -3.174832133989186Q58.63703296002427 -5.02893410023887 58.55237076978456 -7.670394435717873H59.26353316779814V0.0H55.538396797250826V-24.721359549995793H60.245614574578795V-12.343747336949955L58.99261415903106 -10.430381837532472Q59.11114122536666 -13.275031429586782 60.110155070195255 -15.171464490956323Q61.10916891502385 -17.067897552325864 62.80241271981808 -18.016114083010635Q64.49565652461231 -18.964330613695402 66.62914371865305 -18.964330613695402Q68.54250921807053 -18.964330613695402 70.10029351848122 -18.253168215681825Q71.65807781889191 -17.542005817668247 72.76715251103214 -16.272072964072574Q73.87622720317236 -15.0021401104769 74.46886253485035 -13.300430086658697Q75.06149786652833 -11.598720062840492 75.06149786652833 -9.600692373183298V-8.88952997516972Q75.06149786652833 -6.8915022855125265 74.46039631582637 -5.17285982364638Q73.85929476512442 -3.454217361780234 72.70788897786434 -2.150419632088675Q71.55648319060427 -0.8466219023971162 69.94790157604974 -0.11852706633559629Q68.33931996149522 0.6095677697259236 66.34129227183803 0.6095677697259236ZM65.27454867481767 -3.35262273349258Q66.79846809913248 -3.35262273349258 67.94140766736858 -4.106116226626014Q69.08434723560468 -4.859609719759447 69.71931366240253 -6.18880610652292Q70.35428008920036 -7.518002493286392 70.35428008920036 -9.24511117417651Q70.35428008920036 -10.989152293114568 69.71084744337855 -12.284483803782155Q69.06741479755675 -13.579815314449744 67.93294144834462 -14.290977712463322Q66.79846809913248 -15.0021401104769 65.27454867481767 -15.0021401104769Q63.90302119293433 -15.0021401104769 62.72621674860234 -14.384106121727005Q61.54941230427035 -13.76607213297711 60.829783687232805 -12.58926768864512Q60.110155070195255 -11.412463244313127 60.110155070195255 -9.753084315614778V-8.398489271779393Q60.110155070195255 -6.806840095272815 60.85518234430472 -5.68083296508465Q61.60020961841418 -4.554825834896485 62.78548028177015 -3.953724284194533Q63.970750945126106 -3.35262273349258 65.27454867481767 -3.35262273349258ZM86.42316379669764 0.6434326458218084Q84.0526224699857 0.6434326458218084 82.27471647495176 -0.16932438047942322Q80.49681047991783 -0.9820814067806548 79.3284722546098 -2.345142669640012Q78.16013402930177 -3.708203932499369 77.56749869762379 -5.401447737293601Q76.97486336594582 -7.094691542087834 76.97486336594582 -8.872597537121779V-9.516030182943586Q76.97486336594582 -11.344733492121357 77.56749869762379 -13.046443515939561Q78.16013402930177 -14.748153539757764 79.32000603558583 -16.094282364569178Q80.47987804186988 -17.440411189380594 82.21545294178397 -18.236235777633883Q83.95102784169805 -19.032060365887173 86.21997454012232 -19.032060365887173Q89.20008363656018 -19.032060365887173 91.20657754524134 -17.719796417171644Q93.21307145392251 -16.40753246845611 94.23748395582302 -14.299443931487293Q95.26189645772352 -12.191355394518474 95.26189645772352 -9.753084315614778V-8.042908072772605H78.97289105560301V-10.9214225409228H92.29871979933363L90.85946256525853 -9.516030182943586Q90.85946256525853 -11.277003739929588 90.34302320479628 -12.530004155477322Q89.82658384433404 -13.783004571025053 88.80217134243352 -14.460302092942745Q87.77775884053302 -15.137599614860438 86.21997454012232 -15.137599614860438Q84.64525780166369 -15.137599614860438 83.56158176659538 -14.41797099782289Q82.47790573152707 -13.698342380785341 81.92760149496894 -12.369145994021869Q81.37729725841082 -11.039949607258396 81.37729725841082 -9.17738142198474Q81.37729725841082 -7.4333403030466805 81.910669056921 -6.095677697259237Q82.44404085543118 -4.758015091471793 83.56158176659538 -4.00452159833836Q84.67912267775958 -3.2510281052049264 86.42316379669764 -3.2510281052049264Q88.1333400395398 -3.2510281052049264 89.21701607460811 -3.9452580651705618Q90.30069210967642 -4.639488025136197 90.60547599453939 -5.638501869964794H94.94018013481262Q94.55073405970995 -3.759001246643196 93.3908620534259 -2.3366764506160407Q92.23099004714186 -0.9143516545888856 90.46155027113188 -0.1354595043835386Q88.69211049512191 0.6434326458218084 86.42316379669764 0.6434326458218084ZM98.1742758019696 0.0V-18.388627720065365H101.89941217251692V-10.599706218011896H101.79781754422926Q101.79781754422926 -14.544964283182457 103.49106134902348 -16.585323067959507Q105.18430515381772 -18.62568185273656 108.46919813511853 -18.62568185273656H109.14649565703623V-14.528031845134514H107.8596303653926Q105.47215660063274 -14.528031845134514 104.17682508996515 -13.249632772514868Q102.88149357929757 -11.971233699895224 102.88149357929757 -9.566827497087413V0.0ZM119.2551611716578 0.23705413267119255Q116.71529546446645 0.23705413267119255 115.07284897381604 -0.4233109511985581Q113.43040248316564 -1.0836760350683088 112.62611167588838 -2.649926554502974Q111.82182086861113 -4.216177073937639 111.82182086861113 -6.8915022855125265L111.83875330665906 -23.569953762735715H116.24118719912407L116.22425476107612 -6.603650838697507Q116.22425476107612 -5.24905579486212 116.95234959713764 -4.5209609588006Q117.68044443319917 -3.7928661227390807 119.03503947703456 -3.7928661227390807H121.91355394518474V0.23705413267119255ZM108.90944152436504 -14.934410358285131V-18.388627720065365H121.91355394518474V-14.934410358285131Z" fill="#ecebff"/></svg></div>
        <span>ein LoxPanel Fork von Lenardo1 &ndash; Wandpanels, Tablets &amp; Handy f&uuml;r Loxone</span></div>
      <a class="lpx-ver" href="$repo" target="_blank" rel="noopener" title="GitHub-Repository &ouml;ffnen">V $ver_html</a>
    </div>
    <div class="lpx-stats">
      <div class="lpx-stat"><div class="k">Container</div><div class="v"><i class="lpx-dot $ccl"></i>$cst</div><div class="s">Port 8098</div></div>
      <div class="lpx-stat"><div class="k">Miniserver</div><div class="v"><i class="lpx-dot $mcl"></i>$mst</div><div class="s">$msub</div></div>
      <div class="lpx-stat"><div class="k">Sicherungen</div><div class="v"><i class="lpx-dot $bcl"></i>$nb</div><div class="s">$bsub</div></div>
    </div>
    <div class="lpx-go">
      <a class="lpx-btn lpx-acc" href="http://$lbhost:8098/config" target="_blank" rel="noopener" data-role="none">Konfiguration &ouml;ffnen</a>
      <span class="lpx-open">
        <select id="lpx_panel" class="lpx-sel" data-role="none" aria-label="Panel">$popts</select>
        <a class="lpx-btn lpx-ghost" href="http://$lbhost:8098/" target="_blank" rel="noopener" data-role="none"
           onclick="var v=document.getElementById('lpx_panel').value;this.href='http://$lbhost:8098/'+(v?'?panel='+encodeURIComponent(v):'');">Web-App &ouml;ffnen</a>
      </span>
    </div>
  </section>

  <div class="lpx-msg">$msg</div>

  <div class="lpx-grid">
    <section class="lpx-card">
      <div class="lpx-h"><h3>Miniserver-Zugang</h3></div>
      <form method="post" id="msform" data-ajax="false">
        <input type="hidden" name="action" value="miniserver">
        <div class="lpx-f">
          <div><label class="l">Host / IP</label><input class="i" data-role="none" name="host" value="$hh" placeholder="192.168.1.50"></div>
          <div><label class="l">Port</label><input class="i" data-role="none" name="port" value="$hp"></div>
        </div>
        <div class="lpx-f2">
          <div><label class="l">Benutzer</label><input class="i" data-role="none" name="user" value="$hu" autocomplete="off"></div>
          <div><label class="l">Passwort</label><input class="i" data-role="none" type="password" name="pass" placeholder="$passph" autocomplete="new-password"></div>
        </div>
        <label class="lpx-chk"><input type="checkbox" data-role="none" name="tls"> Zertifikat pr&uuml;fen (Gen2 selbstsigniert: aus)</label>
        <p class="lpx-note" style="margin:6px 0 0">Port 443 = HTTPS (Gen2), Port 80 = HTTP (Gen1).</p>
      </form>
      <div class="lpx-row">
        <button class="lpx-btn lpx-pri" data-role="none" type="submit" form="msform">Verbinden &amp; Speichern</button>
        <form method="post" data-ajax="false"><input type="hidden" name="action" value="fromlox"><button class="lpx-btn lpx-sec" data-role="none" type="submit">Aus LoxBerry &uuml;bernehmen</button></form>
      </div>
    </section>

    <section class="lpx-card">
      <div class="lpx-h"><h3>Container</h3></div>
      <p class="lpx-note">Updates installierst du &uuml;ber die <b>LoxBerry-Pluginverwaltung</b> &ndash; LoxBerry f&uuml;hrt. Hier nur Start, Stopp und Neustart (z.&nbsp;B. nach einem H&auml;nger).</p>
      <div class="lpx-row">
        <form method="post" data-ajax="false"><input type="hidden" name="action" value="restart"><button class="lpx-btn lpx-pri" data-role="none" type="submit">Neu starten</button></form>
        <form method="post" data-ajax="false"><input type="hidden" name="action" value="start"><button class="lpx-btn lpx-sec" data-role="none" type="submit">Starten</button></form>
        <form method="post" data-ajax="false"><input type="hidden" name="action" value="stop"><button class="lpx-btn lpx-sec" data-role="none" type="submit">Stoppen</button></form>
      </div>
      <div class="lpx-sep"></div>
      <div class="lpx-h" style="margin-bottom:6px"><h3>Passwort vergessen?</h3></div>
      <p class="lpx-note">Entfernt den Passwortschutz der Konfiguration &ndash; danach dort ein neues setzen.</p>
      <form method="post" data-ajax="false" onsubmit="return confirm('Passwortschutz der Konfiguration entfernen?')"><input type="hidden" name="action" value="resetpw"><button class="lpx-btn lpx-warnbtn" data-role="none" type="submit">Passwort zur&uuml;cksetzen</button></form>
    </section>

    <section class="lpx-card lpx-wide" style="margin-top:0">
      <div class="lpx-h"><h3>Sichern &amp; Wiederherstellen <small>&middot; die letzten 20 bleiben, auch bei Updates</small></h3>
        <form method="post" data-ajax="false" style="margin:0"><input type="hidden" name="action" value="backup"><button class="lpx-btn lpx-pri lpx-sm" data-role="none" type="submit">Backup jetzt erstellen</button></form></div>
      <p class="lpx-note">Panels, Kacheln, Design und Miniserver-Zugang als Archiv unter <code>$bdir</code>. Sicherungen bleiben bei Plugin-Updates erhalten; mit &#8615; auf den PC laden, unten wieder hochladen.</p>
      $backups_html
      <form method="post" enctype="multipart/form-data" data-ajax="false" class="lpx-row" style="align-items:center">
        <input type="hidden" name="action" value="upload_backup">
        <input type="file" name="bfile" accept=".gz,application/gzip" data-role="none" required style="font-size:13px">
        <button class="lpx-btn lpx-sec lpx-sm" data-role="none" type="submit">Sicherung hochladen</button>
      </form>
    </section>
  </div>
$log_html
</div>
$refresh_html
HTML

LoxBerry::Web::lbfooter();
