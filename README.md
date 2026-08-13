# NEXA v28.7 — Transfer UI Runtime Fix

This fixes the reason v28.6 looked unchanged / controls did not work:
- transfer-admin.html relied on automatic JavaScript variables from HTML IDs.
- Many IDs contain hyphens, so those variables were not reliably created.
- The script stopped early, preventing Transfer Form, Recruiting Alliance dynamic times, and Permissions from rendering correctly.

Fixes:
- Explicit DOM references for every Transfer Control Center element.
- Dynamic Bear / Foundry / Canyon / Other Event time controls can now render.
- Recruiting Alliance save/toggle/edit UI can run.
- Transfer Form tab can load and copy the direct form link.
- Permissions can load/search and show SvS Staff / Transfer Staff checkboxes.
- Adds visible `v28.7` build tag beside Transfer Control Center so deployment can be verified.
- Adds visible runtime error text instead of failing silently.

No new SQL is required if the v28.6 SQL already ran successfully.
