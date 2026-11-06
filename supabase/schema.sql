-- ============================================================
-- Förderverein Kita St. Lucia Walbeck – Datenbankschema für Supabase
-- Einmal komplett im SQL-Editor des Supabase-Projekts ausführen.
-- Grundsatz: Eltern (anonym) dürfen nur über Funktionen eintragen/austragen
-- und Anträge abschicken. Lesen/Ändern von Personendaten nur für den Vorstand.
-- ============================================================

create table if not exists public.vorstand (
  user_id uuid primary key references auth.users on delete cascade,
  name text
);

create table if not exists public.listen (
  id uuid primary key default gen_random_uuid(),
  titel text not null check (length(titel) between 2 and 120),
  datum date,
  beschreibung text default '' check (length(beschreibung) <= 1000),
  aktiv boolean not null default true,
  erstellt timestamptz not null default now()
);

create table if not exists public.plaetze (
  id uuid primary key default gen_random_uuid(),
  liste_id uuid not null references public.listen on delete cascade,
  bezeichnung text not null check (length(bezeichnung) between 1 and 120),
  zeit text default '' check (length(zeit) <= 40),
  anzahl int not null default 1 check (anzahl between 1 and 99),
  reihenfolge int not null default 0
);
create index if not exists plaetze_liste on public.plaetze(liste_id);

create table if not exists public.eintraege (
  id uuid primary key default gen_random_uuid(),
  platz_id uuid not null references public.plaetze on delete cascade,
  name text not null check (length(trim(name)) between 2 and 60),
  kontakt text default '' check (length(kontakt) <= 100),
  token uuid not null default gen_random_uuid() unique,
  erstellt timestamptz not null default now()
);
create index if not exists eintraege_platz on public.eintraege(platz_id);

create table if not exists public.mitgliedsantraege (
  id uuid primary key default gen_random_uuid(),
  erstellt timestamptz not null default now(),
  vorname text not null check (length(vorname) between 1 and 60),
  nachname text not null check (length(nachname) between 1 and 60),
  strasse text not null check (length(strasse) <= 120),
  plz text not null check (plz ~ '^[0-9]{5}$'),
  ort text not null check (length(ort) <= 80),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  telefon text default '' check (length(telefon) <= 40),
  kind text default '' check (length(kind) <= 120),
  beitrag numeric(8,2) not null check (beitrag >= 1 and beitrag <= 10000),
  kontoinhaber text not null check (length(kontoinhaber) <= 120),
  iban text not null check (iban ~ '^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$'),
  sepa_mandat boolean not null check (sepa_mandat),
  datenschutz boolean not null check (datenschutz),
  status text not null default 'neu' check (status in ('neu','angenommen','abgelehnt')),
  notiz text default ''
);

-- Hilfsfunktion: ist die angemeldete Person Vorstand?
create or replace function public.ist_vorstand() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.vorstand where user_id = auth.uid());
$$;

alter table public.vorstand enable row level security;
alter table public.listen enable row level security;
alter table public.plaetze enable row level security;
alter table public.eintraege enable row level security;
alter table public.mitgliedsantraege enable row level security;

-- Vorstand
drop policy if exists vorstand_lesen on public.vorstand;
create policy vorstand_lesen on public.vorstand for select to authenticated using (user_id = auth.uid() or public.ist_vorstand());

-- Listen & Plätze: aktive sind öffentlich lesbar, Pflege nur Vorstand
drop policy if exists listen_lesen on public.listen;
create policy listen_lesen on public.listen for select to anon, authenticated using (aktiv or public.ist_vorstand());
drop policy if exists listen_pflege on public.listen;
create policy listen_pflege on public.listen for all to authenticated using (public.ist_vorstand()) with check (public.ist_vorstand());

drop policy if exists plaetze_lesen on public.plaetze;
create policy plaetze_lesen on public.plaetze for select to anon, authenticated
  using (exists (select 1 from public.listen l where l.id = liste_id and (l.aktiv or public.ist_vorstand())));
drop policy if exists plaetze_pflege on public.plaetze;
create policy plaetze_pflege on public.plaetze for all to authenticated using (public.ist_vorstand()) with check (public.ist_vorstand());

-- Einträge: direkt nur Vorstand (Eltern gehen über eintragen/austragen/belegung)
drop policy if exists eintraege_vorstand on public.eintraege;
create policy eintraege_vorstand on public.eintraege for all to authenticated using (public.ist_vorstand()) with check (public.ist_vorstand());

-- Mitgliedsanträge: jeder darf abschicken, nur Vorstand liest/ändert
drop policy if exists antrag_senden on public.mitgliedsantraege;
create policy antrag_senden on public.mitgliedsantraege for insert to anon, authenticated with check (status = 'neu');
drop policy if exists antrag_vorstand on public.mitgliedsantraege;
create policy antrag_vorstand on public.mitgliedsantraege for all to authenticated using (public.ist_vorstand()) with check (public.ist_vorstand());

