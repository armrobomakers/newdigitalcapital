import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const [url, outputArg, widthArg, heightArg] = process.argv.slice(2);
const width = Number(widthArg);
const height = Number(heightArg);

if (!url || !outputArg || !Number.isInteger(width) || !Number.isInteger(height) || width < 240 || height < 240) {
  console.error("usage: node scripts/capture-visual-screenshot.mjs <url> <output.png> <width> <height>");
  process.exit(2);
}

const browserCandidates = [
  process.env.CHROME_BIN,
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].filter(Boolean);

const browserExecutable = browserCandidates.find((candidate) => existsSync(candidate));
if (!browserExecutable) {
  throw new Error(`chrome executable not found; checked: ${browserCandidates.join(", ")}`);
}

const debuggingPort = 9222;
const userDataDir = mkdtempSync(join(tmpdir(), "dc-visual-chrome-"));
const output = resolve(outputArg);
const browser = spawn(
  browserExecutable,
  [
    "--headless=new",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--hide-scrollbars",
    "--remote-debugging-address=127.0.0.1",
    `--remote-debugging-port=${debuggingPort}`,
    `--user-data-dir=${userDataDir}`,
    "about:blank",
  ],
  { stdio: ["ignore", "ignore", "pipe"] }
);

let browserStderr = "";
browser.stderr.on("data", (chunk) => {
  browserStderr += chunk.toString();
});

async function waitForDebugger() {
  const endpoint = `http://127.0.0.1:${debuggingPort}/json/version`;
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(endpoint);
      if (response.ok) return;
    } catch {
      // Chrome is still starting.
    }
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 100));
  }
  throw new Error(`chrome debugging endpoint did not become ready\n${browserStderr}`);
}

async function createPage() {
  const response = await fetch(`http://127.0.0.1:${debuggingPort}/json/new?about:blank`, {
    method: "PUT",
  });
  if (!response.ok) {
    throw new Error(`failed to create Chrome page: HTTP ${response.status}`);
  }
  return response.json();
}

function createCdpClient(webSocketUrl) {
  const socket = new WebSocket(webSocketUrl);
  let nextId = 1;
  const pending = new Map();
  const listeners = new Map();

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve: resolveRequest, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(JSON.stringify(message.error)));
      else resolveRequest(message.result ?? {});
      return;
    }

    const handlers = listeners.get(message.method) ?? [];
    for (const handler of handlers) handler(message.params ?? {});
  });

  const ready = new Promise((resolveReady, rejectReady) => {
    socket.addEventListener("open", resolveReady, { once: true });
    socket.addEventListener("error", () => rejectReady(new Error("CDP websocket failed to open")), {
      once: true,
    });
  });

  function send(method, params = {}) {
    const id = nextId;
    nextId += 1;
    return new Promise((resolveRequest, reject) => {
      pending.set(id, { resolve: resolveRequest, reject });
      socket.send(JSON.stringify({ id, method, params }));
    });
  }

  function once(method) {
    return new Promise((resolveEvent) => {
      const handler = (params) => {
        const handlers = listeners.get(method) ?? [];
        listeners.set(
          method,
          handlers.filter((candidate) => candidate !== handler)
        );
        resolveEvent(params);
      };
      listeners.set(method, [...(listeners.get(method) ?? []), handler]);
    });
  }

  return { socket, ready, send, once };
}

try {
  await waitForDebugger();
  const page = await createPage();
  const cdp = createCdpClient(page.webSocketDebuggerUrl);
  await cdp.ready;

  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width <= 480,
    screenWidth: width,
    screenHeight: height,
  });

  const loaded = cdp.once("Page.loadEventFired");
  await cdp.send("Page.navigate", { url });
  await loaded;

  await cdp.send("Runtime.evaluate", {
    expression: "document.fonts?.ready ?? Promise.resolve()",
    awaitPromise: true,
    returnByValue: true,
  });
  await new Promise((resolvePromise) => setTimeout(resolvePromise, 900));

  const metrics = await cdp.send("Page.getLayoutMetrics");
  const content = metrics.cssContentSize ?? metrics.contentSize;
  const contentWidth = Math.ceil(content.width);
  const contentHeight = Math.ceil(content.height);

  if (contentWidth > width + 2) {
    throw new Error(`horizontal_overflow viewport=${width} content=${contentWidth} url=${url}`);
  }

  const screenshot = await cdp.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: true,
    clip: {
      x: 0,
      y: 0,
      width: Math.max(width, contentWidth),
      height: Math.max(height, contentHeight),
      scale: 1,
    },
  });

  writeFileSync(output, Buffer.from(screenshot.data, "base64"));
  console.log(`visual_screenshot_ok output=${outputArg} viewport=${width}x${height} content=${contentWidth}x${contentHeight}`);
  cdp.socket.close();
} finally {
  browser.kill("SIGTERM");
  rmSync(userDataDir, { recursive: true, force: true });
}
