NEXA — WAITING LIST + ALLIANCE SCROLL FIX
NO NEW SQL.

Alliance Workspace:
• BBC/other Alliance Workspace now forwards vertical finger swipes directly to the outer Admin panel.
• Swipe can begin on cards/content, not only on empty borders.
• No database changes.

Transfers / Waiting List:
• Waiting List action buttons now wrap into a mobile-safe 2-column grid.
• View Details stays inside the Transfers module and remembers whether it came from Waiting List or Applications.
• Back button says “Back to Waiting List” when opened from Waiting List.
• No nested Transfers page after returning from details.
• Move Back to Applications now uses the returned application ID, selects that application’s original Transfer Cycle, opens Applications, clears status filtering, reloads the list and scrolls toward the returned application.
• No SQL changes were required because the existing RPC already restores transfer_status='not_reviewed'.

Administration, Announcements, Event Operations, SvS and the already-approved module shell are otherwise left unchanged.
