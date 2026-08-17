NEXA V51.10 — VERCEL API ROUTES FIX

Confirmed symptom:
System Operations now reports:
404 NOT_FOUND

Cause addressed:
The /api files were written as CommonJS `module.exports` handlers. The current
Vercel Functions runtime expects deployable API files with a default-exported
function/handler. The UI is already calling the correct path:
  /api/nexa-system-settings

This patch converts the Maintenance/Owner API files to default-exported
Vercel Functions and marks the project JavaScript as ESM.

UPLOAD TO GITHUB:

ROOT:
- package.json  (replace current)

INSIDE /api:
- _nexa-maintenance-common.js
- nexa-system-settings.js
- nexa-owner-bypass.js
- nexa-owner-recovery.js

Do NOT change:
- index.html
- middleware.ts
- SQL
- Vercel Environment Variables

After Commit:
1. Wait for the NEW automatic Production deployment.
2. It must say Ready.
3. Open Administration > System Operations.
4. Do NOT turn Maintenance Mode ON yet.
5. Confirm that the status under the switch now reads Maintenance Mode OFF
   instead of a 404/error.
