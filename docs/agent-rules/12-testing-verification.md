# 12 — Testing & Verification Rules

- After every fix/feature: test happy path + at least 1 edge case.
- Critical flows (checkout, payment, stock) require mandatory manual/auto testing.
- Before a breaking change: run existing tests/build first.
- Test empty states, missing values, rate limits, and network failures before shipping (see [01-core-operating-principles.md](01-core-operating-principles.md), Senior Habit #6).

Full test suite reference: `docs/STORE_TESTING_GUIDE.md`.
