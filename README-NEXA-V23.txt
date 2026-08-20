NEXA Administration V23 — Consolidated functional patch
Base verified before build:
- GitHub production commit: 761e2d622beeb19e5e24450783009f5f38a71b95
- Vercel project: nexa-1518 (latest deployment READY on that commit)
- Supabase: dfxcxboxrkfmrnsgpyin

UPLOAD / REPLACE THESE PATHS EXACTLY:
1) nexa-administration-passports 1.js  (replace existing root file)
2) api/nexa-admin-reset-password.js    (replace existing API file)
3) All nexa-v23-*.webp files           (upload at repository ROOT)

NO index.html edit is required.
The existing index.html already loads:
  nexa-administration-passports 1.js?v=1

Supabase status:
- V22 Administration functions / unlock_at migration remain installed.
- Chief Gear + Troop Library image_url values were updated to the root V23 asset filenames.
- Chief Charm records / mappings were NOT modified.

V23 functional scope:
- Administration Quick Guide only triggers when Administration is actually open.
- Administration top-level navigation is isolated and normalized to A/L/R/M/S order.
- Arrow controls use letters only.
- Alliances enhanced planet/passport UI remains; legacy Alliance UI is hidden in that section.
- Roles enhanced audit remains; legacy placeholder hidden.
- Permissions is presented as Module Access; searchable player access list.
- System Operations keeps existing Maintenance / Recovery and adds visible Testing framework.
- Testing framework shows Test Mode Off / Test Mode / Test Mode Auto, Permission Preview, Battle Sandbox; activation intentionally disabled for future phase.
- My Profile only: redundant Owned/Own It controls hidden; Save infers ownership from entered data where an existing hidden owned field is present.
- My Profile Heroes / Experts / Pets receive per-item Reset using the existing Save path.
- My Profile gates: Pets Furnace 18 (+ local Yes/No server-unlock question), Chief Gear Furnace 22, Charms Furnace 25.
- My Profile Troop portrait framing is normalized across tier changes; Lancer receives extra zoom-out space.
- Existing Fire Crystal selected-state guard is preserved.

PROTECTED / NOT REDESIGNED:
- Library Chief Gear logic/layout was NOT rewritten. Only its image asset paths were repaired.
- Library Charms data, logic, mapping and images were NOT changed.
- No final galaxy/background/tab visual redesign in this patch.
- No Sunfire Castle visual redesign.
- Battle Sandbox / Permission Preview do not impersonate, write permissions, or run battle AI yet.
