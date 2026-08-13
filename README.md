# NEXA v29.2 — Cache Bust / Deployment Verification

This build intentionally uses NEW filenames:
- transfer-admin-v292.html
- transfer-apply-v292.html
- transfer-event-v292.html

Why:
If the site looked exactly unchanged after v29.1, the browser/Vercel was almost certainly still serving the old cached transfer page.

Visible proof:
- Home shows `NEXA BUILD v29.2`.
- Transfer Control Center shows `v29.2`.
- A diagnostic chip shows how many Transfer Events and Existing Alliances actually loaded.

No SQL is required if v29.1 SQL already returned Success.

Upload ALL web files from this ZIP to GitHub.
