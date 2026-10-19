Run from the repository root AFTER overlaying this package onto the existing repository:

```
npm --prefix tests ci --ignore-scripts
node tests/dbtest.mjs
node tests/domtest.mjs
node tests/authtest.mjs
node tests/qa.mjs
```

These tests use an isolated PostgreSQL-compatible PGlite database with synthetic accounts. They do not connect to production. The six existing foundation tables are created from the inspected, already-applied SQL. Other legacy table columns and defaults are fixture metadata from the inspected live schema; this does not reproduce every production trigger or policy.

The fixture supplies crypto wrappers: SHA-256 uses PostgreSQL sha256; random bytes and bcrypt are test shims. Production uses the existing pgcrypto extension. Password cryptography and Supabase HTTP transport are NOT validated by this fixture.

DOM tests use jsdom, not a visual browser. Transfer/Ministry tests exercise the actual new session/hub RPC against the local database but mock the workspace snapshots. WOS/Gift tests cover the shared gate in a minimal DOM only. These are not claims of end-to-end production validation.

Outputs are written under tests/. Do not upload node_modules or generated test outputs back to GitHub.
