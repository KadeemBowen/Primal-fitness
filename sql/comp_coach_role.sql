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

-- ---------- 3. Diagnostic ----------
-- app_create_user / app_set_role may carry their own role whitelist inside the
-- function body, which a table constraint cannot see. Run this and check the
-- output: if either function lists the roles explicitly, it needs 'CompCoach'
-- adding too. (Paste the result back and it can be patched.)
select p.proname,
       pg_get_functiondef(p.oid) as definition
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public'
   and p.proname in ('app_create_user','app_set_role');
