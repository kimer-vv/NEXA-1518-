-- This metadata synchronization has already been applied and re-verified.
update public.nexa_library_items
set metadata = metadata || jsonb_build_object(
  'max_tier', 'Legendary T6',
  'max_stars', 3,
  'star_progress_steps', 4
),
updated_at = now()
where item_type = 'chief_gear';

update public.nexa_library_items
set metadata = metadata || jsonb_build_object(
  'max_level', 18,
  'charm_slots', 3,
  'stages_per_level', 'variable'
),
updated_at = now()
where item_type = 'chief_charm';
