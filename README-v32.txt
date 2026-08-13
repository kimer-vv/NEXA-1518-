NEXA v32 — Transfer Roster + Next Transfer Waiting List

IMPORTANT: Run NEXA-v32-transfer-waiting-list.sql in Supabase SQL Editor before uploading the web files.

Adds:
1. Transfer Roster
   - Includes ONLY Ordinary, Special Invite, and Open Transfer.
   - Excludes Needs Review, Not Reviewed, and Not Approved.
   - Groups the current month's incoming players into the three categories.
   - Copy List creates a ready-to-paste text roster.

2. Waiting List
   - New status: Waiting List — Next Transfer.
   - Saving an application with this status moves it into a persistent waiting list.
   - The player remains stored even after the current Transfer Cycle ends.
   - Waiting List has its own tab and Copy Waiting List button.
   - Manual Priority is preserved.

3. Full application review
   - New status selector option for Next Transfer.
