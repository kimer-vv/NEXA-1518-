NEXA — TRANSFER STATE SYNC ROOT FIX V2
No new SQL migration.

Transfer status behavior:
- Waiting List -> Ordinary Invite updates the original transfer_applications record to Ordinary,
  assigns it to the selected/current Transfer Event, removes it from Waiting List through the
  existing RPC, refreshes Applications + Roster + Waiting List, and opens Applications.
- Waiting List -> Special Invite does the same with Special Invite status.
- Move Back to Applications restores the original application as Not Reviewed through the
  existing RPC and reloads the correct Transfer Event in Applications.
- Applications is treated as the canonical status display.

UI:
- Waiting List buttons use a 2-column responsive mobile layout.
- Application Review preserves internal embed navigation and remembers Waiting List vs Applications.
- Team Builder modal layering is strengthened for Pet Schedule.
- SvS archive links preserve embed mode when compatible detail pages exist.

No database schema changes included.
