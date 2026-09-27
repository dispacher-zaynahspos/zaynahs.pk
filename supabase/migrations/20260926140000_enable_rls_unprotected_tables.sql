-- ============================================================
-- Migration: Enable RLS on previously-unprotected tables (S1)
-- Date: 2026-09-26  · Version: v7.0.0
-- ============================================================
-- Context: DEEP_AUDIT_PLAN.md S1 — these 4 tables had RLS DISABLED entirely,
-- meaning any holder of the public anon key could read (and in some cases write)
-- them directly. This migration turns RLS ON with policies that preserve the
-- app's real access patterns:
--   • homepage_sections    → public SELECT (storefront/customizer client reads),
--                            authenticated full (admin editor).
--   • whatsapp_subscribers → public INSERT only (signup via service-role server
--                            action now; NO public SELECT — protects subscriber PII),
--                            authenticated full (admin console).
--   • email_templates      → authenticated full only (server email-send uses the
--                            service-role key which bypasses RLS).
--   • schema_version       → authenticated SELECT only (metadata).
--
-- Service-role key ALWAYS bypasses RLS, so all server-side reads/writes that use
-- supabaseAdmin continue to work unchanged.
--
-- ⚠️ APPLY + VERIFY ON STAGING FIRST (per store), then production:
--    1. Storefront homepage still renders all sections.
--    2. Newsletter / spin-wheel / exit-intent signup still succeeds.
--    3. Admin can still edit sections, subscribers, email templates.
--    4. `select * from whatsapp_subscribers` with the ANON key returns 0 rows.
-- Idempotent: safe to re-run.
-- ============================================================

-- ---------- homepage_sections ----------
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read homepage_sections" ON homepage_sections;
CREATE POLICY "Public read homepage_sections" ON homepage_sections
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin all homepage_sections" ON homepage_sections;
CREATE POLICY "Admin all homepage_sections" ON homepage_sections
  FOR ALL USING (auth.role() = 'authenticated');

-- ---------- whatsapp_subscribers ----------
ALTER TABLE whatsapp_subscribers ENABLE ROW LEVEL SECURITY;

-- Public may INSERT a signup, but may NOT read the list (PII protection).
DROP POLICY IF EXISTS "Public insert whatsapp_subscribers" ON whatsapp_subscribers;
CREATE POLICY "Public insert whatsapp_subscribers" ON whatsapp_subscribers
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin all whatsapp_subscribers" ON whatsapp_subscribers;
CREATE POLICY "Admin all whatsapp_subscribers" ON whatsapp_subscribers
  FOR ALL USING (auth.role() = 'authenticated');

-- ---------- email_templates ----------
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin all email_templates" ON email_templates;
CREATE POLICY "Admin all email_templates" ON email_templates
  FOR ALL USING (auth.role() = 'authenticated');

-- ---------- schema_version ----------
ALTER TABLE schema_version ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated read schema_version" ON schema_version;
CREATE POLICY "Authenticated read schema_version" ON schema_version
  FOR SELECT USING (auth.role() = 'authenticated');

INSERT INTO schema_version (version) VALUES ('7.0.0') ON CONFLICT DO NOTHING;
