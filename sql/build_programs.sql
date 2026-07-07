-- ============================================================
-- Primal Fitness — Build: custom programs + exercise name/video overrides
-- Run once in Supabase → SQL Editor (paste all, Run). Safe to re-run.
-- Builds on the existing app_session(p_token) for admin auth.
-- ============================================================

-- ---------- Tables ----------
-- Custom (admin-built) programs. `data` holds days/exercises/weekly %s.
create table if not exists public.custom_programs (
  id         uuid primary key default gen_random_uuid(),
  name       text not null default 'Untitled',
  weeks      int  not null default 4,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Per-exercise name/video overrides for the built-in programs.
create table if not exists public.exercise_meta (
  program    text not null,
  ex_key     text not null,
  name       text,
  video      text,
  updated_at timestamptz not null default now(),
  primary key (program, ex_key)
);

-- These are workout templates (not private), so the app reads them directly
-- with the public key; only admins can write, via the functions below.
alter table public.custom_programs enable row level security;
alter table public.exercise_meta   enable row level security;

drop policy if exists custom_programs_read on public.custom_programs;
create policy custom_programs_read on public.custom_programs for select using (true);
drop policy if exists exercise_meta_read on public.exercise_meta;
create policy exercise_meta_read on public.exercise_meta for select using (true);

grant select on public.custom_programs to anon, authenticated;
grant select on public.exercise_meta   to anon, authenticated;

-- ---------- Admin functions ----------

-- Create (p_id null) or update a custom program. Returns the row id.
create or replace function public.app_save_program(
  p_token text, p_id uuid, p_name text, p_weeks int, p_data jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_role text; v_id uuid;
begin
  select role into v_role from public.app_session(p_token) limit 1;
  if v_role is null or v_role <> 'Admin' then raise exception 'Admin only'; end if;
  if p_id is null then
    insert into public.custom_programs(name, weeks, data, updated_at)
         values (coalesce(p_name,'Untitled'), greatest(1,coalesce(p_weeks,4)), coalesce(p_data,'{}'::jsonb), now())
      returning id into v_id;
  else
    update public.custom_programs
       set name = coalesce(p_name,'Untitled'),
           weeks = greatest(1,coalesce(p_weeks,4)),
           data = coalesce(p_data,'{}'::jsonb),
           updated_at = now()
     where id = p_id
      returning id into v_id;
  end if;
  return v_id;
end $$;

create or replace function public.app_delete_program(p_token text, p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_role text;
begin
  select role into v_role from public.app_session(p_token) limit 1;
  if v_role is null or v_role <> 'Admin' then raise exception 'Admin only'; end if;
  delete from public.custom_programs where id = p_id;
end $$;

-- Set (or clear) the name/video override for one built-in exercise.
create or replace function public.app_set_exercise_meta(
  p_token text, p_program text, p_ex_key text, p_name text, p_video text)
returns void language plpgsql security definer set search_path = public as $$
declare v_role text;
begin
  select role into v_role from public.app_session(p_token) limit 1;
  if v_role is null or v_role <> 'Admin' then raise exception 'Admin only'; end if;
  insert into public.exercise_meta(program, ex_key, name, video, updated_at)
       values (p_program, p_ex_key, nullif(p_name,''), nullif(p_video,''), now())
  on conflict (program, ex_key) do update
     set name = nullif(excluded.name,''),
         video = nullif(excluded.video,''),
         updated_at = now();
end $$;

grant execute on function public.app_save_program(text,uuid,text,int,jsonb)      to anon, authenticated;
grant execute on function public.app_delete_program(text,uuid)                   to anon, authenticated;
grant execute on function public.app_set_exercise_meta(text,text,text,text,text) to anon, authenticated;
