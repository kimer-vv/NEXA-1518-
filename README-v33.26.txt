NEXA v33.26 — Persistent Recruiting Fix

Run the included SQL AFTER v33.25, then upload this mini-patch.

Fixes the "Transfer Event not found" error by separating permanent
Recruiting Alliance settings from event-specific public-form rows.

Result:
- Save/edit Recruiting Alliances with no active Transfer Event.
- Settings survive End Event / archive / new cycles.
- New Transfer Events automatically inherit all saved alliance settings.
- Public Transfer Form continues to use event-specific synced rows.
- Recruiting / Not Recruiting, schedules and notes persist.
- Remove deletes the persistent Recruiting Alliance only when explicitly pressed.

No need to delete/recreate your current Transfer Event.
