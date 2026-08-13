NEXA v29.8 — Canonical Public Transfer Form Fix

Database was verified working:
- Event token resolves correctly.
- ABS is saved as is_recruiting=true.
- get_public_transfer_form_data(token) returns ABS + schedules.

Therefore this build fixes ONLY the frontend path/link issue:
- Restores canonical transfer-apply.html, transfer-event.html, transfer-admin.html.
- ALL NEXA links now point to canonical Transfer URLs.
- Old versioned Transfer URLs are also overwritten with the same v29.8 code.
- Public form renders directly from get_public_transfer_form_data().
- Adds visible recruiting count + cycle sync text + manual Refresh alliances button.

No SQL required.
