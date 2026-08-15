NEXA • Phase 2A Safe Restore

This build starts from the last known-good Supabase-integrated Phase 2A files.

Replace in GitHub:
- event-operations.html
- battle-settings.html
- battle-form.html

Only these changes were made:
1. Arrange & Preview removed completely.
2. Duplicate removed completely.
3. Delete added to Question Library with confirmation.
4. Back returns to the previous NEXA page when possible; Event Operations is fallback.
5. Preview Battle Form follows the Event Type selected in Form Settings.

IMPORTANT:
- Event Type loading logic was NOT rewritten.
- Availability / T12 / heroes / experts / Form Settings persistence were NOT rewritten.
- Battle Form Supabase loading logic was NOT rewritten.
- No SQL is required.
