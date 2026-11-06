# 🧩 ADMIN SUBDOMAIN SPLIT GUIDE (store vs admin hosting)

> **Sawal:** kya store naye Vercel account par aur sirf admin old account par chal sakta hai (e.g. `admin.<domain>`)?
> **Short jawab:** Haan, technically — magar app **ek hi Next.js codebase** hai. Admin ko alag account par le jaane ka matlab hai **poora app dobara deploy** karna + middleware se host restriction. Isliye pehle Option A try karo.

---

## 1. Pehle ye samajh lo

| Cheez | Sach |
|-------|------|
| Codebase | Ek hi repo/app — `/` (store) aur `/admin` same project me hain |
| Database | **Ek hi Supabase** — dono hosts same DB use karenge (kabhi split mat karo) |
| Webhooks | Store domain par point karte hain (`https://<store-domain>/api/revalidate`) |
| Admin code alag karna | Bina alag repo/app ke possible nahi — host gating hi "split" hai |
| Cache | Har Vercel project ka cache alag hota hai |

**Golden rule:** DB ek, webhooks store domain par, admin host sirf `/admin` serve kare.

---

## 2. Option A — Recommended (ek project, new account)

**Kya karna hai:** store project (new account) par `admin.<domain>` ko **second domain alias** ke tor par add karo, phir middleware se host gate karo.

```
store.<domain>  ─┐
                 ├──► SAME Vercel project (new account)
admin.<domain>  ─┘
```

**Steps:**
1. Cloudflare → DNS → `admin` subdomain ka record add karo (proxied ON), store wale project jaisa hi.
2. Vercel → project → Settings → Domains → `admin.<domain>` add karo (verified hona chahiye).
3. `middleware.ts` me host check:
   - `admin.<domain>` par sirf `/admin`, `/api/admin`, auth routes allow
   - `/` ya store routes → `admin.<domain>/admin` par redirect
   - `store.<domain>` par `/admin` → 404 (F6 defense-in-depth)
4. `NEXT_PUBLIC_SITE_URL` **store domain hi rahe** (canonical/OG/sitemap ke liye)
5. Auth cookie ka `Domain=.<domain>` set karo taake subdomain par login chale
6. Ek deploy + smoke test

**Faide:** ek build, ek env set, ek project, cache consistent. **Nuqsan:** admin aur store same account par.

---

## 3. Option B — Old account sirf admin ke liye

**Kya karna hai:** same repo ko old account me **doosra project** banao, us par `admin.<domain>` lagao, aur middleware se sirf admin allow karo.

```
store.<domain>  ──► Project 1 (new account) — store + admin band
admin.<domain>  ──► Project 2 (old account)  — sirf admin, store band
                         │
                         └── same Supabase DB
```

**Steps:**
1. Old account me repo import karo (naya project) — **project transfer nahi, naya project hai**.
2. Same env vars push karo (`SUPABASE_*`, `REVALIDATE_SECRET`, etc.).
3. `admin.<domain>` Vercel par add karo — naye account/project par domain verification ke liye **DNS TXT** lagega (Cloudflare DNS edit permission chahiye).
4. `middleware.ts` host gating (dono projects me same code):
   - Admin project: sirf `/admin` + admin APIs
   - Store project: `/admin` blocked
5. Auth cookie `Domain=.<domain>`
6. Admin writes ke baad store cache purge ke liye `REVALIDATE` call store domain par hi jaye (already domain-based hai)
7. Dono projects ka deploy + smoke test

**Faide:** admin old account par isolate. **Nuqsan:**
- 2 projects = **double build quota** (RULE VERCEL-QUOTA risk)
- Dono env sets sync rakhne padte hain
- Har code change par dono deploy
- Domain verification dobara (TXT)
- Cache/cookies ke edge cases zyada

---

## 4. Kaunsa chuno?

| Situation | Choice |
|-----------|--------|
| Bas admin URL alag chahiye, account same chalega | **Option A** ✅ |
| Admin ko legally/compliance ke liye alag account chahiye | Option B (risk samajh kar) |
| Build quota tight hai | **Option A** |
| Team sirf admin panel use karti hai, store alag | Option A + admin subdomain |

---

## 5. Dono options me MUST (common rules)

- [ ] Database **ek hi** — admin/store ke liye alag Supabase mat banao
- [ ] Webhooks/triggers store domain par hi rahenge
- [ ] `admin.<domain>` **noindex** (admin already noindex + robots)
- [ ] Store project par `/admin` blocked (F6 defense-in-depth)
- [ ] Admin project par store routes blocked/redirect
- [ ] `SUPABASE_SERVICE_ROLE_KEY` sirf server-side
- [ ] Auth cookie `Domain=.<domain>` (warna subdomain par login fail)
- [ ] Cloudflare me admin subdomain **proxied**
- [ ] Ek final deploy, phir smoke test (home, shop, product, admin login, webhook, order)

---

## 6. Smoke test (both options)

| Test | Expected |
|------|----------|
| `https://<store-domain>/` | 200 |
| `https://<store-domain>/admin` | 404 / redirect (blocked) |
| `https://admin.<domain>/admin/login` | 200 |
| `https://admin.<domain>/` | redirect → `/admin` |
| Admin login | success |
| Product edit (admin) | store par ~10–15s me update |
| Supabase `net._http_response` | recent `200` + `revalidated:true` |

---

## 7. Rollback

- Option A: `admin.<domain>` alias remove karo + middleware host check hatao → ek deploy
- Option B: admin project delete karo + `admin.<domain>` store project par alias karo → ek deploy

---

**Related:** [VERCEL_ACCOUNT_SWITCH_GUIDE.md](VERCEL_ACCOUNT_SWITCH_GUIDE.md) · [07-deployment-vercel-cloudflare.md](agent-rules/07-deployment-vercel-cloudflare.md) · [16-multi-system-architecture.md](agent-rules/16-multi-system-architecture.md)
