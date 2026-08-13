NEXA v29.9 — iOS Public Transfer Form Runtime Fix

Confirmed before this build:
- Supabase event is correct.
- ABS is is_recruiting=true.
- get_public_transfer_form_data(public_token) returns ABS and schedules correctly.
- v29.8 was visibly deployed (Refresh alliances button appeared), but the recruiting count/sync text did not render.

Root frontend issue fixed:
The form JavaScript relied on browser-created global variables from HTML element IDs
(e.g. utc_ranges, transfer_form, event_title). That behavior is unreliable in iOS Safari.
v29.9 explicitly binds every referenced form element with document.getElementById()
before the loader runs.

No SQL required.
Upload/replace the web files only.
