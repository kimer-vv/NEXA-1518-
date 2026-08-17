NEXA PATCH V41 — NOTES EXPORT + UTC FIX

Built on V40.

Micro-fix only:
- Keeps the current Notes block position, width, height and content layout.
- NOTES remains vertical on the left, slightly larger and inset.
- Replaces CSS writing-mode with a normal horizontal label rotated -90deg.
  This is specifically to make PNG/PDF/html2canvas export match the preview.
- Forces ALL TIMES ARE IN UTC to the lower-right beneath Formations.
- Does not change Teams, Important, Legend, Formations, header, or page structure.
