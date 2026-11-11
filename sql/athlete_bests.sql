-- ============================================================
-- Primal Fitness - Athlete bests (kept after a program is removed)
-- Run once in Supabase -> SQL Editor (paste all, Run). Safe to re-run.
--
-- Removing a program deletes all of its program_logs. Before it does, the
-- app works out the athlete's best competition squat / bench / deadlift from
-- that program and saves them here, so an admin can still see previous bests
-- once old programs are cleared off.
--
-- Admin-only: no read policy on the table; the app reads and writes it
-- through the security-definer functions below.
-- ============================================================

create table if not exists public.athlete_bests (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null,
  username     text,                 -- snapshot, so the row still reads right if the user is deleted
  program      text not null,        -- program key, e.g. 'primal-peak'
  program_name text,                 -- display name at the time it was saved
  lift         text not null check (lift in ('squat','bench','deadlift')),
  top_weight   numeric,              -- heaviest weight logged (lb)
  top_reps     int,
  e1rm         numeric,              -- best estimated 1RM (lb)
  e1rm_weight  numeric,              -- the set that produced it
  e1rm_reps    int,
  logged_at    timestamptz,          -- when the heaviest set was logged
  archived_at  timestamptz not null default now()
);
create index if not exists athlete_bests_user_idx on public.athlete_bests(user_id);

alter table public.athlete_bests enable row level security;
revoke all on public.athlete_bests from anon, authenticated;

-- Save one program's bests for one athlete. p_rows is a JSON array of
-- {lift, top_weight, top_reps, e1rm, e1rm_weight, e1rm_reps, logged_at}.
create or replace function public.app_archive_bests(
  p_token text, p_user uuid, p_program text, p_program_name text, p_rows jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare v_role text; v_name text;
begin
  select role into v_role from public.app_session(p_token) limit 1;
  if v_role is null or v_role <> 'Admin' then raise exception 'Admin only'; end if;
  select username into v_name from public.app_users where id = p_user;
  insert into public.athlete_bests(user_id, username, program, program_name, lift,
                                   top_weight, top_reps, e1rm, e1rm_weight, e1rm_reps, logged_at)
  select p_user, v_name, p_program, p_program_name, r->>'lift',
         (r->>'top_weight')::numeric, (r->>'top_reps')::int,
         (r->>'e1rm')::numeric, (r->>'e1rm_weight')::numeric, (r->>'e1rm_reps')::int,
         (r->>'logged_at')::timestamptz
    from jsonb_array_elements(coalesce(p_rows,'[]'::jsonb)) r;
end $$;

create or replace function public.app_list_bests(p_token text)
returns setof public.athlete_bests language plpgsql security definer set search_path = public as $$
declare v_role text;
begin
  select role into v_role from public.app_session(p_token) limit 1;
  if v_role is null or v_role <> 'Admin' then raise exception 'Admin only'; end if;
  return query select * from public.athlete_bests order by archived_at desc;
end $$;

create or replace function public.app_delete_best(p_token text, p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_role text;
begin
  select role into v_role from public.app_session(p_token) limit 1;
  if v_role is null or v_role <> 'Admin' then raise exception 'Admin only'; end if;
  delete from public.athlete_bests where id = p_id;
end $$;

grant execute on function public.app_archive_bests(text,uuid,text,text,jsonb) to anon, authenticated;
grant execute on function public.app_list_bests(text)                         to anon, authenticated;
grant execute on function public.app_delete_best(text,uuid)                   to anon, authenticated;
