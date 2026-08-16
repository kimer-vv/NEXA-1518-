NEXA — SvS VIEW SCHEDULE + VIEW ARCHIVE SHELL FIX
NO SQL.

Keeps the confirmed fixes:
• BBC / Teams native scrolling
• Pet Schedule modal

This patch fixes the two SvS nested-page visuals:
• Schedule Setup -> View Schedule
• History -> View Archive

When schedule.html or history-event.html navigates inside the SvS frame,
NEXA now removes the duplicate standalone NEXA header/background/back navigation
and lets the OUTER SvS module remain the single visible module shell.

No Transfer status logic is changed in this patch.
