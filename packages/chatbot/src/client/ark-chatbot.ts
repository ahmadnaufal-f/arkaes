import { css, html, LitElement, nothing } from "lit";
import { repeat } from "lit/directives/repeat.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { defineElement } from "../define-element";
import { markdownStyles, renderMarkdown } from "@arkaes/ui/markdown";
import { splitReply } from "./sources";
import type { ChatMessage, SourceCitation } from "../shared/types";

interface DisplayMessage extends ChatMessage {
  id: string;
  pending?: boolean;
}

let messageCounter = 0;
const nextId = (): string => `msg-${Date.now()}-${++messageCounter}`;

/**
 * Set once the panel has been opened. While absent, the launcher's halo ring
 * breathes as an attention cue; after the first open the cue has done its job
 * and stays off across visits.
 */
const OPENED_STORAGE_KEY = "ark-chatbot:opened";

const readHasOpened = (): boolean => {
  try {
    return localStorage.getItem(OPENED_STORAGE_KEY) !== null;
  } catch {
    return false; // Storage unavailable (privacy mode): keep the cue.
  }
};

const persistHasOpened = () => {
  try {
    localStorage.setItem(OPENED_STORAGE_KEY, "1");
  } catch {
    // Storage unavailable: the cue simply returns next visit.
  }
};

/**
 * The running conversation is mirrored to sessionStorage so it survives
 * client-side navigation between pages on the same origin. The widget lives in
 * the shared layout, but each navigation can hand it a fresh element instance
 * (View Transition persistence does not reliably carry a Lit element's internal
 * reactive state), which would otherwise reset the transcript. sessionStorage
 * keeps the conversation for the life of the browser tab and is cleared when
 * the tab closes — matching "this session's conversation" semantics.
 */
const STATE_STORAGE_KEY = "ark-chatbot:conversation";

interface StoredMessage {
  id: string;
  role: ChatMessage["role"];
  content: string;
}

interface StoredConversation {
  messages: StoredMessage[];
  draft: string;
  open: boolean;
}

