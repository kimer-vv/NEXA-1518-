# NEXA v27 — Guest Access + Private Schedule

This update is the UI layer for the Guest Access SQL you already ran.

Access model:
- Public: Home + View Event.
- Guest: Home + View Event + Fill Prep Form.
- Guest submissions are saved as Guest/Unverified.
- Guest has no My Submissions and no automatic editing later.
- Logged-in verified member: can view private Schedule if they have a claimed WOS account tied to an active listed alliance.
- Scheduler/Admin/Owner: schedule access always allowed through role.
- Public/Guest/Not Listed/no-account users cannot view schedule, even with the direct URL.

Prep Form:
- Non-logged-in visitors can choose Continue with Discord or Continue as Guest.
- Guest enters IGN, Player ID and Alliance, then fills the same Prep Form.
- Guest warning explains the limitations before submission.

Schedule:
- Direct schedule URL calls Supabase `can_view_private_schedule()`.
- Unauthorized users get an access-restricted message instead of schedule data.

No new SQL is required if you already successfully ran the Guest Access + Verified Schedule Access SQL from chat.
