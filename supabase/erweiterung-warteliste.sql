-- ============================================================
-- Erweiterung: Warteliste mit automatischem Nachrücken
-- Darf mehrfach ausgeführt werden.
-- ============================================================
alter table public.eintraege add column if not exists warteliste boolean not null default false;
alter table public.eintraege add column if not exists nachgerueckt timestamptz;

create or replace function public.nachruecken(p_platz uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_anzahl int; v_id uuid;
begin
  select anzahl into v_anzahl from public.plaetze where id = p_platz;
  if v_anzahl is null then return; end if;
  loop
    exit when (select count(*) from public.eintraege where platz_id = p_platz and not warteliste) >= v_anzahl;
    select id into v_id from public.eintraege where platz_id = p_platz and warteliste order by erstellt limit 1;
    exit when v_id is null;
    update public.eintraege set warteliste = false, nachgerueckt = now() where id = v_id;
  end loop;
end; $$;

create or replace function public.trg_nachruecken() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_table_name = 'eintraege' then perform public.nachruecken(old.platz_id); else perform public.nachruecken(new.id); end if;
  return null;
end; $$;
drop trigger if exists eintraege_nachruecken on public.eintraege;
create trigger eintraege_nachruecken after delete on public.eintraege for each row execute function public.trg_nachruecken();
drop trigger if exists plaetze_nachruecken on public.plaetze;
create trigger plaetze_nachruecken after update of anzahl on public.plaetze for each row execute function public.trg_nachruecken();

drop function if exists public.eintragen(uuid, text, text);
create or replace function public.eintragen(p_platz uuid, p_name text, p_kontakt text default '', p_warteliste boolean default false)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_anzahl int; v_aktiv boolean; v_belegt int; v_wartend int; v_token uuid; v_warte boolean := false;
begin
  select p.anzahl, l.aktiv into v_anzahl, v_aktiv
    from public.plaetze p join public.listen l on l.id = p.liste_id
    where p.id = p_platz for update of p;
  if v_anzahl is null or not v_aktiv then raise exception 'GESCHLOSSEN'; end if;
  select count(*) filter (where not warteliste), count(*) filter (where warteliste) into v_belegt, v_wartend
    from public.eintraege where platz_id = p_platz;
  if v_belegt >= v_anzahl then
    if not coalesce(p_warteliste, false) or v_wartend >= 20 then raise exception 'VOLL'; end if;
    v_warte := true;
  end if;
  insert into public.eintraege (platz_id, name, kontakt, warteliste) values (p_platz, trim(p_name), coalesce(trim(p_kontakt), ''), v_warte)
    returning token into v_token;
  return v_token;
end; $$;

drop function if exists public.belegung();
create or replace function public.belegung()
returns table (platz_id uuid, anzeigename text, warteliste boolean)
language sql stable security definer set search_path = public as $$
  select e.platz_id,
         split_part(trim(e.name), ' ', 1) ||
         case when split_part(trim(e.name), ' ', 2) <> '' then ' ' || left(split_part(trim(e.name), ' ', 2), 1) || '.' else '' end,
         e.warteliste
  from public.eintraege e
  join public.plaetze p on p.id = e.platz_id
  join public.listen l on l.id = p.liste_id
  where l.aktiv
  order by e.erstellt;
$$;

-- Status der eigenen Einträge (Token liegen nur auf dem Gerät)
create or replace function public.meine_status(p_tokens uuid[])
returns table (token uuid, warteliste boolean, platzierung int)
language sql stable security definer set search_path = public as $$
  select e.token, e.warteliste,
         case when e.warteliste then (select count(*)::int from public.eintraege w where w.platz_id = e.platz_id and w.warteliste and w.erstellt <= e.erstellt) else 0 end
  from public.eintraege e where e.token = any(p_tokens);
$$;

revoke all on function public.nachruecken(uuid) from public, anon, authenticated;
revoke all on function public.eintragen(uuid, text, text, boolean) from public;
revoke all on function public.belegung() from public;
revoke all on function public.meine_status(uuid[]) from public;
grant execute on function public.eintragen(uuid, text, text, boolean) to anon, authenticated;
grant execute on function public.belegung() to anon, authenticated;
grant execute on function public.meine_status(uuid[]) to anon, authenticated;
