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
 * ArkChatbot is a self-contained floating chat widget. It owns a launcher
 * button and a panel; on submit it POSTs the running transcript to `endpoint`
 * and renders the streamed plain-text reply token by token.
 *
 * It depends only on `@arkaes/tokens` CSS custom properties for theming, so it
 * inherits the host site's palette automatically.
 */
export class ArkChatbot extends LitElement {
  static override properties = {
    endpoint: { type: String },
    heading: { type: String },
    placeholder: { type: String },
    greeting: { type: String },
    launcherLabel: { attribute: "launcher-label", type: String },
    open: { reflect: true, type: Boolean },
    _messages: { state: true },
    _draft: { state: true },
    _pending: { state: true },
    _error: { state: true },
  };

  /** URL the transcript is POSTed to. */
  endpoint = "/api/chat";
  /** Panel title. */
  heading = "Ask about me";
  /** Input placeholder. */
  placeholder = "Ask a question…";
  /** Optional assistant greeting shown before the first user message. */
  greeting = "Hi! Ask me anything about my work, skills, or background.";
  /** Accessible label for the floating launcher button. */
  launcherLabel = "Open chat";
  /** Whether the panel is open. */
  open = false;

  private _messages: DisplayMessage[] = [];
  private _draft = "";
  private _pending = false;
  private _error = "";

