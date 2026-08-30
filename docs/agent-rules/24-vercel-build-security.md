# 24 — RULE V1: Vercel Build Security & Client Initialization

To prevent Vercel build-time crashes (`Error: supabaseUrl is required` / `Failed to collect page data`):

1. Never use non-null assertions (`!`) on environment variables during top-level module initialization.
2. Always provide a fallback string for any static client initialized at module level (e.g. `|| 'https://placeholder.supabase.co'` for URL, `|| 'placeholder'` for key).
3. This ensures Next.js static compilation and linting analyze files successfully even if env vars aren't loaded in the build system.

Related: `docs/VERCEL_BUILD_FIXES.md` for known build error fixes.
