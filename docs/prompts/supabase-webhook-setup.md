# Supabase Webhook Triggers — Complete Setup Guide
> **UPDATED 2026-08-11**: Manual Dashboard method DEPRECATED. Agent handles EVERYTHING via API.
> Old title was "Manually Karna Hai - Agent Nahi Kar Sakta" — THIS IS WRONG. Agent KAR SAKTA HAI via API.

---

## ⚡ AGENT METHOD — PREFERRED (Zero Manual Steps)

Agent khud SQL triggers create karta hai Supabase Management API se:

```bash
SUPABASE_REF="your_project_ref"          # e.g. ziucrfpebpxijqhwmqre
MGMT_TOKEN="sbp_XXXXXXXX"               # Supabase Management Token
SITE_URL="https://www.yourdomain.com"    # LIVE URL — NEVER localhost!
SECRET="zaynahs_secret_cache_revalidate_2026"

# All tables that need triggers
TABLES=(products categories product_variants product_images product_modifiers
  store_settings reviews seo_meta collections collection_categories badges
  homepage_sections coupons size_guides social_proof social_proof_products
  variant_presets ai_settings meta_category_mapping payment_methods shipping_methods)

for TABLE in "${TABLES[@]}"; do
  HEADERS="{\"Content-Type\":\"application/json\",\"x-revalidate-secret\":\"${SECRET}\"}"
  BODY="{\"type\":\"CHANGE\",\"table\":\"${TABLE}\"}"

  SQL="DROP TRIGGER IF EXISTS \"revalidate-${TABLE}\" ON public.${TABLE};
CREATE TRIGGER \"revalidate-${TABLE}\"
  AFTER INSERT OR UPDATE OR DELETE ON public.${TABLE}
  FOR EACH ROW EXECUTE FUNCTION supabase_functions.http_request(
    '${SITE_URL}/api/revalidate', 'POST',
    '${HEADERS}', '${BODY}', '5000');"

  SQL_JSON=$(python3 -c "import json; print(json.dumps({'query': '''$SQL'''}))")
  RESULT=$(curl -s -X POST "https://api.supabase.com/v1/projects/$SUPABASE_REF/database/query" \
    -H "Authorization: Bearer $MGMT_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$SQL_JSON")

  if [ "$RESULT" = "[]" ]; then
    echo "✅ revalidate-$TABLE"
  else
    echo "❌ revalidate-$TABLE → $RESULT"
  fi
done
```

---

## 📋 All 4 Projects — Credentials Quick Reference

| Project | Ref | Mgmt Token | Site URL |
|---------|-----|------------|----------|
| TotVogue | `ziucrfpebpxijqhwmqre` | `sbp_your_management_token_placeholder` | `https://www.totvogue.pk` |
| Zaynahs | `unfdpfmjqljbjydgsccr` | `sbp_your_management_token_placeholder` | `https://www.zaynahs.pk` |
| MiniMahal | `mgwkcumurrllhpjvfezz` | `sbp_your_management_token_placeholder` | `https://www.minimahal.com` |
| LittleMister | `ljknmwianiswkalifueb` | `sbp_your_management_token_placeholder` | `https://www.littlemister.pk` |

---

## ✅ Verify Triggers — All Correct URLs

```bash
REF="ziucrfpebpxijqhwmqre"
MGMT="sbp_your_management_token_placeholder"
EXPECTED_DOMAIN="www.totvogue.pk"

curl -s -X POST "https://api.supabase.com/v1/projects/$REF/database/query" \
  -H "Authorization: Bearer $MGMT" \
  -H "Content-Type: application/json" \
  -d '{"query":"SELECT trigger_name, action_statement FROM information_schema.triggers WHERE trigger_name LIKE '\''revalidate%'\'' GROUP BY trigger_name, action_statement ORDER BY trigger_name;"}' \
  | python3 -c "
import sys,json,re
d=json.load(sys.stdin)
wrong=0
for row in d:
  m=re.search(r\"https?://[^']+\", row.get('action_statement',''))
  url=m.group() if m else 'NO_URL'
  ok='$EXPECTED_DOMAIN' in url
  if not ok: wrong+=1
  print(f\"{'✅' if ok else '❌ WRONG'} {row['trigger_name']} → {url}\")
print(f'\nTotal: {len(d)} | Wrong: {wrong}')
"
```

---

## 🚨 Common Issues (From 2026-08-11 Audit)

| Issue | Symptom | Fix |
|-------|---------|-----|
| Trigger URL = `localhost:3000` | Cache never clears on live site | Recreate trigger with correct live URL |
| Trigger URL = `domain.com` | Cache never clears | Recreate trigger with correct domain |
| Table missing trigger | That table's changes don't refresh cache | Add trigger for that table |
| `supabase_functions` not found | SQL error | Enable `pg_net` extension in Supabase dashboard |

---

## Fix Single Wrong Trigger

```bash
# Replace TABLE, REF, MGMT, SITE_URL with correct values
TABLE="collections"
REF="ziucrfpebpxijqhwmqre"
MGMT="sbp_your_management_token_placeholder"
SITE_URL="https://www.totvogue.pk"
SECRET="zaynahs_secret_cache_revalidate_2026"

SQL_JSON=$(python3 -c "import json; print(json.dumps({'query': '''
DROP TRIGGER IF EXISTS \"revalidate-$TABLE\" ON public.$TABLE;
CREATE TRIGGER \"revalidate-$TABLE\"
  AFTER INSERT OR UPDATE OR DELETE ON public.$TABLE
  FOR EACH ROW EXECUTE FUNCTION supabase_functions.http_request(
    '"'"'$SITE_URL/api/revalidate'"'"', '"'"'POST'"'"',
    '"'"'{"Content-Type":"application/json","x-revalidate-secret":"$SECRET"}'"'"',
    '"'"'{"type":"CHANGE","table":"$TABLE"}'"'"',
    '"'"'5000'"'"');
'''}))")

curl -s -X POST "https://api.supabase.com/v1/projects/$REF/database/query" \
  -H "Authorization: Bearer $MGMT" \
  -H "Content-Type: application/json" \
  -d "$SQL_JSON"
```

---

## REVALIDATE_SECRET

All projects use the same secret:
```
zaynahs_secret_cache_revalidate_2026
```
This must match:
- Supabase trigger header: `x-revalidate-secret: zaynahs_secret_cache_revalidate_2026`
- Vercel env var: `REVALIDATE_SECRET=zaynahs_secret_cache_revalidate_2026`
- `/api/revalidate/route.ts` check: `headers.get('x-revalidate-secret') === process.env.REVALIDATE_SECRET`

---

## Test Webhook Manually

```bash
SITE="https://www.totvogue.pk"
SECRET="zaynahs_secret_cache_revalidate_2026"

curl -s -X POST "$SITE/api/revalidate" \
  -H "Content-Type: application/json" \
  -H "x-revalidate-secret: $SECRET" \
  -d '{"type":"UPDATE","table":"products","record":{"slug":"test-product"}}'

# Expected response:
# {"revalidated":true,"table":"products","type":"UPDATE"}
```
