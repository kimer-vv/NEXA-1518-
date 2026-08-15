NEXA v33.16 — Duplicate Philosophy Fix

Apply on top of v33.14/v33.15.

Fixes ONLY the Transfer Form duplicate sentence that was being re-injected at runtime:
"Strong accounts matter — but the player behind the account matters just as much."

The new fix watches the Welcome section continuously and removes only that legacy standalone line,
while preserving:
- the introduction paragraph
- Our Philosophy callout
- all other form content

No SQL required.
