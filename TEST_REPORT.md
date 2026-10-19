# Test report — 2026-10-19

## Source and production access

The attached repository ZIP was inspected. The current GitHub versions of Hub, Transfer, Ministry, and their current versioned entries matched the ZIP byte-for-byte by Git blob SHA. The shared workspace script was also read from GitHub. Live Supabase columns, auth/access RPC definitions, the six foundation tables' constraints/RLS, and migration history were inspected. The prior migration `20261019214911` was confirmed applied. Live invalid-token calls returned `session_expired` as expected.

No valid production Staff token was retrieved or used. No production data, grants, passwords, accounts, or schema were changed. No GitHub writes or Vercel deployment occurred.

## Passed locally

- Integration SQL compiles and reruns idempotently in isolated PGlite. The six foundation tables use the exact already-applied SQL, including their checks, keys, foreign keys, indexes and RLS. Other legacy table columns/defaults come from inspected schema fixtures.
- Invalid token denial; Global Owner opens authorized Transfer/Ministry without legacy membership rows; verified linked identities resolve consistently; unverified foreign active identities do not grant access.
- Transfer persistence/reload, revision conflict rejection, and server-enforced waiting-tail placement after an approved failure. Copy summaries preserve names, IDs, states, alliances, headings and waiting order.
- Private alliance isolation, including denial to an Event Admin assigned to another alliance. Session creation/history and admin-only session changes.
- FDT host groups, server maximum 60, persisted members, duplicate placement rejection, and Foundry Legion 1 rendering.
- Immutable form versions; public blank first-time forms; required/type/option validation; role targeting; receipt-based updates limited to selected sections; cross-event authorized prefill without overwriting the earlier event; no Game ID-only profile retrieval/update.
- Closure blocks new tickets; preclosure tickets receive bounded grace; expired grace and ticket replay are rejected.
- Module-scoped Staff grants, self-change denial, protected owner denial, exact access levels, pending invitations, Event-only sign-in, suspension, restore, expiry/finalization, and account preservation. WOS explicit grants and deletion/restoration also synchronize the legacy WOS permission registry.
- Anonymous direct access to new tables and finalizer execution is denied.
- jsdom workflows against real local database RPCs: Transfer add/edit/save/copy; Alliance member add/save; Session create; Foundry roster save; Form add/save/preview/link; Staff add/delete/restore; public form submit/receipt.
- Transfer/Ministry DOM auth regression tests use actual local session/hub RPCs with mocked workspace snapshots: owner shells open, and network errors retain tokens without redirecting. WOS/Gift shared gates pass against minimal DOM fixtures.
- 16 external/inline JavaScript syntax checks; HTML parsing and duplicate-ID checks; 34 local path/image references, including all six emblem files directly under `nexa_alliance_selection/`.
- Generated `.xlsx` opens with openpyxl; names/IDs survive, and formula-looking text remains an inert string.

Reproducible tests are included under `tests/`; fixture accounts/tokens are synthetic. Crypto tests use shims, not a validation of production bcrypt/randomness. See `tests/README_TESTS.md`.

## Not verified / production blockers

1. The integration SQL and cleanup schedule are **not applied**. New pages depend on these RPCs and cannot function against the old schema alone. Applying them still needs authorization.
2. No real signed-in production round trip, existing-password regression, linked-account browser switch, real Supabase write/reload, Discord/Gift/Reminder delivery, or full legacy-module regression was performed.
3. A visual browser was unavailable: Chromium installation failed because downloaded archives were invalid/truncated. jsdom does not validate Safari behavior, responsive rendering, visual layout, or physical print pagination. These need a real browser before production approval.
4. Cron execution was not tested against live `pg_cron`. The pending job must be installed and observed after approval.

**Production readiness: NO.** This is a complete code release candidate for branch review and controlled database/browser acceptance, not a claim of an already-deployed or production-validated integration.
