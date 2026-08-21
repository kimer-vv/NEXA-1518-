NEXA V30 — Administration Stabilization + Profile Usability

WHY THIS IS ADDITIVE
The current index.html contains several generations of legacy CSS/JS and V29 is already live. Replacing index.html or nexa-v28-admin-polish.js blindly would risk removing working behavior. V30 is therefore one isolated overlay loaded AFTER V29.

UPLOAD
1) Upload nexa-v30-stabilization.js to the repository ROOT.
2) Open index.html in GitHub Edit mode.
3) Find the existing script line that loads nexa-v28-admin-polish.js.
4) Immediately AFTER it, paste exactly:

<script src="nexa-v30-stabilization.js?v=30"></script>

5) Commit index.html.
6) Keep Maintenance Mode ON while testing.

V30 TARGETS
- Home must not boot into NEXA Access/Admin automatically.
- Removes the old EVENTS / ACCOUNTS / COORDINATION tagline when runtime re-injects it.
- Stellar Signal keeps blinking star treatment and uses cosmic copy.
- Flattens the inner Live Event card to visually match Transfers more closely.
- Standardizes the Administration shell: centered content, one scroll, X at upper-right.
- Direct Administration menu routing for Alliances / Library / NEXA Access / Roles / System Operations.
- Hides duplicate Bug Reports inside Testing/Sandbox when another principal Bug Reports card exists.
- Removes excessive empty min-height in NEXA Access/Roles panels.
- Makes horizontal tabs/generation rails preserve the user's swipe position after release.
- Profile header size normalization.
- Edit Profile/Profile Configuration single vertical scrolling.
- Hides OWNED in troop configuration.
- Restores troop orbit animation without adding a large artificial rectangular plate.
- Adds Library visual alignment pass without replacing Library data logic.
- Suppresses login/create-account flash during authenticated internal transitions.

IMPORTANT TROOP ASSETS
V30 fixes layout/state presentation only. The screenshot backgrounds embedded inside the troop image files themselves cannot be perfectly removed by CSS. The correct permanent visual fix is to clean the source troop assets to transparent PNG/WebP files. Do that as a dedicated asset pass after Administration is stable.

TEST ORDER
1 Home
2 Administration direct routing
3 Alliances layout + X
4 NEXA Access + Roles
5 System Operations / Bug Reports
6 Library
7 Profile horizontal tabs + generation tabs
8 Edit Profile scroll
9 Troops tier / FC state + orbit
10 Safari refresh / close / reopen
