NEXA • PHASE 2A — SUPABASE INTEGRATION

The Phase 2A SQL must already have returned SUCCESS before uploading this ZIP.

Replace in GitHub:
- event-operations.html
- battle-settings.html
- battle-form.html

What is now connected to Supabase:
- Event Types: add / activate / deactivate / delete.
- Battle Form Settings saved separately per Event Type.
- Question Library: create / edit / reuse / activate.
- Event Questions load only for their assigned Event Type (+ All Events).
- Arrange order saves to event_form_layouts.
- Open Form reads the selected Event Type template and custom questions.
- SvS keeps its current live submission flow and can store custom_answers.

Important Phase boundary:
- TAL / FDT / custom forms can now be built, saved, refreshed, opened and previewed.
- Their submitted-response persistence is Phase 2B, because Phase 2B is the new
  event-separated Submitted Forms / Rally Leaders / Joiners response system.
