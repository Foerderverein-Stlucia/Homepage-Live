// Versendet Web-Push-Nachrichten aus der Tabelle push_queue.
// Aufgerufen nur vom Zeitplan in der Datenbank (Header x-cron-secret). Erzeugt beim ersten Lauf die VAPID-Schlüssel.
import webpush from "npm:web-push@3.6.7";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: cfgRows, error: cfgErr } = await sb.from("push_config").select("key,value");
  if (cfgErr) return new Response("Konfiguration nicht lesbar", { status: 500 });
  const cfg: Record<string, string> = Object.fromEntries((cfgRows || []).map((r) => [r.key, r.value]));
  if (!cfg.cron_secret || req.headers.get("x-cron-secret") !== cfg.cron_secret) return new Response("Nicht erlaubt", { status: 401 });

  if (!cfg.vapid_public || !cfg.vapid_private) {
    const k = webpush.generateVAPIDKeys();
    await sb.from("push_config").upsert([{ key: "vapid_public", value: k.publicKey }, { key: "vapid_private", value: k.privateKey }]);
    cfg.vapid_public = k.publicKey; cfg.vapid_private = k.privateKey;
  }
  webpush.setVapidDetails(cfg.kontakt || "mailto:foerderverein.stlucia.kiga@gmail.com", cfg.vapid_public, cfg.vapid_private);

  const { data: items } = await sb.from("push_queue").select("*").eq("gesendet", false).order("erstellt").limit(20);
  let gesendet = 0;
  for (const it of items || []) {
    let q = sb.from("push_abos").select("endpoint,p256dh,auth");
    if (it.tokens && it.tokens.length) q = q.overlaps("tokens", it.tokens);
    if (it.nur_vorstand) q = q.eq("vorstand", true);
    const { data: abos } = await q;
    let ok = 0, fehler = "";
    await Promise.all((abos || []).map(async (a) => {
      try {
        await webpush.sendNotification({ endpoint: a.endpoint, keys: { p256dh: a.p256dh, auth: a.auth } },
          JSON.stringify({ titel: it.titel, text: it.text, url: it.url || "" }), { TTL: 60 * 60 * 24 });
        ok++;
      } catch (e) {
        const code = (e as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) await sb.from("push_abos").delete().eq("endpoint", a.endpoint);
        else fehler = String((e as Error).message || e).slice(0, 200);
      }
    }));
    await sb.from("push_queue").update({ gesendet: true, versendet: ok, fehler: fehler || null }).eq("id", it.id);
    gesendet += ok;
  }
  return new Response(JSON.stringify({ ok: true, gesendet }), { headers: { "Content-Type": "application/json" } });
});
