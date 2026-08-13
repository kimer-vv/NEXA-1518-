NEXA v29.4 — Recruiting Alliance Sync

Fixes the last Recruiting Alliance issue:
- Recruiting status is now toggled through a protected RPC instead of a direct table update.
- Public form loads Recruiting Alliances through a dedicated token-based RPC.
- Recruiting configuration is explicitly tied to the exact Transfer Cycle.
- Admin shows which Transfer Cycle you are currently editing.
- Transfer Form / Applications / Recruiting selectors default to the same open Transfer Cycle.
- New v29.4 URLs force a fresh page.

IMPORTANT:
Run v29-4-supabase.sql once before uploading the web files.
