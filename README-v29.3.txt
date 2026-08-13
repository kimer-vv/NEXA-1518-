NEXA v29.3 TRANSFER FIX

Fixes:
1. Recruiting Alliances now loads directly from the same active `alliances` table used by NEXA.
2. Restores the missing Special Invite Status control:
   - Not Leading
   - Leading — No Special Invites
   - Leading — Special Invites Available
3. Restores Special Invites Available: 0–3.
4. Removes Special Invite Question Threshold from Transfer Events.
5. Labyrinth logic remains tied to Special Invite Power Cap on the public form.
6. Restores Keep Form Open After End for future-interest / waitlist applications.
7. New v29.3 filenames force a fresh deployment.

No new SQL is included in this package.
Upload all files to the same GitHub repo, replacing matching files.
