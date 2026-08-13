# NEXA v28.4 — Schedule Blank Page Fix

Exact bug fixed:
- The Schedule page referenced HTML element IDs containing hyphens as JavaScript underscore variables.
- That caused a ReferenceError before the access check/render could run, leaving both the private schedule and access message hidden — a completely blank page.

Restored/kept:
- Monday Construction / VP
- Tuesday Research / VP
- Thursday Training / MOE
- 48 half-hour UTC slots per day
- UTC official time + each user's local AM/PM
- Copy This Day
- Copy Full Schedule
- Copy Alliance Schedule
- Private schedule access protection
- Existing Prep Form preferred-time warnings and Scheduled/Preferred-by-X behavior are untouched

No SQL is required.
