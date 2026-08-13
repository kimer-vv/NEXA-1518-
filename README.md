# NEXA v24 — Priority + Time Demand + Health Check

Focused update to keep scheduling simple, not overloaded.

New:
- Specific preferred time is restricted to the selected UTC time frame.
- Only 30-minute slots inside that frame appear.
- Each time shows:
  - Available
  - Preferred by X players
  - Scheduled
- Scheduled slots are disabled for new preferred-time selections.
- If a player chooses a time already preferred by others, NEXA shows a warning but still allows it.
- Admin/Scheduler keeps priority ranking.
- Added Unscheduled Only filter.
- Added compact Scheduled / Unscheduled counters.
- Added Schedule Health Check.
- Health Check looks for:
  - duplicate slots
  - assignments to a day the player did not request
  - assignments outside the player’s preferred time frame
  - scheduled vs waitlisted totals

No new SQL is required for this version.
