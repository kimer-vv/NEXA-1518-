# NEXA v29.1 — Transfer Admin Repair

IMPORTANT:
1. Run `v29-1-supabase.sql` in Supabase first.
2. Wait for Success.
3. Then upload the web files to GitHub.
4. Do NOT upload the SQL file to GitHub.

This version repairs:
- Existing Alliances dropdown in Recruiting Alliances using a protected RPC.
- Recruiting list + saved schedules.
- End Event button (v29 still had an old Archive handler in the frontend).
- Permissions directory so Owner/Admin is included and users can be searched by name, IGN or Player ID.
- Generic Special Invite Status:
  - Not Leading
  - Leading — No Special Invites
  - Leading — Special Invites Available
- Special Invite count 0–3.
- Public Transfer Form continues to load only alliances marked Recruiting.
