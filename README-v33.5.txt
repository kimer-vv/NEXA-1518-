NEXA v33.5 — stability + editing
Run NEXA-v33-5-SQL.sql first, then deploy this ZIP.

Included:
- Standalone SvS Control Panel (Manage/Create/Edit no longer depends on Home deep-links).
- SvS Guide / Ministry Guide / Transfer Guide buttons without leading question marks, with working close controls.
- Direct Ministry Unschedule Appointment action.
- Undo stores/restores player_account_id for new Change Log entries.
- End SvS Event creates an archive snapshot, clears active Prep Requests/appointments, and removes ended cycles from active management.
- History reads archived snapshots; Owner-only permanent delete.
- Alliance Distribution final renderer reads Assigned Alliance directly.
- Transfer application cards show Staff Note preview.
- Transfer review guards missing/undefined internal IDs.
- Copy Coordinates includes State + coordinates.
- Staff Edit Applicant Details for non-identity fields.
- New Transfer submissions receive Application ID + private Edit Token.
- Transfer View Event includes Edit My Application.
- Applicant self-edit requires both Application ID + Edit Token.
- Direct public SvS Prep Form link remains prep-form.html?direct=1.
- Turnstile/Human Verification is NOT included yet; configure it after this build is stable.
