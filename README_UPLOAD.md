# NEXA Quick Operations — upload instructions

**Status: release candidate for a GitHub branch. NOT cleared for production.**
The implementation is included; new database RPCs and the cleanup schedule are pending. Real signed-in browser acceptance remains required. No GitHub write, Vercel deployment, production migration, or production data removal was performed in this session.

## Upload exactly this package

1. Open `kimer-vv/NEXA-1518-` and create a new branch, such as `quick-operations-20261019`. Do not upload directly to `main`.
2. Unzip this package. Upload its **contents into the repository root**. Do not upload the ZIP itself or create a containing `release/` folder.
3. Replace these existing root files: `staff-workspaces.html`, `transfer-workspace.html`, `ministry-workspace.html`, `nexa-staff-workspace-shared-v1.js`.
4. Add all other files at their included relative paths, including `sql/` and `tests/`. Keep every other existing repository file and directory. Open a PR for review; do not merge or deploy until the database and acceptance checks below are complete.

New root entry pages: `quick-operations.html`, `staff-access.html`, `event-registration.html`. Their JavaScript and CSS files are at the root beside them. No new Vercel API functions or production npm dependencies are needed.

Existing versioned Transfer/Ministry entry pages remain in place: they load the corrected base HTML files. Existing WOS Utilities, Gift Codes, Event Reminders, Discord features, and other modules are retained.

## Database — separate authorization still required

- **Already applied — DO NOT rerun:** `sql/ALREADY_APPLIED_20261019214911_safe_foundation.sql`. This is the exact inspected migration retained as a reference. Its six tables are reused.
- **New / pending:** `sql/20261019223348_nexa_quick_operations_integration.sql`. Test on a non-production copy first. After approval, apply it to `dfxcxboxrkfmrnsgpyin` before activating the new pages. It creates storage/RPCs and replaces the listed auth/access functions; it does not rewrite existing passwords, identities, or memberships.
- **New / pending automation:** `sql/PENDING_AUTOMATION.sql`. Requires `pg_cron` enabled. After approval, apply once to schedule hourly removal finalization. Without this schedule, access suspension and the seven-day restore window still work, but finalization is not automated.

Assign existing Staff their global alliance explicitly in Manage Staff Access. Existing WOS assignments are not guessed or automatically migrated. Changing an existing global alliance requires Global Owner because it affects private data scope across modules. WOS uses an exact state/tag mapping between the established bigint alliance registry and its separate UUID registry; missing/conflicting mappings produce an error rather than silently moving membership.

## First use after approval

1. Sign in as Global Owner. Verify Transfer and Ministry open from Workspace Hub with the selected linked account/state. Verify WOS Utilities, Gift Codes, and Event Reminders using real data.
2. Open Quick Operations. Transfer List uses an independent shared tracker per State; it does not replace or overwrite the original Transfer Workspace applications/cycles. Save before leaving. Remaining invitations mean total minus reserved Approved/Transferred applicants. Choose **Unsuccessful → Waiting** to append an approved applicant below existing waiting applicants.
3. Assign Staff their global alliance and Event Participation access. Alliance Management permits only the assigned alliance; Event Admin alone does not broaden private-profile access. Global Owner is the explicit exception.
4. Create an event session, configure/save a Form Builder version, and open registration. Publish the public form link. Test a first-time submission and a returning submission with its private receipt; Game ID alone never retrieves a profile. Receipts can prefill a future event in the same State.
5. Create FDT groups by host alliance (maximum 60), or Foundry Legion 1/2. Paste `Original Alliance | Game Name | Game ID` in the roster editor. Save, export Excel, and check the print layout.
6. Test a scoped Staff removal and restore with test accounts. Removal suspends only managed modules and revokes affected Staff tokens; restored Staff sign in again. Confirm the cron job exists before approving production.

Tests and limitations: `TEST_REPORT.md`. Reproduction commands: `tests/README_TESTS.md`.