const readConversation = (): StoredConversation | null => {
  try {
    const raw = sessionStorage.getItem(STATE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredConversation>;
    if (!parsed || !Array.isArray(parsed.messages)) return null;
    const messages = parsed.messages.filter(
      (message): message is StoredMessage =>
        Boolean(message) &&
        typeof message.id === "string" &&
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string",
    );
    return {
      messages,
      draft: typeof parsed.draft === "string" ? parsed.draft : "",
      open: Boolean(parsed.open),
    };
  } catch {
    return null; // Storage unavailable or corrupt: start fresh.
  }
};

/** Fallback morph duration (ms) when the motion token cannot be read. */
const MORPH_DURATION_FALLBACK_MS = 420;

/**
 * How far past the panel's border box the morph's final clip reaches. The clip
 * is what gives the growing shape its silhouette, and it cuts the panel's drop
 * shadow along with everything else — landing on `inset(0)` would slice the
 * shadow off and then pop it back the moment the clip is released. Ending
 * outside the box leaves the shadow intact through the hand-off.
 */
const MORPH_SHADOW_BLEED_PX = 80;

/** Parse a CSS time token ("0.22s", "220ms") to milliseconds. */
const readDurationMs = (value: string, fallback: number): number => {
  const raw = value.trim();
  const parsed = Number.parseFloat(raw);
  if (!Number.isFinite(parsed)) return fallback;
  const ms = raw.endsWith("ms") ? parsed : raw.endsWith("s") ? parsed * 1000 : NaN;
  return Number.isFinite(ms) && ms > 0 ? ms : fallback;
};

/**
 * The assistant mark: a large four-pointed star with a small one tucked against
 * its shoulder. Each point is drawn as a quadratic curve pulling back through
 * the centre, which is what gives the star its concave waist — and what leaves
 * the diagonals empty, so the small star can sit close without the two touching.
 */
const sparkMark = () => html`
  <svg
    class="spark"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M9.5 5 Q9.5 14.5 19 14.5 Q9.5 14.5 9.5 24 Q9.5 14.5 0 14.5 Q9.5 14.5 9.5 5 Z"
    />
    <path d="M17 1 Q17 7 23 7 Q17 7 17 13 Q17 7 11 7 Q17 7 17 1 Z" />
  </svg>
`;

/**
 * ArkChatbot is a self-contained floating chat widget. It owns a launcher
 * button and a panel; on submit it POSTs the running transcript to `endpoint`
 * and renders the streamed plain-text reply token by token.
 *
 * The assistant is visually branded as "Arkhe": an italic Æ monogram (the
 * ARKÆS glyph) serves as its avatar on the launcher, the panel header, and
 * beside assistant messages. The empty state offers starter-prompt chips
 * (`suggestions`) that submit on click.
 *
 * It depends only on `@arkaes/tokens` CSS custom properties for theming, so it
 * inherits the host site's palette automatically. Because the motion tokens
 * (`--ark-duration-*`) collapse to 1ms under `prefers-reduced-motion`, all
 * one-shot transitions degrade automatically; the looping animations (launcher
 * halo, typing dots) are additionally gated behind an explicit media query.
 *
 * By default it plants itself in the bottom-right corner of the viewport. Set
 * `docked` to hand the launcher's placement to a parent instead — the widget is
 * then an in-flow box the size of its launcher, which is what lets it sit in
 * `ark-floating-action-container`.
 *
 * Opening and closing morphs the launcher into the panel and back: the pill
 * travels to the panel's box and grows into it while the contents cross-fade
 * (see `_startMorph`). It is skipped under `prefers-reduced-motion: reduce`,
 * where a browser cannot animate, and whenever the two boxes cannot be
 * measured — all of which fall back to the plain cross-fade. `no-morph` opts
 * out for good.
 *
 * @attr no-morph - Skip the open/close morph; cross-fade instead.
 */
export class ArkChatbot extends LitElement {
  static override properties = {
    endpoint: { type: String },
    heading: { type: String },
    tagline: { type: String },
    placeholder: { type: String },
    greeting: { type: String },
    suggestions: { type: Array },
    launcherLabel: { attribute: "launcher-label", type: String },
    docked: { reflect: true, type: Boolean },
    noMorph: { attribute: "no-morph", type: Boolean },
    open: { reflect: true, type: Boolean },
    _messages: { state: true },
    _draft: { state: true },
    _pending: { state: true },
    _error: { state: true },
    _hasOpened: { state: true },
  };

  /** URL the transcript is POSTed to. */
  endpoint = "/api/chat";
  /** Panel title — the assistant's name. */
  heading = "Arkhe";
  /** Small line under the title. */
  tagline = "Ask about Ahmad's work";
  /** Input placeholder. */
  placeholder = "Ask a question…";
  /** Optional assistant greeting shown before the first user message. */
  greeting =
    "Hi, I'm Arkhe. Ask me anything about Ahmad's work, skills, or background.";
  /** Starter prompts offered in the empty state; each submits on click. */
  suggestions: string[] = [
    "What does Ahmad work on?",
    "How does he approach design systems?",
    "How can I contact him?",
  ];
  /** Accessible label for the floating launcher button (also its visible text). */
  launcherLabel = "Open chat";
  /**
   * Hand the launcher's placement to a parent — e.g. slot the widget into
   * `ark-floating-action-container` to dock it in a centred row. The panel stays
   * fixed to the viewport; `--ark-chatbot-docked-panel-bottom` sets how far it
   * clears the dock.
   */
  docked = false;
  /**
   * Opt out of the open/close morph and fall back to the plain cross-fade.
   * Negative form because a boolean attribute defaulting to `true` cannot be
   * switched off from HTML.
   */
  noMorph = false;
  /** Whether the panel is open. */
  open = false;

  private _messages: DisplayMessage[] = [];
  private _draft = "";
  private _pending = false;
  private _error = "";
  private _hasOpened = false;
  /** Animations owned by the morph currently in flight, if any. */
  private _morphAnimations: Animation[] = [];

  // markdownStyles first: a shadow root cannot see the app's global
  // stylesheet, so the shared prose rules are adopted here and the bubble's
  // own block below tightens them for chat.
  static override styles = [markdownStyles, css`
    :host {
      --chatbot-width: min(380px, calc(100vw - var(--ark-space-6)));
      --chatbot-height: min(560px, calc(100vh - var(--ark-space-10)));

      bottom: var(--ark-space-5);
      box-sizing: border-box;
      font-family: var(--ark-font-sans);
      pointer-events: none;
      position: fixed;
      right: var(--ark-space-5);
      z-index: 1200;
    }

    /* ── Docked ────────────────────────────────────────────────────────────
       Handing the launcher's placement to a parent (ark-floating-action-
       container docks it in a centred row at the bottom of the page). The host
       joins that row as an ordinary in-flow box the size of the launcher, and
       the panel — far too big to sit in a dock — takes over the fixed
       positioning the host gives up, centred above it.

       Note for the parent: while the panel is open the host must not be given a
       transform, since that would make it the panel's containing block and drag
       the fixed panel back into the dock. Parents that animate their children
       are expected to leave an element carrying the open attribute alone. */
    :host([docked]) {
      bottom: auto;
      position: static;
      right: auto;
      z-index: auto;
    }

    :host([docked]) .launcher {
      bottom: auto;
      position: relative;
      right: auto;
    }

    :host([docked]) .panel {
      /* Clears a dock of the launcher's height plus its block margins. */
      bottom: var(--ark-chatbot-docked-panel-bottom, var(--ark-space-24));
      inset-inline: 0;
      margin-inline: auto;
      position: fixed;
      transform-origin: bottom center;
      /* Above its siblings in the dock — the panel covers them while open. */
      z-index: 1;
    }

    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    /* ── Arkhe monogram (the ARKÆS Æ glyph, cf. ark-brand-logo) ────────── */
    .avatar {
      align-items: center;
      background: var(--ark-color-accent-soft);
      border: 1px solid color-mix(in srgb, var(--ark-color-accent), transparent 65%);
      border-radius: var(--ark-radius-full);
      color: var(--ark-color-accent-strong);
      display: inline-flex;
      flex: none;
      font-family: var(--ark-font-display);
      font-size: 1.05rem;
      font-style: italic;
      font-weight: var(--ark-weight-medium);
      height: 2rem;
      justify-content: center;
      line-height: var(--ark-leading-none);
      user-select: none;
      width: 2rem;
    }
    .avatar--header {
      font-size: 1.25rem;
      height: 2.5rem;
      width: 2.5rem;
    }
    .avatar--log {
      font-size: 0.85rem;
      height: 1.5rem;
      width: 1.5rem;
    }
    .avatar--ghost {
      visibility: hidden;
    }

    /* ── Launcher ──────────────────────────────────────────────────────────
       A raised surface chip rather than a solid accent pill, so it reads as one
       family with the other floating controls it sits beside in a dock
       (ark-scroll-top). Both custom properties below are the way back to a
       louder treatment for a site that wants one. */
    .launcher {
      align-items: center;
      background: var(--ark-chatbot-launcher-bg, var(--ark-color-surface));
      border: 1px solid var(--ark-color-border);
      border-radius: var(--ark-radius-full);
      bottom: 0;
      box-shadow: var(--ark-shadow-float);
      color: var(--ark-chatbot-launcher-color, var(--ark-color-text));
      cursor: var(--ark-cursor-interactive, pointer);
      display: inline-flex;
      gap: var(--ark-space-2);
      height: 3.25rem;
      justify-content: center;
      padding: 0 var(--ark-space-4) 0 var(--ark-space-2);
      pointer-events: auto;
      position: absolute;
      right: 0;
      transition:
        box-shadow var(--ark-duration-normal) var(--ark-ease-standard),
        opacity var(--ark-duration-normal) var(--ark-ease-standard),
        transform var(--ark-duration-normal) var(--ark-ease-spring),
        visibility var(--ark-duration-normal) step-start;
      white-space: nowrap;

      /* Breathing halo ring */
      &::before {
        border: 1px solid color-mix(in srgb, var(--ark-color-accent), transparent 35%);
        border-radius: inherit;
        content: "";
        inset: 0;
        opacity: 0;
        pointer-events: none;
        position: absolute;
      }

      &:hover {
        background: var(--ark-color-accent-soft);
        color: var(--ark-color-accent-strong);
        transform: translateY(-2px);
      }
      &:active {
        transform: translateY(0) scale(0.97);
      }
      &:focus-visible {
        outline: 2px solid var(--ark-color-focus);
        outline-offset: 3px;
      }

      /* On the light chip the avatar goes back to the accent tint the panel
         uses, rather than the knocked-out white it needed on a solid pill. */
      .avatar {
        height: 2.25rem;
        width: 2.25rem;
      }

      &:hover .avatar {
        background: var(--ark-color-surface);
      }
    }

    /* The launcher wears the assistant mark — two four-pointed stars — rather
       than the Æ monogram: it reads as "AI" at a glance where a wordmark
       glyph reads as branding. The monogram still stands in for Arkhe inside
       the panel, where the heading has already introduced it. */
    .spark {
      height: 1.5rem;
      width: 1.5rem;
    }
    /* The halo breathes only until the chat has been opened once (persisted
       in localStorage) — it is an attention cue, not permanent decoration. */
    @media (prefers-reduced-motion: no-preference) {
      .launcher--unseen::before {
        animation: chatbot-halo 3.2s var(--ark-ease-standard) infinite;
      }
    }
    @keyframes chatbot-halo {
      0%,
      55% {
        opacity: 0.7;
        transform: scale(1);
      }
      100% {
        opacity: 0;
        transform: scale(1.22, 1.42);
      }
    }
    .launcher__label {
      font-size: var(--ark-text-sm);
      font-weight: var(--ark-weight-semibold);
      letter-spacing: var(--ark-tracking-wide);
    }
    :host([open]) .launcher {
      opacity: 0;
      pointer-events: none;
      transform: translateY(6px) scale(0.9);
      transition:
        box-shadow var(--ark-duration-normal) var(--ark-ease-standard),
        opacity var(--ark-duration-normal) var(--ark-ease-standard),
        transform var(--ark-duration-normal) var(--ark-ease-standard),
        visibility var(--ark-duration-normal) step-end;
      visibility: hidden;
    }

    /* ── Panel (grows out of the launcher corner, animated both ways) ──── */
    .panel {
      background: var(--ark-color-surface);
      border: 1px solid var(--ark-color-border);
      border-radius: var(--ark-radius-lg);
      box-shadow: var(--ark-shadow-lg);
      display: flex;
      flex-direction: column;
      height: var(--chatbot-height);
      opacity: 0;
      overflow: hidden;
      pointer-events: none;
      transform: translateY(14px) scale(0.96);
      transform-origin: bottom right;
      transition:
        opacity var(--ark-duration-normal) var(--ark-ease-standard),
        transform var(--ark-duration-normal) var(--ark-ease-standard),
        visibility var(--ark-duration-normal) step-end;
      visibility: hidden;
      width: var(--chatbot-width);
    }
    :host([open]) .panel {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0) scale(1);
      transition:
        opacity var(--ark-duration-normal) var(--ark-ease-standard),
        transform var(--ark-duration-normal) var(--ark-ease-emphasized),
        visibility var(--ark-duration-normal) step-start;
      visibility: visible;
    }

    /* ── Morph ─────────────────────────────────────────────────────────────
       While the launcher is being animated into the panel, both elements' own
       open/close styling has to stand down. Otherwise the launcher blinks out
       on the first frame (visibility is a discrete property, it cannot fade)
       and the panel's resting transform composes with the one the morph is
       animating. Neutralising the transform is also what makes the panel's
       measured rect its true resting box — see _startMorph, which sets this
       attribute before it measures.

       Keyframes take over both elements for the duration; nothing here
       animates, so a morph that is cancelled mid-flight simply hands back to
       the CSS above. */
    :host([morphing]) .launcher {
      opacity: 1;
      /* The launcher is a ghost mid-morph — the panel is the live surface. */
      pointer-events: none;
      transform: none;
      transition: none;
      visibility: visible;
    }

    :host([morphing]) .panel {
      opacity: 1;
      transform: none;
      transition: none;
      visibility: visible;
    }

    /* ── Header ────────────────────────────────────────────────────────── */
    .header {
      align-items: center;
      background:
        radial-gradient(
          130% 180% at 0% 0%,
          var(--ark-color-accent-soft),
          transparent 60%
        ),
        var(--ark-color-surface);
      border-bottom: 1px solid var(--ark-color-border);
      color: var(--ark-color-text);
      display: flex;
      gap: var(--ark-space-3);
      padding: var(--ark-space-3) var(--ark-space-4);
    }
    .header__meta {
      display: flex;
      flex: 1;
      flex-direction: column;
      min-width: 0;
    }
    .header__title {
      font-family: var(--ark-font-display);
      font-size: var(--ark-text-lg);
      font-weight: var(--ark-weight-medium);
      letter-spacing: var(--ark-tracking-wide);
      line-height: var(--ark-leading-snug);
    }
    .header__tagline {
      color: var(--ark-color-text-subtle);
      font-size: var(--ark-text-xs);
      letter-spacing: var(--ark-tracking-wide);
    }
    .icon-button {
      align-items: center;
      background: transparent;
      border: none;
      border-radius: var(--ark-radius-xs);
      color: var(--ark-color-text-subtle);
      cursor: var(--ark-cursor-interactive, pointer);
      display: inline-flex;
      height: 1.75rem;
      justify-content: center;
      padding: 0;
      transition:
        background var(--ark-duration-fast) var(--ark-ease-standard),
        color var(--ark-duration-fast) var(--ark-ease-standard),
        transform var(--ark-duration-fast) var(--ark-ease-standard);
      width: 1.75rem;

      &:hover {
        background: var(--ark-color-surface-soft);
        color: var(--ark-color-text);
      }
      &:active {
        transform: scale(0.92);
      }
      &:focus-visible {
        outline: 2px solid var(--ark-color-focus);
        outline-offset: 2px;
      }
    }

    /* ── Message log ───────────────────────────────────────────────────── */
    .log {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: var(--ark-space-3);
      overflow-y: auto;
      padding: var(--ark-space-4);
      scrollbar-color: color-mix(in srgb, var(--ark-color-text-subtle), transparent 55%)
        transparent;
      scrollbar-width: thin;
    }
    .row {
      animation: chatbot-message-in var(--ark-duration-normal) var(--ark-ease-standard)
        both;
      display: flex;
    }
    .row--assistant {
      align-items: flex-end;
      align-self: flex-start;
      gap: var(--ark-space-2);
      max-width: 92%;
    }
    .row--user {
      align-self: flex-end;
      max-width: 85%;
    }
    @keyframes chatbot-message-in {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .bubble {
      font-size: var(--ark-text-sm);
      line-height: var(--ark-leading-normal);
      min-width: 0;
      padding: var(--ark-space-2) var(--ark-space-3);
      white-space: pre-wrap;
      word-break: break-word;
    }
    .bubble--assistant {
      background: var(--ark-color-surface-soft);
      border: 1px solid color-mix(in srgb, var(--ark-color-border), transparent 40%);
      border-radius: var(--ark-radius-md) var(--ark-radius-md) var(--ark-radius-md)
        var(--ark-radius-xs);
      color: var(--ark-color-text);
    }
    .bubble--user {
      background: linear-gradient(
        135deg,
        var(--ark-color-accent),
        var(--ark-color-accent-strong)
      );
      border-radius: var(--ark-radius-md) var(--ark-radius-md) var(--ark-radius-xs)
        var(--ark-radius-md);
      box-shadow: 0 4px 14px color-mix(in srgb, var(--ark-color-accent), transparent 80%);
      color: var(--ark-color-accent-contrast);
    }
    .bubble--pending::after {
      animation: chatbot-blink 1s steps(1) infinite;
      color: var(--ark-color-accent);
      content: "▍";
      margin-left: 1px;
    }
    @keyframes chatbot-blink {
      50% {
        opacity: 0;
      }
    }

    /* ── Rendered Markdown (assistant replies) ─────────────────────────────
       The shared prose rules come from markdownStyles (adopted above). A reply
       is a bubble, not an article, so this block resets the long-form container
       defaults and tightens the block rhythm. */
    .bubble--rich {
      white-space: normal;

      /* markdownStyles caps a body at the reading measure and sets the article
         type scale; inside a bubble the bubble is the measure. */
      &.ark-md {
        color: inherit;
        font-size: inherit;
        line-height: inherit;
        max-width: none;
      }

      & > :first-child {
        margin-top: 0;
      }
      & > :last-child {
        margin-bottom: 0;
      }
      p,
      ul,
      ol,
      pre,
      blockquote {
        margin: 0 0 var(--ark-space-2);
      }
      /* Flow spacing here is per-element margin, not the shared owl rule. */
      & > * + * {
        margin-block-start: 0;
      }
      p,
      li {
        color: inherit;
        line-height: inherit;
      }
      .ark-md-heading {
        font-weight: var(--ark-weight-semibold);
        margin-bottom: var(--ark-space-1);
      }
      ul,
      ol {
        padding-left: var(--ark-space-4);
      }
      li {
        margin-bottom: var(--ark-space-1);
      }
      /* Nested lists hug their parent item instead of carrying the block gap. */
      li > ul,
      li > ol {
        margin-top: var(--ark-space-1);
        margin-bottom: 0;
      }
      a {
        color: var(--ark-color-accent-strong);
        text-decoration: underline;
        text-underline-offset: 2px;
        word-break: break-word;
      }
      a:hover {
        color: var(--ark-color-accent);
      }
      strong {
        font-weight: var(--ark-weight-semibold);
      }
      /* Inline citation markers ([3] / [3, 5]) render as circular badges whose
         numbers match the "Sources" footer below the reply. */
      .ark-md-cites {
        display: inline-flex;
        gap: 0.25em;
        margin-left: 0.2em;
        vertical-align: 0.12em;
      }
      .ark-md-cite {
        align-items: center;
        background: var(--ark-color-accent-soft);
        border: 1px solid color-mix(in srgb, var(--ark-color-accent), transparent 65%);
        border-radius: var(--ark-radius-full);
        color: var(--ark-color-accent-strong);
        display: inline-flex;
        font-size: 0.68rem;
        font-weight: var(--ark-weight-semibold);
        height: 1.4em;
        justify-content: center;
        line-height: var(--ark-leading-none);
        min-width: 1.4em;
        padding: 0 0.28em;
      }
      code {
        background: color-mix(in srgb, var(--ark-color-accent), transparent 88%);
        border-radius: var(--ark-radius-xs);
        font-family: var(--ark-font-mono, ui-monospace, monospace);
        font-size: 0.9em;
        padding: 0.1em 0.3em;
      }
      pre {
        background: var(--ark-color-surface);
        border: 1px solid color-mix(in srgb, var(--ark-color-border), transparent 40%);
        border-radius: var(--ark-radius-sm);
        overflow-x: auto;
        padding: var(--ark-space-2) var(--ark-space-3);
      }
      pre code {
        background: none;
        padding: 0;
      }
      blockquote {
        border-left: 2px solid var(--ark-color-border);
        color: var(--ark-color-text-muted);
        padding-left: var(--ark-space-3);
      }
    }

    /* ── Cited sources footer (appended under an assistant reply) ───────── */
    .sources {
      border-top: 1px solid color-mix(in srgb, var(--ark-color-border), transparent 40%);
      display: flex;
      flex-direction: column;
      gap: var(--ark-space-2);
      margin-top: var(--ark-space-3);
      padding-top: var(--ark-space-2);
    }
    .sources__label {
      color: var(--ark-color-text-subtle);
      font-size: var(--ark-text-xs);
      font-weight: var(--ark-weight-semibold);
      letter-spacing: var(--ark-tracking-wide);
      text-transform: uppercase;
    }
    .sources__list {
      display: flex;
      flex-direction: column;
      gap: var(--ark-space-1);
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .sources__item {
      align-items: baseline;
      display: flex;
      gap: var(--ark-space-2);
    }
    /* The number matches the inline [n] marker in the reply text. */
    .sources__marker {
      align-items: center;
      background: var(--ark-color-accent-soft);
      border-radius: var(--ark-radius-full);
      color: var(--ark-color-accent-strong);
      display: inline-flex;
      flex: none;
      font-size: 0.7rem;
      font-weight: var(--ark-weight-semibold);
      height: 1.15rem;
      justify-content: center;
      line-height: var(--ark-leading-none);
      min-width: 1.15rem;
      padding: 0 0.3em;
    }
    .sources__link,
    .sources__name {
      color: var(--ark-color-text-muted);
      font-size: var(--ark-text-xs);
      line-height: var(--ark-leading-snug);
    }
    .sources__link {
      color: var(--ark-color-accent-strong);
      text-decoration: underline;
      text-underline-offset: 2px;
      transition: color var(--ark-duration-fast) var(--ark-ease-standard);
      word-break: break-word;

      &:hover {
        color: var(--ark-color-accent);
      }
      &:focus-visible {
        border-radius: var(--ark-radius-xs);
        outline: 2px solid var(--ark-color-focus);
        outline-offset: 2px;
      }
    }

    /* Three-dot "thinking" indicator (before the first streamed token) */
    .typing {
      align-items: center;
      display: inline-flex;
      gap: var(--ark-space-1);
      height: 1.2em;

      span {
        background: var(--ark-color-accent);
        border-radius: var(--ark-radius-full);
        height: 0.35rem;
        opacity: 0.35;
        width: 0.35rem;
      }
    }
    @media (prefers-reduced-motion: no-preference) {
      .typing span {
        animation: chatbot-typing 1.1s var(--ark-ease-standard) infinite;

        &:nth-child(2) {
          animation-delay: 0.15s;
        }
        &:nth-child(3) {
          animation-delay: 0.3s;
        }
      }
    }
    @keyframes chatbot-typing {
      0%,
      60%,
      100% {
        opacity: 0.35;
        transform: translateY(0);
      }
      30% {
        opacity: 1;
        transform: translateY(-3px);
      }
    }

    /* ── Empty state: greeting + starter prompts, staggered on open ────── */
    :host([open]) .intro {
      animation: chatbot-message-in var(--ark-duration-slow) var(--ark-ease-standard)
        both;
      animation-delay: calc(var(--intro-step, 0) * 70ms);
    }
    .suggestions {
      align-items: flex-start;
      display: flex;
      flex-direction: column;
      gap: var(--ark-space-2);
      padding-left: calc(1.5rem + var(--ark-space-2));
    }
    .suggestion {
      background: var(--ark-color-surface);
      border: 1px solid var(--ark-color-border);
      border-radius: var(--ark-radius-full);
      color: var(--ark-color-text-muted);
      cursor: var(--ark-cursor-interactive, pointer);
      font-family: inherit;
      font-size: var(--ark-text-xs);
      letter-spacing: var(--ark-tracking-wide);
      padding: var(--ark-space-1) var(--ark-space-3);
      text-align: left;
      transition:
        background var(--ark-duration-fast) var(--ark-ease-standard),
        border-color var(--ark-duration-fast) var(--ark-ease-standard),
        color var(--ark-duration-fast) var(--ark-ease-standard),
        transform var(--ark-duration-fast) var(--ark-ease-standard);

      &:hover {
        background: var(--ark-color-accent-soft);
        border-color: color-mix(in srgb, var(--ark-color-accent), transparent 50%);
        color: var(--ark-color-accent-strong);
        transform: translateX(2px);
      }
      &:focus-visible {
        outline: 2px solid var(--ark-color-focus);
        outline-offset: 2px;
      }
    }

    .error {
      animation: chatbot-message-in var(--ark-duration-normal) var(--ark-ease-standard)
        both;
      color: var(--ark-color-danger);
      font-size: var(--ark-text-xs);
      margin: 0;
      padding: 0 var(--ark-space-4) var(--ark-space-2);
    }

    /* ── Composer ──────────────────────────────────────────────────────── */
    .composer {
      align-items: flex-end;
      border-top: 1px solid var(--ark-color-border);
      display: flex;
      gap: var(--ark-space-2);
      padding: var(--ark-space-3);
    }
    /* The bordered box. Vertical padding lives HERE (outside the textarea's
       scroll viewport) so overflowing text can never peek through it. */
    .field {
      background: var(--ark-color-bg);
      border: 1px solid var(--ark-color-border);
      border-radius: var(--ark-radius-md);
      cursor: var(--ark-cursor-text, text);
      flex: 1;
      min-width: 0;
      padding: var(--ark-space-2) var(--ark-space-3);
      transition:
        border-color var(--ark-duration-fast) var(--ark-ease-standard),
        box-shadow var(--ark-duration-fast) var(--ark-ease-standard);

      &:focus-within {
        border-color: color-mix(in srgb, var(--ark-color-accent), transparent 30%);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--ark-color-accent), transparent 82%);
      }
    }
    textarea {
      background: transparent;
      border: none;
      color: var(--ark-color-text);
      cursor: inherit;
      display: block;
      font: inherit;
      font-size: var(--ark-text-sm);
      line-height: var(--ark-leading-normal);
      /* No padding/border here, so the scroll viewport is an exact multiple of
         the line height — _resizeInput clamps to whole lines (max 3) and no
         partial line shows through. This em fallback matches that cap. */
      max-height: calc(3 * var(--ark-leading-normal) * 1em);
      overflow-y: auto;
      padding: 0;
      resize: none;
      width: 100%;

      &::placeholder {
        color: var(--ark-color-text-subtle);
      }
      &:focus-visible {
        outline: none;
      }
    }
    .send {
      align-items: center;
      background: linear-gradient(
        135deg,
        var(--ark-color-accent),
        var(--ark-color-accent-strong)
      );
      border: none;
      border-radius: var(--ark-radius-md);
      color: var(--ark-color-accent-contrast);
      cursor: var(--ark-cursor-interactive, pointer);
      display: inline-flex;
      flex: none;
      height: 2.5rem;
      justify-content: center;
      transition:
        box-shadow var(--ark-duration-fast) var(--ark-ease-standard),
        opacity var(--ark-duration-fast) var(--ark-ease-standard),
        transform var(--ark-duration-fast) var(--ark-ease-standard);
      width: 2.5rem;

      svg {
        transition: transform var(--ark-duration-normal) var(--ark-ease-spring);
      }
      &:hover:not(:disabled) {
        box-shadow: 0 6px 18px color-mix(in srgb, var(--ark-color-accent), transparent 65%);
        transform: translateY(-1px);

        svg {
          transform: translate(1px, -1px) rotate(-8deg);
        }
      }
      &:active:not(:disabled) {
        transform: scale(0.94);
      }
      &:disabled {
        cursor: not-allowed;
        opacity: 0.45;
      }
      &:focus-visible {
        outline: 2px solid var(--ark-color-focus);
        outline-offset: 2px;
      }
    }
  `];

  override connectedCallback() {
    super.connectedCallback();
    this._hasOpened = readHasOpened();
    this._restoreConversation();
  }

  override disconnectedCallback() {
    // A morph left running would hold the elements at a mid-flight clip if the
    // widget is re-attached (a client-side navigation moving it, say).
    this._cancelMorph();
    super.disconnectedCallback();
  }

  /**
   * Rehydrate the transcript, draft, and open state from sessionStorage. Only a
   * fresh instance is hydrated: if this element already holds messages (e.g. it
   * survived a navigation with its state intact, or a reply is mid-stream) we
   * leave the live state untouched so nothing is clobbered.
   */
  private _restoreConversation() {
    if (this._messages.length > 0 || this._pending) return;
    const saved = readConversation();
    if (!saved) return;
    this._messages = saved.messages.map((message) => ({ ...message }));
    this._draft = saved.draft;
    this.open = saved.open;
  }

  /**
   * Mirror the current conversation to sessionStorage. Pending placeholders are
   * dropped and the streaming flag is not stored, so a transcript restored on
   * the next page is always settled — a reply interrupted by navigation simply
   * keeps whatever text had streamed in so far.
   */
  private _persistConversation() {
    try {
      const messages: StoredMessage[] = this._messages
        .filter((message) => !(message.pending && message.content === ""))
        .map((message) => ({
          id: message.id,
          role: message.role,
          content: message.content,
        }));
      const snapshot: StoredConversation = {
        messages,
        draft: this._draft,
        open: this.open,
      };
      sessionStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      // Storage unavailable (privacy mode / quota): persistence is best-effort.
    }
  }

  /**
   * Morph the launcher into the panel (and back): the pill travels to the
   * panel's box and grows into it while the contents cross-fade — the
   * container-transform idea, so the panel reads as the launcher expanding
   * rather than as a new surface appearing.
   *
   * The shape is a `clip-path` window rather than a scale, so the panel's text
   * is revealed at its final size instead of being stretched through the
   * motion, and nothing inside the panel is laid out more than once.
   *
   * Deliberately not the View Transition API, though that is the obvious tool
   * for a morph: it cannot capture elements inside a shadow root — the name
   * computes but no snapshot is taken, so no group is generated and nothing
   * animates. It would also snapshot and freeze the whole host page for the
   * duration, and collide with any view transition the host app runs of its
   * own (a router's, say), since only one can be live per document.
   *
   * Returns false when it cannot run, leaving the caller on the CSS
   * cross-fade.
   */
  private _startMorph(open: boolean): boolean {
    if (this.noMorph) return false;
    if (typeof Element === "undefined" || !Element.prototype.animate) return false;
    // Under reduced motion the cross-fade already collapses to 1ms via the
    // duration tokens; a morph would be exactly the sweeping motion the
    // preference asks us not to make.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      return false;
    }

    const launcher = this.renderRoot.querySelector<HTMLElement>(".launcher");
    const panel = this.renderRoot.querySelector<HTMLElement>(".panel");
    if (!launcher || !panel) return false;

    this._cancelMorph();
    // Set before measuring: the attribute zeroes the panel's resting transform,
    // which getBoundingClientRect would otherwise bake into the geometry.
    this.toggleAttribute("morphing", true);

    const from = launcher.getBoundingClientRect();
    const to = panel.getBoundingClientRect();
    // Nothing to interpolate if either box is unrendered (a DOM shim, or a
    // display:none ancestor) — hand back to the cross-fade.
    if (!from.width || !from.height || !to.width || !to.height) {
      this.toggleAttribute("morphing", false);
      return false;
    }

    const style = getComputedStyle(panel);
    // The slow token, not the normal one the cross-fade uses: this surface
    // travels the height of the dock and grows from a pill to most of the
    // screen, and at 220ms it is over before the eye can follow the shape.
    const duration = readDurationMs(
      style.getPropertyValue("--ark-duration-slow"),
      MORPH_DURATION_FALLBACK_MS,
    );
    // Standard rather than emphasized: the emphasized curve overshoots, which
    // on a clip-path reads as the panel snapping past its own edges.
    const easing =
      style.getPropertyValue("--ark-ease-standard").trim() ||
      "cubic-bezier(0.2, 0, 0, 1)";

    // The panel is centred on the launcher and clipped to a launcher-sized
    // window at the start; both are released as it lands.
    const collapsed = {
      translate: `${from.left + from.width / 2 - (to.left + to.width / 2)}px ${
        from.top + from.height / 2 - (to.top + to.height / 2)
      }px`,
      clipPath: `inset(${Math.max(0, (to.height - from.height) / 2)}px ${Math.max(
        0,
        (to.width - from.width) / 2,
      )}px round ${Math.min(from.width, from.height) / 2}px)`,
    };
    const expanded = {
      translate: "0px 0px",
      clipPath: `inset(${-MORPH_SHADOW_BLEED_PX}px round ${style.borderRadius})`,
    };

    const shape = open ? [collapsed, expanded] : [expanded, collapsed];
    // The launcher clears out early on the way in; on the way out it is back to
    // full opacity before the morph ends, so that it is already covering the
    // collapsed panel by the time that panel fades out underneath it (below).
    const fade = open ? [{ opacity: 1 }, { opacity: 0 }] : [{ opacity: 0 }, { opacity: 1 }];
    const contents = open ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 0 }];

    this._morphAnimations = [
      panel.animate(shape, { duration, easing, fill: "both" }),
      launcher.animate(fade, {
        duration: duration * (open ? 0.45 : 0.4),
        delay: open ? 0 : duration * 0.45,
        easing,
        fill: "both",
      }),
      ...Array.from(panel.children).map((child) =>
        child.animate(contents, {
          duration: duration * 0.6,
          delay: open ? duration * 0.4 : 0,
          easing,
          fill: "both",
        }),
      ),
    ];

    if (!open) {
      // The close morph has to land on opacity 0, not merely on a collapsed
      // shape. Releasing the animations hands the panel back to CSS, where the
      // closed rule is `opacity: 0` *with a transition* — so a panel still
      // committed at opacity 1 starts that transition from a full-size,
      // no-longer-clipped box, and the whole panel flashes back for the length
      // of the transition before fading out. Landing at 0 leaves the transition
      // nothing to animate.
      //
      // It runs in the last sliver of the morph, by which point the shape has
      // collapsed onto the launcher's rect and the launcher is opaque over it,
      // so it is never actually seen: this exists to make the hand-off exact.
      // The panel's transform has the same delta on release and is deliberately
      // left alone — at opacity 0 it cannot be observed.
      this._morphAnimations.push(
        panel.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: duration * 0.15,
          delay: duration * 0.85,
          easing,
          fill: "both",
        }),
      );
    }

    const running = this._morphAnimations;
    void Promise.allSettled(running.map((animation) => animation.finished)).then(
      () => {
        // A morph started since this one owns the element now.
        if (this._morphAnimations !== running) return;
        this._cancelMorph();
      },
    );
    return true;
  }

  /**
   * Drop any in-flight morph and hand both elements back to the CSS, which
   * already describes the resting state for whatever `open` currently is.
   */
  private _cancelMorph() {
    this._morphAnimations.forEach((animation) => animation.cancel());
    this._morphAnimations = [];
    this.toggleAttribute("morphing", false);
  }

  private _toggle(open: boolean) {
    // Started before the state change and synchronously with it, so the first
    // frame after the toggle is already mid-morph rather than showing the
    // panel at rest.
    this._startMorph(open);
    this.open = open;
    if (open) {
      if (!this._hasOpened) {
        this._hasOpened = true;
        persistHasOpened();
      }
      this.updateComplete.then(() => {
        this.renderRoot.querySelector<HTMLTextAreaElement>("textarea")?.focus();
      });
    }
  }

  private _onInput(event: Event) {
    const el = event.target as HTMLTextAreaElement;
    this._draft = el.value;
    this._resizeInput(el);
  }

  /**
   * Grow the composer to fit its content, capped at 3 lines (then it scrolls).
   * The textarea has no padding or border of its own (the .field wrapper holds
   * those), so its height is a plain multiple of the line height. The 1px
   * tolerance keeps sub-pixel line-height rounding from tripping the scrollbar
   * exactly at 3 lines.
   */
  private _resizeInput(el: HTMLTextAreaElement) {
    const style = getComputedStyle(el);
    const fontSize = parseFloat(style.fontSize);
    // getComputedStyle usually returns line-height in px; fall back to the
    // leading ratio if it reports "normal" (NaN) or a raw multiplier.
    let lineHeight = parseFloat(style.lineHeight);
    if (!lineHeight || lineHeight < fontSize) lineHeight = fontSize * 1.62;

    const maxHeight = lineHeight * 3;
    el.style.height = "auto";
    const full = el.scrollHeight;
    el.style.height = `${Math.min(full, maxHeight)}px`;
    el.style.overflowY = full > maxHeight + 1 ? "auto" : "hidden";
  }

  private _onKeydown(event: KeyboardEvent) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void this._send();
    }
  }

  private _ask(question: string) {
    if (this._pending) return;
    this._draft = question;
    void this._send();
  }

  private async _send() {
    const content = this._draft.trim();
    if (!content || this._pending) return;

    this._error = "";
    this._draft = "";
    // Collapse the composer back to one line once the draft is cleared.
    this.updateComplete.then(() => {
      const input = this.renderRoot.querySelector<HTMLTextAreaElement>("textarea");
      if (input) this._resizeInput(input);
    });
    const userMessage: DisplayMessage = { id: nextId(), role: "user", content };
    const reply: DisplayMessage = {
      id: nextId(),
      role: "assistant",
      content: "",
      pending: true,
    };
    this._messages = [...this._messages, userMessage, reply];
    this._pending = true;

    const transcript: ChatMessage[] = this._messages
      .filter((message) => message.id !== reply.id)
      .map(({ role, content: text }) => ({ role, content: text }));

    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: transcript }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Request failed (${response.status})`);
      }

      const decoder = new TextDecoder();
      const streamReader = response.body.getReader();
      for (;;) {
        const { done, value } = await streamReader.read();
        if (done) break;
        reply.content += decoder.decode(value, { stream: true });
        this._messages = [...this._messages];
      }
    } catch {
      this._error = "Something went wrong. Please try again.";
      this._messages = this._messages.filter(
        (message) => message.id !== reply.id,
      );
    } finally {
      reply.pending = false;
      this._pending = false;
      this._messages = [...this._messages];
    }
  }

  override updated() {
    const log = this.renderRoot.querySelector<HTMLElement>(".log");
    if (log) log.scrollTop = log.scrollHeight;
    this._persistConversation();
  }

  private _renderLog() {
    if (this._messages.length === 0) {
      return html`
        <div class="row row--assistant intro" style="--intro-step: 0">
          <span class="avatar avatar--log" aria-hidden="true">Æ</span>
          <div class="bubble bubble--assistant">${this.greeting}</div>
        </div>
        ${this.suggestions.length > 0
          ? html`
              <div class="suggestions">
                ${this.suggestions.map(
                  (suggestion, index) => html`
                    <button
                      class="suggestion intro"
                      type="button"
                      style="--intro-step: ${index + 1}"
                      @click=${() => this._ask(suggestion)}
                    >
                      ${suggestion}
                    </button>
                  `,
                )}
              </div>
            `
          : nothing}
      `;
    }
    return repeat(
      this._messages,
      (message) => message.id,
      (message, index) => {
        const thinking = Boolean(message.pending) && message.content === "";
        const firstOfRun = this._messages[index - 1]?.role !== "assistant";
        // Assistant replies are Markdown; render them as rich HTML. User
        // messages stay plain text (Lit escapes the binding).
        const rich = message.role === "assistant" && !thinking;
        const bubbleClass = `bubble bubble--${message.role}${
          message.pending && !thinking ? " bubble--pending" : ""
        }${rich ? " bubble--rich ark-md ark-md-headings-flat" : ""}`;
        // Rich replies may carry an appended sources payload; split it off so
        // the answer renders as Markdown and the sources render as a footer.
        const split = rich ? splitReply(message.content) : null;
        const body = thinking
          ? typingDots
          : split
            ? html`${unsafeHTML(
              renderMarkdown(split.body, {
                features: ["citations"],
                headings: "flat",
                softBreaks: true,
              }),
            )}${this._renderSources(
              split.sources,
            )}`
            : message.content;
        // Bubble content stays on one line: the bubble renders with
        // `white-space: pre-wrap`, so template whitespace would be visible.
        return html`
          <div class="row row--${message.role}">
            ${message.role === "assistant"
              ? html`
                  <span
                    class="avatar avatar--log ${firstOfRun ? "" : "avatar--ghost"}"
                    aria-hidden="true"
                    >Æ</span
                  >
                `
              : nothing}
            <div class=${bubbleClass}>${body}</div>
          </div>
        `;
      },
    );
  }

  /**
   * Render the "Sources" footer for a reply. Each entry shows its citation
   * number (matching the inline `[n]` markers) and links to the source's page
   * when it has one. Root-relative links stay in-tab so the conversation, kept
   * in sessionStorage, survives the navigation.
   */
  private _renderSources(sources: SourceCitation[]) {
    if (sources.length === 0) return nothing;
    return html`
      <div class="sources" role="group" aria-label="Sources">
        <span class="sources__label">Sources</span>
        <ul class="sources__list">
          ${sources.map((source) => {
            const href = safeHref(source.url);
            const external = href ? /^https?:/i.test(href) : false;
            return html`
              <li class="sources__item">
                <span class="sources__marker" aria-hidden="true"
                  >${source.n}</span
                >
                ${href
                  ? html`<a
                      class="sources__link"
                      href=${href}
                      target=${external ? "_blank" : nothing}
                      rel=${external ? "noopener noreferrer" : nothing}
                      >${source.label}</a
                    >`
                  : html`<span class="sources__name">${source.label}</span>`}
              </li>
            `;
          })}
        </ul>
      </div>
    `;
  }

  override render() {
    return html`
      <button
        class="launcher ${this._hasOpened ? "" : "launcher--unseen"}"
        type="button"
        aria-label=${this.launcherLabel}
        data-cursor-label="Open"
        @click=${() => this._toggle(true)}
      >
        <span class="avatar" aria-hidden="true">${sparkMark()}</span>
        <span class="launcher__label">${this.launcherLabel}</span>
      </button>

      <section
        class="panel"
        role="dialog"
        aria-label=${this.heading}
        aria-modal="false"
      >
        <header class="header">
          <span class="avatar avatar--header" aria-hidden="true">Æ</span>
          <div class="header__meta">
            <span class="header__title">${this.heading}</span>
            <span class="header__tagline">${this.tagline}</span>
          </div>
          <button
            class="icon-button"
            type="button"
            aria-label="Close chat"
            data-cursor-label="Close"
            @click=${() => this._toggle(false)}
          >
            ${closeIcon}
          </button>
        </header>

        <div class="log" role="log" aria-live="polite">${this._renderLog()}</div>

        ${this._error
          ? html`<p class="error" role="alert">${this._error}</p>`
          : nothing}

        <form
          class="composer"
          @submit=${(event: Event) => {
            event.preventDefault();
            void this._send();
          }}
        >
          <div class="field">
            <textarea
              .value=${this._draft}
              placeholder=${this.placeholder}
              aria-label=${this.placeholder}
              rows="1"
              @input=${this._onInput}
              @keydown=${this._onKeydown}
            ></textarea>
          </div>
          <button
            class="send"
            type="submit"
            aria-label="Send message"
            ?disabled=${this._pending || this._draft.trim() === ""}
          >
            ${sendIcon}
          </button>
        </form>
      </section>
    `;
  }
}

// Only allow http(s), mailto, or root-relative (`/path`, not `//host`) hrefs on
// source links, mirroring the markdown renderer's URL guard.
const SAFE_HREF = /^(https?:|mailto:|\/(?!\/))/i;
const safeHref = (url: string | undefined): string | undefined =>
  url && SAFE_HREF.test(url) ? url : undefined;

// Kept whitespace-free: it renders inside a `pre-wrap` bubble.
// prettier-ignore
const typingDots = html`<span class="typing" role="status" aria-label="Arkhe is thinking"><span></span><span></span><span></span></span>`;

const closeIcon = html`
  <svg
    width="14"
    height="14"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    stroke-width="1.6"
    stroke-linecap="round"
    aria-hidden="true"
  >
    <path d="M4 4l8 8M12 4l-8 8" />
  </svg>
`;

const sendIcon = html`
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    stroke-width="1.6"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M2 8l12-5-4.5 12-2.5-5z" />
    <path d="M7 11l2.5-3" />
  </svg>
`;

export const defineArkChatbot = () => {
  defineElement("ark-chatbot", ArkChatbot);
};

declare global {
  interface HTMLElementTagNameMap {
    "ark-chatbot": ArkChatbot;
  }
}
