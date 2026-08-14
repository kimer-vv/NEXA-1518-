-- ============================================================
-- NEXA v33.10 — FINAL POLISH
-- Run AFTER v33.9
-- ============================================================

-- 1) Applicant self-edit may correct Player ID.
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
  new_player_id text;
begin
  select ta.*
  into a
  from public.transfer_applications ta
  join public.transfer_events ev
    on ev.id=ta.transfer_event_id
  where ta.application_id=p_application_id
    and ev.public_token=p_event_token
  limit 1;

  if a.id is null then
    raise exception 'Application not found';
  end if;

  select * into te
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

  new_player_id:=nullif(trim(p_payload->>'player_id'),'');

  if new_player_id is not null
     and exists(
       select 1
       from public.transfer_applications x
       where x.transfer_event_id=a.transfer_event_id
         and x.player_id=new_player_id
         and x.id<>a.id
     )
  then
    raise exception 'Another application in this Transfer cycle already uses that Player ID';
  end if;

  update public.transfer_applications
  set
    player_id=coalesce(new_player_id,player_id),
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
    jsonb_build_object(
      'source','Application ID + Edit Token',
      'player_id_updated',new_player_id is not null and new_player_id is distinct from a.player_id
    )
  );
end;
$$;

grant execute
on function public.update_transfer_application_by_token(uuid,text,text,jsonb)
to anon,authenticated;


-- 2) Waiting List: Delete Permanently is different from Move Back to Applications.
create or replace function public.delete_transfer_waiting_application_permanently(
  p_waiting_id uuid
)
returns void
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

  delete from public.transfer_waiting_list
  where id=w.id;

  if app_id is not null then
    -- Remove NEXA-owned audit rows first so a permanent delete is not
    -- blocked by application references.
    delete from public.transfer_roster_audit
    where application_id=app_id;

    delete from public.transfer_application_edit_audit
    where application_id=app_id;

    delete from public.transfer_applications
    where id=app_id;
  end if;
end;
$$;

grant execute
on function public.delete_transfer_waiting_application_permanently(uuid)
to authenticated;
