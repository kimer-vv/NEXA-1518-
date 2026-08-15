NEXA • Phase 2A — Order + Preview Fix

Replace in GitHub:
- battle-settings.html
- battle-form.html

Fixes:
1. Preview Battle Form now opens the Event Type currently being edited
   (TAL opens TAL, FDT opens FDT, custom opens custom, etc.).
2. Arrange & Preview now READS the previously saved order from Supabase.
   Returning to Form Settings or refreshing no longer resets the list to
   the original order.
3. Open Form loads event_form_layouts for the selected Event Type.
4. Event Questions in the real player form follow their saved Role order.

No new SQL is required.
