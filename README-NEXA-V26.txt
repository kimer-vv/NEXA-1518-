NEXA V26 — CONSOLIDATED FOUNDATION
=================================

UPLOAD LOCATION
Upload EVERY file from this folder directly to the ROOT of the GitHub repository.
Do not create asset folders. V26 intentionally uses unique root filenames so iPhone/GitHub uploads cannot flatten T1-T12 files into collisions.

REPLACE THESE EXISTING ROOT FILES
- nexa-administration-passports 1.js
- nexa-troop-assets-v21.js
- library.html

ADD THESE ROOT ASSETS
- nexa-logo.png               Official full NEXA logo (transparent)
- nexa-icon.png               Official NEXA icon mark (transparent)
- nexa-alliance-emblem-01.png through nexa-alliance-emblem-10.png
- nexa-troop-infantry-t1.webp through t12.webp
- nexa-troop-lancer-t1.webp through t12.webp
- nexa-troop-marksman-t1.webp through t12.webp
- nexa-gear-helmet.webp / watch / coat / pants / belt / shortstaff

SUPABASE
The V26 database migration has ALREADY been applied. Do not run SQL manually.
It adds alliance one-time verification, protected Main-account switching, exclusive alliance-emblem assignment, automatic alliance colors/access codes, and Owner protections.

IMPORTANT TEST ORDER
1. Upload all V26 root files in one commit if possible.
2. Wait for Vercel deployment to finish.
3. Hard refresh NEXA once.
4. Check Home/Menu + Account Constellation.
5. Check Administration > Alliances, NEXA Access, Roles, System Operations.
6. Check Library > Troops and Chief Gear.
7. Keep Maintenance Mode OFF until the new V26 JS is deployed. Then test ON once. V26 verifies the Owner bypass by probing a protected route; if verification fails, it automatically returns Maintenance Mode to OFF.

V26 INCLUDED
- MENU instead of floating HOME behavior + higher positioning.
- Administration sequence A > L > N > R > S.
- NEXA Access search/ficha flow; SBS and Library removed from ordinary module permissions.
- Owner Main account cannot be removed or have module access stripped.
- Roles focuses on Operational Roles and shows Game ID + access summary + Manage Access.
- Alliance Passport with Access Code view/copy/regenerate rules.
- 10 exclusive selectable Alliance Emblems.
- Automatic distinct alliance planet colors; active status dot is green.
- Edit Profile alliance selection with one-time Alliance Access Code verification.
- Edit Profile can move Main protection to a new account.
- Players cannot self-edit Alliance Rank from Profile.
- Profile Alliance emblem decoration.
- Main account constellation uses actual database is_main, stronger glow; secondary planets softer.
- Official NEXA icon mark on Home/auth branding.
- Occasional subtle asteroid shower.
- Safer Maintenance ON/OFF guard and mojibake cleanup.
- Mobile/Safari horizontal overflow safeguards.
- Library generation/category scroll keeps the active selection visible.
- Library Troops uses exact T1-T12 assets with tier buttons.
- Profile Troops uses a scoped troop-only image resolver (no broad Profile image rewrite).
- Library Chief Gear uses stable unique root assets.
- Charms are not modified.

DO NOT DELETE OLD ROOT ASSETS YET.
They are harmless after V26 because the new code references unique nexa-* filenames. Keeping them makes rollback safer.
