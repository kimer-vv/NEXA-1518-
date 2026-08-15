NEXA v33.19 — Transfer Form Restore

Apply on top of the current deployment.

What this patch does:
- Restores the Transfer Application files from the last fully functional v33.14 baseline.
- Preserves all form questions, capacities, conditional logic, Submit Application,
  Application ID, Edit Token, Copy buttons, Edit My Application, and existing backend flow.
- Removes ONLY the exact standalone duplicate sentence:
  "Strong accounts matter — but the player behind the account matters just as much."
- Keeps the intro paragraph and the Our Philosophy callout.
- The removal script only checks direct <p> children inside the Welcome block;
  it cannot remove form sections or other containers.

No SQL required.

Visual deployment check:
TRANSFER APPLICATION • v33.19
