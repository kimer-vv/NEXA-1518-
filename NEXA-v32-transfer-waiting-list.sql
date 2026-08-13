
-- NEXA v32 — Transfer roster + persistent next-transfer waiting list

alter table public.transfer_applications
  drop constraint if exists transfer_applications_transfer_status_check;

alter table public.transfer_applications
  add constraint transfer_applications_transfer_status_check
  check (transfer_status in (
    'not_reviewed',
    'needs_review',
    'ordinary',
    'special_invite',
    'open_transfer',
    'not_approved',
    'transferred',
    'next_transfer'
  ));

alter table public.transfer_applications
  add column if not exists waiting_list_since timestamptz,
  add column if not exists waiting_list_source_event_id uuid references public.transfer_events(id) on delete set null;

create index if not exists transfer_applications_waiting_list_idx
  on public.transfer_applications (transfer_status, waiting_list_since desc)
  where transfer_status = 'next_transfer';

create or replace function public.move_transfer_application_to_waiting_list(p_application_id bigint)
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

  select * into v_app
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

  return jsonb_build_object('ok', true, 'application_id', p_application_id);
end;
$$;

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
  order by a.manual_priority desc, a.waiting_list_since asc nulls last, a.created_at asc;
$$;

grant execute on function public.move_transfer_application_to_waiting_list(bigint) to authenticated;
grant execute on function public.get_transfer_waiting_list() to authenticated;
