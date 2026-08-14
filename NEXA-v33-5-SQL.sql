-- ============================================================
-- NEXA v33.5 — Stability, SvS Archive, Staff/Public Editing
-- Run AFTER v33.4 SQL.
-- This does not delete existing Transfer applications or active data.
-- ============================================================

create extension if not exists pgcrypto;

-- ============================================================
-- 1) SVS ARCHIVE SNAPSHOTS
-- ============================================================

create table if not exists public.svs_event_archives (
  event_id uuid primary key references public.svs_events(id) on delete cascade,
  archived_at timestamptz not null default now(),
  event_data jsonb not null default '{}'::jsonb,
  prep_requests jsonb not null default '[]'::jsonb,
  appointments jsonb not null default '[]'::jsonb,
  summary jsonb not null default '{}'::jsonb
);

grant select on public.svs_event_archives to authenticated;

create or replace function public.end_svs_event_v2(target_event_id uuid)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare
  target_event public.svs_events%rowtype;
  req_json jsonb;
  appt_json jsonb;
  req_count bigint;
  appt_count bigint;
begin
  if public.current_nexa_role() not in ('owner','admin','scheduler') then
    raise exception 'SvS staff access required';
  end if;

  select * into target_event
  from public.svs_events
  where id=target_event_id
  for update;

  if target_event.id is null then
    raise exception 'Event not found';
  end if;

  if coalesce(target_event.status,'')='ended' then
    raise exception 'This event is already ended';
  end if;

  select count(*) into req_count
  from public.prep_requests
  where event_id=target_event_id;

  select count(*) into appt_count
  from public.ministry_appointments
  where event_id=target_event_id;

  select coalesce(jsonb_agg(
    to_jsonb(pr) ||
    jsonb_build_object(
      'in_game_name',pa.in_game_name,
      'player_id',pa.player_id,
      'alliance',coalesce(al.tag,pa.custom_alliance_tag,'')
    )
    order by pr.created_at
  ),'[]'::jsonb)
  into req_json
  from public.prep_requests pr
  left join public.player_accounts pa on pa.id=pr.player_account_id
  left join public.alliances al on al.id=pa.alliance_id
  where pr.event_id=target_event_id;

  select coalesce(jsonb_agg(
    to_jsonb(ma) ||
    jsonb_build_object(
      'time',to_char(ma.appointment_time at time zone 'UTC','HH24:MI'),
      'in_game_name',pa.in_game_name,
      'player_id',pa.player_id,
      'alliance',coalesce(al.tag,pa.custom_alliance_tag,'')
    )
    order by ma.appointment_time
  ),'[]'::jsonb)
  into appt_json
  from public.ministry_appointments ma
  left join public.player_accounts pa on pa.id=ma.player_account_id
  left join public.alliances al on al.id=pa.alliance_id
  where ma.event_id=target_event_id;

  insert into public.svs_event_archives(
    event_id,archived_at,event_data,prep_requests,appointments,summary
  )
  values(
    target_event_id,
    now(),
    to_jsonb(target_event),
    req_json,
    appt_json,
    jsonb_build_object(
      'prep_requests',req_count,
      'appointments',appt_count,
      'waitlisted',0
    )
  )
  on conflict(event_id) do update set
    archived_at=excluded.archived_at,
    event_data=excluded.event_data,
    prep_requests=excluded.prep_requests,
    appointments=excluded.appointments,
    summary=excluded.summary;

  -- Clear the operational schedule/forms after the archive is safely stored.
  delete from public.ministry_appointments where event_id=target_event_id;
  delete from public.prep_requests where event_id=target_event_id;

  update public.svs_events
  set
    status='ended',
    is_live=false,
    prep_form_open=false,
    battle_form_open=false,
    schedule_published=false,
    ended_at=now()
  where id=target_event_id;
end;
$$;

grant execute on function public.end_svs_event_v2(uuid) to authenticated;

create or replace function public.owner_delete_svs_archive_v2(target_event_id uuid)
returns void
language plpgsql
security definer
set search_path=public
as $$
begin
  if public.current_nexa_role()<>'owner' then
    raise exception 'Only the Owner can permanently delete SvS History';
  end if;

  delete from public.svs_event_archives where event_id=target_event_id;
  delete from public.svs_events where id=target_event_id and status='ended';
end;
$$;

grant execute on function public.owner_delete_svs_archive_v2(uuid) to authenticated;

-- ============================================================
-- 2) MINISTRY UNDO — UUID + PLAYER ACCOUNT RESTORE
-- ============================================================

create or replace function public.undo_ministry_schedule_change(p_change_id bigint)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare
  c public.ministry_schedule_changes%rowtype;
  item jsonb;
  aid uuid;
  old_time timestamptz;
  pa_id uuid;
