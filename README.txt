NEXA — SINGLE SCROLL + TEAM NAV FIX
NO SQL.

Fixes:
• Only the outer Admin module panel owns vertical scrolling.
• Embedded Event Operations / Transfers / SvS Schedule / SvS History cannot create a second vertical scrollbar.
• iframe height continuously follows its content using ResizeObserver + MutationObserver.
• Safari safe-area bottom spacing remains on the outer panel.
• Teams -> Alliance Workspace -> Open Team preserves embed mode.
• Team Builder -> ← Alliance Workspace returns to the embedded alliance workspace instead of nesting Event Operations again.
• Alliance Formations back navigation also preserves embed mode.

No database changes.
