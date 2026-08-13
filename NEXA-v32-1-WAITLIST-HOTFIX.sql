
-- NEXA v32.1 HOTFIX
-- Fix: transfer_applications.id is UUID, so the waiting-list RPC must accept UUID.
-- Safe to run after v32.

drop function if exists public.move_transfer_application_to_waiting_list(bigint);
drop function if exists public.move_transfer_application_to_waiting_list(uuid);

create or replace function public.move_transfer_application_to_waiting_list(
  p_application_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_app public.transfer_applications%rowtype;
begin
  if not (public.is_admin() or public.can_manage_transfers()) then
    raise exception 'Transfer Staff access required';
  end if;

  select *
  into v_app
  from public.transfer_applications
  where id = p_application_id;

  if not found then
    raise exception 'Application not found';
  end if;

  update public.transfer_applications
  set transfer_status = 'next_transfer',
      waiting_list_since = coalesce(waiting_list_since, now()),
      waiting_list_source_event_id = coalesce(waiting_list_source_event_id, transfer_event_id),
      updated_at = now()
  where id = p_application_id;

  return jsonb_build_object(
    'ok', true,
    'application_id', p_application_id
  );
end;
$$;

grant execute
on function public.move_transfer_application_to_waiting_list(uuid)
to authenticated;

-- Recreate waiting-list reader (safe/idempotent)
create or replace function public.get_transfer_waiting_list()
returns setof public.transfer_applications
language sql
security definer
set search_path = public
as $$
  select a.*
  from public.transfer_applications a
  where (public.is_admin() or public.can_manage_transfers())
    and a.transfer_status = 'next_transfer'
  order by a.manual_priority desc,
           a.waiting_list_since asc nulls last,
           a.created_at asc;
$$;

grant execute on function public.get_transfer_waiting_list() to authenticated;
