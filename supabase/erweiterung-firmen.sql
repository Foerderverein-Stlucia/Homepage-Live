-- ============================================================
-- Firmenmitgliedschaft (Antrag, Mitgliederliste, Nennung als Unterstützer)
-- Darf mehrfach ausgeführt werden.
-- ============================================================
alter table public.mitgliedsantraege add column if not exists art text not null default 'person';
alter table public.mitgliedsantraege add column if not exists firma text not null default '';
alter table public.mitgliedsantraege add column if not exists nennung boolean not null default false;
alter table public.mitglieder add column if not exists art text not null default 'person';
alter table public.mitglieder add column if not exists firma text not null default '';
alter table public.mitglieder add column if not exists nennung boolean not null default false;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'mitgliedsantraege_art_check') then
    alter table public.mitgliedsantraege add constraint mitgliedsantraege_art_check check (art in ('person','firma'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'mitgliedsantraege_firma_check') then
    alter table public.mitgliedsantraege add constraint mitgliedsantraege_firma_check check (length(firma) <= 120 and (art = 'person' or length(trim(firma)) >= 2));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'mitglieder_art_check') then
    alter table public.mitglieder add constraint mitglieder_art_check check (art in ('person','firma'));
  end if;
end $$;

-- Öffentliche Liste der Firmen, die genannt werden möchten (nur der Firmenname)
create or replace function public.unterstuetzer()
returns table (firma text)
language sql stable security definer set search_path = public as $$
  select m.firma from public.mitglieder m
  where m.art = 'firma' and m.nennung and m.status = 'aktiv' and length(trim(m.firma)) > 0
  order by lower(m.firma);
$$;
revoke all on function public.unterstuetzer() from public;
grant execute on function public.unterstuetzer() to anon, authenticated;
