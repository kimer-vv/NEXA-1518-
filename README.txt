NEXA — RESPONSES + MOBILE TEAM UX FIX
No SQL.

Based on the full GitHub project + the latest TAL Event Operations selector fix.

Changes:
1) Responses
• Full Availability is stored and displayed as “Full Availability”.
• Rally Leader cards no longer show empty Troop Level.
• Rally Leader cards no longer show Deployment Capacity.
• Joiner capacity is labeled “Deployment Capacity” (not Rally Cap / Deployment).
• Existing custom response-card questions remain unchanged.

2) Battle Form
• Saves availability_mode/full_availability for new submissions.
• Deployment Capacity is saved only for Joiners.

3) Team Builder
• “Use Defensive Heroes” is now an On/Off switch instead of a Yes/No dropdown.

4) Alliance Formations / iPhone
• 16px form controls prevent Safari focus auto-zoom.
• Removes mobile horizontal overflow/min-width traps.
• Keeps pinch zoom available; this does NOT disable accessibility zoom.
• Same fix is added to index.html because Alliance Formations runs as a native internal NEXA view.

Not changed:
• Rally Leader hero selector/catalog. That is intentionally left for the future Library work.
