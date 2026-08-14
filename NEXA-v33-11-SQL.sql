-- ============================================================
-- NEXA v33.11 — HOME VISIBILITY + ANNOUNCEMENT AUDIENCE
-- Run AFTER v33.10
-- ============================================================

-- ------------------------------------------------------------
-- 1) HOME MODULE VISIBILITY
-- Controls Home only. Events/forms/public links remain active.
-- ------------------------------------------------------------

create table if not exists public.nexa_home_visibility (
  id smallint primary key default 1 check (id=1),
  show_svs boolean not null default true,
  show_transfer boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid null
);

insert into public.nexa_home_visibility(id,show_svs,show_transfer)
values(1,true,true)
on conflict(id) do nothing;


create or replace function public.get_home_module_visibility()
returns jsonb
language sql
stable
security definer
set search_path=public
as $$
  select jsonb_build_object(
    'show_svs',coalesce(show_svs,true),
    'show_transfer',coalesce(show_transfer,true)
  )
  from public.nexa_home_visibility
  where id=1;
$$;

grant execute
on function public.get_home_module_visibility()
to anon,authenticated;


create or replace function public.set_home_module_visibility(
  new_show_svs boolean,
  new_show_transfer boolean
)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare
  role_name text;
begin
  role_name:=public.current_nexa_role();

  if role_name not in ('owner','admin') then
    raise exception 'Admin access required';
  end if;

  insert into public.nexa_home_visibility(
    id,
    show_svs,
    show_transfer,
    updated_at,
    updated_by
  )
  values(
    1,
    coalesce(new_show_svs,true),
    coalesce(new_show_transfer,true),
    now(),
    auth.uid()
  )
  on conflict(id)
  do update set
    show_svs=excluded.show_svs,
    show_transfer=excluded.show_transfer,
    updated_at=excluded.updated_at,
    updated_by=excluded.updated_by;
end;
$$;

grant execute
on function public.set_home_module_visibility(boolean,boolean)
to authenticated;


-- ------------------------------------------------------------
-- 2) ANNOUNCEMENT AUDIENCE
-- verified = verified members + staff can see.
-- everyone = public/guest can read; only verified can acknowledge.
-- ------------------------------------------------------------

alter table public.svs_events
  add column if not exists announcement_audience text not null default 'verified';

update public.svs_events
set announcement_audience='verified'
where announcement_audience is null
   or announcement_audience not in ('verified','everyone');

do $$
begin
  if not exists(
    select 1
    from pg_constraint
    where conname='svs_events_announcement_audience_check'
      and conrelid='public.svs_events'::regclass
  ) then
    alter table public.svs_events
      add constraint svs_events_announcement_audience_check
      check (announcement_audience in ('verified','everyone'));
  end if;
end $$;


create or replace function public.set_event_announcement_audience(
  target_event_id uuid,
  new_audience text
)
returns void
language plpgsql
security definer
set search_path=public
as $$
begin
  if public.current_nexa_role() not in ('owner','admin') then
    raise exception 'Admin access required';
  end if;

  if new_audience not in ('verified','everyone') then
    raise exception 'Invalid announcement audience';
  end if;

  update public.svs_events
  set announcement_audience=new_audience
  where id=target_event_id;

  if not found then
    raise exception 'SvS event not found';
  end if;
end;
$$;

grant execute
on function public.set_event_announcement_audience(uuid,text)
to authenticated;
