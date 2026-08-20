NEXA V21 — LIBRARY COMPLETE

UPLOAD TO THE ROOT OF THE GITHUB REPOSITORY

1. index.html
2. library.html
3. nexa-player-library 21.js
4. nexa-troop-assets-v21.js

Keep the filenames exactly as written. The updated index.html already loads the
V21 troop-assets file first and then nexa-player-library 21.js.

SUPABASE — RUN ONCE IN SQL EDITOR

5. Open NEXA-V21-LIBRARY-SCHEDULE.sql, copy all its contents, and run it in the
   Supabase SQL Editor. This enables Hidden / Scheduled / Unlocked generation
   status and automatic scheduled unlocking.

AFTER VERCEL DEPLOYS, VERIFY

- Open Profile > Troops and test T1, T10, FC5, Helios, FC10 and T12.
- Confirm the circular portrait and Fire Crystal insignia change.
- Confirm Helios appears at FC5+ and T12 appears only at FC10 + Helios.
- Save, refresh, and verify the selected levels remain saved.
- Open Administration > Library > Heroes, choose a generation, and test the
  Hidden / Scheduled / Unlocked dropdown and explanation modal.

Rollback: change the two V21 script tags in index.html back to the prior V20
player-library script. The SQL addition is backward-compatible.
