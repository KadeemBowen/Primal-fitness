-- ============================================================
-- Primal Fitness - UNDO the "Comp Coach" role
-- Reverses sql/comp_coach_role.sql (removed from the tree by commit af29c10;
-- still recoverable with: git show 588f52a:sql/comp_coach_role.sql).
--
-- Run in Supabase -> SQL Editor. Safe to re-run.
--
-- Only run this if the Comp Coach feature is being abandoned for good. Leaving
-- the database as-is is harmless: it merely permits a role the app no longer
-- offers, and nothing can create one.
-- ============================================================

-- ---------- 1. Refuse to run while anyone still holds the role ----------
-- Narrowing the whitelist under a live CompCoach user would lock them out of
-- every screen and block any later attempt to change their role.
do $$
declare n int; who text;
begin
  select count(*), string_agg(username, ', ')
    into n, who
    from public.app_users
   where role = 'CompCoach';
  if n > 0 then
    raise exception 'Still % user(s) with role CompCoach: %. Change them to Lifter/Admin/Spectate first.', n, who;
  end if;
end $$;

-- ---------- 2. Restore both role functions to their original whitelist ----------
-- These are the definitions exactly as they were before the feature, with
-- 'CompCoach' removed from the two role checks. Signatures are unchanged, so
-- CREATE OR REPLACE replaces in place and existing grants carry over.

create or replace function public.app_set_role(p_token text, p_user uuid, p_role text)
returns void language plpgsql security definer set search_path to 'public' as $function$
begin
  if not public._sess_admin(p_token) then raise exception 'Not authorized'; end if;
  if p_role not in ('Admin','Lifter','Spectate') then raise exception 'Bad role'; end if;
  if p_role<>'Admin' and (select role from public.app_users where id=p_user)='Admin'
     and (select count(*) from public.app_users where role='Admin')<=1 then raise exception 'Cannot demote the only admin'; end if;
  update public.app_users set role=p_role where id=p_user;
end;$function$;

create or replace function public.app_create_user(p_token text, p_username text, p_password text, p_role text)
returns json language plpgsql security definer set search_path to 'public', 'extensions' as $function$
declare nid uuid;
begin
  if not public._sess_admin(p_token) then raise exception 'Not authorized'; end if;
  if p_role not in ('Admin','Lifter','Spectate') then raise exception 'Bad role'; end if;
  if exists(select 1 from public.app_users where username=p_username) then raise exception 'Username already exists'; end if;
  insert into public.app_users(username,role,pass_hash) values(p_username,p_role,crypt(p_password,gen_salt('bf'))) returning id into nid;
  return json_build_object('id',nid,'username',p_username,'role',p_role);
end;$function$;

-- ---------- 3. Narrow the table constraint back to three roles ----------
-- Note: the original constraint was dropped by name-discovery, so its original
-- name was never recorded. This recreates it as app_users_role_check, which is
-- PostgreSQL's own default name for a check on this column and so is very
-- likely what it was called before.
do $$
declare c record;
begin
  for c in
    select con.conname
      from pg_constraint con
      join pg_class     rel on rel.oid = con.conrelid
      join pg_namespace ns  on ns.oid  = rel.relnamespace
     where ns.nspname = 'public'
       and rel.relname = 'app_users'
       and con.contype = 'c'
       and pg_get_constraintdef(con.oid) ilike '%role%'
  loop
    execute format('alter table public.app_users drop constraint %I', c.conname);
    raise notice 'dropped role constraint: %', c.conname;
  end loop;
end $$;

alter table public.app_users
  add constraint app_users_role_check
  check (role in ('Admin','Lifter','Spectate'));

-- If app_users.role had NO check constraint before the feature, comment out the
-- ALTER above and the column goes back to being unconstrained. Keeping the
-- constraint is the safer of the two, so it is the default here.

-- ---------- 4. Verify ----------
-- Both functions should report false; the constraint should list three roles.
select p.proname,
       pg_get_functiondef(p.oid) ilike '%CompCoach%' as still_accepts_compcoach
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public'
   and p.proname in ('app_create_user','app_set_role');

select conname, pg_get_constraintdef(oid) as definition
  from pg_constraint
 where conrelid = 'public.app_users'::regclass
   and conname = 'app_users_role_check';

select role, count(*) as users
  from public.app_users
 group by role
 order by role;