begin
  if public.current_nexa_role() not in ('owner','admin','scheduler') then
    raise exception 'Scheduler access required';
  end if;

  select * into c
  from public.ministry_schedule_changes
  where id=p_change_id
  for update;

  if c.id is null then raise exception 'Change not found'; end if;
  if c.undone_at is not null then raise exception 'This change was already undone'; end if;
  if c.changed_at<=now()-interval '30 minutes' then raise exception 'Undo window expired'; end if;

  -- Block only if a row that should still exist was changed again.
  for item in select * from jsonb_array_elements(c.after_state)
  loop
    aid:=nullif(item->>'id','')::uuid;

    if aid is not null
       and coalesce(item->>'time','')<>''
       and not exists(
         select 1 from public.ministry_appointments
         where id=aid
           and appointment_time=(item->>'time')::timestamptz
       )
    then
      raise exception 'Schedule changed again; undo manually';
    end if;
  end loop;

  for item in select * from jsonb_array_elements(c.before_state)
  loop
    aid:=nullif(item->>'id','')::uuid;
    old_time:=nullif(item->>'time','')::timestamptz;
    pa_id:=nullif(item->>'player_account_id','')::uuid;

    if aid is null or old_time is null then
      continue;
    end if;

    if exists(select 1 from public.ministry_appointments where id=aid) then
      update public.ministry_appointments
      set appointment_time=old_time
      where id=aid;
    else
      if pa_id is null then
        raise exception 'This older Change Log entry does not contain the player account needed for automatic Undo. Reverse it manually.';
      end if;

      insert into public.ministry_appointments(
        event_id,
        prep_request_id,
        player_account_id,
        day_type,
        ministry_position,
        appointment_time
      )
      values(
        nullif(item->>'event_id','')::uuid,
        nullif(item->>'prep_request_id','')::uuid,
        pa_id,
        item->>'day_type',
        item->>'ministry_position',
        old_time
      );
    end if;
  end loop;

  update public.ministry_schedule_changes
  set undone_at=now(),undone_by=auth.uid()
  where id=c.id;
end;
$$;

grant execute on function public.undo_ministry_schedule_change(bigint) to authenticated;

-- ============================================================
-- 3) TRANSFER PRIVATE EDIT TOKEN
-- ============================================================

alter table public.transfer_applications
  add column if not exists edit_token_hash text;

