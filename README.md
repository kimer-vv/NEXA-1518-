# NEXA 1518 v18 — Live Event Sync + Local AM/PM

Fixes:
- Home now reads the current live SvS directly from Supabase instead of showing `XXXX`.
- View Event reads opponent state, dates, notes, and open/closed settings from the saved Admin event.
- WOS official date/time remains UTC.
- Local time is displayed in 12-hour AM/PM format using the user's saved time zone.
- View Schedule now contains ONLY Monday Construction, Tuesday Research, and Thursday Training.
- Saturday Battle remains on the Event timeline but is removed from Ministry Schedule.
- Schedule local-time labels are dynamically converted from UTC to the user's time zone.

Upload all included files to the GitHub repository root and replace the previous version.
