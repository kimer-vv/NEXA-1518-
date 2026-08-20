NEXA 1518 — ADMINISTRATION V22 ONE-SHOT
Verified production base: kimer-vv/NEXA-1518- @ e41a335abe59aee07ad1b0b8b44c638d2b1e7ec6
Vercel project: nexa-1518
Supabase project: dfxcxboxrkfmrnsgpyin

IMPORTANT
- DO NOT edit index.html.
- The current production index.html already loads:
  nexa-administration-passports 1.js?v=1
- This package deliberately replaces that SAME filename so there is no version-line mismatch.
- Supabase V22 migrations were already applied and verified before this ZIP was built.
- Upload/replace the files in this package preserving their exact paths.

FILES
1) /nexa-administration-passports 1.js
2) /api/nexa-admin-reset-password.js
3) /assets/nexa-v22/*.webp

WHAT THIS PACKAGE CHANGES
ADMINISTRATION
- Independent pages: Alliances | Library | Roles | Module Access | System Operations.
- No mixed content between tabs.
- Compact internal navigation:
  A = Alliances, L = Library, R = Roles, M = Module Access, S = System Operations.
- Floating Home remains independent.
- First-entry Administration Quick Guide.
- Persistent general ⓘ guide + per-section ⓘ guide.
- Alliance constellation / Alliance Passport.
- Alliance password, status, members, R5/R4/R3-R1 grouping.
- Owner/Admin destructive alliance actions use a 24-hour soft-delete countdown.
- R5 can manage alliance ranks below R5 and reset member passwords in own alliance.
- R4 can assign R3/R2/R1.
- Roles is a global alliance-rank audit.
- Module Access is separate from alliance rank and is Owner/Admin only.
- Special access: SvS, SBS, Transfer, Team Builder, Forms, Events, Library, Administration.
- Admin cannot create/remove Admin through this screen; Owner remains protected.

LIBRARY / TROOPS
- Supabase unlock_at column + scheduled generation unlock function applied.
- Troop Library images now use local stable assets.
- Chief Gear cards now use individual gear-piece images instead of one full-body image.
- Chief Charm metadata standardized to 5 substeps per level.
- Profile troop portraits get fit/scale protection; Lancer is intentionally smaller so the face remains visible.
- Fire Crystal selector gets a visual-state synchronization guard.

PASSWORD RESET
- New /api/nexa-admin-reset-password endpoint.
- Owner/Admin can reset member NEXA passwords.
- R5 can reset passwords only for members of their own alliance.
- R5 cannot reset their own password.
- Requires the existing SUPABASE_SERVICE_ROLE_KEY Vercel environment variable used by NEXA auth.

VERIFY AFTER VERCEL DEPLOYS
1) Administration > each tab shows ONLY its own section.
2) Confirm A/L/R/M/S arrows and both guide types.
3) Alliances > open an alliance planet > Passport > grouped members.
4) Roles > confirm global rank layout.
5) Module Access > toggle one harmless module for a test user, refresh, confirm persistence.
6) Library > Heroes Gen 11 > test Hidden / Scheduled / Unlocked.
7) Library > Troops > Infantry/Lancer/Marksman all have images.
8) Library > Chief Gear > Helmet/Watch/Coat/Pants/Belt/Short Staff use different piece images.
9) Profile > Troops > Lancer/Helios face fits inside circle.
10) Profile > Troops > select Fire Crystal, save/refresh, confirm value and highlight agree.

ROLLBACK
- Restore the prior nexa-administration-passports 1.js file from GitHub history.
- The added Supabase columns/functions are backward-compatible; they do not need to be removed for frontend rollback.
