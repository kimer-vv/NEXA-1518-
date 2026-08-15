NEXA • Phase 2B Recovery

This restores the last known-good Phase 2A UI/navigation baseline:
- event-operations.html
- battle-settings.html

And keeps ONLY the safe Phase 2B submit change in:
- battle-form.html

Use this because the current deployed Event Operations page is still carrying
a broken event-operations.html / battle-settings.html from a later cleanup.

Replace all 3 files in GitHub:
- event-operations.html
- battle-settings.html
- battle-form.html

Do NOT run another SQL. The Phase 2B SQL already ran successfully.
