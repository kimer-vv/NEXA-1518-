-- NEXA — SvS response delete permission fix
-- Run this in Supabase > SQL Editor.
-- This only adds DELETE permission for battle_form_responses.

grant delete on table public.battle_form_responses to authenticated;

drop policy if exists "Admins can delete battle form responses" on public.battle_form_responses;

create policy "Admins can delete battle form responses"
on public.battle_form_responses
for delete
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and lower(coalesce(p.role, '')) = 'admin'
  )
);
