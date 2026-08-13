# NEXA v29 — Transfer Cycle Logic Fix

IMPORTANT: Run `v29-supabase.sql` once in Supabase BEFORE uploading the web files.

Fixes:
- Recruiting Alliances now load through a public security-definer RPC.
  - If Transfer Staff marks an alliance Recruiting, it appears automatically in the public Transfer Form.
  - Bear / Foundry / Canyon / Other Event schedules appear with it.
- Manual End Event is rebuilt.
- End Event can happen before the scheduled End Date.
- New option: keep the Transfer Application open after End Event for future-transfer interest / waitlist applications.
- Applications submitted after the cycle ends are internally marked Future Interest.
- Removes the separate Special Invite Question Threshold.
- Labyrinth Score is now conditional on the editable Special Invite Power Cap.
- Transfer Event adds:
  - State Leadership Status: Not Leading / Leading under 3 months / Leading 3+ months
  - Special Invites Available: 0–3
- Leading under 3 months automatically makes Special Invite Power Cap N/A and Special Invites Available 0.
- Not Leading and Leading 3+ months can both configure a Special Invite Power Cap and 0–3 available invites.
- Existing isolated public Transfer Form remains intact.
