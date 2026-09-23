-- ============================================================
-- Primal Fitness - Local records + qualifying totals per weight class
-- Run once in Supabase -> SQL Editor (paste all, Run). Safe to re-run.
-- Builds on the existing app_session(p_token) for admin auth.
-- ============================================================

-- One row per (sex, weight class). Classic/raw only for now; if equipped
-- standards are ever needed, add an `equip` column to the primary key.
-- All values are kg, matching the competition bests on the lifters table.
-- Any column may be null - a blank simply renders as "-" in the app.
create table if not exists public.standards (
  sex        text not null check (sex in ('M','F')),
  wclass     text not null,               -- '83', '120+', ... as produced by wclass()
  sq         numeric,                     -- local record squat
  bp         numeric,                     -- local record bench
  dl         numeric,                     -- local record deadlift
  total      numeric,                     -- local record total
  qual_total numeric,                     -- qualifying total for the meet
  updated_at timestamptz not null default now(),
  primary key (sex, wclass)
);

-- Records and standards are public information, so the app reads them
-- directly with the public key; only admins can write, via the function below.
alter table public.standards enable row level security;

drop policy if exists standards_read on public.standards;
create policy standards_read on public.standards for select using (true);

grant select on public.standards to anon, authenticated;

-- ---------- Admin functions ----------

-- Insert or update one weight class. Nulls clear a value.
create or replace function public.app_set_standard(
  p_token text, p_sex text, p_wclass text,
  p_sq numeric, p_bp numeric, p_dl numeric, p_total numeric, p_qual numeric)
returns void language plpgsql security definer set search_path = public as $$
declare v_role text;
begin
  select role into v_role from public.app_session(p_token) limit 1;
  if v_role is null or v_role <> 'Admin' then raise exception 'Admin only'; end if;
  if p_sex not in ('M','F') then raise exception 'Bad sex'; end if;
  if coalesce(p_wclass,'') = '' then raise exception 'Weight class required'; end if;
  insert into public.standards(sex, wclass, sq, bp, dl, total, qual_total, updated_at)
       values (p_sex, p_wclass, p_sq, p_bp, p_dl, p_total, p_qual, now())
  on conflict (sex, wclass) do update
     set sq = excluded.sq,
         bp = excluded.bp,
         dl = excluded.dl,
         total = excluded.total,
         qual_total = excluded.qual_total,
         updated_at = now();
end $$;

create or replace function public.app_delete_standard(p_token text, p_sex text, p_wclass text)
returns void language plpgsql security definer set search_path = public as $$
declare v_role text;
begin
  select role into v_role from public.app_session(p_token) limit 1;
  if v_role is null or v_role <> 'Admin' then raise exception 'Admin only'; end if;
  delete from public.standards where sex = p_sex and wclass = p_wclass;
end $$;

grant execute on function public.app_set_standard(text,text,text,numeric,numeric,numeric,numeric,numeric) to anon, authenticated;
grant execute on function public.app_delete_standard(text,text,text)                                      to anon, authenticated;
