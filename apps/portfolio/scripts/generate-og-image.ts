/**
 * Regenerates public/og-default.png — the fallback social share card used by
 * every page that has no image of its own (see src/lib/seo.ts).
 *
 * Run with `pnpm --filter @arkaes/portfolio og:image`. The output PNG is
 * committed, so this only needs re-running when the brand or the copy changes.
 *
 * Deliberately dependency-free: it fetches the two brand webfonts, inlines them
 * as data URIs (a headless render has no network and no system copy of them),
 * and drives a Chromium binary over the DevTools protocol. Adding Playwright as
 * a devDependency for one build-time image would cost more than it's worth.
 *
 * CDP rather than Chromium's simpler `--screenshot` flag: that flag sizes the
 * image to the *outer* window while painting only the *inner* viewport, which
 * is ~87px shorter, so the bottom of the card comes out blank. Setting the
 * metrics explicitly via Emulation.setDeviceMetricsOverride renders exactly
 * WIDTH x HEIGHT with no chrome to subtract.
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";

const WIDTH = 1200;
const HEIGHT = 630;

const OUTPUT = fileURLToPath(
  new URL("../public/og-default.png", import.meta.url),
);

// Mirrors @arkaes/tokens (packages/tokens/src/styles/tokens.generated.css).
// Duplicated rather than imported because this renders in a bare Chromium with
// no build step; keep in sync if the palette moves.
const COLOR = {
  bg: "#fbf8f3",
  ink: "#17130f",
  muted: "#5f534a",
  accent: "#8f554d",
  accentSoft: "#f2ddd7",
  accentStrong: "#653a35",
  sage: "#aeb997",
  // ark-chip's per-variant pairs: primary (blush) and emerging (sage).
  blush50: "#fff8f6",
  blush300: "#d7a79b",
  sage50: "#f7f8f3",
  secondary: "#5f6f48",
};

const GOOGLE_FONTS_CSS =
  "https://fonts.googleapis.com/css2" +
  "?family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..600" +
  "&family=Plus+Jakarta+Sans:wght@400;500;600" +
  "&family=DM+Mono:wght@400";

// Google Fonts serves a different @font-face set per User-Agent; a modern
// browser UA is what gets us woff2 rather than ttf.
const BROWSER_UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) " +
  "Chrome/120.0.0.0 Safari/537.36";

const CHROMIUM_CANDIDATES = [
  process.env.CHROMIUM_BIN,
  "/opt/pw-browsers/chromium/chrome-linux/chrome",
  "/opt/pw-browsers/chromium",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/google-chrome",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter((candidate): candidate is string => Boolean(candidate));

const findChromium = (): string => {
  for (const candidate of CHROMIUM_CANDIDATES) {
    if (existsSync(candidate)) return candidate;
  }
  throw new Error(
    "No Chromium binary found. Set CHROMIUM_BIN to a Chrome/Chromium executable.",
  );
};

/**
 * Google Fonts splits each family into per-subset @font-face blocks, each
 * preceded by a `/* subset *\/` comment. We only render Latin text, so pull
 * just those blocks and inline their woff2 — embedding every subset would
 * multiply the payload for glyphs that never render.
 */
