NEXA • PHASE 2A — EVENT TYPES / TEMPLATE FIX

Replace in GitHub:
- event-operations.html
- battle-settings.html

What to verify BEFORE SQL:
1. Event Operations > Event Types shows SvS, TAL, FDT.
2. + Add Event Type adds a new type instead of replacing existing ones.
3. Event Types can be Active / Inactive / Delete.
4. Form Settings > Event Type is independent from live SvS events and lets you choose any active Event Type.
5. Event Questions only show questions for the selected Event Type plus All Events.
6. Create Question defaults to the currently selected Event Type.
7. Add From Library targets the selected Event Type.
8. Arrange & Preview follows the selected Event Type.
9. Role choices are Joiner + Rally, Joiner only, Rally only. Everyone was removed.
10. Base + Combat fields remain in the Form Settings page.

NOTE: Until the Phase 2A SQL is run, Event Type/template changes use a local preview fallback in the browser. The SQL will turn on permanent database storage.
