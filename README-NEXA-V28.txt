NEXA V28 — CONSOLIDATED CORRECTION
==================================

UPLOAD LOCATION
Upload these files directly to the ROOT of the GitHub repository.
Do not create a folder.

REPLACE
- nexa-troop-assets-v21.js
- maintenance.html

ADD
- nexa-v28-admin-polish.js

SUPABASE
Already applied. Do NOT run SQL manually.
V28 adds the protected Owner/Admin RPC for deleting a full player account from NEXA.
Alliance Access Codes are already generated automatically by NEXA; existing alliance codes were verified.
Maintenance Mode is currently ON in Supabase.

WHAT V28 FIXES / POLISHES
- Administration submenu opens the selected section directly instead of always landing on Alliances first.
- Avoids unnecessary full-page reloads between Administration sections, reducing repeated Human Verification screens.
- Administration X is fully visible at top-right and closes the actual Administration layer.
- MENU is aligned inside the Administration visual area while Administration is open.
- One-scroll Administration layout; no nested page scroller added.
- Removes duplicated info icon; the blue section info control opens the detailed Quick Guide.
- Quick Guides remain explanatory for Alliances, NEXA Access, Roles, System Operations and Library.
- Roles stays read-only / visual dashboard with neon cards; edits route to NEXA Access.
- Transient Roles/NEXA Access “Load failed” gets one controlled retry.
- System Operations keeps one primary Bug Reports block; duplicate bug-report controls inside Testing are removed.
- Adds a protected “Delete NEXA Account” action next to special-access removal for non-protected accounts.
- Home Main identity/glow re-applies after auth/render events instead of requiring a manual refresh.
- Removes fixed visual State 1518 references from Home and Maintenance screen; keeps NEXA portable.
- Removes “Tap to open” above Live Event/Event Operations.
- Restores the NEXA daily inspirational signal on Home.
- Horizontal category/generation rows remember where the user scrolled instead of snapping back to Epic/Gen 1.
- Library adopts the compact My Profile galaxy-card language and consistent MENU/info/X shell.
- Troop art removes the rectangular screenshot plate and leaves the game hex floating over NEXA space.
- Profile Troops syncs exact saved tier image from player inventory.
- Fire Crystal level gets a visible crystal-style FC badge.
- OWNED label is hidden in Troop configuration.
- Old document-wide troop MutationObserver remains removed to avoid lag/freezing.

IMPORTANT TEST ORDER
1. Upload all 3 code/page files in the same GitHub upload/commit.
2. Wait for Vercel production deployment to show READY.
3. Hard refresh Safari once.
4. HOME: confirm identity + strong Main glow immediately, no manual refresh needed.
5. MENU > Administration > System Operations: it must open System directly.
6. Test Alliances, NEXA Access, Roles and System navigation; X must close correctly.
7. NEXA Access: test a NON-OWNER player checkbox for Operational Role + Module Access.
   Owner Main controls are intentionally protected/disabled.
8. Test Remove Special Access separately from Delete NEXA Account.
9. Library: drag category/generation rows to the right and release; they must stay there.
10. Profile > Troops: verify Infantry/Lancer/Marksman tier image changes and FC badge.
11. Maintenance is already ON. Use a normal/private unauthenticated session to confirm public blocking; Owner session should continue through bypass.

DO NOT TURN MAINTENANCE OFF until this verification pass is complete.
