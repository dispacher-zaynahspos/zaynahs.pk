# 🔁 VERCEL ACCOUNT SWITCH GUIDE (old ⇄ new) — beginner + agent friendly

> **Kaam:** kisi store ka Vercel project ek account se doosre account par le jaana (ya wapas laana) **bina domain/webhook todhe**.
> **Rule:** Project ko **TRANSFER** karo — naya project **IMPORT nahi**. Transfer se domain verification, Git link aur env vars saath chalte hain; import se domain dobara verify karna padta hai (naya DNS TXT).

---

## 1. Pehle ye samajh lo (2 minute)

| Cheez | Account switch par kya hota hai |
|-------|----------------------------------|
| Vercel project (builds, deployments) | ✅ Project ke saath move hota hai |
| Env vars (Supabase, secrets) | ✅ Project ke saath move hote hain (phir bhi verify karo) |
| Git link (auto-deploy) | ✅ Saath aata hai |
| Custom domain verification | ✅ Saath aati hai — **DNS change nahi chahiye** |
| Cloudflare cache rules | ❌ Change nahi hoti — ye domain-based hai |
| Supabase webhooks/triggers | ❌ Change nahi hote — ye `https://<domain>/api/revalidate` hit karte hain |
| Vercel token / team ID | ⚠️ Env file me update karna padta hai |

**Golden line:** Domain, Cloudflare aur Supabase kisi Vercel account se bandhe nahi — wo sirf domain se bandhe hain. Jo account domain serve karega, site wahi chalegi.

---

## 2. Before you start (checklist)

- [ ] Dono accounts ke token: **source** (jahan se nikal rahe ho) + **destination** (jahan le ja rahe ho)
- [ ] Dono ke **Team ID** (personal account ho to team ID nahi chahiye)
- [ ] Project ka **ID** (`prj_...`) — Vercel project → Settings → General
- [ ] Domain pehle se **source** project par verified hai
- [ ] Koi **duplicate project** destination me nahi bana hua (bana ho to pehle delete karo — ek store = ek project)
- [ ] Supabase/Cloudflare me kuch change nahi karna — bas end me test karna hai

**Token kahan se:** https://vercel.com/account/tokens → Create Token (Full Account, no expiry)
**Team ID kahan se:** https://vercel.com/account → Team Settings → Team ID

---

## 3. Transfer karo (3 commands)

```bash
# 1) Source team se transfer request banao
curl -s -X POST \
  -H "Authorization: Bearer $SRC_TOKEN" \
  "https://api.vercel.com/v9/projects/$PROJECT_ID/transfer-request?teamId=$SRC_TEAM_ID"
# response me "code" milega

# 2) Destination team se accept karo
curl -s -X PUT \
  -H "Authorization: Bearer $DST_TOKEN" \
  "https://api.vercel.com/v9/projects/transfer-request/$TRANSFER_CODE?teamId=$DST_TEAM_ID"
```

✅ Success ke baad: project **same ID**, same Git link, same env vars, domain **verified = true**.
❌ Agar domain `verified=false` dikhe → matlab transfer nahi, naya import hua hai. Ruk jao, project delete karke transfer dobara karo.

---

## 4. Env files update karo (sirf ye keys)

`env-backups/<store>.env.local` **aur** root `.env.local` — dono me:

```bash
# Purana account — sirf rollback ke liye (label account ke naam se)
VERCEL_TOKEN_<OLD_LABEL>=<old token>

# Naya account — ACTIVE (scripts yahi padhti hain)
VERCEL_TOKEN=<new token>
VERCEL_TEAM_ID=<new team id>
VERCEL_TEAM_SLUG=<new team slug>
VERCEL_ACCOUNT_LABEL=<new account label>
VERCEL_PROJECT_NAME=<same project name>
```

> Scripts (`vercel-setup.mjs`, `post-deploy-fix.mjs`, bulk ops) sirf `VERCEL_TOKEN` + `VERCEL_TEAM_ID` padhti hain.
> Purana token **delete mat karo** — rollback ke liye rakho. Lekin runtime env me push mat karo (setup script `VERCEL_TOKEN_*` skip karta hai).

---

## 5. Project env vars verify karo

Transfer ke baad project → Settings → Environment Variables check karo.

- Sab keys maujood → aage badho
- Koi missing → `npm run clone:setup -- --store=<store> --deploy --yes` (idempotent hai) ya env push script chalao
- **Kabhi bhi** `SUPABASE_SERVICE_ROLE_KEY`, `REVALIDATE_SECRET` client-side expose na karo

