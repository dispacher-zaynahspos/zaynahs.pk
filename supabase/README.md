# supabase/ — schema and migrations

## Purpose
Database definition only.

## Belongs here
- `migrations/` — numbered, immutable SQL migrations (`YYYYMMDDHHMMSS_name.sql`)
- `schema/SUPER_MASTER_SCHEMA.sql` — full current schema (single source of truth)

## Does not belong here
- App data access → `lib/supabase/` + `lib/services/`
- Seed/demo data → `scripts/`
- Secrets (`service_role` key) → env only

## Rules
- snake_case columns, UUID primary keys, RLS on every data table (RULE D13/D14).
- Every migration must be reflected in `SUPER_MASTER_SCHEMA.sql` — `npm run check:setup` blocks drift.
- Destructive/live changes ship as reviewable migrations and are applied after review.
- Never edit an applied migration; add a new one.
