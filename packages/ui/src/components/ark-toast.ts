import { css, html, LitElement, nothing, svg } from "lit";
import { choose } from "lit/directives/choose.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { repeat } from "lit/directives/repeat.js";
import { defineElement } from "../define-element";
import {
  getToasts,
  subscribeToToasts,
  toast,
  type ToastPosition,
  type ToastRecord,
  type ToastVariantValue,
} from "./toast-store";

export enum ToastVariant {
  Default = "default",
  Success = "success",
  Error = "error",
  Warning = "warning",
  Info = "info",
  Loading = "loading",
}

const toastPositions = new Set<string>([
  "top-left",
  "top-center",
  "top-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
]);

const normalizeToastPosition = (position: string): ToastPosition =>
  (toastPositions.has(position) ? position : "bottom-center") as ToastPosition;

/**
 * ArkToast is a single notification. Use it declaratively (toggle `open`) or
 * let `<ark-toaster>` spawn it from the imperative `toast()` store.
 */
export class ArkToast extends LitElement {
  static override properties = {
    variant: { reflect: true, type: String },
    open: { reflect: true, type: Boolean },
    duration: { type: Number },
    heading: { type: String },
  };

  static override styles = css`
    :host {
      --toast-accent: var(--ark-color-accent);

      box-sizing: border-box;
      display: block;
      pointer-events: auto;
      width: 100%;
    }

    :host([variant="success"]) {
      --toast-accent: var(--ark-color-secondary);
    }
    :host([variant="error"]) {
      --toast-accent: var(--ark-color-danger);
    }
    :host([variant="warning"]) {
      --toast-accent: var(--ark-color-accent-strong);
    }
    :host([variant="info"]) {
      --toast-accent: var(--ark-color-accent);
    }
    :host([variant="loading"]) {
      --toast-accent: var(--ark-color-text-subtle);
    }

    @keyframes ark-toast-in {
      from {
        opacity: 0;
        transform: translateY(var(--ark-toast-enter-from, 0.75rem));
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    :host(:not([open])) {
      display: none;
    }

    :host([open]) {
      animation: ark-toast-in var(--ark-duration-normal) var(--ark-ease-standard);
    }

    @media (prefers-reduced-motion: reduce) {
      :host([open]) {
        animation: none;
      }
    }

    .toast {
      align-items: flex-start;
      background: var(--ark-color-surface);
      border: 1px solid var(--ark-color-border);
      border-left: 3px solid var(--toast-accent);
      border-radius: var(--ark-radius-md);
      box-shadow: var(--ark-shadow-md);
      box-sizing: border-box;
      color: var(--ark-color-text);
      display: flex;
      font-family: var(--ark-font-sans);
      gap: var(--ark-space-3);
      padding: var(--ark-space-3) var(--ark-space-4);
      width: 100%;
    }

    .icon {
      color: var(--toast-accent);
      display: inline-flex;
      flex-shrink: 0;
      line-height: 0;
      margin-top: 0.1em;
    }

    .content {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: var(--ark-space-1);
      min-width: 0;
    }

    .heading {
      color: var(--ark-color-text);
      font-size: var(--ark-text-sm);
      font-weight: var(--ark-weight-semibold);
      line-height: var(--ark-leading-snug);
    }

    .message {
      color: var(--ark-color-text);
      font-size: var(--ark-text-sm);
      line-height: var(--ark-leading-normal);
    }

    /* When a heading is present the message becomes supporting copy. */
    .heading + .message {
      color: var(--ark-color-text-muted);
    }

    ::slotted(*) {
      margin: 0;
    }

    .close {
      align-items: center;
      background: transparent;
      border: none;
      border-radius: var(--ark-radius-xs);
      color: var(--ark-color-text-subtle);
      cursor: var(--ark-cursor-interactive);
      display: inline-flex;
      flex-shrink: 0;
      height: 1.5rem;
      justify-content: center;
      margin: -0.25rem -0.25rem -0.25rem 0;
      padding: 0;
      transition:
        background var(--ark-duration-fast) var(--ark-ease-standard),
        color var(--ark-duration-fast) var(--ark-ease-standard);
      width: 1.5rem;
    }

    .close:hover {
      background: var(--ark-color-surface-soft);
      color: var(--ark-color-text);
    }

    .close:focus-visible {
      outline: 2px solid var(--ark-color-focus);
      outline-offset: 2px;
    }
  `;

  variant: ToastVariantValue | string = ToastVariant.Default;
  open = false;
  duration = 4000;
  heading?: string;

  private _timer?: ReturnType<typeof setTimeout>;

  override updated(changed: Map<string, unknown>) {
    if (changed.has("open") || changed.has("duration")) {
      this._resetTimer();
    }
  }

  override disconnectedCallback() {
    this._clearTimer();
    super.disconnectedCallback();
  }

  private _resetTimer() {
    this._clearTimer();
    if (this.open && this.duration > 0) {
      this._timer = setTimeout(() => this.dismiss(), this.duration);
    }
  }

