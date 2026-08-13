
-- ============================================================
-- NEXA 1518 v22 — SvS workflow completion
-- Run ONCE in Supabase SQL Editor → New Query → Run.
-- Safe to run if Castle/Presidency columns already exist.
-- ============================================================

alter table public.svs_events
add column if not exists castle_alliance_id bigint
references public.alliances(id)
on delete set null;

alter table public.svs_events
add column if not exists presidency_alliance_id bigint
references public.alliances(id)
on delete set null;

alter table public.svs_events
add column if not exists announcement_text text;

alter table public.svs_events
add column if not exists announcement_version bigint not null default 0;

alter table public.prep_requests
add column if not exists scheduler_note text;

-- ------------------------------------------------------------
-- Announcement acknowledgements
-- ------------------------------------------------------------
create table if not exists public.announcement_acknowledgements (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.svs_events(id) on delete cascade,
  announcement_version bigint not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  acknowledged_at timestamptz not null default now(),
  unique(event_id, announcement_version, user_id)
);

alter table public.announcement_acknowledgements enable row level security;

drop policy if exists "Users view own announcement acknowledgement" on public.announcement_acknowledgements;
create policy "Users view own announcement acknowledgement"
on public.announcement_acknowledgements
for select to authenticated
using (user_id = (select auth.uid()) or public.is_admin());

drop policy if exists "Users acknowledge announcement" on public.announcement_acknowledgements;
create policy "Users acknowledge announcement"
on public.announcement_acknowledgements
for insert to authenticated
with check (user_id = (select auth.uid()));

grant select, insert on public.announcement_acknowledgements to authenticated;

-- Admin/Owner can list who acknowledged the current announcement
create or replace function public.list_announcement_acknowledgements(
  target_event_id uuid,
  target_version bigint
)
returns table (
  user_id uuid,
  discord_name text,
  in_game_names text,
  acknowledged_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Admin access required.';
  end if;

  return query
  select
    aa.user_id,
    coalesce(
      u.raw_user_meta_data ->> 'full_name',
      u.raw_user_meta_data ->> 'name',
      u.raw_user_meta_data ->> 'preferred_username',
      u.raw_user_meta_data ->> 'user_name',
      u.email,
      'Discord User'
    ) as discord_name,
    coalesce(string_agg(distinct pa.in_game_name, ', '), '') as in_game_names,
    aa.acknowledged_at
  from public.announcement_acknowledgements aa
  join auth.users u on u.id = aa.user_id
  left join public.player_accounts pa on pa.user_id = aa.user_id
  where aa.event_id = target_event_id
    and aa.announcement_version = target_version
  group by aa.user_id, u.raw_user_meta_data, u.email, aa.acknowledged_at
  order by aa.acknowledged_at desc;
end;
$$;

grant execute on function public.list_announcement_acknowledgements(uuid,bigint) to authenticated;

-- ------------------------------------------------------------
-- Scheduler access to Prep Requests and Ministry Appointments
-- ------------------------------------------------------------
drop policy if exists "View prep requests" on public.prep_requests;
create policy "View prep requests"
on public.prep_requests
for select to authenticated
using (
  user_id = (select auth.uid())
  or public.is_scheduler_or_admin()
);

drop policy if exists "Update prep request" on public.prep_requests;
create policy "Update prep request"
on public.prep_requests
for update to authenticated
using (
  public.is_scheduler_or_admin()
  or (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.svs_events e
      where e.id = event_id
        and e.prep_form_open = true
    )
  )
)
with check (
  public.is_scheduler_or_admin()
  or user_id = (select auth.uid())
);

-- Preserve admin-only workflow fields when a normal player edits their form.
create or replace function public.protect_prep_admin_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_scheduler_or_admin() then
    new.status := old.status;
    new.admin_notes := old.admin_notes;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_prep_admin_fields_trigger on public.prep_requests;
create trigger protect_prep_admin_fields_trigger
before update on public.prep_requests
for each row execute function public.protect_prep_admin_fields();

