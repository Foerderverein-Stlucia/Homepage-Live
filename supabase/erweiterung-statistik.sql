-- ============================================================
-- Erweiterung: anonyme Seitenstatistik (nur Zähler, keine Personendaten)
-- Darf mehrfach ausgeführt werden.
-- ============================================================
create table if not exists public.seitenaufrufe (
  tag date not null,
  seite text not null,
  geraet text not null check (geraet in ('handy','computer')),
  app boolean not null default false,
  anzahl integer not null default 0,
  primary key (tag, seite, geraet, app)
);
alter table public.seitenaufrufe enable row level security;
-- keine Policies: niemand liest oder schreibt direkt, nur die Funktionen unten

create or replace function public.aufruf(p_seite text, p_geraet text, p_app boolean)
returns void language plpgsql security definer set search_path = public as $$
declare v_tag date := (now() at time zone 'Europe/Berlin')::date;
begin
  if p_seite !~ '^[a-z0-9-]{1,40}$' or p_geraet not in ('handy','computer') then return; end if;
  -- Schutz vor Flut: pro Tag höchstens 400 verschiedene Zähler
  if not exists (select 1 from public.seitenaufrufe where tag = v_tag and seite = p_seite and geraet = p_geraet and app = coalesce(p_app,false))
     and (select count(*) from public.seitenaufrufe where tag = v_tag) >= 400 then return; end if;
  insert into public.seitenaufrufe (tag, seite, geraet, app, anzahl) values (v_tag, p_seite, p_geraet, coalesce(p_app,false), 1)
  on conflict (tag, seite, geraet, app) do update set anzahl = public.seitenaufrufe.anzahl + 1;
end; $$;

create or replace function public.statistik(p_tage integer default 30)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare v_von date := (now() at time zone 'Europe/Berlin')::date - greatest(1, least(p_tage, 365)) + 1;
begin
  if not public.ist_vorstand() then raise exception 'Nur für den Vorstand'; end if;
  return jsonb_build_object(
    'tage',    coalesce((select jsonb_agg(jsonb_build_object('tag', tag, 'anzahl', s) order by tag) from (select tag, sum(anzahl)::int s from public.seitenaufrufe where tag >= v_von group by tag) x), '[]'::jsonb),
    'seiten',  coalesce((select jsonb_agg(jsonb_build_object('seite', seite, 'anzahl', s) order by s desc) from (select seite, sum(anzahl)::int s from public.seitenaufrufe where tag >= v_von group by seite) x), '[]'::jsonb),
    'geraete', coalesce((select jsonb_agg(jsonb_build_object('geraet', geraet, 'anzahl', s)) from (select geraet, sum(anzahl)::int s from public.seitenaufrufe where tag >= v_von group by geraet) x), '[]'::jsonb),
    'app',     coalesce((select jsonb_agg(jsonb_build_object('app', app, 'anzahl', s)) from (select app, sum(anzahl)::int s from public.seitenaufrufe where tag >= v_von group by app) x), '[]'::jsonb));
end; $$;

revoke all on function public.aufruf(text, text, boolean) from public;
revoke all on function public.statistik(integer) from public;
grant execute on function public.aufruf(text, text, boolean) to anon, authenticated;
grant execute on function public.statistik(integer) to authenticated;
revoke execute on function public.statistik(integer) from anon;
