NEXA v33.29 — Site-wide Human Verification

Purpose:
- Verify a visitor once when entering NEXA.
- After successful verification, navigation across NEXA does not ask again during the browser session.
- Direct links to Transfer/SvS/forms are covered because every included HTML page loads the same gate.
- The visitor remains on the exact URL they opened; there is no forced redirect to Home.

Security:
- Cloudflare Turnstile token is validated server-side through Siteverify.
- TURNSTILE_SECRET_KEY stays in Vercel Environment Variables.
- Successful verification creates an HttpOnly + Secure + SameSite=Lax session cookie.
- Cookie has no Max-Age/Expires, so it is a browser-session cookie.
- A 12-hour safety cap forces re-verification if the browser restores an old session.

Required Vercel variable:
- TURNSTILE_SECRET_KEY (already configured)

No Supabase SQL is required.
Do NOT use the previous Transfer-submit-only Turnstile patch or its SQL.
