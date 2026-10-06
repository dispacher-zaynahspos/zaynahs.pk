# JustWoker Proxy Guide (opencode Anthropic blank-response fix)

## Symptom
Opencode me `anthropic/claude-opus-4-8` select karne par:
- Request send hoti hai (justwoker dashboard me consume aata hai), lekin jawab blank/screen "load hoti rehti hai".

## Root causes (dono fix ho chuke hain)
1. **justwoker streaming toot ta hai**: `/v1/messages` with `stream:true` SSE me `content_block_start`/`content_block_delta` (asli text) events bhejta hi nahi — turant `message_delta` (end_turn) aa jata hai. Non-stream (`stream:false`) sahi text deta hai.
2. **Path mismatch**: opencode ke AI SDK anthropic provider `POST /messages` bhejta hai, lekin justwoker sirf `/v1/messages` jaanta hai → 404 → opencode retry loop ("load hota rehta").

## Fix (already applied)
- `opencode.json` → anthropic provider: `"baseURL": "http://localhost:8787"`, model `"anthropic/claude-opus-4-8"`.
- Local proxy: `scripts/justworker-proxy.mjs`
  - `POST /messages` → upstream `/v1/messages` (path fix).
  - Request `stream:true` ho to upstream ko `stream:false` bhejta hai, non-stream JSON ko proper anthropic SSE stream (`message_start` → `content_block_start` → `content_block_delta` → `content_block_stop` → `message_delta` → `message_stop`) me convert karta hai. Tools/thinking blocks bhi map hote hain.
- Port: `8787` (env `PORT` se badal sakte hain). API key embedded / `JUSTWORKER_KEY` env se override.

## Kabhi issue aaye to check karo
```bash
# 1) Proxy chal raha hai?
curl -s -N -m 30 http://localhost:8787/messages -H "content-type: application/json" \
  -d '{"model":"claude-opus-4-8","max_tokens":20,"stream":true,"messages":[{"role":"user","content":"hi"}]}' | head -c 400
# Expected: SSE with content_block_delta containing text

# 2) Proxy nahi chal raha?
nohup node scripts/justworker-proxy.mjs > /tmp/jw-proxy.log 2>&1 &

# 3) opencode baseURL
grep baseURL opencode.json   # http://localhost:8787 hona chahiye
```

- Request aayi ya nahi dekhne ke liye: `cat /tmp/jw-proxy.log` (har request log hoti hai).
- OpenAI-compatible route `/v1/chat/completions` Cloudflare-blocked hai → mat use karo.
- Config sirf opencode restart par load hota hai.
