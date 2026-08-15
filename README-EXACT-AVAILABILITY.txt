NEXA Phase 2B — Exact Availability Choice

Replace:
- battle-form.html
- event-operations.html

No SQL required.

New submissions now save the actual Availability choice:
- Full Availability
- Not Available
- Selected blocks

Responses displays that exact choice instead of trying to infer Full Availability
from a long list of saved blocks.

IMPORTANT:
Existing test submissions were saved before this marker existed.
Submit the TAL test form one more time after uploading this patch so the saved
response includes availability_mode. The same account/event upsert will update
the existing test response rather than create a duplicate.
