# 06 — Git & GitHub Rules

- Every logical change = a separate commit with a clear message (`fix:`, `feat:`, `chore:`).
- Direct push to `main` is banned — feature branch → PR flow.
- Review the diff before committing (catch extra/accidental changes).
- Never commit `.env`, secrets, or `node_modules`.
- Verify no secrets leak into source: `rg "sbp_|ghp_|cfut_" --glob '!.env*' --glob '!.git'` — must return 0 results.
