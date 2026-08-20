NEXA PLAYER LIBRARY 13 — INSTALLATION

Verified base:
- GitHub main: nexa-player-library 12.js
- GitHub blob SHA: 277a7cbd2a2351e8bbc6541b78bd79366ab1eb6f
- Supabase project: NEXA 1518 (ACTIVE_HEALTHY)

UPLOAD BOTH:
1. nexa-player-library 13.js in the repository root.
2. The complete assets/charms folder, preserving this exact path.

IN index.html REPLACE:
<script src="nexa-player-library 12.js?v=12"></script>

WITH:
<script src="nexa-player-library 13.js?v=13"></script>

Do not rename or flatten assets/charms. The 54 real charm images are loaded from that folder.

Supabase metadata was already synchronized:
- Chief Gear maximum: Legendary T6
- Chief Gear stars: 0–3
- Star progress: 4 stages
- Chief Charms: 3 slots, levels 1–18

V13 COMPLETED:
- Real Charm images for all 18 levels and all three troop types.
- Each Charm image changes immediately with the selected level.
- Three real Charm thumbnails shown on the outer Charm card.
- Snow Ape deployment values corrected.
- Iron Rhino rally-capacity values corrected.
- Expert skill selection now refreshes the visible effect and floating notification.
- Long hero/expert skill descriptions keep a stable card layout.

IMPORTANT VERIFIED LIMIT:
- Supabase contains hero records only through Generation 10.
- Generations 11+ cannot be made visible safely until their real hero records,
  portraits, skills and widget data are loaded. V13 does not invent that data.