---

## 6. Ek deploy + domain check

1. Destination account se **ek** deploy karo (push ya `vercel --prod`).
2. Deploy READY hone ke baad project → Domains me dekho:
   - `<domain>` → **Valid / Verified ✅**
   - `www.<domain>` → **Valid ✅**
3. Dono URLs browser me kholo — 200 aana chahiye.

> **RULE:** wasteful deploys na karo. Sab changes pehle local me complete karo, phir **ek final deploy**.

---

## 7. Cache purge + smoke test

```bash
# Cloudflare purge (script har zone purge karti hai)
node scripts/post-deploy-fix.mjs
```

Manually verify:

| Test | Kya dekhna hai |
|------|----------------|
| Home `/` | 200, images/price sahi |
| `/shop` | 200, products load |
| Product page | 200, price sahi |
| `/cart` | 200 |
| `/admin/login` | 200 |
| Webhook | Supabase → Database → `net._http_response` me recent `status_code = 200` + `{"revalidated":true}` |
| Price update | DB me price badlo → 10–15s me site par naya price |
| Order test | Ek test order banao → DB me verify → cancel/delete |

Webhook/trigger list check:
```sql
select tgname from pg_trigger where tgname ilike 'revalidate%';
```

---

## 8. Purane account ki safai (verification ke BAAD)

- Source account me **koi project na bache** (transfer ke baad khud khatam ho jata hai)
- Source account ke Domains me stale `<domain>` entry ho to delete karo:
  ```bash
  curl -s -X DELETE -H "Authorization: Bearer $SRC_TOKEN" \
    "https://api.vercel.com/v5/domains/<domain>?teamId=$SRC_TEAM_ID"
  ```
- Destination me sirf **ek** project ho — duplicate ho to delete

⚠️ Domain entry delete **sirf verification ke baad** karo. Pehle delete karke phir transfer fail hua to domain recover karna mushkil hota hai.

---

## 9. Wapas switch karna (rollback / old account)

Bilkul same steps, bas source/destination swap:

1. Current account se transfer-request banao
2. Old account se accept karo
3. Env me `VERCEL_TOKEN` + `VERCEL_TEAM_ID` old account ke kar do (purana token `VERCEL_TOKEN_<OLD_LABEL>` me pehle se hai)
4. Ek deploy + Section 7 ke smoke tests

Domain verification project ke saath wapas aati hai — **DNS/TXT dobara nahi**.

---

## 10. Do / Don't

| ✅ Karo | ❌ Mat karo |
|--------|------------|
| Transfer API use karo | Naya project import karo |
| Dono tokens env file me rakho | Purana token delete karo |
| Ek store = ek project | Duplicate project chhodo |
| Verification ke baad cleanup | Pehle domain delete karo |
| Ek final deploy | Har chhoti change par deploy |
| Domain-based webhooks test karo | Supabase triggers rewrite karo (zaroorat nahi) |

---

## 11. Troubleshooting (short)

| Problem | Fix |
|---------|-----|
| Domain `verified: false` | Transfer nahi hua — project delete karke transfer dobara |
| Site 404 / wrong project | Domain kisi doosre project par hai — Domains se remove karke sahi project me add |
| Env var missing after transfer | `clone:setup` se push karo, phir redeploy |
| Purana price dikh raha | CF purge karo; 10–15s baad check (revalidate fallback) |
| Webhook 401 | `REVALIDATE_SECRET` mismatch — env + Supabase trigger check |
| Build fail | Local `npm run build` chalao; logs me exact error dekho |

---

## 12. Final checklist (copy-paste)

```
[ ] Transfer-request + accept done
[ ] Domain verified=true (apex + www)
[ ] Env files updated (new active + old rollback)
[ ] Project env vars complete
[ ] One final deploy READY
[ ] CF purge done
[ ] Home / shop / product / cart / admin = 200
[ ] Webhook 200 + revalidated:true
[ ] Price update < 15s
[ ] Test order created + cleaned
[ ] Old account clean (no project / no stale domain)
[ ] Docs me sirf env keys — koi account ID/domain hardcode nahi
```

---

**Related:** [07-deployment-vercel-cloudflare.md](agent-rules/07-deployment-vercel-cloudflare.md) · [22-credentials-management.md](agent-rules/22-credentials-management.md) · [26-project-reference-table.md](agent-rules/26-project-reference-table.md) · [NEW_PROJECT_SETUP_GUIDE.md](NEW_PROJECT_SETUP_GUIDE.md)
