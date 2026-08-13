# NEXA 1518 v22.1 — Announcement Display Fix

This is the same SvS Core Complete build as v22, with a front-end fix:

- Important Announcement now has an actual visible ticker container on the NEXA Home page.
- The existing saved `announcement_text` and acknowledgement logic can now render properly.
- My Submissions shortcut is also visible in the My Accounts section.

NO NEW SQL is required if you already successfully ran v22 SQL / added:
- announcement_text
- announcement_version
- announcement acknowledgements and the remaining v22 migration.

Upload the web files in this package to GitHub and replace the current versions.
