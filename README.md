# NEXA v27.1 — Guest Prep Form Redirect Fix

Fixes one blocking bug in v27:
- Unauthenticated visitors were still being redirected to Home before the new Guest Access logic could run.
- Now View Event → Fill Out Prep Form opens the Guest/Discord choice correctly.
- No SQL changes are required.

Upload/replace the web files in GitHub. No SQL file needs to be run.
