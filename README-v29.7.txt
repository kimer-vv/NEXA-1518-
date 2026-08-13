NEXA v29.7 — Recruiting Form Binding Fix

This version fixes the remaining cycle-binding mismatch:
- Admin Recruiting list now loads through get_transfer_recruiting_for_event(event_id).
- Public Transfer Form loads through get_public_transfer_form_data(token).
- Both read the same transfer_recruiting_alliances rows.
- Public Form Preview shows the exact cycle ID, public token, and number of Recruiting alliances visible publicly.
- Public form shows a visible count of Recruiting alliances available for that cycle.

IMPORTANT:
1. Run v29-7-supabase.sql once.
2. Then upload all web files.
