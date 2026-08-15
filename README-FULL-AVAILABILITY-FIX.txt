NEXA Phase 2B — Full Availability Display Fix

Replace ONLY:
- event-operations.html

Why the previous fix did not work:
The saved response does not always contain exactly 24 values, so counting values
was not reliable.

This version reads the Availability Blocks configured for the selected Event Type.
If the submitted response contains every configured block, Responses displays:
Full Availability

Partial selections still show only the selected blocks.
Not Available remains Not Available.

No SQL required.
