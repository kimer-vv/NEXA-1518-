NEXA — Consolidated corrections, 2026-10-10

Upload the CONTENTS of this folder to the ROOT of GitHub repository kimer-vv/NEXA-1518- on branch main, preserving paths. Do not upload the folder as a nested directory.

Changes:
- Administration passport navigation: removed System Operations from normal tab/arrow rotation.
- Standard Administration submenu: removed System Operations shortcut.
- V49: removed automatic State 1518 default and standard System Operations menu shortcut.
- My Alliance: only resolve accounts belonging to the selected State, never fall back to another State.
- Constellation: planets open the account profile without silently changing active account/State.
- Fleet: explicit 'Change to this account' selection, persisted via RPC and clean Home navigation.
- System Operations APIs: independent Developer permission via nexa_platform_roles.developer_mode_allowed, not global owner role.
- Supabase State Owner recognition fix was previously applied directly and verified for States 1518, 1646 and 4136; no SQL upload needed for that fix.

Caution: This is a static-code patch, not an end-to-end browser test. NEXA includes multiple legacy navigation/rendering layers. Test sign-in, Fleet selection, Constellation, My Alliance, State Hub, and Developer Portal after deployment. Keep the original ZIP as rollback backup.
