# 25 — RULE AI1: SEO & Copywriting AI Engine

- **Vision models for images**: use vision models (`gemini-2.0-flash` or similar) strictly for image SEO optimization, alt tags, captions, and visual descriptive generation.
- **Text models for copywriting**: use the configured content copywriting model (`ai_settings` content model) to write descriptions, keywords, titles, and schema metadata.
- **Brand context bound**: all copywriting requests must use the brand's general settings (`brand_name`, `store_type`, `target_market`, `tone`, `language`, `address`, `whatsapp_number`, `tagline`) as system context, for personalized, localized descriptions and structured FAQ schemas that maximize local SEO ranking.
- **Form integration**: AI copywriting output must populate storefront description fields directly and update `products`/`categories` tables on generation, keeping storefront data fully synchronized.

Related automation reference: `docs/GEMINI_AUTOMATION_GUIDE.md` (product renaming and listing automation via the free Gemini API).
