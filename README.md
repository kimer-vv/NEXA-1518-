# NEXA v25 — Mega Update: Announcements Center + Preferred Time Fix

This update includes the requested focused improvements without adding a heavy auto-scheduler.

Preferred time:
- Specific Preferred Time now ALWAYS populates from the selected UTC time frame immediately.
- Uses 30-minute slots only.
- Uses a protected Supabase RPC to show demand without exposing other players' forms.
- Shows Available / Preferred by X players / Scheduled.
- Scheduled slots are disabled.
- Competition warning remains optional: player can keep a preferred time if it is only preferred, not scheduled.

Admin:
- New standalone Admin → Announcements tab.
- Important Announcement and translations are REMOVED from the SvS Event form to keep Events cleaner.
- Save/deactivate announcement from Announcements.
- Acknowledged / Not Acknowledged filters.
- Counts for acknowledged, not acknowledged, and total NEXA users with claimed accounts.
- Shows IGN(s), alliance(s), Discord name and acknowledgement date/time.
- Announcement History preserves prior versions.
- Home ticker continues to display the correct saved translation and hides after acknowledgement.

Still included:
- Priority ranking
- Unscheduled Only
- Schedule Health Check
- Copy schedule tools
- My Submissions
- Prep Form conditional validation
- UTC/local time behavior
- Edit Event from View Event

IMPORTANT:
Run `v25-supabase.sql` in Supabase before uploading the web files.
Do not upload the SQL file to GitHub.
