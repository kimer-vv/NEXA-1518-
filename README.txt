NEXA — Pet Window undefined fix

Replace ONLY:
- team-builder.html

Cause:
The Pet Window overlap check was testing the returned data array instead of the
Supabase error object. That caused an alert showing "undefined" even when the
query itself succeeded.

Fix:
The code now checks `error` correctly and continues to save the Pet Window.

Keeps:
- dark NEXA button colors
- UTC Start/End dropdowns

No SQL required.
