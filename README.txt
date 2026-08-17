NEXA ROOT TEAM-LAYOUT FIX

Upload BOTH files to the root of your GitHub repository:

1) alliance-teams.html
   - replaces the existing alliance-teams.html

2) team-layout.html
   - NEW file; do not rename it

This intentionally stops using template-builder.html for Finish Lineup Setup.
The old route is being bypassed completely, so old CSS/cache/native-render behavior
cannot keep showing the unchanged layout.

Finish Lineup Setup now opens team-layout.html through NEXA_NATIVE_OPEN when inside
the NEXA Administration workspace, and falls back to a normal page navigation if needed.

No SQL. No database changes. Do not delete your current template-builder.html yet.
