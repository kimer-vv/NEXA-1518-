NEXA V51.3 — PACKAGE DEPENDENCY FIX

Confirmed Vercel runtime error:
Cannot find module '@vercel/functions'
Require stack:
- /var/task/middleware.js

The repository has no package.json, so Vercel has nothing instructing it
to install @vercel/functions.

UPLOAD THESE TWO FILES TO THE ROOT OF GITHUB:
1. package.json  <-- NEW FILE
2. middleware.ts <-- REPLACE the current root middleware.ts

Do NOT put either file inside /api.

No SQL changes.
No Vercel environment-variable changes.
Do not re-upload the other V51 files.

After Commit:
- Wait for a NEW automatic Vercel Production deployment.
- Do NOT redeploy the old failed deployment.
- Open the new deployment and confirm it says Ready.
