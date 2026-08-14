NEXA v33.8 — Final Fix Round

Run NEXA-v33-8-SQL.sql after v33.7, then deploy this ZIP.

Fixes included:
- Manage SvS / Create Event / Edit Event open the SAME SvS Control Center used inside Administration.
- Edit Event preloads the active event, alliances and Auto End.
- Red × on Ministry appointments removes only the appointment and keeps the Prep Request.
- Prep Requests assignment handles occupied slots with Swap or Assign & Unschedule.
- Transfer Application removes the duplicated welcome sentence.
- Transfer coordinates are separate X / Y number fields; NEXA formats them automatically.
- Edit My Application on the Transfer Form is linked to the correct event token.
- Edit Applicant Details uses explicit mobile-safe DOM bindings.
- Waiting List keeps the action-enabled renderer and legacy internal IDs are repaired by SQL.
- Edit Token no longer depends on pgcrypto digest(); v33.8 uses built-in md5() for the high-entropy private token hash.
- Clone Event remains removed.
