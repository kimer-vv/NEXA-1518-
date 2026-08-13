# NEXA v27.5 — Audit + Mobile Admin + Owner Delete Fix

Fixes visible in the latest screenshots:

1. End Event error:
   - Adds/recreates `audit_log` and `write_audit(text,jsonb)`.
   - Fixes: `function public.write_audit(unknown, jsonb) does not exist`.

2. Admin Control Center on iPhone:
   - Modal now fits the viewport instead of being cut off on the left.
   - Admin tabs horizontally scroll when needed.

3. Announcements separation:
   - Important Announcement is removed from View Event → Edit Event.
   - Announcements remain managed only in Admin → Announcements.

4. Owner-only archived deletion:
   - Admin → History shows Delete Permanently only to Owner.
   - Only ended events can be permanently deleted.
   - Other Admin/Scheduler users cannot use the database function.

Steps:
- Run `v27-5-supabase.sql` once in Supabase.
- Then upload/replace the web files in GitHub.
- Do not upload the SQL file to GitHub.
