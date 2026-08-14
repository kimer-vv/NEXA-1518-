-- ============================================================
-- NEXA v33.8 — FINAL FIXES
-- Run AFTER v33.7
-- Fixes: Edit Token hashing, Waiting List legacy IDs
-- ============================================================

-- ============================================================
-- 1) TRANSFER EDIT TOKEN
-- Use PostgreSQL built-in md5() so this does not depend on the
-- pgcrypto digest() function/search_path.
-- ============================================================

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
  is_duplicate boolean := false;
begin
  result := to_jsonb(public.submit_transfer_application(p_event_token,p_payload));
  app_public_id := nullif(result->>'application_id','');

  begin
    is_duplicate := coalesce((result->>'duplicate')::boolean,false);
  exception when others then
    is_duplicate := false;
  end;

  if app_public_id is not null then
    select ta.id
    into app_row_id
    from public.transfer_applications ta
    join public.transfer_events te on te.id=ta.transfer_event_id
    where ta.application_id=app_public_id
      and te.public_token=p_event_token
    order by ta.created_at desc
    limit 1;
  end if;

  if app_row_id is null
     and nullif(trim(p_payload->>'player_id'),'') is not null
  then
    select ta.id,ta.application_id
    into app_row_id,app_public_id
    from public.transfer_applications ta
    join public.transfer_events te on te.id=ta.transfer_event_id
    where te.public_token=p_event_token
      and ta.player_id=trim(p_payload->>'player_id')
    order by ta.created_at desc
    limit 1;
  end if;

  if app_row_id is null or is_duplicate then
    return result;
  end if;

  generated_token :=
    replace(gen_random_uuid()::text,'-','')
    ||
    replace(gen_random_uuid()::text,'-','');

  update public.transfer_applications
  set edit_token_hash=md5(generated_token)
  where id=app_row_id;

  return result || jsonb_build_object(
    'application_id',coalesce(app_public_id,result->>'application_id'),
    'edit_token',generated_token
  );
end;
$$;

grant execute
on function public.submit_transfer_application_v2(uuid,jsonb)
to anon,authenticated;


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

  if a.id is null then
    raise exception 'Application not found';
  end if;

  select *
  into te
  from public.transfer_events
  where id=a.transfer_event_id;

  if te.id is null then
    raise exception 'Transfer cycle not found';
  end if;

  if a.edit_token_hash is null
     or a.edit_token_hash<>md5(coalesce(p_edit_token,''))
  then
    raise exception 'Application ID or Edit Token is incorrect';
  end if;

  if te.status='archived'
     or coalesce(te.applications_open,false)=false
  then
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

grant execute
on function public.get_transfer_application_for_edit(uuid,text,text)
to anon,authenticated;


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

  if a.id is null then
    raise exception 'Application not found';
  end if;

  select *
  into te
  from public.transfer_events
  where id=a.transfer_event_id;

  if te.id is null then
    raise exception 'Transfer cycle not found';
  end if;

  if a.edit_token_hash is null
     or a.edit_token_hash<>md5(coalesce(p_edit_token,''))
  then
    raise exception 'Application ID or Edit Token is incorrect';
  end if;

  if te.status='archived'
     or coalesce(te.applications_open,false)=false
  then
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
    labyrinth_score=case
      when nullif(p_payload->>'labyrinth_score','') is null then null
      else (p_payload->>'labyrinth_score')::numeric
    end,
    t12_infantry=coalesce((p_payload->>'t12_infantry')::boolean,false),
    t12_lancer=coalesce((p_payload->>'t12_lancer')::boolean,false),
    t12_marksman=coalesce((p_payload->>'t12_marksman')::boolean,false),
    t11_infantry=coalesce((p_payload->>'t11_infantry')::boolean,false),
    t11_lancer=coalesce((p_payload->>'t11_lancer')::boolean,false),
    t11_marksman=coalesce((p_payload->>'t11_marksman')::boolean,false),
    no_t11_t12=coalesce((p_payload->>'no_t11_t12')::boolean,false),
    updated_at=now()
  where id=a.id;

  insert into public.transfer_application_edit_audit(
    application_id,actor_type,details
  )
  values(
    a.id,
    'applicant',
    jsonb_build_object('source','Application ID + Edit Token')
  );
