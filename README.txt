NEXA Teams — Shared Phase 1

Run NEXA-TEAMS-SHARED-PHASE1.sql first.

Replace/add:
- alliance-teams.html
- alliance-formations.html
- team-builder.html
- alliance-team-history.html

This converts Teams and Alliance Formations from preview/localStorage to shared Supabase data.

Team Builder now activates:
- Add Rally Leader from submitted responses
- Add Joiner from submitted responses
- Joiner single-assignment rule per Event Type
- Moving a Joiner removes the old Team assignment after confirmation
- Rally Leaders may be in multiple Teams/alliances
- Pet Windows with Start/End UTC
- Pet overlap warning (does not hard block)
- Remove members
- Change History / audit trail

Hero assignment is intentionally the next Team Builder step.
