-- ============================================================
-- Primal Fitness - add the "Comp Coach" role
-- Run once in Supabase -> SQL Editor (paste all, Run). Safe to re-run.
--
-- The role is stored as 'CompCoach' (one word, no space) because the app
-- turns it into a CSS class: body.role-CompCoach. The UI shows "Comp Coach".
--
-- The Competition tab itself stores nothing, so this is the only database
-- change the feature needs.
-- ============================================================

-- ---------- 1. Refuse to run if some existing row uses an unknown role ----------
-- Better a clear message now than a cryptic constraint violation below.
do $$
declare bad text;
begin
  select string_agg(distinct role, ', ') into bad
    from public.app_users
   where role is null or role not in ('Admin','Lifter','Spectate','CompCoach');
  if bad is not null then
    raise exception 'app_users contains unexpected role values: %. Fix those rows first.', bad;
  end if;
end $$;

-- ---------- 2. Replace whatever CHECK constraint guards app_users.role ----------
-- The constraint name is not known ahead of time, so find it by definition.
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
    raise notice 'dropped old role constraint: %', c.conname;
  end loop;
end $$;

alter table public.app_users
  add constraint app_users_role_check
  check (role in ('Admin','Lifter','Spectate','CompCoach'));

-- ---------- 3. Teach the two role functions about CompCoach ----------
-- Both carry their own whitelist in the function body, which the table
-- constraint above cannot see:
--     if p_role not in ('Admin','Lifter','Spectate') then raise exception 'Bad role';
-- These are the live definitions with only that one list extended. Everything
-- else - the admin check, the last-admin guard, the search_path, the password
-- hashing - is reproduced exactly as it was.

create or replace function public.app_set_role(p_token text, p_user uuid, p_role text)
returns void language plpgsql security definer set search_path to 'public' as $function$
begin
  if not public._sess_admin(p_token) then raise exception 'Not authorized'; end if;
  if p_role not in ('Admin','Lifter','Spectate','CompCoach') then raise exception 'Bad role'; end if;
  if p_role<>'Admin' and (select role from public.app_users where id=p_user)='Admin'
     and (select count(*) from public.app_users where role='Admin')<=1 then raise exception 'Cannot demote the only admin'; end if;
  update public.app_users set role=p_role where id=p_user;
end;$function$;

create or replace function public.app_create_user(p_token text, p_username text, p_password text, p_role text)
returns json language plpgsql security definer set search_path to 'public', 'extensions' as $function$
declare nid uuid;
begin
  if not public._sess_admin(p_token) then raise exception 'Not authorized'; end if;
  if p_role not in ('Admin','Lifter','Spectate','CompCoach') then raise exception 'Bad role'; end if;
  if exists(select 1 from public.app_users where username=p_username) then raise exception 'Username already exists'; end if;
  insert into public.app_users(username,role,pass_hash) values(p_username,p_role,crypt(p_password,gen_salt('bf'))) returning id into nid;
  return json_build_object('id',nid,'username',p_username,'role',p_role);
end;$function$;

-- ---------- 4. Verify ----------
-- Both rows should mention CompCoach; the constraint should list all four roles.
select p.proname,
       pg_get_functiondef(p.oid) ilike '%CompCoach%' as accepts_compcoach
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public'
   and p.proname in ('app_create_user','app_set_role');

select conname, pg_get_constraintdef(oid) as definition
  from pg_constraint
 where conrelid = 'public.app_users'::regclass
   and conname = 'app_users_role_check';