drop policy if exists "View ministry appointments" on public.ministry_appointments;
create policy "View ministry appointments"
on public.ministry_appointments
for select to authenticated
using (
  public.is_scheduler_or_admin()
  or exists (
    select 1 from public.svs_events e
    where e.id = event_id
      and e.schedule_published = true
  )
);

drop policy if exists "Create ministry appointments" on public.ministry_appointments;
create policy "Create ministry appointments"
on public.ministry_appointments
for insert to authenticated
with check (public.is_scheduler_or_admin());

drop policy if exists "Update ministry appointments" on public.ministry_appointments;
create policy "Update ministry appointments"
on public.ministry_appointments
for update to authenticated
using (public.is_scheduler_or_admin())
with check (public.is_scheduler_or_admin());

drop policy if exists "Delete ministry appointments" on public.ministry_appointments;
create policy "Delete ministry appointments"
on public.ministry_appointments
for delete to authenticated
using (public.is_scheduler_or_admin());

-- Recreate direct assignment RPC so Scheduler can assign too.
create or replace function public.assign_ministry_appointment(
  target_request_id uuid,
  target_day_type text,
  target_appointment_time timestamptz
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  req public.prep_requests;
  ministry text;
  new_appointment_id uuid;
begin
  if not public.is_scheduler_or_admin() then
    raise exception 'Scheduler or Admin access required.';
  end if;

  select * into req
  from public.prep_requests
  where id = target_request_id;

  if req.id is null then
    raise exception 'Prep request not found.';
  end if;

  if target_day_type = 'construction' and req.construction_requested is not true then
    raise exception 'Player did not request Construction ministry.';
  end if;

  if target_day_type = 'research' and req.research_requested is not true then
    raise exception 'Player did not request Research ministry.';
  end if;

  if target_day_type = 'training' and req.training_requested is not true then
    raise exception 'Player did not request Training ministry.';
  end if;

  if target_day_type in ('construction','research') then
    ministry := 'VP';
  elsif target_day_type = 'training' then
    ministry := 'MOE';
  else
    raise exception 'Invalid ministry day.';
  end if;

  insert into public.ministry_appointments (
    event_id, prep_request_id, player_account_id, day_type,
    ministry_position, appointment_time, assigned_by
  )
  values (
    req.event_id, req.id, req.player_account_id, target_day_type,
    ministry, target_appointment_time, auth.uid()
  )
  returning id into new_appointment_id;

  update public.prep_requests
  set status =
    case
      when
        (not construction_requested or exists (
          select 1 from public.ministry_appointments ma
          where ma.prep_request_id=req.id and ma.day_type='construction'
        ))
        and
        (not research_requested or exists (
          select 1 from public.ministry_appointments ma
          where ma.prep_request_id=req.id and ma.day_type='research'
        ))
        and
        (not training_requested or exists (
          select 1 from public.ministry_appointments ma
          where ma.prep_request_id=req.id and ma.day_type='training'
        ))
      then 'scheduled'
      else 'partially_scheduled'
    end
  where id=req.id;

  return new_appointment_id;
end;
$$;

grant execute on function public.assign_ministry_appointment(uuid,text,timestamptz) to authenticated;

-- ------------------------------------------------------------
-- Basic audit log
-- ------------------------------------------------------------
create table if not exists public.audit_log (
  id bigint generated by default as identity primary key,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.audit_log enable row level security;

drop policy if exists "Admins view audit log" on public.audit_log;
create policy "Admins view audit log"
on public.audit_log
for select to authenticated
using (public.is_admin());

grant select on public.audit_log to authenticated;

create or replace function public.write_audit(
  action_name text,
  action_details jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_scheduler_or_admin() then
    raise exception 'Scheduler or Admin access required.';
  end if;

  insert into public.audit_log(actor_user_id,action,details)
  values(auth.uid(), action_name, coalesce(action_details,'{}'::jsonb));
end;
$$;

grant execute on function public.write_audit(text,jsonb) to authenticated;
