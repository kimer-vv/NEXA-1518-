NEXA v32.1 — Waiting List Hotfix

The screenshot error:
operator does not exist: uuid = bigint

Cause:
transfer_applications.id is UUID, while v32 mistakenly created the waiting-list function with a bigint parameter.

Do this:
1. Run NEXA-v32-1-WAITLIST-HOTFIX.sql in Supabase.
2. Upload/replace the v32.1 web files.

Fixes:
- Waiting List save now uses UUID correctly.
- Selecting Waiting List — Next Transfer can save without uuid=bigint error.
- Transfer Roster and Waiting List tabs have a robust tab activation handler.
- Waiting List remains persistent across transfer cycles.
