# NEXA 1518 v10 — Discord Login

This version connects the Home "Discord Profile" button to Supabase Auth using Discord OAuth.

Upload all files to the root of the GitHub repository:
- index.html
- event.html
- schedule.html
- style.css
- cosmic-background.png
- README.md

Expected flow:
1. Tap Discord Profile.
2. Authorize NEXA 1518 in Discord.
3. Return to the Vercel site.
4. The Discord display name/avatar appears in the header.
5. Tapping the connected profile offers Sign Out.

Supabase project URL and Publishable Key are browser-safe public values.
Do not add any Secret key, service-role key, Discord Client Secret, or database password to these files.
