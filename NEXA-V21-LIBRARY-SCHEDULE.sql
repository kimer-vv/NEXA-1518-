alter table public.nexa_library_generations
  add column if not exists unlock_at timestamptz;

create index if not exists nexa_library_generations_unlock_at_idx
  on public.nexa_library_generations (unlock_at)
  where unlock_at is not null;

create or replace function public.nexa_unlock_scheduled_library_generations()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  unlocked_count integer := 0;
begin
  with due as (
    update public.nexa_library_generations
       set is_visible = true,
           unlock_at = null,
           updated_at = now()
     where unlock_at is not null
       and unlock_at <= now()
     returning item_type, generation
  ), changed as (
    update public.nexa_library_items i
       set is_visible = true,
           updated_at = now()
      from due d
     where i.item_type = d.item_type
       and i.generation = d.generation
     returning i.id
  )
  select count(*) into unlocked_count from changed;

  return unlocked_count;
end;
$$;

grant execute on function public.nexa_unlock_scheduled_library_generations() to authenticated;

-- The Library calls this function when it loads, so an expired schedule becomes
-- visible immediately even if no external cron job is configured.
