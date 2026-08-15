-- ============================================================
-- NEXA v33.26 — PERSISTENT RECRUITING ALLIANCES (FIX)
-- Run AFTER v33.25
--
-- v33.25 made transfer_event_id nullable, but the OLD RPC still required
-- a Transfer Event and returned "Transfer Event not found".
--
-- v33.26 creates a permanent template layer and automatically syncs it
-- into every active Transfer Event for the public form.
-- ============================================================

begin;

-- 1) Permanent recruiting settings, independent of Transfer Events.
create table if not exists public.transfer_recruiting_alliance_templates (
  id bigserial primary key,
  alliance_id bigint not null references public.alliances(id) on delete cascade,
  is_recruiting boolean not null default true,
  schedule_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(alliance_id)
);

-- 2) Seed templates from any existing recruiting rows.
insert into public.transfer_recruiting_alliance_templates(
  alliance_id,
  is_recruiting,
  schedule_notes
)
select distinct on (r.alliance_id)
  r.alliance_id,
  coalesce(r.is_recruiting,true),
  r.schedule_notes
from public.transfer_recruiting_alliances r
where r.alliance_id is not null
order by r.alliance_id, r.id desc
on conflict(alliance_id) do update
set
  is_recruiting=excluded.is_recruiting,
  schedule_notes=excluded.schedule_notes,
  updated_at=now();

-- Old table remains event-specific because the existing public form RPC
-- already knows how to read it.
delete from public.transfer_recruiting_alliances
where transfer_event_id is null;


-- 3) Permission helper.
create or replace function public.can_manage_recruiting_templates()
returns boolean
language sql
stable
security definer
set search_path=public
as $$
  select public.current_nexa_role() in ('owner','admin')
      or coalesce((select public.can_manage_transfers()),false);
$$;

grant execute
on function public.can_manage_recruiting_templates()
to authenticated;


-- 4) Sync permanent settings into one Transfer Event.
create or replace function public.sync_recruiting_templates_to_event(
  p_transfer_event_id uuid
)
returns void
language plpgsql
security definer
set search_path=public
as $$
begin
  if p_transfer_event_id is null then
    return;
  end if;

  if not exists(
    select 1
    from public.transfer_events
    where id=p_transfer_event_id
  ) then
    raise exception 'Transfer Event not found';
  end if;

  delete from public.transfer_recruiting_alliances
  where transfer_event_id=p_transfer_event_id;

  insert into public.transfer_recruiting_alliances(
    transfer_event_id,
    alliance_id,
    is_recruiting,
    schedule_notes
  )
  select
    p_transfer_event_id,
    t.alliance_id,
    t.is_recruiting,
    t.schedule_notes
  from public.transfer_recruiting_alliance_templates t;
end;
$$;


-- 5) Sync into all currently non-archived cycles.
create or replace function public.sync_recruiting_templates_to_active_events()
returns void
language plpgsql
security definer
set search_path=public
as $$
declare
  e record;
begin
  for e in
    select id
    from public.transfer_events
    where status <> 'archived'
  loop
    perform public.sync_recruiting_templates_to_event(e.id);
  end loop;
end;
$$;


-- 6) List permanent Recruiting Alliances for Admin.
create or replace function public.list_transfer_recruiting_templates()
returns table(
  row_id bigint,
  alliance_id bigint,
  is_recruiting boolean,
  schedule_notes text,
  tag text
)
language sql
stable
security definer
set search_path=public
as $$
  select
    t.id,
    t.alliance_id,
    t.is_recruiting,
    t.schedule_notes,
    a.tag
  from public.transfer_recruiting_alliance_templates t
  join public.alliances a
    on a.id=t.alliance_id
  order by upper(a.tag);
$$;

grant execute
on function public.list_transfer_recruiting_templates()
to authenticated;


-- 7) Save/Create permanent Recruiting Alliance.
create or replace function public.save_transfer_recruiting_template(
  p_alliance_id bigint,
  p_new_tag text,
  p_is_recruiting boolean,
  p_schedule_notes text
)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare
  v_alliance_id bigint;
  v_tag text;
begin
  if not public.can_manage_recruiting_templates() then
    raise exception 'Transfer Staff access required';
  end if;

  v_alliance_id:=p_alliance_id;
  v_tag:=nullif(upper(trim(coalesce(p_new_tag,''))),'');

  if v_alliance_id is null then
    if v_tag is null then
      raise exception 'Choose an existing alliance or enter a new Alliance Tag';
    end if;

    select id
    into v_alliance_id
    from public.alliances
    where upper(tag)=v_tag
    limit 1;

    if v_alliance_id is null then
      insert into public.alliances(tag)
      values(v_tag)
      returning id into v_alliance_id;
    end if;
  end if;

  insert into public.transfer_recruiting_alliance_templates(
    alliance_id,
    is_recruiting,
    schedule_notes,
    updated_at
  )
  values(
    v_alliance_id,
    coalesce(p_is_recruiting,true),
    p_schedule_notes,
    now()
  )
  on conflict(alliance_id) do update
  set
    is_recruiting=excluded.is_recruiting,
    schedule_notes=excluded.schedule_notes,
    updated_at=now();

  perform public.sync_recruiting_templates_to_active_events();
end;
$$;

grant execute
on function public.save_transfer_recruiting_template(bigint,text,boolean,text)
to authenticated;


-- 8) Recruiting / Not Recruiting persists globally.
create or replace function public.set_transfer_recruiting_template_status(
  p_row_id bigint,
  p_is_recruiting boolean
)
returns void
language plpgsql
security definer
set search_path=public
as $$
begin
  if not public.can_manage_recruiting_templates() then
    raise exception 'Transfer Staff access required';
  end if;

  update public.transfer_recruiting_alliance_templates
  set
    is_recruiting=coalesce(p_is_recruiting,false),
    updated_at=now()
  where id=p_row_id;

  if not found then
    raise exception 'Recruiting Alliance not found';
  end if;

  perform public.sync_recruiting_templates_to_active_events();
end;
$$;

grant execute
on function public.set_transfer_recruiting_template_status(bigint,boolean)
to authenticated;


-- 9) Explicit Remove is the ONLY action that deletes the persistent setup.
create or replace function public.remove_transfer_recruiting_template(
  p_row_id bigint
)
returns void
language plpgsql
security definer
set search_path=public
as $$
begin
  if not public.can_manage_recruiting_templates() then
    raise exception 'Transfer Staff access required';
  end if;

  delete from public.transfer_recruiting_alliance_templates
  where id=p_row_id;

  if not found then
    raise exception 'Recruiting Alliance not found';
  end if;

  perform public.sync_recruiting_templates_to_active_events();
end;
$$;

grant execute
on function public.remove_transfer_recruiting_template(bigint)
to authenticated;


-- 10) Every NEW Transfer Event automatically receives the permanent setup.
create or replace function public.apply_recruiting_templates_after_event_insert()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
begin
  perform public.sync_recruiting_templates_to_event(new.id);
  return new;
end;
$$;

drop trigger if exists trg_apply_recruiting_templates_to_transfer_event
on public.transfer_events;

create trigger trg_apply_recruiting_templates_to_transfer_event
after insert on public.transfer_events
for each row
execute function public.apply_recruiting_templates_after_event_insert();


-- 11) Make sure any currently active event receives the templates now.
select public.sync_recruiting_templates_to_active_events();

commit;
