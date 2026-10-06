import http from "node:http";

const UPSTREAM = "https://api.justwoker.icu";
const KEY = process.env.JUSTWORKER_KEY || "sk-KGrFaiGN20WiTyfpeLWCaaQmiOHWBQCLqnATlV1A4QnR0m1S";
const PORT = Number(process.env.PORT || 8787);

function sse(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

const server = http.createServer(async (req, res) => {
  if (req.method !== "POST") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
    return;
  }
  console.log(new Date().toISOString(), req.method, req.url);
  let body = "";
  for await (const c of req) body += c;
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    res.writeHead(400); res.end("bad json"); return;
  }

  const wantsStream = parsed.stream === true;
  const upstreamBody = JSON.stringify({ ...parsed, stream: false });

  try {
    let path = req.url.replace(/\?.*$/, "");
    if (!path.startsWith("/v1")) path = "/v1" + path;
    const up = await fetch(`${UPSTREAM}${path}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": KEY,
        "anthropic-version": "2023-06-01",
        ...(req.headers["anthropic-beta"] ? { "anthropic-beta": req.headers["anthropic-beta"] } : {}),
      },
      body: upstreamBody,
    });
    const text = await up.text();
    let json;
    try { json = JSON.parse(text); } catch {
      res.writeHead(up.status, { "content-type": "text/plain" });
      res.end(text);
      return;
    }

    if (!wantsStream) {
      res.writeHead(up.status, { "content-type": "application/json" });
      res.end(JSON.stringify(json));
      return;
    }

    if (json.type === "error" || !json.content) {
      res.writeHead(up.status, { "content-type": "application/json" });
      res.end(JSON.stringify(json));
      return;
    }

    res.writeHead(200, {
      "content-type": "text/event-stream",
      "cache-control": "no-cache",
      connection: "keep-alive",
    });

    const msg = { ...json, content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: json.usage?.input_tokens ?? 0, output_tokens: 0 } };
    sse(res, "message_start", { type: "message_start", message: msg });

    let index = 0;
    for (const block of json.content) {
      if (block.type === "text") {
        sse(res, "content_block_start", { type: "content_block_start", index, content_block: { type: "text", text: "" } });
        sse(res, "content_block_delta", { type: "content_block_delta", index, delta: { type: "text_delta", text: block.text } });
        sse(res, "content_block_stop", { type: "content_block_stop", index });
        index++;
      } else if (block.type === "tool_use") {
        sse(res, "content_block_start", { type: "content_block_start", index, content_block: { type: "tool_use", id: block.id, name: block.name, input: {} } });
        sse(res, "content_block_delta", { type: "content_block_delta", index, delta: { type: "input_json_delta", partial_json: JSON.stringify(block.input ?? {}) } });
        sse(res, "content_block_stop", { type: "content_block_stop", index });
        index++;
      } else if (block.type === "thinking") {
        sse(res, "content_block_start", { type: "content_block_start", index, content_block: { type: "thinking", thinking: "" } });
        sse(res, "content_block_delta", { type: "content_block_delta", index, delta: { type: "thinking_delta", thinking: block.thinking ?? "" } });
        sse(res, "content_block_stop", { type: "content_block_stop", index });
        index++;
      }
    }

    sse(res, "message_delta", { type: "message_delta", delta: { stop_reason: json.stop_reason ?? "end_turn", stop_sequence: json.stop_sequence ?? null }, usage: { output_tokens: json.usage?.output_tokens ?? 0 } });
    sse(res, "message_stop", { type: "message_stop" });
    res.end();
  } catch (e) {
    res.writeHead(500, { "content-type": "application/json" });
    res.end(JSON.stringify({ type: "error", error: { type: "api_error", message: String(e) } }));
  }
});

server.listen(PORT, "127.0.0.1", () => console.log(`justworker proxy on :${PORT}`));
