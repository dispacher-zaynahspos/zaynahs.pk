# 21 — 🔑 Cloudflare + Supabase — Agent MUST Use API (MANDATORY)

⚡ Agent kabhi bhi user ko manual kaam karne nahi dega jab API available ho.

## ❌ NEVER do manually
- Never ask the user to manually create Cloudflare tokens, Supabase webhooks, or Vercel env vars.
- Never say "go to dashboard and do X" when an API/curl exists.
- Never test tokens in a browser — always use the API.

## ✅ Agent always handles via API automatically

### Cloudflare token verification (ALL projects at once)
```bash
# env-backups/ se CLOUDFLARE_API_TOKEN padhke har project test karo
for ENV in env-backups/*.env.local; do
  TOKEN=$(grep CLOUDFLARE_API_TOKEN $ENV | cut -d= -f2)
  NAME=$(basename $ENV)
  curl -s "https://api.cloudflare.com/client/v4/user/tokens/verify" \
    -H "Authorization: Bearer $TOKEN" | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'$NAME: {d.get(\"result\",{}).get(\"status\",\"INVALID\")} | success: {d.get(\"success\")}')"
done
```

### Cloudflare cache purge (via API)
```bash
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/purge_cache" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"purge_everything":true}'
```

### Supabase webhook triggers — agent creates via SQL API
```bash
# CORRECT: cfut_ token only (NOT cfk_ Global API Key)
# cfk_ tokens DO NOT work with Bearer auth — always create cfut_ API Tokens
SQL_JSON=$(python3 -c "import json; print(json.dumps({'query': '''
DROP TRIGGER IF EXISTS \"revalidate-TABLE\" ON public.TABLE;
CREATE TRIGGER \"revalidate-TABLE\"
  AFTER INSERT OR UPDATE OR DELETE ON public.TABLE
  FOR EACH ROW EXECUTE FUNCTION supabase_functions.http_request(
    '\''https://SITE_URL/api/revalidate'\'', '\''POST'\'',
    '\''{\"Content-Type\":\"application/json\",\"x-revalidate-secret\":\"SECRET\"}'\'',
    '\''{\"type\":\"CHANGE\",\"table\":\"TABLE\"}'\'', '\''5000'\''
  );
'''}))")
curl -s -X POST "https://api.supabase.com/v1/projects/$SUPABASE_REF/database/query" \
  -H "Authorization: Bearer $SUPABASE_MGMT_TOKEN" \
  -H "Content-Type: application/json" -d "$SQL_JSON"
```

### Vercel env vars — agent updates via API
```bash
# Get project ID
curl -s "https://api.vercel.com/v9/projects?limit=20" \
  -H "Authorization: Bearer $VERCEL_TOKEN" | python3 -c "import sys,json; [print(p['id'], p['name']) for p in json.load(sys.stdin)['projects']]"

# Update env var
curl -s -X PATCH "https://api.vercel.com/v9/projects/PROJECT_ID/env/ENV_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"value":"NEW_VALUE","target":["production","preview","development"]}'
```

## 🚨 CF token format rule (CRITICAL)
- `cfut_` or `cf_` = ✅ API Token — works with `Authorization: Bearer`.
- `cfk_` = ❌ Global API Key — NEVER works with Bearer auth.
- Agent MUST warn the user if a `cfk_` token is found in any env file, and guide them to create a new `cfut_` token: Cloudflare → Profile → API Tokens → Create Token → Cache Purge permission.

## 🔁 Mandatory self-test after ANY change
After creating/updating any trigger, token, or webhook:
1. **Webhook live test**: `curl -X POST https://SITE/api/revalidate -H "x-revalidate-secret: SECRET"` → expect `{"revalidated":true}`.
2. **CF token test**: `curl https://api.cloudflare.com/client/v4/user/tokens/verify -H "Authorization: Bearer TOKEN"` → expect `"status":"active"`.
3. **Trigger URL check**: SQL query to confirm no trigger points to `localhost` or `domain.com`.

## Project reference table
See [26-project-reference-table.md](26-project-reference-table.md) for the full ref/zone/secret table used by every command above.
