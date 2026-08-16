NEXA — DYNAMIC TEAM WIDTH FIX
NO SQL.

This patch changes template-builder.html only.

Fixes the layout shown after the root-cause fix:
• 1 Team uses the available sheet width.
• 2 Teams split the full width 50/50.
• 3 Teams use 3 equal columns.
• 4 Teams use the approved 4-column layout.
• 5–6 Teams use 3 columns per row.
• No more empty phantom Team 3 / Team 4 space when only two Teams exist.
• Joiner / Rally Leader text has more room with two-team layouts.
• Global Formation cards expand based on how many formations actually exist.
  Example: Main Attack + Main Defense = two wide cards, not two tiny cards
  plus two empty reserved slots.
• Mobile fit is recalculated after Teams/Formations render.
• Existing data loading, Preview Layout, Download Layout, and styling are preserved.

Replace template-builder.html only. Keep the root-cause-fixed index.html already uploaded.
