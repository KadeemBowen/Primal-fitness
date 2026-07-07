-- ============================================================
-- Primal Fitness — notifications + payments feature
-- Run this once in Supabase → SQL Editor (paste all, click Run).
-- Safe to re-run: uses "if not exists" / "create or replace".
-- Builds on the existing app_session(p_token) function for auth,
-- so it needs no changes to your login/session internals.
-- ============================================================

-- ---------- Tables ----------
create table if not exists public.notifications (
  user_id    uuid primary key references public.app_users(id) on delete cascade,
  message    text    not null default '',
  active     boolean not null default false,   -- admin toggle: show to user?
  dismissed  boolean not null default false,   -- user tapped Dismiss
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  user_id    uuid not null references public.app_users(id) on delete cascade,
  year       int  not null,
  month      int  not null check (month between 1 and 12),
  paid       boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (user_id, year, month)
);

-- Lock the tables down: no direct API access. Everything goes through
-- the SECURITY DEFINER functions below (same pattern as app_users).
alter table public.notifications enable row level security;
alter table public.payments      enable row level security;

-- ---------- Notifications ----------

-- Admin: set the message + on/off for a user. Any change re-shows it
-- (dismissed reset to false).
create or replace function public.app_set_notification(
  p_token text, p_user uuid, p_message text, p_active boolean)
returns void language plpgsql security definer set search_path = public as $$
declare v_role text;
begin
  select role into v_role from public.app_session(p_token) limit 1;
  if v_role is null or v_role <> 'Admin' then raise exception 'Admin only'; end if;
  insert into public.notifications(user_id, message, active, dismissed, updated_at)
       values (p_user, coalesce(p_message,''), coalesce(p_active,false), false, now())
  on conflict (user_id) do update
     set message   = excluded.message,
         active    = excluded.active,
         dismissed = false,
         updated_at = now();
end $$;

-- User: dismiss their own notification.
create or replace function public.app_dismiss_notification(p_token text)
returns void language plpgsql security definer set search_path = public as $$
declare v_uid uuid;
begin
  select id into v_uid from public.app_session(p_token) limit 1;
  if v_uid is null then raise exception 'Not signed in'; end if;
  update public.notifications set dismissed = true where user_id = v_uid;
end $$;

-- User: fetch their own notification.
create or replace function public.app_my_notification(p_token text)
returns table(message text, active boolean, dismissed boolean)
language plpgsql security definer set search_path = public as $$
declare v_uid uuid;
begin
  select id into v_uid from public.app_session(p_token) limit 1;
  if v_uid is null then return; end if;
  return query select n.message, n.active, n.dismissed
                 from public.notifications n where n.user_id = v_uid;
end $$;

-- Admin: list all notifications (for the management UI).
create or replace function public.app_list_notifications(p_token text)
returns table(user_id uuid, message text, active boolean, dismissed boolean)
language plpgsql security definer set search_path = public as $$
declare v_role text;
begin
  select role into v_role from public.app_session(p_token) limit 1;
  if v_role is null or v_role <> 'Admin' then raise exception 'Admin only'; end if;
  return query select n.user_id, n.message, n.active, n.dismissed from public.notifications n;
end $$;

-- ---------- Payments ----------

-- Admin: mark a month paid (true) or clear it (false → row removed).
create or replace function public.app_set_payment(
  p_token text, p_user uuid, p_year int, p_month int, p_paid boolean)
returns void language plpgsql security definer set search_path = public as $$
declare v_role text;
begin
  select role into v_role from public.app_session(p_token) limit 1;
  if v_role is null or v_role <> 'Admin' then raise exception 'Admin only'; end if;
  if p_paid then
    insert into public.payments(user_id, year, month, paid, updated_at)
         values (p_user, p_year, p_month, true, now())
    on conflict (user_id, year, month) do update set paid = true, updated_at = now();
  else
    delete from public.payments where user_id = p_user and year = p_year and month = p_month;
  end if;
end $$;

-- User: fetch their own paid months for a year (drives the reminders).
create or replace function public.app_my_payments(p_token text, p_year int)
returns table(year int, month int, paid boolean)
language plpgsql security definer set search_path = public as $$
declare v_uid uuid;
begin
  select id into v_uid from public.app_session(p_token) limit 1;
  if v_uid is null then return; end if;
  return query select p.year, p.month, p.paid
                 from public.payments p where p.user_id = v_uid and p.year = p_year;
end $$;

-- Admin: list all payments for a year (for the management grid).
create or replace function public.app_list_payments(p_token text, p_year int)
returns table(user_id uuid, year int, month int, paid boolean)
language plpgsql security definer set search_path = public as $$
declare v_role text;
begin
  select role into v_role from public.app_session(p_token) limit 1;
  if v_role is null or v_role <> 'Admin' then raise exception 'Admin only'; end if;
  return query select p.user_id, p.year, p.month, p.paid from public.payments p where p.year = p_year;
end $$;

-- ---------- Allow the app (anon key) to call the functions ----------
grant execute on function public.app_set_notification(text,uuid,text,boolean) to anon, authenticated;
grant execute on function public.app_dismiss_notification(text)               to anon, authenticated;
grant execute on function public.app_my_notification(text)                    to anon, authenticated;
grant execute on function public.app_list_notifications(text)                 to anon, authenticated;
grant execute on function public.app_set_payment(text,uuid,int,int,boolean)   to anon, authenticated;
grant execute on function public.app_my_payments(text,int)                    to anon, authenticated;
grant execute on function public.app_list_payments(text,int)                  to anon, authenticated;
