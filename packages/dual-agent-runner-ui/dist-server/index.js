// server/index.ts
import http from "http";
import { URL } from "url";
var json = (res, status, body) => {
  const data = JSON.stringify(body, null, 2);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(data)
  });
  res.end(data);
};
var readBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf8");
};
var sseHeaders = {
  "content-type": "text/event-stream; charset=utf-8",
  "cache-control": "no-cache, no-transform",
  connection: "keep-alive",
  // Local-first UI; allow local dev server to connect.
  "access-control-allow-origin": "*"
};
var formatSse = (event) => `data: ${JSON.stringify(event)}

`;
var createRunnerUiServer = (options) => {
  const port = options?.port ?? 4318;
  const events = [];
  let nextClientId = 1;
  let nextEventId = 1;
  const clients = /* @__PURE__ */ new Map();
  const broadcast = (event) => {
    const payload = formatSse(event);
    for (const client of clients.values()) client.write(payload);
  };
  const addEvent = (partial) => {
    const full = {
      ...partial,
      id: partial.id ?? `evt_${nextEventId++}`
    };
    events.push(full);
    broadcast(full);
    return full;
  };
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
    if (req.method === "GET" && url.pathname === "/health") {
      return json(res, 200, { ok: true });
    }
    if (req.method === "GET" && url.pathname === "/events") {
      res.writeHead(200, sseHeaders);
      res.write("retry: 1000\n\n");
      const clientId = nextClientId++;
      clients.set(clientId, { id: clientId, write: (chunk) => res.write(chunk) });
      for (const e of events) res.write(formatSse(e));
      req.on("close", () => {
        clients.delete(clientId);
      });
      return;
    }
    if (req.method === "POST" && url.pathname === "/emit") {
      try {
        const body = await readBody(req);
        const parsed = JSON.parse(body);
        if (!parsed.taskId || !parsed.type || !parsed.message || typeof parsed.timestampMs !== "number") {
          return json(res, 400, { ok: false, error: "Invalid RunnerEvent payload" });
        }
        const created = addEvent({
          id: parsed.id,
          taskId: parsed.taskId,
          stepId: parsed.stepId,
          type: parsed.type,
          message: parsed.message,
          timestampMs: parsed.timestampMs,
          payload: parsed.payload
        });
        return json(res, 200, { ok: true, event: created });
      } catch (err) {
        return json(res, 400, { ok: false, error: String(err) });
      }
    }
    if (req.method === "POST" && url.pathname === "/demo") {
      const now = Date.now();
      const taskId = url.searchParams.get("taskId") ?? "demo";
      addEvent({ taskId, type: "task.started", message: "Task started", timestampMs: now });
      addEvent({ taskId, stepId: "plan", type: "step.started", message: "Plan", timestampMs: now + 100 });
      addEvent({
        taskId,
        stepId: "plan",
        type: "builder.decision.created",
        message: "Use append-only events + pure reducer for UI model.",
        timestampMs: now + 200
      });
      return json(res, 200, { ok: true });
    }
    return json(res, 404, { ok: false, error: "Not found" });
  });
  return {
    listen: () => new Promise((resolve) => {
      server.listen(port, () => resolve());
    }),
    close: () => new Promise((resolve, reject) => {
      server.close((err) => err ? reject(err) : resolve());
    }),
    port
  };
};
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = createRunnerUiServer();
  server.listen().then(() => {
    console.log(`dual-agent-runner-ui server listening on http://localhost:${server.port}`);
  });
}
export {
  createRunnerUiServer
};
