NEXA Phase 2B — Full Availability ID Fix

Replace ONLY:
- battle-form.html

Root cause:
The form checkbox is id="full-avail", but the previous code was checking
id="full-availability". That meant Full Availability was never being saved
as the explicit availability_mode.

After uploading:
1. Open the TAL real form.
2. Select Full Availability.
3. Submit again.
4. Responses should display "Full Availability".

No SQL required.
No Event Operations / Form Settings files changed.
