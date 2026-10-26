# 06 — Git & GitHub Rules

- Every logical change = a separate commit with a clear message (`fix:`, `feat:`, `chore:`).
- Direct push to `main` is banned — feature branch → PR flow.
- Review the diff before committing (catch extra/accidental changes).
- Never commit `.env`, secrets, or `node_modules`.
- Verify no secrets leak into source: `rg "sbp_|ghp_|cfut_" --glob '!.env*' --glob '!.git'` — must return 0 results.
- **RULE GIT-STRICT-APPROVAL — Absolute User Approval Required for ANY Push / Deploy**: NEVER push to any Git remote (`origin`, `dispacher-zaynahspos`, `infominimahal-bit`, `littlemisterpk-cell`, `infolobopk-lgtm`, or any other) and NEVER trigger any Vercel deployment without explicit, affirmative user command in the chat (e.g. user explicitly says "push karo", "deploy karo", "push now"). All code edits, fixes, and verifications must stay 100% local until the user explicitly approves pushing.
