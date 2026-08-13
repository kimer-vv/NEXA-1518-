# NEXA v27.3 — Private Schedule UI Fix

Fixes:
- Public and Guest users no longer see the View Schedule button on View Event.
- schedule.html is hidden by default and only renders after Supabase confirms can_view_private_schedule() = true.
- Direct schedule URL still shows only the Private Schedule access message for unauthorized users.
- Verified logged-in members with a claimed WOS account in an active alliance can see the schedule.
- Scheduler/Admin/Owner keep access.

No new SQL is required.
Upload/replace the web files in GitHub.
