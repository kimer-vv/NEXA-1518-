NEXA PATCH V51 — MAINTENANCE MODE + SYSTEM OPERATIONS
======================================================

BASE
- Keeps the stable V49 Template Builder files in this patch.
- Adds Maintenance Mode and the new Administration structure.

ADMINISTRATION TABS
- Alliances
- Roles (reserved for operational roles phase)
- Permissions
- Library (reserved for Heroes / Experts / Troops)
- System Operations (OWNER ONLY)

MAINTENANCE MODE
- Owner toggle lives in Administration > System Operations.
- When ON, public pages, shared forms, direct links and module URLs are redirected
  before the page loads to maintenance.html.
- Maintenance does NOT rely on hiding UI in the browser.
- Missing infrastructure configuration fails OPEN rather than locking the Owner out.

OWNER RECOVERY PATH 1
- Maintenance page has a discreet lock icon.
- Lock -> Owner Access -> Continue with Discord.
- NEXA verifies current_nexa_role() = owner before issuing the bypass cookie.
- Knowing about the lock does not grant Owner access.

OWNER RECOVERY PATH 2
- Private emergency URL:
  /owner-recovery-fgpelbgj6g.html
- The URL alone is NOT enough.
- It requires NEXA_OWNER_RECOVERY_SECRET from Vercel.
- You can rotate that secret whenever you want.

IMPORTANT: VERCEL ENVIRONMENT VARIABLES
Add these before turning Maintenance Mode ON:
1. SUPABASE_SERVICE_ROLE_KEY
   Your Supabase service_role secret. NEVER put it in browser HTML/JS.
2. NEXA_MAINTENANCE_COOKIE_SECRET
   Make this a long random secret (32+ characters).
3. NEXA_OWNER_RECOVERY_SECRET
   Your private emergency recovery password (strong and unique).
Optional:
4. SUPABASE_URL
5. SUPABASE_ANON_KEY or SUPABASE_PUBLISHABLE_KEY

SUPABASE
- Run NEXA-V51-SYSTEM-OPERATIONS.sql once.

DISCORD OWNER ACCESS
- Existing Discord provider must be enabled in Supabase.
- If Supabase redirect allow-list is restrictive, allow:
  https://YOUR-NEXA-DOMAIN/owner-access.html
- The Discord account must already resolve to the NEXA user whose current_nexa_role() is owner.

SAFETY
- Turning Maintenance ON sets the Owner bypass cookie before the global setting is enabled.
- Middleware never blocks:
  maintenance.html
  owner-access.html
  the private owner recovery route
  Owner recovery APIs
  System Operations API
- If Supabase/service configuration is unavailable, middleware fails open instead of
  trapping the Owner outside NEXA.
- The bypass cookie lasts 12 hours on that device.

ADMIN BUTTON FIX
- Administration is no longer shown to logged-out/non-admin users by the old unconditional UI rule.

NEXT PHASE
- Account/Login redesign (Game ID + NEXA Password; Owner Discord shortcut)
- Operational Roles
- Library
- Sandbox/Test Mode (SvS / Event Operations / Transfer)
