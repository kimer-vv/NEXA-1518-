# NEXA v23.1 — Prep Submit Fix

This patch focuses only on unblocking Prep Form testing.

Changes:
- Unselected Day 1 / Day 2 / Day 4 / T12 sections are truly disabled and cannot block Submit.
- Specific preferred time uses explicit 24-hour UTC choices instead of the phone AM/PM time picker.
- Estimated Construction/Research points are hidden from players.
- Point calculations remain an Admin/Scheduler concern.
- Only selected sections are validated.
- Specific preferred time remains optional.
- Inactive sections save neutral values instead of stale hidden values.

Before testing, run `v23-1-supabase.sql` once in Supabase.
