# NEXA 1518 v17 — Admin Role Fix

Fixes Admin visibility by checking Supabase's protected `is_admin()` helper directly.
The Admin button remains hidden for non-admin users.

Also changes local-time previews to 12-hour AM/PM format while WOS/UTC stays 24-hour.

Upload all files to the GitHub repository root and replace the previous version.
