NEXA V51.8 — SYSTEM OPERATIONS REAL DIAGNOSTIC

Built from V51.6 (the version where Discord/Admin access works).

This patch changes the actual visible System Operations error path so the UI
cannot silently collapse the underlying failure into the old generic message.

UPLOAD ONLY index.html to the repository root and replace the current file.

Do not change /api, middleware.ts, package.json, SQL, or Vercel variables.
After the new Production deployment is Ready, open System Operations and send
a screenshot of the cyan error line. Do not enable Maintenance Mode.
