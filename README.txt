NEXA • Event Operations Syntax Fix

Replace ONLY:
- event-operations.html

This fixes one malformed JavaScript line in selectedFormUrl() that stopped
the entire Event Operations script from running. When that script stops,
Form dropdowns remain empty and buttons/tabs do not respond.

No SQL.
Do not replace battle-settings.html or battle-form.html with this patch.
