NEXA v33.21 — Translation Source Fix

Root cause found:
transfer-i18n-full-data.js had the obsolete Strong Accounts sentence embedded
inside the translated "intro" value after <br><br>. The translation script
replaced the visible intro at runtime, which is why HTML/CSS cleanup patches
could not permanently remove it.

Fixed:
- transfer-i18n-full-data.js: removed the obsolete second paragraph from intro
  in every language.
- transfer-i18n-en.json: synchronized source translations.
- legacy transfer-apply-v*.html pages: removed the old standalone sentence.
- Current Transfer Application badge: v33.21.

Preserved:
- Welcome introduction.
- Our Philosophy callout.
- All Transfer form questions and logic.
- Application ID / Edit Token / self-edit / submission flow.

No SQL required.
