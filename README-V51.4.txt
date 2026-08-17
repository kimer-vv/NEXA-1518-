NEXA V51.4 — SYSTEM OPERATIONS SUPABASE CLIENT FIX

Confirmed UI error:
Can't find variable: supabaseClient

Cause:
System Operations referenced `supabaseClient`, while NEXA initializes and uses
the Supabase browser client as `sb`.

Fix:
Replaced 60 System Operations reference(s) from `supabaseClient` to `sb`.

UPLOAD:
Replace ONLY root-level index.html in GitHub with this index.html.

Do not upload README.
Do not change /api.
Do not run SQL again.
Do not change Vercel environment variables.
Do not change middleware.ts or package.json.

After commit, wait for the NEW automatic Production deployment.
Do not enable Maintenance Mode until System Operations loads without the error.
