NEXA — BATTLE FORM END-TO-END SYNC FIX
NO SQL.

Important: the previous sync patch fixed Responses + Team Builder, but did NOT include battle-form.html.
This patch now includes and fixes the actual Battle Form submission page too.

All three now use the same current SvS resolution:
1. is_live = true
2. status = live
3. newest event that is not ended

Flow:
Battle Form submit -> battle_form_responses -> Responses -> Team Builder candidates.

The Battle Form now also verifies that the row really exists after saving before showing
"submitted successfully". If it cannot verify the save, it shows the database error instead.

Includes all prior Team/SvS fixes from the current combined baseline.
No database migration required.
