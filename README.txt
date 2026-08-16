NEXA — BATTLE FORM -> RESPONSES -> TEAMS SYNC FIX
NO SQL.

Problem found:
Different parts of NEXA were identifying the current SvS differently.
Some use svs_events.is_live=true while Responses/Team Builder were only looking for status='live'.

Fix:
• Responses now resolves current SvS in this order:
  1) is_live=true
  2) status='live'
  3) newest event not ended
• Team Builder uses the exact same current-SvS resolution.
• Add Rally Leader / Add Joiner reads Battle Form submissions from that same event.
• Joiner hero reports also use that same event.
• Responses shows the current SvS and number of submitted responses for easier verification.

No database schema changes.
