-- ============================================================
-- NEXA v33.9 — SEPARATE UI / WAITING LIST PATCH
-- Run AFTER v33.8
-- ============================================================

-- Keep application status synchronized with the persistent waiting table.
create or replace function public.move_transfer_application_to_waiting_list(
  p_application_id uuid
)
returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare
  a public.transfer_applications%rowtype;
  wid uuid;
begin
  if not coalesce((select public.can_manage_transfers()),false)
     and public.current_nexa_role() not in ('owner','admin')
  then
    raise exception 'Transfer Staff access required';
  end if;

  select *
  into a
  from public.transfer_applications
  where id=p_application_id
  for update;

  if a.id is null then
    raise exception 'Application not found';
  end if;

  insert into public.transfer_waiting_list(
    source_application_id,
    player_id,
    in_game_name,
    current_state,
    current_alliance,
    current_power,
    manual_priority,
    application_snapshot,
    added_by,
    updated_at
  )
  values(
    a.id,
    a.player_id,
    a.in_game_name,
    a.current_state::text,
    a.current_alliance,
    a.current_power,
    coalesce(a.manual_priority,false),
    to_jsonb(a),
    auth.uid(),
    now()
  )
  on conflict(player_id)
    where player_id is not null and player_id<>''
  do update set
    source_application_id=excluded.source_application_id,
    in_game_name=excluded.in_game_name,
    current_state=excluded.current_state,
    current_alliance=excluded.current_alliance,
    current_power=excluded.current_power,
    manual_priority=excluded.manual_priority,
    application_snapshot=excluded.application_snapshot,
    updated_at=now()
  returning id into wid;

  update public.transfer_applications
  set
    transfer_status='next_transfer',
    updated_at=now()
  where id=a.id;

  insert into public.transfer_roster_audit(
    transfer_event_id,
    application_id,
    action_type,
    details,
    changed_by
  )
  values(
    a.transfer_event_id,
    a.id,
    'waiting_list_add',
    jsonb_build_object(
      'waiting_id',wid,
      'player',a.in_game_name
    ),
    auth.uid()
  );

  return wid;
end;
$$;

grant execute
on function public.move_transfer_application_to_waiting_list(uuid)
to authenticated;


-- Repair status on existing rows already present in the Waiting List.
update public.transfer_applications a
set
  transfer_status='next_transfer',
  updated_at=now()
from public.transfer_waiting_list w
where w.source_application_id=a.id
  and a.transfer_status<>'next_transfer';


-- Return exactly the fields the v33.9 Waiting List UI expects.
drop function if exists public.get_transfer_waiting_list();

create function public.get_transfer_waiting_list()
returns table(
  waiting_id uuid,
  source_application_id uuid,
  application_id text,
  in_game_name text,
  player_id text,
  current_state text,
  current_alliance text,
  current_power numeric,
  manual_priority boolean,
  added_at timestamptz
)
language sql
stable
security definer
set search_path=public
as $$
  select
    w.id,
    w.source_application_id,
    a.application_id,
    coalesce(a.in_game_name,w.in_game_name),
    coalesce(a.player_id,w.player_id),
    coalesce(a.current_state::text,w.current_state),
    coalesce(a.current_alliance,w.current_alliance),
    coalesce(a.current_power,w.current_power),
    coalesce(a.manual_priority,w.manual_priority,false),
    w.added_at
  from public.transfer_waiting_list w
  left join public.transfer_applications a
    on a.id=w.source_application_id
  where
    coalesce((select public.can_manage_transfers()),false)
    or public.current_nexa_role() in ('owner','admin')
  order by
    coalesce(a.manual_priority,w.manual_priority,false) desc,
    w.added_at;
$$;

grant execute
on function public.get_transfer_waiting_list()
to authenticated;
