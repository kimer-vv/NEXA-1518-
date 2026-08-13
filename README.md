# NEXA v28.2 — Admin Tabs + Transfer View Event

Fixes:
- Restores SvS Control Center tab navigation.
  - Events
  - Alliances
  - Permissions
  - Announcements
  now open correctly again.
- Opening SvS always starts on Events.
- History remains its own separate page below the SvS tab row.

Transfers:
- Public Transfer card now says `View Event`, matching SvS.
- Transfer Event page includes `Edit Event` for Transfer Staff/Admin/Owner only.
- If there is no live Transfer Cycle, authorized Transfer Staff see `Create Transfer Event` directly on Home.
- `Create Transfer Event` opens the Transfer Events editor directly.
- `Edit Event` from the public Transfer Event opens that exact cycle in the Transfer editor.

No new SQL is required.
Upload/replace the web files in GitHub.