const inlineLatinFontFaces = async (css: string): Promise<string> => {
  const blocks = css.split(/\/\*\s*([\w-]+)\s*\*\//).slice(1);
  const latin: string[] = [];

  for (let i = 0; i < blocks.length; i += 2) {
    const subset = blocks[i];
    const block = blocks[i + 1];
    if (subset !== "latin" || !block?.includes("@font-face")) continue;

    const url = block.match(/url\((https:\/\/[^)]+\.woff2)\)/)?.[1];
    if (!url) continue;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download ${url}: ${response.status}`);
    }
    const base64 = Buffer.from(await response.arrayBuffer()).toString("base64");
    latin.push(
      block.replace(
        /url\(https:\/\/[^)]+\.woff2\)/,
        `url(data:font/woff2;base64,${base64})`,
      ),
    );
  }

  if (latin.length === 0) throw new Error("No latin @font-face blocks found.");
  return latin.join("\n");
};

const buildHtml = (fontFaces: string): string => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <style>
      ${fontFaces}

      * { box-sizing: border-box; margin: 0; padding: 0; }

      body {
        background:
          radial-gradient(circle at 88% 12%, ${COLOR.accentSoft}, transparent 46%),
          radial-gradient(circle at 4% 96%, #e8eadf, transparent 40%),
          ${COLOR.bg};
        color: ${COLOR.ink};
        display: flex;
        flex-direction: column;
        font-family: "Plus Jakarta Sans", sans-serif;
        height: ${HEIGHT}px;
        justify-content: space-between;
        padding: 76px 84px;
        width: ${WIDTH}px;
      }

      /* Mirrors ark-hero's chip row (ark-chip: mono, uppercase, pill). */
      .chips {
        display: flex;
        gap: 10px;
      }

      .chips span {
        border: 1px solid ${COLOR.blush300};
        border-radius: 999px;
        background: ${COLOR.blush50};
        color: ${COLOR.accentStrong};
        font-family: "DM Mono", monospace;
        font-size: 20px;
        letter-spacing: 0.06em;
        padding: 7px 18px;
        text-transform: uppercase;
      }

      .chips span:last-child {
        background: ${COLOR.sage50};
        border-color: ${COLOR.sage};
        color: ${COLOR.secondary};
      }

      .name {
        font-family: Fraunces, Georgia, serif;
        font-size: 118px;
        font-weight: 600;
        letter-spacing: -0.025em;
        line-height: 1;
        margin-top: 26px;
      }

      .tagline {
        color: ${COLOR.muted};
        font-size: 34px;
        font-weight: 400;
        line-height: 1.35;
        margin-top: 30px;
        max-width: 24ch;
        text-wrap: balance;
      }

      /* Mirrors ark-hero's emphasis: the same face as its own line, filled,
         rather than an italic accent run. */
      .tagline em {
        background: ${COLOR.accent};
        color: ${COLOR.bg};
        display: inline-block;
        font-style: normal;
        font-weight: inherit;
        padding: 0.1em 0.5em 0.18em;
      }

      .footer {
        align-items: center;
        display: flex;
        gap: 22px;
      }

      .rule {
        background: ${COLOR.accent};
        flex: 1;
        height: 2px;
        opacity: 0.32;
      }

      .domain {
        font-size: 23px;
        font-weight: 500;
        letter-spacing: 0.06em;
      }

      /* Echoes the hero's block composition (apps/portfolio: ark-hero). */
      .marks {
        display: flex;
        gap: 14px;
      }

      .marks span {
        border-radius: 3px;
        display: block;
        height: 14px;
        width: 14px;
      }

      .marks span:nth-child(1) { background: ${COLOR.accent}; }
      .marks span:nth-child(2) { background: ${COLOR.sage}; }
      .marks span:nth-child(3) { background: ${COLOR.accentSoft}; }
    </style>
  </head>
  <body>
    <div>
      <p class="chips">
        <span>Frontend Engineer</span>
        <span>UI Systems Architect</span>
        <span>Applied AI Interfaces</span>
      </p>
      <h1 class="name">Ahmad Naufal</h1>
      <p class="tagline">Frontend engineering <em>with clarity.</em></p>
    </div>
    <div class="footer">
      <span class="domain">arkaes.dev</span>
      <span class="rule"></span>
      <span class="marks"><span></span><span></span><span></span></span>
    </div>
  </body>
</html>
`;

/** Minimal DevTools-protocol client over the browser's WebSocket endpoint. */
class CdpSession {
  #socket: WebSocket;
  #nextId = 1;
  #pending = new Map<
    number,
    { resolve: (value: Record<string, unknown>) => void; reject: (error: Error) => void }
  >();
  #events = new Set<string>();

  private constructor(socket: WebSocket) {
    this.#socket = socket;
    socket.addEventListener("message", (event) => {
      const message = JSON.parse(String(event.data)) as {
        id?: number;
        method?: string;
        error?: { message: string };
        result?: Record<string, unknown>;
      };
      if (message.method) this.#events.add(message.method);
      if (message.id === undefined) return;
      const pending = this.#pending.get(message.id);
      if (!pending) return;
      this.#pending.delete(message.id);
      if (message.error) pending.reject(new Error(message.error.message));
      else pending.resolve(message.result ?? {});
    });
  }

  static async connect(url: string): Promise<CdpSession> {
    const socket = new WebSocket(url);
    await new Promise<void>((resolve, reject) => {
      socket.addEventListener("open", () => resolve(), { once: true });
      socket.addEventListener(
        "error",
        () => reject(new Error(`Failed to open CDP socket at ${url}`)),
        { once: true },
      );
    });
    return new CdpSession(socket);
  }

  send(method: string, params: Record<string, unknown> = {}) {
    const id = this.#nextId++;
    return new Promise<Record<string, unknown>>((resolve, reject) => {
      this.#pending.set(id, { resolve, reject });
      this.#socket.send(JSON.stringify({ id, method, params }));
    });
  }

  /** Poll for a one-shot lifecycle event (e.g. Page.loadEventFired). */
  async waitForEvent(method: string, timeoutMs = 15_000) {
    const deadline = Date.now() + timeoutMs;
    while (!this.#events.has(method)) {
      if (Date.now() > deadline) {
        throw new Error(`Timed out waiting for ${method}`);
      }
      await delay(25);
    }
  }

  close() {
    this.#socket.close();
  }
}

/** Chromium writes its actual port here once the debugging server is up. */
const readDevToolsPort = async (userDataDir: string): Promise<number> => {
  const portFile = path.join(userDataDir, "DevToolsActivePort");
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    try {
      const [port] = (await readFile(portFile, "utf8")).split("\n");
      if (port) return Number(port);
    } catch {
      // Not written yet — Chromium is still starting.
    }
    await delay(50);
  }
  throw new Error("Chromium did not expose a DevTools port.");
};

const screenshot = async (htmlPath: string): Promise<Buffer> => {
  const userDataDir = path.join(tmpdir(), `arkaes-og-profile-${process.pid}`);
  const browser = spawn(
    findChromium(),
    [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--hide-scrollbars",
      "--remote-debugging-port=0",
      `--user-data-dir=${userDataDir}`,
      "about:blank",
    ],
    { stdio: "ignore" },
  );

  try {
    const port = await readDevToolsPort(userDataDir);
    const targets = (await (
      await fetch(`http://127.0.0.1:${port}/json/list`)
    ).json()) as { type: string; webSocketDebuggerUrl?: string }[];
    const page = targets.find(
      (target) => target.type === "page" && target.webSocketDebuggerUrl,
    );
    if (!page?.webSocketDebuggerUrl) throw new Error("No page target found.");

    const cdp = await CdpSession.connect(page.webSocketDebuggerUrl);
    try {
      await cdp.send("Page.enable");
      await cdp.send("Emulation.setDeviceMetricsOverride", {
        width: WIDTH,
        height: HEIGHT,
        deviceScaleFactor: 1,
        mobile: false,
      });
      await cdp.send("Page.navigate", { url: `file://${htmlPath}` });
      await cdp.waitForEvent("Page.loadEventFired");
      // The inlined webfonts are data URIs, but decoding still happens off the
      // critical path — screenshotting early can capture fallback glyphs.
      await cdp.send("Runtime.evaluate", {
        expression: "document.fonts.ready",
        awaitPromise: true,
      });
      const { data } = (await cdp.send("Page.captureScreenshot", {
        format: "png",
        captureBeyondViewport: true,
        clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT, scale: 1 },
      })) as { data: string };
      return Buffer.from(data, "base64");
    } finally {
      cdp.close();
    }
  } finally {
    // Wait for the process to actually exit before removing its profile —
    // Chromium keeps flushing state on the way down and rmdir would race it.
    const exited = new Promise<void>((resolve) =>
      browser.once("exit", () => resolve()),
    );
    browser.kill();
    await Promise.race([exited, delay(5_000)]);
    // A leftover temp profile is harmless; a failed cleanup throwing away a
    // successful render is not.
    await rm(userDataDir, { force: true, recursive: true }).catch(() => {});
  }
};

const main = async () => {
  const response = await fetch(GOOGLE_FONTS_CSS, {
    headers: { "user-agent": BROWSER_UA },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch Google Fonts CSS: ${response.status}`);
  }

  const html = buildHtml(await inlineLatinFontFaces(await response.text()));

  const workDir = path.join(tmpdir(), `arkaes-og-${process.pid}`);
  await mkdir(workDir, { recursive: true });
  const htmlPath = path.join(workDir, "og.html");

  try {
    await writeFile(htmlPath, html, "utf8");
    await writeFile(OUTPUT, await screenshot(htmlPath));
    console.log(`Wrote ${OUTPUT} (${WIDTH}x${HEIGHT})`);
  } finally {
    await rm(workDir, { force: true, recursive: true });
  }
};

await main();