-- Wrap the existing public submission function so new submissions receive
-- a private token without replacing the existing submission logic.
create or replace function public.submit_transfer_application_v2(
  p_event_token uuid,
  p_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  result jsonb;
  generated_token text;
  app_row_id uuid;
  app_public_id text;
  is_duplicate boolean;
begin
  result:=to_jsonb(public.submit_transfer_application(p_event_token,p_payload));
  app_public_id:=result->>'application_id';
  is_duplicate:=coalesce((result->>'duplicate')::boolean,false);

  -- Do not issue an edit credential for a duplicate submission.
  if app_public_id is null or is_duplicate then
    return result;
  end if;

  select ta.id into app_row_id
  from public.transfer_applications ta
  join public.transfer_events te on te.id=ta.transfer_event_id
  where ta.application_id=app_public_id
    and te.public_token=p_event_token
  order by ta.created_at desc
  limit 1;

  if app_row_id is null then
    return result;
  end if;

  generated_token:=encode(gen_random_bytes(18),'hex');

  update public.transfer_applications
  set edit_token_hash=encode(digest(generated_token,'sha256'),'hex')
  where id=app_row_id;

  return result || jsonb_build_object('edit_token',generated_token);
end;
$$;

grant execute on function public.submit_transfer_application_v2(uuid,jsonb) to anon,authenticated;

create or replace function public.get_transfer_application_for_edit(
  p_event_token uuid,
  p_application_id text,
  p_edit_token text
)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  a public.transfer_applications%rowtype;
  te public.transfer_events%rowtype;
begin
  select ta.*
  into a
  from public.transfer_applications ta
  join public.transfer_events ev on ev.id=ta.transfer_event_id
  where ta.application_id=p_application_id
    and ev.public_token=p_event_token
  limit 1;

  if a.id is null then raise exception 'Application not found'; end if;

  select * into te
  from public.transfer_events
  where id=a.transfer_event_id;

  if te.id is null then raise exception 'Transfer cycle not found'; end if;

  if a.edit_token_hash is null
     or a.edit_token_hash<>encode(digest(coalesce(p_edit_token,''),'sha256'),'hex')
  then
    raise exception 'Application ID or Edit Token is incorrect';
  end if;

  if te.status='archived' or coalesce(te.applications_open,false)=false then
    raise exception 'This application can no longer be edited';
  end if;

  return jsonb_build_object(
    'application_id',a.application_id,
    'in_game_name',a.in_game_name,
    'player_id',a.player_id,
    'current_state',a.current_state,
    'current_alliance',a.current_alliance,
    'discord_username',a.discord_username,
    'coordinates',a.coordinates,
    'current_power',a.current_power,
    'furnace_level',a.furnace_level,
    'transfer_passes',a.transfer_passes,
    'account_progression',a.account_progression,
    'leader_requested_labyrinth',a.leader_requested_labyrinth,
    'labyrinth_score',a.labyrinth_score,
    't12_infantry',a.t12_infantry,
    't12_lancer',a.t12_lancer,
    't12_marksman',a.t12_marksman,
    't11_infantry',a.t11_infantry,
    't11_lancer',a.t11_lancer,
    't11_marksman',a.t11_marksman,
    'no_t11_t12',a.no_t11_t12
  );
end;
$$;

grant execute on function public.get_transfer_application_for_edit(uuid,text,text) to anon,authenticated;

create table if not exists public.transfer_application_edit_audit (
  id bigint generated by default as identity primary key,
  application_id uuid not null,
  actor_type text not null,
  changed_at timestamptz not null default now(),
  details jsonb not null default '{}'::jsonb
);

create or replace function public.update_transfer_application_by_token(
  p_event_token uuid,
  p_application_id text,
  p_edit_token text,
  p_payload jsonb
)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare
  a public.transfer_applications%rowtype;
  te public.transfer_events%rowtype;
begin
  select ta.*
  into a
  from public.transfer_applications ta
  join public.transfer_events ev on ev.id=ta.transfer_event_id
  where ta.application_id=p_application_id
    and ev.public_token=p_event_token
  limit 1;

  if a.id is null then raise exception 'Application not found'; end if;

  select * into te
  from public.transfer_events
  where id=a.transfer_event_id;

  if te.id is null then raise exception 'Transfer cycle not found'; end if;

  if a.edit_token_hash is null
     or a.edit_token_hash<>encode(digest(coalesce(p_edit_token,''),'sha256'),'hex')
  then
    raise exception 'Application ID or Edit Token is incorrect';
  end if;

  if te.status='archived' or coalesce(te.applications_open,false)=false then
    raise exception 'This application can no longer be edited';
  end if;

  update public.transfer_applications
  set
    discord_username=nullif(trim(p_payload->>'discord_username'),''),
    current_alliance=nullif(trim(p_payload->>'current_alliance'),''),
    coordinates=nullif(trim(p_payload->>'coordinates'),''),
    current_power=coalesce(nullif(p_payload->>'current_power','')::numeric,current_power),
    furnace_level=coalesce(nullif(trim(p_payload->>'furnace_level'),''),furnace_level),
    transfer_passes=coalesce(nullif(trim(p_payload->>'transfer_passes'),''),transfer_passes),
    account_progression=coalesce(nullif(p_payload->>'account_progression',''),account_progression),
    leader_requested_labyrinth=coalesce((p_payload->>'leader_requested_labyrinth')::boolean,false),
    labyrinth_score=case when nullif(p_payload->>'labyrinth_score','') is null then null else (p_payload->>'labyrinth_score')::numeric end,
    t12_infantry=coalesce((p_payload->>'t12_infantry')::boolean,false),
    t12_lancer=coalesce((p_payload->>'t12_lancer')::boolean,false),
    t12_marksman=coalesce((p_payload->>'t12_marksman')::boolean,false),
    t11_infantry=coalesce((p_payload->>'t11_infantry')::boolean,false),
    t11_lancer=coalesce((p_payload->>'t11_lancer')::boolean,false),
    t11_marksman=coalesce((p_payload->>'t11_marksman')::boolean,false),
    no_t11_t12=coalesce((p_payload->>'no_t11_t12')::boolean,false),
    updated_at=now()
  where id=a.id;

  insert into public.transfer_application_edit_audit(application_id,actor_type,details)
  values(a.id,'applicant',jsonb_build_object('source','Application ID + Edit Token'));
end;
$$;

grant execute on function public.update_transfer_application_by_token(uuid,text,text,jsonb) to anon,authenticated;

-- ============================================================
-- 4) STAFF EDIT AUDIT (existing staff UI uses this helper)
-- ============================================================

create or replace function public.log_transfer_action(
  p_event_id uuid,
  p_application_id uuid,
  p_action text,
  p_details jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path=public
as $$
begin
  if not coalesce((select public.can_manage_transfers()),false)
     and public.current_nexa_role() not in ('owner','admin') then
    raise exception 'Transfer Staff access required';
  end if;

  insert into public.transfer_roster_audit(
    transfer_event_id,application_id,action_type,details,changed_by
  )
  values(p_event_id,p_application_id,p_action,coalesce(p_details,'{}'::jsonb),auth.uid());
end;
$$;

grant execute on function public.log_transfer_action(uuid,uuid,text,jsonb) to authenticated;
