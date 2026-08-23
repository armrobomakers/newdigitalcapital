import { createHash, createHmac } from "node:crypto";
import { createServer } from "node:http";

import { runAcceptanceCheck } from "./check-lead-storage.mjs";

const secret = "dc-ci-secret-0123456789-abcdefghijklmnopqrstuvwxyz";
const stored = new Map();

function hmac(payload, timestamp) {
  return createHmac("sha256", secret).update(`${timestamp}.${payload}`, "utf8").digest("hex");
}

function hash(payload) {
  return createHash("sha256").update(payload, "utf8").digest("hex");
}

function json(response, status, body) {
  response.writeHead(status, { "Content-Type": "application/json" });
  response.end(JSON.stringify(body));
}

async function readBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

const server = createServer(async (request, response) => {
  if (request.method !== "POST") {
    json(response, 405, { ok: false, error: "method_not_allowed" });
    return;
  }

  const raw = await readBody(request);
  let payload = raw;
  let timestamp = request.headers["x-digitalcapital-timestamp"] ?? "";
  let signature = request.headers["x-digitalcapital-signature"] ?? "";

  if (request.url === "/apps") {
    let wrapper;
    try {
      wrapper = JSON.parse(raw);
    } catch {
      json(response, 200, { ok: false, error: "invalid_wrapper" });
      return;
    }
    if (wrapper.transport !== "apps_script_body_hmac.v1") {
      json(response, 200, { ok: false, error: "unsupported_transport" });
      return;
    }
    payload = wrapper.payload;
    timestamp = wrapper.timestamp;
    signature = wrapper.signature;
  }

  if (signature !== `sha256=${hmac(payload, timestamp)}`) {
    json(response, request.url === "/apps" ? 200 : 401, { ok: false, error: "invalid_signature" });
    return;
  }

  let envelope;
  try {
    envelope = JSON.parse(payload);
  } catch {
    json(response, 400, { ok: false, error: "invalid_payload" });
    return;
  }

  const requestId = envelope.request_id;
  const storageKey = `${request.url}:${requestId}`;
  const payloadHash = hash(payload);
  const existingHash = stored.get(storageKey);

  if (existingHash) {
    if (existingHash === payloadHash) {
      json(response, 200, { ok: true, request_id: requestId, duplicate: true });
      return;
    }
    json(response, request.url === "/apps" ? 200 : 409, {
      ok: false,
      error: "idempotency_conflict",
      request_id: requestId,
    });
    return;
  }

  stored.set(storageKey, payloadHash);
  json(response, 200, { ok: true, request_id: requestId });
});

await new Promise((resolve, reject) => {
  server.once("error", reject);
  server.listen(0, "127.0.0.1", resolve);
});

try {
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("mock_server_address_unavailable");
  }

  for (const [transport, path] of [
    ["header_hmac", "/header"],
    ["apps_script_body_hmac", "/apps"],
  ]) {
    const result = await runAcceptanceCheck({
      url: `http://127.0.0.1:${address.port}${path}`,
      secret,
      transport,
    });

    if (
      result.ok !== true ||
      result.first_write !== "acknowledged" ||
      result.duplicate_retry !== "deduplicated" ||
      result.changed_payload_retry !== "rejected"
    ) {
      throw new Error(`acceptance_checker_failed:${transport}`);
    }
  }

  console.log("Lead storage acceptance checker contract: PASS");
} finally {
  await new Promise((resolve) => server.close(resolve));
}
