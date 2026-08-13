# NEXA v26 — Event Lifecycle + History (Final SvS Core)

Adds:
- Manual End Event.
- Optional Auto End UTC date/time.
- Event statuses: Upcoming / Live / Ended.
- Forms automatically close when an event ends.
- Active Prep Requests and Schedule only use the Live event.
- Ended events stay archived instead of being deleted.
- Admin → History tab.
- Archived event summary.
- Archived final schedule.
- Archived Prep Requests.
- Waitlist status for unscheduled players.
- Clone Settings from an archived event to create a fresh upcoming SvS.
- Only one Live event at a time.
- Existing requests/appointments are never mixed into the next SvS.
- All prior v25 functionality remains.

IMPORTANT:
Run `v26-supabase.sql` in Supabase first.
Do NOT upload the SQL file to GitHub.
