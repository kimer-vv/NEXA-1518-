# NEXA 1518 v23 — Prep Preview + Edit Event + Announcement Fix

New:
- Prep Form interface localized for English, Spanish, Turkish, Korean, Arabic, Japanese, Chinese, and Russian.
- Important Announcement acknowledgement now disappears after the player confirms “I’ve read this”.
- Already-acknowledged announcements remain hidden for that player.
- Admin/Owner can edit the live SvS directly from View Event without going back to the Admin panel.
- Dynamic announcement text can display a saved translation matching the user’s NEXA language.
- Admin has translation fields for the Important Announcement.

Important limitation:
Automatic translation of arbitrary new announcement text cannot be done safely/reliably from this static Vercel site without connecting a translation API/service. v23 therefore supports per-language announcement translations and automatically displays the correct saved version. The fixed NEXA interface and Prep Form questions are translated automatically.

Steps:
1. Run `v23-supabase.sql` in Supabase SQL Editor.
2. Upload all web files to the GitHub repository root.
3. Open the live event, then Fill Out Prep Form to test a real submission.