-- Öffentliche Belegung: nur Vorname + Initial, keine Kontaktdaten
create or replace function public.belegung()
returns table (platz_id uuid, anzeigename text)
language sql stable security definer set search_path = public as $$
  select e.platz_id,
         split_part(trim(e.name), ' ', 1) ||
         case when split_part(trim(e.name), ' ', 2) <> '' then ' ' || left(split_part(trim(e.name), ' ', 2), 1) || '.' else '' end
  from public.eintraege e
  join public.plaetze p on p.id = e.platz_id
  join public.listen l on l.id = p.liste_id
  where l.aktiv
  order by e.erstellt;
$$;

-- Eintragen mit Platzprüfung (gegen Überbuchung gesperrt)
create or replace function public.eintragen(p_platz uuid, p_name text, p_kontakt text default '')
returns uuid language plpgsql security definer set search_path = public as $$
declare v_anzahl int; v_aktiv boolean; v_belegt int; v_token uuid;
begin
  select p.anzahl, l.aktiv into v_anzahl, v_aktiv
    from public.plaetze p join public.listen l on l.id = p.liste_id
    where p.id = p_platz for update of p;
  if v_anzahl is null or not v_aktiv then raise exception 'GESCHLOSSEN'; end if;
  select count(*) into v_belegt from public.eintraege where platz_id = p_platz;
  if v_belegt >= v_anzahl then raise exception 'VOLL'; end if;
  insert into public.eintraege (platz_id, name, kontakt) values (p_platz, trim(p_name), coalesce(trim(p_kontakt), ''))
    returning token into v_token;
  return v_token;
end; $$;

-- Austragen nur mit dem geheimen Token, das beim Eintragen auf dem Gerät gespeichert wurde
create or replace function public.austragen(p_token uuid)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  delete from public.eintraege where token = p_token;
  return found;
end; $$;

-- Liste samt Plätzen in einem Schritt speichern (nur Vorstand)
create or replace function public.liste_speichern(p_liste jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_platz jsonb; v_ids uuid[] := '{}'; v_pid uuid;
begin
  if not public.ist_vorstand() then raise exception 'Nur für den Vorstand'; end if;
  v_id := nullif(p_liste->>'id', '')::uuid;
  if v_id is null then
    insert into public.listen (titel, datum, beschreibung, aktiv)
    values (p_liste->>'titel', nullif(p_liste->>'datum','')::date, coalesce(p_liste->>'beschreibung',''), coalesce((p_liste->>'aktiv')::boolean, true))
    returning id into v_id;
  else
    update public.listen set titel = p_liste->>'titel', datum = nullif(p_liste->>'datum','')::date,
      beschreibung = coalesce(p_liste->>'beschreibung',''), aktiv = coalesce((p_liste->>'aktiv')::boolean, true)
    where id = v_id;
  end if;
  for v_platz in select * from jsonb_array_elements(coalesce(p_liste->'plaetze','[]'::jsonb)) loop
    v_pid := nullif(v_platz->>'id','')::uuid;
    if v_pid is null then
      insert into public.plaetze (liste_id, bezeichnung, zeit, anzahl, reihenfolge)
      values (v_id, v_platz->>'bezeichnung', coalesce(v_platz->>'zeit',''), coalesce((v_platz->>'anzahl')::int,1), coalesce((v_platz->>'reihenfolge')::int,0))
      returning id into v_pid;
    else
      update public.plaetze set bezeichnung = v_platz->>'bezeichnung', zeit = coalesce(v_platz->>'zeit',''),
        anzahl = coalesce((v_platz->>'anzahl')::int,1), reihenfolge = coalesce((v_platz->>'reihenfolge')::int,0)
      where id = v_pid and liste_id = v_id;
    end if;
    v_ids := v_ids || v_pid;
  end loop;
  delete from public.plaetze where liste_id = v_id and not (id = any(v_ids));
  return v_id;
end; $$;

revoke all on function public.belegung() from public;
revoke all on function public.eintragen(uuid, text, text) from public;
revoke all on function public.austragen(uuid) from public;
revoke all on function public.liste_speichern(jsonb) from public;
revoke all on function public.ist_vorstand() from public;
grant execute on function public.belegung() to anon, authenticated;
grant execute on function public.eintragen(uuid, text, text) to anon, authenticated;
grant execute on function public.austragen(uuid) to anon, authenticated;
grant execute on function public.liste_speichern(jsonb) to authenticated;
grant execute on function public.ist_vorstand() to anon, authenticated;

-- ------------------------------------------------------------
-- Nach dem Anlegen eines Vorstandskontos (Authentication → Users → Add user):
-- insert into public.vorstand (user_id, name)
--   select id, 'Name' from auth.users where email = 'vorstand@beispiel.de';
-- ------------------------------------------------------------
