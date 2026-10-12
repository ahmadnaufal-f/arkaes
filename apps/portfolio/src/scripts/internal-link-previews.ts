import { resolveInternalContentLink } from "../lib/internal-content-link";

type InternalLink = NonNullable<ReturnType<typeof resolveInternalContentLink>>;
interface PreviewFragment {
  html: string;
  styles: string[];
}

interface PreviewRequest {
  endpoint: string;
  generation: number;
  resolve: (fragment: PreviewFragment | null) => void;
}

const MAX_CONCURRENT_REQUESTS = 3;
const REQUEST_TIMEOUT_MS = 8_000;
const PREVIEW_PATH_PREFIX = "/api/link-preview/";

const previewCache = new Map<string, Promise<PreviewFragment | null>>();
const requestQueue: PreviewRequest[] = [];
const activeControllers = new Set<AbortController>();
const installedStyleNodes = new Map<string, Element>();
let pendingLinks = new WeakMap<HTMLElement, InternalLink>();

let activeRequests = 0;
let lifecycleGeneration = 0;
let observer: IntersectionObserver | null = null;

const pumpQueue = (): void => {
  while (activeRequests < MAX_CONCURRENT_REQUESTS && requestQueue.length > 0) {
    const request = requestQueue.shift();
    if (!request) continue;

    if (request.generation !== lifecycleGeneration) {
      request.resolve(null);
      continue;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(
      () => controller.abort(),
      REQUEST_TIMEOUT_MS,
    );
    activeControllers.add(controller);
    activeRequests += 1;

    void fetchPreviewHtml(request.endpoint, controller.signal)
      .then(request.resolve)
      .catch(() => request.resolve(null))
      .finally(() => {
        window.clearTimeout(timeoutId);
        activeControllers.delete(controller);
        activeRequests -= 1;
        pumpQueue();
      });
  }
};

const fetchPreviewHtml = async (
  endpointPath: string,
  signal: AbortSignal,
): Promise<PreviewFragment | null> => {
  let endpoint: URL;
  try {
    endpoint = new URL(endpointPath, window.location.origin);
  } catch {
    return null;
  }

  if (
    endpoint.origin !== window.location.origin ||
    !endpoint.pathname.startsWith(PREVIEW_PATH_PREFIX)
  ) {
    return null;
  }

  try {
    const response = await fetch(endpoint, {
      credentials: "same-origin",
      headers: { Accept: "text/html" },
      redirect: "error",
      signal,
    });

    if (!response.ok) return null;
    if (new URL(response.url).origin !== window.location.origin) return null;
    if (response.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase() !== "text/html") {
      return null;
    }

    const html = await response.text();
    const parsed = new DOMParser().parseFromString(html, "text/html");
    const cards = parsed.body.querySelectorAll<HTMLElement>("[data-internal-link-preview]");
    if (cards.length !== 1) return null;

    const card = cards[0];
    const links = card.querySelectorAll<HTMLAnchorElement>("a");
    if (links.length !== 1 || !card.contains(links[0])) return null;

    const cardLink = new URL(links[0].getAttribute("href") ?? "", window.location.origin);
    if (cardLink.origin !== window.location.origin) return null;

    // Astro may return scoped thumbnail CSS alongside the fragment. Install
    // those styles in the active page head before dropping them from the card
    // markup, so client inserted thumbnails keep their authored appearance.
    const styleNodes = Array.from(
      parsed.querySelectorAll("style, link[rel='stylesheet']"),
    );
    const styles = styleNodes.map((node) => node.outerHTML);
    for (const node of styleNodes) node.remove();

    return { html: card.outerHTML, styles };
  } catch {
    return null;
  }
};

const getPreviewHtml = (link: InternalLink): Promise<PreviewFragment | null> => {
  const cached = previewCache.get(link.key);
  if (cached) return cached;

  const promise = new Promise<PreviewFragment | null>((resolve) => {
    requestQueue.push({
      endpoint: link.endpoint,
      generation: lifecycleGeneration,
      resolve,
    });
    pumpQueue();
  });

  previewCache.set(link.key, promise);
  return promise;
};

const insertCard = async (
  slot: HTMLElement,
  link: InternalLink,
  generation: number,
): Promise<void> => {
  const fragment = await getPreviewHtml(link);
  if (!fragment || generation !== lifecycleGeneration || !slot.isConnected) {
    if (generation === lifecycleGeneration && slot.isConnected) slot.remove();
    return;
  }

  installPreviewStyles(fragment.styles);

  const template = document.createElement("template");
  template.innerHTML = fragment.html;
  const card = template.content.firstElementChild;
  if (!(card instanceof HTMLElement) || !card.matches("[data-internal-link-preview]")) {
    slot.remove();
    return;
  }

  const cardLink = card.querySelector<HTMLAnchorElement>("[data-link-preview-anchor]");
  if (!cardLink) {
    slot.remove();
    return;
  }

  // Preview HTML is cached by canonical path. Each card uses the first source
  // link in its paragraph so its query string and fragment remain intact.
  cardLink.setAttribute("href", link.href);
  slot.replaceWith(card);
};

const installPreviewStyles = (styles: string[]): void => {
  if (styles.length === 0) return;

  const template = document.createElement("template");
  template.innerHTML = styles.join("");

  for (const node of template.content.querySelectorAll("style, link[rel='stylesheet']")) {
    let key: string;
    if (node instanceof HTMLStyleElement) {
      const viteId = node.getAttribute("data-vite-dev-id");
      key = viteId ? `vite:${viteId}` : `style:${node.textContent ?? ""}`;
    } else if (node instanceof HTMLLinkElement) {
      const href = node.getAttribute("href");
      if (!href) continue;

      let stylesheetUrl: URL;
      try {
        stylesheetUrl = new URL(href, window.location.origin);
      } catch {
        continue;
      }
      if (stylesheetUrl.origin !== window.location.origin) continue;
      if (
        !stylesheetUrl.pathname.startsWith("/_astro/") &&
        !stylesheetUrl.pathname.startsWith("/src/") &&
        !stylesheetUrl.pathname.startsWith("/@fs/")
      ) {
        continue;
      }
      key = `link:${stylesheetUrl.href}`;
      node.href = stylesheetUrl.href;
    } else {
      continue;
    }

    const installed = installedStyleNodes.get(key);
    if (installed?.isConnected) continue;

    let existing: Element | undefined;
    if (node instanceof HTMLLinkElement) {
      existing = Array.from(
        document.head.querySelectorAll<HTMLLinkElement>("link[rel='stylesheet']"),
      ).find((stylesheet) => stylesheet.href === node.href);
    } else if (node instanceof HTMLStyleElement) {
      const viteId = node.getAttribute("data-vite-dev-id");
      if (viteId) {
        existing = Array.from(
          document.head.querySelectorAll<HTMLStyleElement>("style[data-vite-dev-id]"),
        ).find((style) => style.getAttribute("data-vite-dev-id") === viteId);
      } else {
        existing = Array.from(document.head.querySelectorAll<HTMLStyleElement>("style")).find(
          (style) => style.textContent === node.textContent,
        );
      }
    }
    if (existing) {
      installedStyleNodes.set(key, existing);
      continue;
    }

    document.head.append(node);
    installedStyleNodes.set(key, node);
  }
};

const isTextLink = (anchor: HTMLAnchorElement): boolean =>
  Boolean(anchor.textContent?.trim()) && !anchor.closest("[data-internal-link-preview]");

const scanMarkdownHost = (host: HTMLElement): void => {
  if (host.dataset.internalLinkPreviewsScanned === "true") return;
  host.dataset.internalLinkPreviewsScanned = "true";

  const generation = lifecycleGeneration;
  const paragraphs = host.querySelectorAll<HTMLParagraphElement>("p");

  for (const paragraph of paragraphs) {
    const linksByKey = new Map<string, InternalLink>();

    for (const anchor of paragraph.querySelectorAll<HTMLAnchorElement>("a[href]")) {
      if (!isTextLink(anchor)) continue;

      const resolved = resolveInternalContentLink(
        anchor.getAttribute("href") ?? "",
        window.location.href,
      );
      if (resolved && !linksByKey.has(resolved.key)) {
        linksByKey.set(resolved.key, resolved);
      }
    }

    if (linksByKey.size === 0) continue;

    const slots = document.createDocumentFragment();
    const pendingSlots: HTMLElement[] = [];
    for (const link of linksByKey.values()) {
      const slot = document.createElement("div");
      slot.className = "internal-link-preview-slot";
      slot.setAttribute("aria-hidden", "true");
      pendingLinks.set(slot, link);
      slots.append(slot);
      pendingSlots.push(slot);
    }

    paragraph.after(slots);

    for (const slot of pendingSlots) {
      const link = pendingLinks.get(slot);
      if (observer) observer.observe(slot);
      else if (link) void insertCard(slot, link, generation);
    }
  }
};

const initializePreviews = (): void => {
  if ("IntersectionObserver" in window && !observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          const slot = entry.target;
          observer?.unobserve(slot);
          const link = pendingLinks.get(slot as HTMLElement);
          if (link) void insertCard(slot as HTMLElement, link, lifecycleGeneration);
          else slot.remove();
        }
      },
      { rootMargin: "240px 0px" },
    );
  }

  document
    .querySelectorAll<HTMLElement>("ark-markdown[data-internal-link-previews]")
    .forEach(scanMarkdownHost);
};

const cleanupPreviews = (): void => {
  lifecycleGeneration += 1;
  observer?.disconnect();
  observer = null;
  pendingLinks = new WeakMap<HTMLElement, InternalLink>();

  for (const request of requestQueue.splice(0)) request.resolve(null);
  for (const controller of activeControllers) controller.abort();

  previewCache.clear();
};

document.addEventListener("astro:before-swap", cleanupPreviews);
document.addEventListener("astro:page-load", initializePreviews);

// Scripts can execute after the initial page-load event if a route was served
// from a cached transition document. Scanning is idempotent on each host.
initializePreviews();
