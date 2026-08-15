NEXA — BATTLE FORM PHASE 1

Included:
- battle-form.html
- battle-settings.html
- NEXA-BATTLE-PHASE-1.sql
- Battle Form link activated in event.html
- Battle Form Settings / Open Battle Form shortcuts added to SvS admin areas

Phase 1 behavior:
- Requires a registered NEXA account; IGN / Alliance / Player ID come from player_accounts.
- Multiple registered accounts: player chooses the account. One account: selection is hidden.
- Admin-configurable UTC availability blocks; multi-select + optional Full Availability.
- Role branches are completely separate: Joiner vs Rally Lead.
- Joiner troop quality: FC10 / T11 / T12 independently for Infantry, Lancer, Marksman.
- T12 reveals configurable Skill dropdown.
- Deployment Capacity can be ON/OFF.
- Joiner Heroes are configurable and selected as eligible Lv.5 rally heroes.
- Rally Lead Heroes: Fully Maxed; if No -> Stars 1–5, Skills 1–5, Widget 1–10.
- Experts are configurable separately for Joiners and Rally Leads; Maxed or Current Level.
- Discord Voice question can be ON/OFF.
- Responses save/update per event + player account.

NOT INCLUDED YET:
- Phase 2 Applicants ranking / Troop Score UI.
- Phase 3 Team Planner / Pet Schedule warnings.
- Phase 4 Image Studio / global templates / alliance emblems.

INSTALL:
1. Run NEXA-BATTLE-PHASE-1.sql in Supabase SQL Editor.
2. Upload the files from this ZIP to the repository, preserving paths.
3. Wait for Vercel deployment.
4. In SvS Admin -> Battle Form Settings, configure the active event.
5. Turn Battle Form ON for the event.
6. Test Open Battle Form with a registered player.

IMPORTANT:
Keep your NEXA-STABLE-BEFORE-BATTLE-FORM.zip backup untouched.
