# NEXA v28.6 — Transfer Form + Recruiting Save + Permissions

Fixes/finishes three areas:

Transfer Form
- New Transfer Control Center tab: Transfer Form.
- Select a Transfer Event, preview/open the full public form, or copy the direct shareable form link.
- Responses submit directly into Applications.
- Full question set remains connected.
- Public form clearly shows Destination, Ordinary Cap, Special Cap, and Recruiting Alliance schedules.

Recruiting Alliances
- Reliable Supabase save function.
- Choose existing alliance OR enter a new Alliance Tag.
- Save Recruiting on/off state.
- 4 Bear Trap time fields appear when 4 is selected.
- Foundry/Canyon/Other Event time fields appear dynamically.
- Saved alliance appears in the Recruiting Alliances list.
- Recruiting can be toggled directly from the list.
- Edit Schedule reloads the saved UTC times back into the editor.

Permissions
- Reliable Transfer permissions directory.
- Search by Discord name, IGN, or Player ID.
- Owner/Admin visibly show full SvS + Transfers access.
- Other users get separate SvS Staff and Transfer Staff checkboxes.

IMPORTANT:
Run `v28-6-supabase.sql` once before uploading the web files.
Do not upload the SQL file to GitHub.