end;
$$;

grant execute
on function public.update_transfer_application_by_token(uuid,text,text,jsonb)
to anon,authenticated;


-- ============================================================
-- 2) REPAIR OLD WAITING LIST ROWS
-- ============================================================

-- Snapshot internal UUID.
update public.transfer_waiting_list w
set source_application_id=(w.application_snapshot->>'id')::uuid,
    updated_at=now()
where w.source_application_id is null
  and coalesce(w.application_snapshot->>'id','')
      ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and exists(
    select 1
    from public.transfer_applications a
    where a.id=(w.application_snapshot->>'id')::uuid
  );

-- Public Application ID fallback.
update public.transfer_waiting_list w
set source_application_id=a.id,
    updated_at=now()
from public.transfer_applications a
where w.source_application_id is null
  and nullif(w.application_snapshot->>'application_id','') is not null
  and a.application_id=w.application_snapshot->>'application_id';

-- Player ID fallback for older waiting rows.
update public.transfer_waiting_list w
set source_application_id=(
      select a.id
      from public.transfer_applications a
      where a.player_id=w.player_id
      order by a.created_at desc
      limit 1
    ),
    updated_at=now()
where w.source_application_id is null
  and nullif(w.player_id,'') is not null
  and exists(
    select 1
    from public.transfer_applications a
    where a.player_id=w.player_id
  );


create or replace function public.get_transfer_waiting_entry(
  p_waiting_id uuid
)
returns jsonb
language plpgsql
stable
security definer
set search_path=public
as $$
declare
  w public.transfer_waiting_list%rowtype;
  app jsonb;
  resolved_id uuid;
begin
  if not coalesce((select public.can_manage_transfers()),false)
     and public.current_nexa_role() not in ('owner','admin')
  then
    raise exception 'Transfer Staff access required';
  end if;

  select *
  into w
  from public.transfer_waiting_list
  where id=p_waiting_id;

  if w.id is null then
    raise exception 'Waiting entry not found';
  end if;

  resolved_id:=w.source_application_id;

  if resolved_id is null
     and coalesce(w.application_snapshot->>'id','')
         ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  then
    resolved_id:=(w.application_snapshot->>'id')::uuid;
  end if;

  if resolved_id is null
     and nullif(w.application_snapshot->>'application_id','') is not null
  then
    select a.id
    into resolved_id
    from public.transfer_applications a
    where a.application_id=w.application_snapshot->>'application_id'
    order by a.created_at desc
    limit 1;
  end if;

  if resolved_id is null and nullif(w.player_id,'') is not null then
    select a.id
    into resolved_id
    from public.transfer_applications a
    where a.player_id=w.player_id
    order by a.created_at desc
    limit 1;
  end if;

  if resolved_id is not null then
    select to_jsonb(a)
    into app
    from public.transfer_applications a
    where a.id=resolved_id;
  end if;

  app:=coalesce(app,w.application_snapshot,'{}'::jsonb);

  return jsonb_build_object(
    'waiting_id',w.id,
    'source_application_id',resolved_id,
    'application',app
  );
end;
$$;

grant execute
on function public.get_transfer_waiting_entry(uuid)
to authenticated;


create or replace function public.return_transfer_waiting_to_applications(
  p_waiting_id uuid
)
returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare
  w public.transfer_waiting_list%rowtype;
  app_id uuid;
