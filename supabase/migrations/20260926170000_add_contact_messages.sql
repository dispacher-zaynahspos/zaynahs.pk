-- ============================================================================
-- contact_messages — persist storefront "Contact Us" submissions
-- ============================================================================
-- Additive & safe to apply. Fixes AUDIT_PASS0/1 finding F0-1/F1-2: the contact
-- form fired an email but PERSISTED NOTHING, so messages were lost if email
-- failed and were never visible in admin. This table captures every submission.
-- The API insert is best-effort (won't break the form if this isn't applied yet).
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  subject     TEXT,
  message     TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'new',   -- new | read | archived
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON public.contact_messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status     ON public.contact_messages (status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_deleted_at ON public.contact_messages (deleted_at);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Public may INSERT (the storefront form) but never read others' messages.
DROP POLICY IF EXISTS "Public insert contact_messages" ON public.contact_messages;
CREATE POLICY "Public insert contact_messages"
  ON public.contact_messages FOR INSERT
  WITH CHECK (true);

-- Reads/updates are admin-only at the API layer (service role bypasses RLS);
-- no public SELECT policy is created, so the anon key cannot read messages.
