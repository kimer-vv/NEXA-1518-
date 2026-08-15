NEXA • Phase 2A — Loading + Back Fix V2

Replace:
- event-operations.html
- battle-settings.html
- battle-form.html

Fixes:
- Custom Availability is hidden, but its DOM hooks remain so the existing Form Settings script does not crash.
- Event Type / Availability / Heroes / Experts loading logic is preserved.
- T12 Maximum Skill Level options 1–5 restored.
- Save Form Settings shows Saved ✓ beside the button.
- Preview Battle Form stays in the same tab and is read-only.
- Open Form stays in the same tab.
- Back returns to Form Settings or Event Operations depending on where the form was opened from.
- Old Phase 2B preview message replaced with a simple Preview Mode notice.
- No SQL required.
