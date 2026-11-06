-- ============================================================
-- Erweiterung Verwaltung (Inhalte, Mitglieder, Bilder, Zugänge)
-- Einmal komplett im SQL-Editor des Vereinsprojekts ausführen.
-- Darf mehrfach ausgeführt werden.
-- ============================================================

-- Newsletter-Häkchen im Mitgliedsantrag
alter table public.mitgliedsantraege add column if not exists newsletter boolean not null default false;

-- Seiteninhalte (Vereinsdaten, Termine, Projekte) – öffentlich lesbar, nur Vorstand schreibt
create table if not exists public.inhalte (
  schluessel text primary key check (schluessel in ('verein','termine','projekte')),
  wert jsonb not null,
  geaendert timestamptz not null default now(),
  geaendert_von uuid default auth.uid()
);
alter table public.inhalte enable row level security;
drop policy if exists inhalte_lesen on public.inhalte;
create policy inhalte_lesen on public.inhalte for select to anon, authenticated using (true);
drop policy if exists inhalte_pflege on public.inhalte;
create policy inhalte_pflege on public.inhalte for all to authenticated using (public.ist_vorstand()) with check (public.ist_vorstand());

-- Mitgliederliste – nur Vorstand
create table if not exists public.mitglieder (
  id uuid primary key default gen_random_uuid(),
  mitgliedsnr text default '',
  vorname text not null default '',
  nachname text not null default '',
  strasse text default '',
  plz text default '',
  ort text default '',
  email text default '',
  telefon text default '',
  kind text default '',
  beitrag numeric(8,2),
  newsletter boolean not null default false,
  kontoinhaber text default '',
  iban text default '',
  bic text default '',
  bank text default '',
  mandatsreferenz text default '',
  eintritt date,
  austritt date,
  status text not null default 'aktiv' check (status in ('aktiv','ausgetreten')),
  notiz text default '',
  antrag_id uuid,
  erstellt timestamptz not null default now(),
  geaendert timestamptz not null default now()
);
alter table public.mitglieder enable row level security;
drop policy if exists mitglieder_vorstand on public.mitglieder;
create policy mitglieder_vorstand on public.mitglieder for all to authenticated using (public.ist_vorstand()) with check (public.ist_vorstand());

-- Bilder (öffentlich abrufbar, hochladen/löschen nur Vorstand)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('bilder', 'bilder', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
drop policy if exists bilder_hochladen on storage.objects;
create policy bilder_hochladen on storage.objects for insert to authenticated with check (bucket_id = 'bilder' and public.ist_vorstand());
drop policy if exists bilder_aendern on storage.objects;
create policy bilder_aendern on storage.objects for update to authenticated using (bucket_id = 'bilder' and public.ist_vorstand());
drop policy if exists bilder_loeschen on storage.objects;
create policy bilder_loeschen on storage.objects for delete to authenticated using (bucket_id = 'bilder' and public.ist_vorstand());

-- Zugänge für den Vorstand verwalten
create or replace function public.vorstand_hinzufuegen(p_email text, p_name text)
returns void language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if not public.ist_vorstand() then raise exception 'Nur für den Vorstand'; end if;
  select id into v_id from auth.users where lower(email) = lower(trim(p_email));
  if v_id is null then raise exception 'KEIN_KONTO'; end if;
  insert into public.vorstand (user_id, name) values (v_id, trim(p_name))
  on conflict (user_id) do update set name = excluded.name;
end; $$;

create or replace function public.vorstand_entfernen(p_user uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.ist_vorstand() then raise exception 'Nur für den Vorstand'; end if;
  if p_user = auth.uid() then raise exception 'SELBST'; end if;
  delete from public.vorstand where user_id = p_user;
end; $$;

revoke all on function public.vorstand_hinzufuegen(text, text) from public;
revoke all on function public.vorstand_entfernen(uuid) from public;
grant execute on function public.vorstand_hinzufuegen(text, text) to authenticated;
grant execute on function public.vorstand_entfernen(uuid) to authenticated;

-- ------------------------------------------------------------
-- Zugang beantragen (Seite #registrieren) und Freischalten mit Amt
-- Voraussetzung in Supabase: Authentication → Sign In / Providers:
--   „Allow new users to sign up“ AN, beim Anbieter E-Mail „Confirm email“ AUS.
-- Neue Konten haben keinerlei Rechte, bis ein Vorstandsmitglied sie freischaltet.
-- ------------------------------------------------------------
alter table public.vorstand add column if not exists amt text default '';
alter table public.vorstand add column if not exists seit timestamptz default now();

drop function if exists public.vorstand_liste();
create or replace function public.vorstand_liste()
returns table (user_id uuid, name text, amt text, email text, ich boolean)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.ist_vorstand() then raise exception 'Nur für den Vorstand'; end if;
  return query select v.user_id, v.name, coalesce(v.amt, ''), u.email::text, v.user_id = auth.uid()
    from public.vorstand v join auth.users u on u.id = v.user_id order by v.name;
end; $$;

create or replace function public.zugang_anfragen()
returns table (user_id uuid, name text, email text, erstellt timestamptz)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.ist_vorstand() then raise exception 'Nur für den Vorstand'; end if;
  return query select u.id, coalesce(u.raw_user_meta_data->>'name', '')::text, u.email::text, u.created_at
    from auth.users u where not exists (select 1 from public.vorstand v where v.user_id = u.id)
    order by u.created_at desc;
end; $$;

create or replace function public.zugang_freischalten(p_user uuid, p_name text, p_amt text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.ist_vorstand() then raise exception 'Nur für den Vorstand'; end if;
  if not exists (select 1 from auth.users where id = p_user) then raise exception 'KEIN_KONTO'; end if;
  insert into public.vorstand (user_id, name, amt) values (p_user, trim(p_name), trim(coalesce(p_amt, '')))
  on conflict (user_id) do update set name = excluded.name, amt = excluded.amt;
end; $$;

create or replace function public.zugang_ablehnen(p_user uuid)
returns void language plpgsql security definer set search_path = public, auth as $$
begin
  if not public.ist_vorstand() then raise exception 'Nur für den Vorstand'; end if;
  if exists (select 1 from public.vorstand where user_id = p_user) then raise exception 'IST_VORSTAND'; end if;
  delete from auth.users where id = p_user;
end; $$;

revoke all on function public.vorstand_liste() from public;
revoke all on function public.zugang_anfragen() from public;
revoke all on function public.zugang_freischalten(uuid, text, text) from public;
revoke all on function public.zugang_ablehnen(uuid) from public;
grant execute on function public.vorstand_liste() to authenticated;
grant execute on function public.zugang_anfragen() to authenticated;
grant execute on function public.zugang_freischalten(uuid, text, text) to authenticated;
grant execute on function public.zugang_ablehnen(uuid) to authenticated;
