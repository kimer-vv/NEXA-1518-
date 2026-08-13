# NEXA v28.1 — Transfer Navigation + Alliance Schedule Builder

Fixes and improvements:
- Home always shows a Transfers section.
  - If no cycle is open, it shows “No live Transfer event.”
- Admin opens to the Module Chooser only.
  - SvS information does NOT appear until SvS is selected.
  - Transfers opens the Transfer Control Center.
- SvS now has a ← Modules button so staff can return and choose Transfers.
- Transfer Control Center has ← Modules and returns directly to the Admin module chooser.

Recruiting Alliances:
- Choose an existing alliance OR type a new Alliance Tag.
- If the tag does not exist, NEXA creates it in the normal Alliances table.
- Each recruiting alliance can configure:
  - 0–4 Bear Trap times
  - 0–2 Foundry times
  - 0–2 Canyon times
  - optional extra schedule note
- All schedule times use UTC 24-hour selectors.
- Recruiting / Not Recruiting toggle remains available.
- Only Recruiting alliances appear in the public Transfer Form.
- Alliance schedule is shown automatically under each recruiting alliance.

No new SQL is required for this update.
