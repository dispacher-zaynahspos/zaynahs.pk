# 06 — Git & GitHub Rules

- Every logical change = a separate commit with a clear message (`fix:`, `feat:`, `chore:`).
- Direct push to `main` is banned — feature branch → PR flow.
- Review the diff before committing (catch extra/accidental changes).
- Never commit `.env`, secrets, or `node_modules`.
- Verify no secrets leak into source: `rg "sbp_|ghp_|cfut_" --glob '!.env*' --glob '!.git'` — must return 0 results.
- **Multi-remote push across all projects is STRICTLY manual/on-demand**: Never push or deploy across all remotes (`origin`, `zaynahspk`, `minimahal`, `littlemister`, `lobo`) automatically. Only execute when the user explicitly commands it.
