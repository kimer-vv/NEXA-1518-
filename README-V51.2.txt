NEXA V51.2 — MIDDLEWARE NODE RUNTIME FIX

Problem:
Vercel built middleware using the default Edge runtime and rejected
@vercel/functions as an unsupported module.

Fix:
The middleware config now explicitly sets:
  runtime: 'nodejs'

Upload:
Replace ONLY the root-level middleware.ts in GitHub with this one.
Do not put it inside /api.

No SQL changes.
No environment-variable changes.
Do not re-upload the other V51.1 files.

After the GitHub commit, Vercel should create a fresh Production deployment.
Use that NEW deployment; do not redeploy the old failed deployment.
