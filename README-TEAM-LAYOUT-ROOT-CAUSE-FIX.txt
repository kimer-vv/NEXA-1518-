NEXA TEAM LAYOUT — ROOT CAUSE FIX

No SQL required.

Root causes found in the full GitHub ZIP:
1. template-builder.html placed the Preview overlay AFTER the main script.
   The script tried to bind onclick to elements that did not exist yet.
   JavaScript stopped before load() ran, so saved Teams never rendered.

2. NEXA's native Event Operations loader cloned only the child page BODY.
   template-builder.html keeps its page-specific CSS in HEAD, so the native
   modal discarded the Team Sheet styling.

3. Native mode intentionally does not execute child external scripts.
   html2canvas therefore never loaded, which is why Download Layout did nothing.

Fixes:
• Preview overlay is now before the script.
• Saved Teams / members / formations can actually load and render.
• Native Event Operations now preserves page-specific <style> blocks.
• Download Layout loads html2canvas on demand and works in native mode.
• template-builder reads NEXA_NATIVE_PARAMS directly.
• Data-loading errors are shown visibly in the sheet instead of silently
  leaving a blank white page.
• Existing approved Team Sheet design/mobile-fit changes are preserved.

Changed files:
• index.html
• template-builder.html
