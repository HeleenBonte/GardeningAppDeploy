add new recipe screen
favorites screen
account screen
auth via api
logout after jwt expires
converter logic voor measurements
accessibility
translations:


Short answer: use a mix.

Static UI strings: translate in the app (no DB changes)

Use an i18n library (recommended: react-i18next + expo-localization / react-native-localize).
Keep localized resource files (JSON) per language, load them at startup, and let the user switch locales or auto-detect device locale.
Dynamic/content (crops, recipes, user data): you must store or fetch translations

Option A — Store translations in the DB (recommended for quality & control)
Schema patterns:
Separate translation table: translations(entity_type, entity_id, field, lang, value).
Or JSON/JSONB column per row: translations -> { "fr": { "name": "...", "description": "..." } }.
Or add columns per language (only if few languages and stable): name_en, name_fr, ....
Pros: accurate, searchable, editable by admins, offline-ready. Cons: larger schema + migration/authoring work.
API: accept Accept-Language or ?lang=fr and return localized DTOs (or fall back to default language).
Option B — Machine-translate at runtime (quick but limited)
Call translation APIs (Google/Azure/DeepL) when serving content or on-demand, cache results.
Pros: fast to ship, no DB schema changes. Cons: cost, latency, inconsistent quality, privacy concerns, not great for UI/SEO.
Option C — Hybrid / Translation Management
Use TMS (Lokalise, Phrase) to manage translations, then sync/export translations into DB or static files.
Frontend integration (practical steps)

Static strings: add react-i18next, create locales/en.json, locales/fr.json, initialize i18next in app entry, use t('Home.Welcome').
Content: change API to accept lang and return translated fields when available; client requests /api/crops?lang=fr.
Fallback: implement fallback order — requested locale → default locale → machine-translate cached result.
Caching: cache translations server-side or in CDN to reduce cost/latency for machine translations.
Backend changes (minimal example)

Translation table approach (conceptual SQL):
translations(id, entity_type, entity_id, field, lang, value, updated_at)
API: when building CropResponse, prefer translations for requested lang:
if localized value exists → use it, else use original.
Recommendations

Start by localizing UI with react-i18next.
For content you control (recipes/crops), plan to store translations in the DB or import them from your TMS—this gives best UX.
Reserve runtime machine translation as a temporary fallback, not the main solution.
Provide an admin workflow (or import) to keep translations correct.
If you want, I can:

Add react-i18next scaffolding to the frontend and wire a language switcher, or
Create a sample DB schema + backend DTO changes and example endpoint ?lang=xx, or
Add a simple server-side machine-translate caching example.