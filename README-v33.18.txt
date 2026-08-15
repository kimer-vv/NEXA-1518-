NEXA v33.18 — Remove Strong Accounts Sentence FINAL

Apply on top of v33.14+.

This patch removes ONLY the obsolete standalone sentence:
“Strong accounts matter — but the player behind the account matters just as much.”

Why this version is different:
- The sentence is being injected at runtime by an older translation/UI pass.
- The guard now starts in HEAD before the page body finishes loading.
- It watches the whole document for delayed injections and removes only that legacy sentence.
- The Our Philosophy callout is explicitly excluded and preserved.
- The Transfer Application badge changes to v33.18 so you can confirm the new file is actually deployed.

No SQL required.
