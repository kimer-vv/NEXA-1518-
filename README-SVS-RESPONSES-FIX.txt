NEXA Phase 2B — SvS Responses Fix

Replace ONLY:
- event-operations.html

Why SvS was missing:
TAL/FDT/custom submissions are stored in event_operation_responses.
SvS still uses the original battle_form_responses table.

This patch makes the existing Responses tab read:
- SvS -> battle_form_responses for the current LIVE SvS event
- TAL/FDT/custom -> event_operation_responses

No SQL required.
No submit/form/settings logic changed.
