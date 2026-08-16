NEXA Team Builder — Loading Fix

Replace ONLY:
- team-builder.html

Cause:
The new Rally Schedule modal was inserted after the page's JavaScript.
The script tried to bind buttons before the modal existed, stopping page
initialization and leaving Rally Leaders / Joiners stuck on Loading.

Fix:
The modal is now in the DOM before the JavaScript runs.

No SQL required.
The SQL you already ran is correct and does not need to be run again.