  private _clearTimer() {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = undefined;
    }
  }

  /** Close the toast and notify listeners. */
  dismiss() {
    this._clearTimer();
    if (!this.open) return;
    this.open = false;
    this.dispatchEvent(
      new CustomEvent("ark-toast:dismiss", {
        bubbles: true,
        composed: true,
        detail: { id: this.id || undefined },
      }),
    );
  }

  private _renderIcon() {
    if (this.variant === ToastVariant.Loading) {
      return html`<span class="icon"
        ><ark-spinner size="sm" decorative></ark-spinner
      ></span>`;
    }

    const glyph = choose<string, ReturnType<typeof svg>>(
      this.variant,
      [
        [
          ToastVariant.Success,
          () => svg`<path d="M3.5 8.5l3 3 6-6" />`,
        ],
        [
          ToastVariant.Error,
          () => svg`<path d="M5 5l6 6M11 5l-6 6" />`,
        ],
        [
          ToastVariant.Warning,
          () =>
            svg`<path d="M8 2.5l6 11H2l6-11z" /><path d="M8 6.5v3.5" /><path d="M8 11.6v.01" />`,
        ],
        [
          ToastVariant.Info,
          () =>
            svg`<circle cx="8" cy="8" r="6.2" /><path d="M8 7.2v4" /><path d="M8 5v.01" />`,
        ],
      ],
      () => svg`<circle cx="8" cy="8" r="3" fill="currentColor" stroke="none" />`,
    );

    return html`
      <span class="icon" aria-hidden="true">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          ${glyph}
        </svg>
      </span>
    `;
  }

  override render() {
    return html`
      <div class="toast" role="status" aria-live="polite">
        ${this._renderIcon()}
        <div class="content">
          ${this.heading
            ? html`<div class="heading">${this.heading}</div>`
            : nothing}
          <div class="message"><slot></slot></div>
        </div>
        <button
          class="close"
          type="button"
          aria-label="Dismiss notification"
          @click=${() => this.dismiss()}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
          >
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
      </div>
    `;
  }
}

/**
 * ArkToaster is the fixed-position region that lays out toasts. It renders
 * declaratively-slotted `<ark-toast>` children and store-driven transient
 * toasts whose `position` matches its own. Default position: bottom-center.
 */
export class ArkToaster extends LitElement {
  static override properties = {
    position: { reflect: true, type: String },
  };

  static override styles = css`
    :host {
      align-items: center;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: var(--ark-space-3);
      max-width: min(420px, calc(100vw - var(--ark-space-8)));
      padding: var(--ark-space-4);
      pointer-events: none;
      position: fixed;
      width: 100%;
      z-index: 1100;
    }

    /* Re-enable interaction on the toasts themselves. */
    ::slotted(ark-toast),
    ark-toast {
      pointer-events: auto;
    }

    /* ── Bottom positions (default) ─────────────────────────────── */
    :host,
    :host([position="bottom-center"]) {
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
    }
    :host([position="bottom-left"]) {
      align-items: flex-start;
      bottom: 0;
      left: 0;
      transform: none;
    }
    :host([position="bottom-right"]) {
      align-items: flex-end;
      bottom: 0;
      right: 0;
      transform: none;
    }

    /* ── Top positions (slide in from above) ────────────────────── */
    :host([position="top-center"]) {
      --ark-toast-enter-from: -0.75rem;
      bottom: auto;
      left: 50%;
      top: 0;
      transform: translateX(-50%);
    }
    :host([position="top-left"]) {
      --ark-toast-enter-from: -0.75rem;
      align-items: flex-start;
      bottom: auto;
      left: 0;
      top: 0;
      transform: none;
    }
    :host([position="top-right"]) {
      --ark-toast-enter-from: -0.75rem;
      align-items: flex-end;
      bottom: auto;
      right: 0;
      top: 0;
      transform: none;
    }
  `;

  private _position: ToastPosition = "bottom-center";
  private _toasts: readonly ToastRecord[] = [];
  private _unsubscribe?: () => void;

  get position(): ToastPosition {
    return this._position;
  }

  set position(value: ToastPosition | string) {
    const oldValue = this._position;
    this._position = normalizeToastPosition(value);
    this.requestUpdate("position", oldValue);
  }

  override connectedCallback() {
    super.connectedCallback();
    this._toasts = getToasts();
    this._unsubscribe = subscribeToToasts((toasts) => {
      this._toasts = toasts;
      this.requestUpdate();
    });
  }

  override disconnectedCallback() {
    this._unsubscribe?.();
    this._unsubscribe = undefined;
    super.disconnectedCallback();
  }

  private _onStoreDismiss(id: string) {
    toast.dismiss(id);
  }

  override render() {
    const ownToasts = this._toasts.filter(
      (record) => record.position === this._position,
    );

    return html`
      <slot></slot>
      ${repeat(
        ownToasts,
        (record) => record.id,
        (record) => html`
          <ark-toast
            id=${record.id}
            variant=${record.variant}
            duration=${record.duration}
            heading=${ifDefined(record.heading)}
            open
            @ark-toast:dismiss=${() => this._onStoreDismiss(record.id)}
            >${record.message}</ark-toast
          >
        `,
      )}
    `;
  }
}

export const Toast = {
  Region: ArkToaster,
  Item: ArkToast,
};

export const defineArkToast = () => {
  defineElement("ark-toast", ArkToast);
  defineElement("ark-toaster", ArkToaster);
};

declare global {
  interface HTMLElementTagNameMap {
    "ark-toast": ArkToast;
    "ark-toaster": ArkToaster;
  }
}
