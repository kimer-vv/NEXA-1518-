NEXA — SvS DELETE permission fix

Problem:
SvS responses are stored in battle_form_responses and Supabase returns:
permission denied for table battle_form_responses

What to do:
1. Open Supabase.
2. Go to SQL Editor.
3. Open svs-delete-permission-fix.sql.
4. Copy/paste the SQL and Run it.
5. Return to NEXA > Event Operations > Responses > SvS.
6. Test the individual × first, then Select/Delete Selected.

This does not change TAL/FDT response deletion and does not change the NEXA page files.
