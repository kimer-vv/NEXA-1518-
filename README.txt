NEXA — BBC / TEAM NATIVE SCROLL FIX
No SQL.

This patch is intentionally narrow:
• Removes JavaScript touch-forwarding from Alliance Workspace / Team Builder / Alliance Formations.
• BBC/Team pages now use native iOS/Safari momentum scrolling.
• When those pages are open, the outer Admin panel is locked so there is only one active vertical scroller.
• Event Operations header remains in the outer shell.
• Horizontal scrolling inside team tables remains available.
• Other modules are left on the existing behavior.

This patch does NOT attempt the separate pending fixes for Pet Schedule, SvS archive nesting,
or Transfer application/waiting-list nesting/status display.
