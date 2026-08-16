NEXA — TEAM LAYOUT PREVIEW + DOWNLOAD FIX
NO SQL.

This patch only changes template-builder.html.

Changes:
• Removes “Preview Fullscreen”.
• Removes “Print / PDF”.
• Adds “Preview Layout”.
  - Opens a clean in-app full-screen preview that works on iPhone/Safari.
  - Does not depend on the browser Fullscreen API.
• Adds “Download Layout”.
  - Downloads the clean Team Sheet directly as PNG.
  - Does not open the browser print dialog.
  - Exports only the sheet, not the NEXA controls/editor.
• Keeps “Save Layout”.
  - Saves the current layout/style state locally on the device.
• Preview overlay also has its own Download Layout button.

This patch does NOT yet redesign the Team Sheet content/layout itself.
It only fixes the Preview / Download / Save workflow discussed before the visual redesign.
