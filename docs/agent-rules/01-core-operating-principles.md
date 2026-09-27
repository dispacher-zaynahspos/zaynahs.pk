# 01 — Core Operating Principles

- **Root cause first**: Pehle problem/root-cause samjho, phir fix karo — guess-based patch mat lagao.
- **Impact check**: Har change se pehle "kya break ho sakta hai?" check karo.
- **Convention discipline**: Existing code, schema, naming convention follow karo — unnecessary rewrite se bacho.
- **Scope discipline**: Sirf jo mangi gayi cheez fix/build karo. Unrelated refactor mana hai.
- **Decision logging**: Agent apne decisions ka short summary log kare (kya fix kiya, kyun).

## RULE OP1 — No band-aid, permanent global fix only (STRICT)
- **No patch, no band-aid, no "should work now".** Har issue ka **root cause** trace karo (UI → API/action → Supabase client/RPC → DB → cache → response → client state) — phir hi fix karo.
- Fix hamesha **global + reproducible** ho, **per-shop / per-case / per-page hack nahi**. Ek jaisa bug do jagah aa raha hai to ek shared fix, do alag patch nahi.
- Symptom hide mat karo — `try/catch` sirf error nigalne ke liye add karna banned. Real error ko surface karo (UI + logs), tabhi root cause milta hai.
- Agar ek approach do baar fail ho jaye → incremental tweak band karo, root cause diagnose karo, phir fundamentally different approach lo.

## RULE OP2 — Zero leakage (STRICT)
- **Secret leakage**: API keys, service-role keys, tokens kabhi client bundle / logs / responses / git me na jaayein. `NEXT_PUBLIC_*` sirf truly public values ke liye.
- **Data/state leakage**: ek store/user ka data doosre ko na dikhe — RLS + `store_settings` scoping enforce. Global/module-level mutable state me user-specific data cache mat karo (SSR cross-request leak).
- **Stale-data leakage**: save ke baad koi bhi layer purani value serve na kare (see [08-caching-isr-ssr.md](08-caching-isr-ssr.md) RULE C10).
- **Error leakage**: raw stack trace / DB error client ko mat bhejo — structured message do, real detail server logs me.

## RULE OP3 — Fool-proof: verify before "done" (STRICT)
- Kisi fix ko "done" tabhi bolo jab **actual runtime behavior verify** kiya ho — sirf code padh ke assume mat karo.
- Har touched write-path: (a) atomic hai (all-or-nothing, [05-database-supabase.md](05-database-supabase.md) RULE D15), (b) full cache invalidation trigger karta hai (RULE C10), (c) `snake_case` + UUID compliant hai.
- Proof-of-fix checklist mandatory: [12-testing-verification.md](12-testing-verification.md) RULE V1.

## Senior Developer Backend Engineering Habits
1. **Think before you code** — understand the problem before touching the keyboard. ("What problem am I solving?" not "I'll figure it out while coding.")
2. **Read existing code first** — understand the current system before rewriting anything.
3. **Handle errors gracefully** — users need structured responses, not stack traces.
   - ❌ `res.json(error)`
   - ✅ `res.status(400).json({ message: "Invalid email" })`
4. **Write for readability** — self-documenting, clean, maintainable code over clever tricks.
5. **Validate every input** — never trust client input; validate before touching the database.
   - ❌ `User.create(req.body)`
   - ✅ `if(!email){ return res.status(400) }`
6. **Test edge cases** — empty states, missing values, rate limits, network failures — before shipping.
7. **Think like your users** — "My API works" (junior) vs. "Can someone actually use it easily?" (senior).
