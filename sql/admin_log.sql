-- ============================================================
-- Primal Fitness — let admins edit any lifter's workout log
-- Run once in Supabase → SQL Editor (paste all, Run). Safe to re-run.
-- The normal app_log_exercise logs for the token's own user; these
-- admin versions target a specific p_user (validated via app_session).
-- ============================================================

-- Log or overwrite one exercise entry for a given user.
create or replace function public.app_admin_log_exercise(
  p_token text, p_user uuid, p_program text, p_week int, p_day text, p_ex text,
  p_weight numeric, p_reps int)
returns void language plpgsql security definer set search_path = public as $$
declare v_role text;
begin
  select role into v_role from public.app_session(p_token) limit 1;
  if v_role is null or v_role <> 'Admin' then raise exception 'Admin only'; end if;
  delete from public.program_logs
        where user_id=p_user and program=p_program and week=p_week and day=p_day and ex=p_ex;
  insert into public.program_logs(user_id, program, week, day, ex, weight, reps, completed_at)
       values (p_user, p_program, p_week, p_day, p_ex, p_weight, p_reps, now());
end $$;

-- Remove one exercise entry for a given user.
create or replace function public.app_admin_unlog_exercise(
  p_token text, p_user uuid, p_program text, p_week int, p_day text, p_ex text)
returns void language plpgsql security definer set search_path = public as $$
declare v_role text;
begin
  select role into v_role from public.app_session(p_token) limit 1;
  if v_role is null or v_role <> 'Admin' then raise exception 'Admin only'; end if;
  delete from public.program_logs
        where user_id=p_user and program=p_program and week=p_week and day=p_day and ex=p_ex;
end $$;

grant execute on function public.app_admin_log_exercise(text,uuid,text,int,text,text,numeric,int) to anon, authenticated;
grant execute on function public.app_admin_unlog_exercise(text,uuid,text,int,text,text)            to anon, authenticated;
