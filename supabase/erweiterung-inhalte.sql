-- ============================================================
-- Erweiterung: Neuigkeiten, Galerie, Checkliste
-- Darf mehrfach ausgeführt werden.
-- ============================================================
alter table public.inhalte drop constraint if exists inhalte_schluessel_check;
alter table public.inhalte add constraint inhalte_schluessel_check
  check (schluessel in ('verein','termine','projekte','neuigkeiten','galerie','aufgaben'));

-- Die Checkliste des Vorstands ist nicht öffentlich lesbar
drop policy if exists inhalte_lesen on public.inhalte;
create policy inhalte_lesen on public.inhalte for select to anon, authenticated
  using (schluessel <> 'aufgaben' or public.ist_vorstand());