  static override styles = css`
    :host {
      --chatbot-width: min(380px, calc(100vw - var(--ark-space-6)));
      --chatbot-height: min(560px, calc(100vh - var(--ark-space-10)));

      bottom: var(--ark-space-5);
      box-sizing: border-box;
      font-family: var(--ark-font-sans);
      position: fixed;
      right: var(--ark-space-5);
      z-index: 1200;
    }

    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    .launcher {
      align-items: center;
      background: var(--ark-color-accent);
      border: none;
      border-radius: var(--ark-radius-full, 999px);
      box-shadow: var(--ark-shadow-lg, 0 12px 32px rgb(0 0 0 / 18%));
      color: var(--ark-color-on-accent, #fff);
      cursor: var(--ark-cursor-interactive, pointer);
      display: inline-flex;
      gap: var(--ark-space-2);
      height: 3.25rem;
      justify-content: center;
      padding: 0 var(--ark-space-4);
      transition: transform var(--ark-duration-fast) var(--ark-ease-standard);
    }
    .launcher:hover {
      transform: translateY(-2px);
    }
    .launcher:focus-visible {
      outline: 2px solid var(--ark-color-focus);
      outline-offset: 3px;
    }
    .launcher__label {
      font-size: var(--ark-text-sm);
      font-weight: var(--ark-weight-semibold);
    }
    :host([open]) .launcher {
      display: none;
    }

    .panel {
      background: var(--ark-color-surface);
      border: 1px solid var(--ark-color-border);
      border-radius: var(--ark-radius-lg);
      box-shadow: var(--ark-shadow-lg, 0 16px 48px rgb(0 0 0 / 22%));
      display: flex;
      flex-direction: column;
      height: var(--chatbot-height);
      overflow: hidden;
      width: var(--chatbot-width);
    }
    :host(:not([open])) .panel {
      display: none;
    }
    @media (prefers-reduced-motion: no-preference) {
      :host([open]) .panel {
        animation: chatbot-in var(--ark-duration-normal) var(--ark-ease-standard);
      }
    }
    @keyframes chatbot-in {
      from {
        opacity: 0;
        transform: translateY(12px) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .header {
      align-items: center;
      background: var(--ark-color-surface-soft, var(--ark-color-surface));
      border-bottom: 1px solid var(--ark-color-border);
      color: var(--ark-color-text);
      display: flex;
      gap: var(--ark-space-3);
      justify-content: space-between;
      padding: var(--ark-space-3) var(--ark-space-4);
    }
    .header__title {
      font-size: var(--ark-text-sm);
      font-weight: var(--ark-weight-semibold);
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
      width: 1.75rem;
    }
    .icon-button:hover {
      background: var(--ark-color-surface-soft);
      color: var(--ark-color-text);
    }
    .icon-button:focus-visible {
      outline: 2px solid var(--ark-color-focus);
      outline-offset: 2px;
    }

    .log {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: var(--ark-space-3);
      overflow-y: auto;
      padding: var(--ark-space-4);
    }
    .bubble {
      border-radius: var(--ark-radius-md);
      font-size: var(--ark-text-sm);
      line-height: var(--ark-leading-normal);
      max-width: 85%;
      padding: var(--ark-space-2) var(--ark-space-3);
      white-space: pre-wrap;
      word-break: break-word;
    }
    .bubble--assistant {
      align-self: flex-start;
      background: var(--ark-color-surface-soft, var(--ark-color-bg));
      color: var(--ark-color-text);
    }
    .bubble--user {
      align-self: flex-end;
      background: var(--ark-color-accent);
      color: var(--ark-color-on-accent, #fff);
    }
    .bubble--pending::after {
      animation: chatbot-blink 1s steps(1) infinite;
      content: "▍";
      margin-left: 1px;
    }
    @keyframes chatbot-blink {
      50% {
        opacity: 0;
      }
    }
    .error {
      color: var(--ark-color-danger);
      font-size: var(--ark-text-xs, 0.75rem);
      padding: 0 var(--ark-space-4);
    }

    .composer {
      align-items: flex-end;
      border-top: 1px solid var(--ark-color-border);
      display: flex;
      gap: var(--ark-space-2);
      padding: var(--ark-space-3);
    }
    textarea {
      background: var(--ark-color-bg, var(--ark-color-surface));
      border: 1px solid var(--ark-color-border);
      border-radius: var(--ark-radius-md);
      color: var(--ark-color-text);
      flex: 1;
      font: inherit;
      font-size: var(--ark-text-sm);
      max-height: 7rem;
      min-height: 2.5rem;
      padding: var(--ark-space-2) var(--ark-space-3);
      resize: none;
    }
    textarea:focus-visible {
      border-color: var(--ark-color-accent);
      outline: none;
    }
    .send {
      align-items: center;
      background: var(--ark-color-accent);
      border: none;
      border-radius: var(--ark-radius-md);
      color: var(--ark-color-on-accent, #fff);
      cursor: var(--ark-cursor-interactive, pointer);
      display: inline-flex;
      height: 2.5rem;
      justify-content: center;
      width: 2.5rem;
    }
    .send:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
    .send:focus-visible {
      outline: 2px solid var(--ark-color-focus);
      outline-offset: 2px;
    }
  `;

  private _toggle(open: boolean) {
    this.open = open;
    if (open) {
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
      return html`<div class="bubble bubble--assistant">${this.greeting}</div>`;
    }
    return repeat(
      this._messages,
      (message) => message.id,
      (message) => html`
        <div
          class="bubble bubble--${message.role} ${message.pending &&
          message.content === ""
            ? "bubble--pending"
            : ""}"
        >
          ${message.content}
        </div>
      `,
    );
  }

  override render() {
    return html`
      <button
        class="launcher"
        type="button"
        aria-label=${this.launcherLabel}
        @click=${() => this._toggle(true)}
      >
        ${chatIcon}
        <span class="launcher__label">${this.heading}</span>
      </button>

      <section
        class="panel"
        role="dialog"
        aria-label=${this.heading}
        aria-modal="false"
      >
        <header class="header">
          <span class="header__title">${this.heading}</span>
          <button
            class="icon-button"
            type="button"
            aria-label="Close chat"
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

const chatIcon = html`
  <svg
    width="18"
    height="18"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    stroke-width="1.6"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M2 3.5h12v8H6l-3 2.5v-2.5H2z" />
  </svg>
`;

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
