NEXA v32.3 — Language Expansion

No SQL required unless your Supabase user_profiles.language column has a custom CHECK constraint.

Automatic device/browser detection now supports:
- English
- Español
- Türkçe
- 한국어
- العربية
- Português (pt / pt-BR / pt-PT)
- Русский
- Українська
- Français
- Italiano
- 简体中文 (zh / zh-CN variants)
- 日本語

English is the fallback for unsupported device languages and for any translation key that has not yet been localized.

This update touches only the i18n/language layer and Home language selector.
It does NOT change SvS scheduling, Transfers, applications, permissions, or Supabase data logic.
