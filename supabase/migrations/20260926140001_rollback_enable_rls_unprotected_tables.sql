-- ============================================================
-- ROLLBACK for 20260926140000_enable_rls_unprotected_tables.sql (S1)
-- Date: 2026-09-26 · Version: v7.0.0-rollback
-- ============================================================
-- One-command revert if enabling RLS on these 4 tables causes any unexpected
-- breakage on a store. Restores the PRIOR state (RLS disabled, no policies) so the
-- tables behave exactly as before the S1 migration.
--
-- Usage: node scripts/run-migration.mjs supabase/migrations/20260926140001_rollback_enable_rls_unprotected_tables.sql
--
-- NOTE: after rollback, subscriber signup still works (it uses the service-role
-- server action which bypasses RLS regardless). Idempotent: safe to re-run.
-- ============================================================

-- homepage_sections
DROP POLICY IF EXISTS "Public read homepage_sections" ON homepage_sections;
DROP POLICY IF EXISTS "Admin all homepage_sections" ON homepage_sections;
ALTER TABLE homepage_sections DISABLE ROW LEVEL SECURITY;

-- whatsapp_subscribers
DROP POLICY IF EXISTS "Public insert whatsapp_subscribers" ON whatsapp_subscribers;
DROP POLICY IF EXISTS "Admin all whatsapp_subscribers" ON whatsapp_subscribers;
ALTER TABLE whatsapp_subscribers DISABLE ROW LEVEL SECURITY;

-- email_templates
DROP POLICY IF EXISTS "Admin all email_templates" ON email_templates;
ALTER TABLE email_templates DISABLE ROW LEVEL SECURITY;

-- schema_version
DROP POLICY IF EXISTS "Authenticated read schema_version" ON schema_version;
ALTER TABLE schema_version DISABLE ROW LEVEL SECURITY;
