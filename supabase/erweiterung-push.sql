-- ============================================================
-- Erweiterung: Push-Benachrichtigungen (Web Push)
-- Meldungen vom Vorstand, Hinweis bei Nachrücken, Erinnerung am Vortag
-- Voraussetzung: Edge Function "push-senden" (siehe supabase/functions/push-senden)
-- Darf mehrfach ausgeführt werden.
-- ============================================================
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

-- Schlüssel und Zugangsdaten der Versandfunktion (nur über die Funktion lesbar, keine Policies)
create table if not exists public.push_config (key text primary key, value text not null);
alter table public.push_config enable row level security;
insert into public.push_config (key, value) values ('cron_secret', encode(extensions.gen_random_bytes(24), 'hex')) on conflict do nothing;
insert into public.push_config (key, value) values ('kontakt', 'mailto:foerderverein.stlucia.kiga@gmail.com') on conflict do nothing;

-- Geräte, die Benachrichtigungen erlaubt haben (keine Namen, keine Mailadressen)
create table if not exists public.push_abos (
  endpoint text primary key check (endpoint like 'https://%' and length(endpoint) < 800),
  p256dh text not null,
  auth text not null,
  tokens uuid[] not null default '{}',
  erstellt timestamptz not null default now()
);
alter table public.push_abos enable row level security;

-- Warteschlange der Nachrichten (tokens = null: an alle)
create table if not exists public.push_queue (
  id uuid primary key default gen_random_uuid(),
  tokens uuid[],
  titel text not null,
  text text not null default '',
  url text not null default '',
  erstellt timestamptz not null default now(),
  gesendet boolean not null default false,
  versendet int,
  fehler text
);
alter table public.push_queue enable row level security;
alter table public.eintraege add column if not exists erinnert boolean not null default false;

create or replace function public.push_schluessel() returns text
language sql stable security definer set search_path = public as $$
  select value from public.push_config where key = 'vapid_public';
$$;

create or replace function public.push_anmelden(p_endpoint text, p_p256dh text, p_auth text, p_tokens uuid[] default '{}')
returns void language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.push_abos) >= 5000 then raise exception 'ZU_VIELE'; end if;
  insert into public.push_abos (endpoint, p256dh, auth, tokens)
  values (p_endpoint, p_p256dh, p_auth, (coalesce(p_tokens, '{}'::uuid[]))[1:50])
  on conflict (endpoint) do update set p256dh = excluded.p256dh, auth = excluded.auth, tokens = excluded.tokens;
end; $$;

create or replace function public.push_abmelden(p_endpoint text) returns void
language sql security definer set search_path = public as $$
  delete from public.push_abos where endpoint = p_endpoint;
$$;

create or replace function public.push_anzahl() returns int
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.ist_vorstand() then raise exception 'Nur für den Vorstand'; end if;
  return (select count(*)::int from public.push_abos);
end; $$;

create or replace function public.push_senden(p_titel text, p_text text, p_url text default '')
returns int language plpgsql security definer set search_path = public as $$
begin
  if not public.ist_vorstand() then raise exception 'Nur für den Vorstand'; end if;
  if length(trim(coalesce(p_titel, ''))) < 3 or length(p_titel) > 80 or length(coalesce(p_text, '')) > 200 then raise exception 'UNGUELTIG'; end if;
  insert into public.push_queue (tokens, titel, text, url) values (null, trim(p_titel), trim(coalesce(p_text, '')), left(coalesce(p_url, ''), 100));
  return (select count(*)::int from public.push_abos);
end; $$;

-- Nachrücken: zusätzlich eine Nachricht an das Gerät der nachgerückten Person
create or replace function public.nachruecken(p_platz uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_anzahl int; v_id uuid; v_token uuid; v_bez text; v_titel text; v_liste uuid;
begin
  select p.anzahl, p.bezeichnung, l.titel, l.id into v_anzahl, v_bez, v_titel, v_liste
    from public.plaetze p join public.listen l on l.id = p.liste_id where p.id = p_platz;
  if v_anzahl is null then return; end if;
  loop
    exit when (select count(*) from public.eintraege where platz_id = p_platz and not warteliste) >= v_anzahl;
    select id, token into v_id, v_token from public.eintraege where platz_id = p_platz and warteliste order by erstellt limit 1;
    exit when v_id is null;
    update public.eintraege set warteliste = false, nachgerueckt = now() where id = v_id;
    if exists (select 1 from public.push_abos a where v_token = any(a.tokens)) then
      insert into public.push_queue (tokens, titel, text, url)
      values (array[v_token], 'Ihr seid nachgerückt', left(v_bez || ' bei „' || v_titel || '“ ist jetzt für euch eingetragen.', 200), '#liste-' || v_liste);
    end if;
  end loop;
end; $$;

-- Erinnerung am Vortag des Helferdienstes
create or replace function public.push_erinnerungen() returns int
language plpgsql security definer set search_path = public as $$
declare n int := 0; r record; v_morgen date := (now() at time zone 'Europe/Berlin')::date + 1;
begin
  for r in
    select e.id, e.token, p.bezeichnung, p.zeit, l.titel, l.id as liste_id
    from public.eintraege e join public.plaetze p on p.id = e.platz_id join public.listen l on l.id = p.liste_id
    where l.aktiv and l.datum = v_morgen and not e.warteliste and not e.erinnert
      and exists (select 1 from public.push_abos a where e.token = any(a.tokens))
  loop
    insert into public.push_queue (tokens, titel, text, url)
    values (array[r.token], 'Morgen: ' || r.titel, left(r.bezeichnung || coalesce(' · ' || nullif(r.zeit, ''), '') || '. Danke für eure Hilfe!', 200), '#liste-' || r.liste_id);
    update public.eintraege set erinnert = true where id = r.id;
    n := n + 1;
  end loop;
  delete from public.push_queue where gesendet and erstellt < now() - interval '30 days';
  return n;
end; $$;

revoke all on function public.push_schluessel() from public;
revoke all on function public.push_anmelden(text, text, text, uuid[]) from public;
revoke all on function public.push_abmelden(text) from public;
revoke all on function public.push_anzahl() from public;
revoke all on function public.push_senden(text, text, text) from public;
revoke all on function public.push_erinnerungen() from public, anon, authenticated;
revoke all on function public.nachruecken(uuid) from public, anon, authenticated;
grant execute on function public.push_schluessel() to anon, authenticated;
grant execute on function public.push_anmelden(text, text, text, uuid[]) to anon, authenticated;
grant execute on function public.push_abmelden(text) to anon, authenticated;
grant execute on function public.push_anzahl() to authenticated;
grant execute on function public.push_senden(text, text, text) to authenticated;
revoke execute on function public.push_anzahl() from anon;
revoke execute on function public.push_senden(text, text, text) from anon;

-- Zeitpläne: Versand jede Minute (nur wenn etwas wartet), Erinnerungen täglich 16:00 UTC (17/18 Uhr deutscher Zeit)
do $$
declare s text;
begin
  select value into s from public.push_config where key = 'cron_secret';
  perform cron.unschedule(jobid) from cron.job where jobname in ('push-versand', 'push-erinnerung');
  perform cron.schedule('push-versand', '* * * * *', format(
    $c$select net.http_post(url := 'https://esfmfgsrrrpqwtmfyoys.supabase.co/functions/v1/push-senden', headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', %L), body := '{}'::jsonb) where exists (select 1 from public.push_queue where not gesendet)$c$, s));
  perform cron.schedule('push-erinnerung', '0 16 * * *', 'select public.push_erinnerungen()');
end $$;
