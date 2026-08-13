# NEXA 1518 v22 — SvS Core Complete

This package includes the full current SvS workflow.

NEW / corrected in v22:
- Castle Alliance label fixed.
- Presidency Alliance.
- Event Notes remains separate.
- Important Announcement on the Home page as a highlighted scrolling ticker.
- Players can click “I’ve read this”.
- Admin/Owner can see who acknowledged the current announcement.
- Changing the announcement creates a new acknowledgement version.
- Optional Note to Scheduler on Prep Form.
- My Submissions page for players to see request status and assigned appointments.
- Players can edit their submission while Prep Form is still open.
- Scheduler role can review Prep Requests and assign Ministry appointments.
- Admin/Owner remain responsible for Events, Alliances and Permissions.
- Basic audit logging for schedule assignments.
- Export Prep Requests to CSV.
- Copy Full Schedule.
- Copy Schedule by Alliance.
- Copy Schedule by Day.
- Alliance/day copy text is ready to paste into Discord or Alliance Chat.
- Public View Schedule continues to show UTC plus each user’s local AM/PM time.
- Monday/Tuesday = VP (Vice President); Thursday = MOE (Minister of Education).

FILES ADDED/USED:
- index.html
- event.html
- schedule.html
- prep-form.html
- prep-requests.html
- my-submissions.html
- lang.js
- style.css
- cosmic-background.png
- v22-supabase.sql

IMPORTANT:
1. Run `v22-supabase.sql` in Supabase SQL Editor first.
2. Then upload all web files to the GitHub repository root.
3. `v22-supabase.sql` itself does not need to be served by Vercel, but it is included for your records.

Future TODO (not part of this version):
- Transfer Live Event with a shareable external application link/form.
