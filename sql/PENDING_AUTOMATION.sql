-- NEW / PENDING. Apply only after the integration migration is tested and approved.
-- Requires pg_cron enabled in Supabase Database Extensions.
do $$ begin
 if not exists(select 1 from cron.job where jobname='nexa-quick-staff-finalization') then
 perform cron.schedule('nexa-quick-staff-finalization','17 * * * *','select public.nexa_quick_finalize_removals_v1()');
 end if;
end $$;
