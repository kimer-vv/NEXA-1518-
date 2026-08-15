NEXA v33.20 — Legacy Strong Accounts Line Fix

Apply on top of v33.19.

This patch keeps the restored, fully functional Transfer Form and changes only one thing:
- If an old runtime script injects an extra paragraph between the intro and Our Philosophy,
  that ONE paragraph is hidden/removed.

It does not inspect or remove any form sections, questions, capacity cards, or containers.

No SQL required.

Deployment check:
TRANSFER APPLICATION • v33.20
