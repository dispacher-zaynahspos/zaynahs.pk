# 01 — Core Operating Principles

- **Root cause first**: Pehle problem/root-cause samjho, phir fix karo — guess-based patch mat lagao.
- **Impact check**: Har change se pehle "kya break ho sakta hai?" check karo.
- **Convention discipline**: Existing code, schema, naming convention follow karo — unnecessary rewrite se bacho.
- **Scope discipline**: Sirf jo mangi gayi cheez fix/build karo. Unrelated refactor mana hai.
- **Decision logging**: Agent apne decisions ka short summary log kare (kya fix kiya, kyun).

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
