NEXA Patch — Team Builder Missing UUID Fix

Replace ONLY:
- team-builder.html

Cause of the error:
Some Team links created during the preview phase do not include the new shared
Supabase team UUID. Team Builder then queried team_members with team_id = "",
which PostgreSQL rejected as an invalid UUID.

Fix:
- If team_id is missing, Team Builder now resolves the Team UUID from:
  Event Type + Alliance + Team Name.
- It repairs the URL automatically once found.
- If the Team only exists in the old browser preview and not in Supabase,
  NEXA tells you to recreate that Team once in the shared Alliance Workspace.

No SQL required.
