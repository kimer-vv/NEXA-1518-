# NEXA v28.9 — Public Transfer Application

Implemented from the approved Transfer Form specification:

- Public Transfer link is isolated:
  - no Home link
  - no Admin link
  - no NEXA navigation
  - no Schedule / History / Applications access
- Token ties the form to one Transfer Cycle.
- If the cycle is not Open + Applications Open, the link shows that applications are closed and cannot submit.
- Approved short State 1518 welcome copy.
- Collapsible “How does State 1518 run major events?” section:
  - Frostdragon Tyrant (FDT)
  - Tundra Arms League (TAL)
  - Sunfire Castle & Presidency
  - SvS Prep & Battle
- Required acknowledgment of the coordinated state-event structure.
- Recruiting Alliances are loaded dynamically from the selected Transfer Cycle.
- Only alliances marked Recruiting appear.
- Saved Bear / Foundry / Canyon / Other Event schedules appear automatically in UTC.
- Flexible / any recruiting alliance remains available.
- Full applicant form and conditional Labyrinth threshold remain.
- Application ID is shown after submission.
- Submissions continue to go directly into Transfer Applications.

No new SQL is required for v28.9 if v28.6 SQL was already run successfully.