begin
  if not coalesce((select public.can_manage_transfers()),false)
     and public.current_nexa_role() not in ('owner','admin')
  then
    raise exception 'Transfer Staff access required';
  end if;

  select *
  into w
  from public.transfer_waiting_list
  where id=p_waiting_id
  for update;

  if w.id is null then
    raise exception 'Waiting entry not found';
  end if;

  app_id:=w.source_application_id;

  if app_id is null
     and coalesce(w.application_snapshot->>'id','')
         ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  then
    app_id:=(w.application_snapshot->>'id')::uuid;
  end if;

  if app_id is null
     and nullif(w.application_snapshot->>'application_id','') is not null
  then
    select a.id into app_id
    from public.transfer_applications a
    where a.application_id=w.application_snapshot->>'application_id'
    order by a.created_at desc
    limit 1;
  end if;

  if app_id is null and nullif(w.player_id,'') is not null then
    select a.id into app_id
    from public.transfer_applications a
    where a.player_id=w.player_id
    order by a.created_at desc
    limit 1;
  end if;

  if app_id is null
     or not exists(select 1 from public.transfer_applications where id=app_id)
  then
    raise exception 'Original application is no longer available';
  end if;

  update public.transfer_applications
  set transfer_status='not_reviewed',
      updated_at=now()
  where id=app_id;

  perform public.log_transfer_action(
    null,
    app_id,
    'waiting_list_return_to_applications',
    jsonb_build_object('waiting_id',w.id,'player',w.in_game_name)
  );

  delete from public.transfer_waiting_list
  where id=w.id;

  return app_id;
end;
$$;

grant execute
on function public.return_transfer_waiting_to_applications(uuid)
to authenticated;


create or replace function public.promote_transfer_waiting_entry(
  p_waiting_id uuid,
  p_event_id uuid,
  p_target_status text
)
returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare
  w public.transfer_waiting_list%rowtype;
  cap record;
  app_id uuid;
begin
  if not coalesce((select public.can_manage_transfers()),false)
     and public.current_nexa_role() not in ('owner','admin')
  then
    raise exception 'Transfer Staff access required';
  end if;

  if p_target_status not in ('ordinary','special_invite') then
    raise exception 'Invalid target status';
  end if;

  select *
  into w
  from public.transfer_waiting_list
  where id=p_waiting_id
  for update;

  if w.id is null then
    raise exception 'Waiting entry not found';
  end if;

  select *
  into cap
  from public.transfer_capacity_summary(p_event_id);

  if p_target_status='ordinary'
     and cap.ordinary_used>=cap.ordinary_capacity
  then
    raise exception 'CAPACITY_FULL: Ordinary';
  end if;

  if p_target_status='special_invite' then
    if cap.special_capacity=0 then
      raise exception 'NO_SPECIAL_INVITES';
    end if;

    if cap.special_used>=cap.special_capacity then
      raise exception 'CAPACITY_FULL: Special Invite';
    end if;
  end if;

  app_id:=w.source_application_id;

  if app_id is null
     and coalesce(w.application_snapshot->>'id','')
         ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  then
    app_id:=(w.application_snapshot->>'id')::uuid;
  end if;

  if app_id is null
     and nullif(w.application_snapshot->>'application_id','') is not null
  then
    select a.id into app_id
    from public.transfer_applications a
    where a.application_id=w.application_snapshot->>'application_id'
    order by a.created_at desc
    limit 1;
  end if;

  if app_id is null and nullif(w.player_id,'') is not null then
    select a.id into app_id
    from public.transfer_applications a
    where a.player_id=w.player_id
    order by a.created_at desc
    limit 1;
  end if;

  if app_id is null
     or not exists(select 1 from public.transfer_applications where id=app_id)
  then
    raise exception 'Original application is no longer available. Ask the player to submit a fresh application.';
  end if;

  update public.transfer_applications
  set transfer_event_id=p_event_id,
      transfer_status=p_target_status,
      updated_at=now()
  where id=app_id;

  perform public.log_transfer_action(
    p_event_id,
    app_id,
    'waiting_list_promote',
    jsonb_build_object(
      'waiting_id',w.id,
      'player',w.in_game_name,
      'target_status',p_target_status
    )
  );

  delete from public.transfer_waiting_list
  where id=w.id;

  return app_id;
end;
$$;

grant execute
on function public.promote_transfer_waiting_entry(uuid,uuid,text)
to authenticated;


-- Clone Settings/Event was intentionally removed from the UI.
drop function if exists public.clone_svs_event(uuid,bigint,date);
