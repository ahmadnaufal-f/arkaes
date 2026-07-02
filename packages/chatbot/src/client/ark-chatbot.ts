import { css, html, LitElement, nothing } from "lit";
import { repeat } from "lit/directives/repeat.js";
import { defineElement } from "../define-element";
import type { ChatMessage } from "../shared/types";

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
  /** Whether the panel is open. */
  open = false;

  private _messages: DisplayMessage[] = [];
  private _draft = "";
  private _pending = false;
  private _error = "";
  private _hasOpened = false;

  static override styles = css`
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

    /* ── Launcher ──────────────────────────────────────────────────────── */
    .launcher {
      align-items: center;
      background: linear-gradient(
        135deg,
        var(--ark-color-accent),
        var(--ark-color-accent-strong)
      );
      border: none;
      border-radius: var(--ark-radius-full);
      bottom: 0;
      box-shadow:
        0 10px 30px color-mix(in srgb, var(--ark-color-accent), transparent 65%),
        var(--ark-shadow-sm);
      color: var(--ark-color-accent-contrast);
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
        box-shadow:
          0 14px 36px color-mix(in srgb, var(--ark-color-accent), transparent 55%),
          var(--ark-shadow-sm);
        transform: translateY(-2px);
      }
      &:active {
        transform: translateY(0) scale(0.97);
      }
      &:focus-visible {
        outline: 2px solid var(--ark-color-focus);
        outline-offset: 3px;
      }

      .avatar {
        background: color-mix(in srgb, var(--ark-color-accent-contrast), transparent 84%);
        border-color: color-mix(in srgb, var(--ark-color-accent-contrast), transparent 62%);
        color: var(--ark-color-accent-contrast);
        height: 2.25rem;
        width: 2.25rem;
      }
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
    textarea {
      background: var(--ark-color-bg);
      border: 1px solid var(--ark-color-border);
      border-radius: var(--ark-radius-md);
      color: var(--ark-color-text);
      cursor: var(--ark-cursor-text, text);
      flex: 1;
      font: inherit;
      font-size: var(--ark-text-sm);
      line-height: var(--ark-leading-normal);
      max-height: 7rem;
      min-height: 2.5rem;
      padding: var(--ark-space-2) var(--ark-space-3);
      resize: none;
      transition:
        border-color var(--ark-duration-fast) var(--ark-ease-standard),
        box-shadow var(--ark-duration-fast) var(--ark-ease-standard);

      &::placeholder {
        color: var(--ark-color-text-subtle);
      }
      &:focus-visible {
        border-color: color-mix(in srgb, var(--ark-color-accent), transparent 30%);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--ark-color-accent), transparent 82%);
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
  `;

  override connectedCallback() {
    super.connectedCallback();
    this._hasOpened = readHasOpened();
  }

  private _toggle(open: boolean) {
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
    this._draft = (event.target as HTMLTextAreaElement).value;
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
        const bubbleClass = `bubble bubble--${message.role}${
          message.pending && !thinking ? " bubble--pending" : ""
        }`;
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
            <div class=${bubbleClass}>${thinking ? typingDots : message.content}</div>
          </div>
        `;
      },
    );
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
        <span class="avatar" aria-hidden="true">Æ</span>
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
          <textarea
            .value=${this._draft}
            placeholder=${this.placeholder}
            aria-label=${this.placeholder}
            rows="1"
            @input=${this._onInput}
            @keydown=${this._onKeydown}
          ></textarea>
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
