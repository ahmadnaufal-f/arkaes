import { css, html, LitElement } from "lit";
import { defineElement } from "../define-element";
import {
  lockBodyScroll,
  unlockBodyScroll,
} from "../utils/body-scroll-lock";

const getDeepActiveElement = (): HTMLElement | null => {
  let element = document.activeElement;
  while (element?.shadowRoot?.activeElement) {
    element = element.shadowRoot.activeElement;
  }
  return element instanceof HTMLElement ? element : null;
};

/**
 * ArkDialogRoot manages the open state of the dialog.
 */
export class ArkDialogRoot extends LitElement {
  static override properties = {
    open: { type: Boolean, reflect: true },
  };

  private _open = false;
  private _previouslyFocusedElement: HTMLElement | null = null;
  private _portalContainers: HTMLElement[] = [];

  get open(): boolean {
    return this._open;
  }

  set open(val: boolean) {
    const oldVal = this._open;
    if (oldVal !== val) {
      this._open = val;
      this.requestUpdate("open", oldVal);
      this._updateChildren();
      this._handleScrollLock(val);
      this._handleFocusRestoration(val);
    }
  }

  static override styles = css`
    :host {
      display: contents;
    }
  `;

  constructor() {
    super();
    this.addEventListener("ark-dialog:open", this._handleOpenEvent);
    this.addEventListener("ark-dialog:close", this._handleCloseEvent);
  }

  override disconnectedCallback() {
    this.removeEventListener("ark-dialog:open", this._handleOpenEvent);
    this.removeEventListener("ark-dialog:close", this._handleCloseEvent);
    this._handleScrollLock(false);
    super.disconnectedCallback();
  }

  private _handleOpenEvent = (e: Event) => {
    e.stopPropagation();
    this.open = true;
  };

  private _handleCloseEvent = (e: Event) => {
    e.stopPropagation();
    this.open = false;
  };

  /**
   * Called by ArkDialogPortal when it teleports its children to document.body.
   * Stores a reference to the portal container so _updateChildren() can still
   * reach the teleported overlay / content elements.
   */
  registerPortalContainer(container: HTMLElement) {
    this._portalContainers.push(container);
    // Sync the current open state immediately into the new container.
    this._updateContainerChildren(container);
  }

  unregisterPortalContainer(container: HTMLElement) {
    this._portalContainers = this._portalContainers.filter((c) => c !== container);
  }

  private _updateContainerChildren(container: HTMLElement) {
    container
      .querySelectorAll("ark-dialog-overlay, ark-dialog-content")
      .forEach((el) => {
        (el as ArkDialogOverlay | ArkDialogContent).open = this.open;
      });
  }

  private _updateChildren() {
    // Update any overlay / content that remain inside the root (non-portal usage).
    this.querySelectorAll("ark-dialog-overlay, ark-dialog-content").forEach(
      (el) => {
        (el as ArkDialogOverlay | ArkDialogContent).open = this.open;
      },
    );
    // Update children that were teleported to document.body via ArkDialogPortal.
    this._portalContainers.forEach((c) => this._updateContainerChildren(c));
  }

  private _handleScrollLock(lock: boolean) {
    if (lock) {
      lockBodyScroll(this);
    } else {
      unlockBodyScroll(this);
    }
  }

  private _handleFocusRestoration(lock: boolean) {
    if (lock) {
      this._previouslyFocusedElement = getDeepActiveElement();
    } else {
      if (this._previouslyFocusedElement?.isConnected) {
        this._previouslyFocusedElement.focus();
      }
      this._previouslyFocusedElement = null;
    }
  }

  override render() {
    return html`<slot></slot>`;
  }
}

/**
 * ArkDialogTrigger opens the dialog on click.
 */
export class ArkDialogTrigger extends LitElement {
  static override styles = css`
    :host {
      display: contents;
    }
    .trigger-wrapper {
      display: contents;
    }
  `;

  private _handleClick() {
    this.dispatchEvent(
      new CustomEvent("ark-dialog:open", {
        bubbles: true,
        composed: true,
      }),
    );
  }

  override render() {
    return html`
      <div class="trigger-wrapper" @click=${this._handleClick}>
        <slot></slot>
      </div>
    `;
  }
}

/**
 * ArkDialogPortal teleports its light-DOM children into a container appended
 * directly to document.body, matching the behaviour of Radix UI <Portal>.
 *
 * This lets the overlay and dialog panel escape any parent stacking context or
 * overflow:hidden while keeping full state-sync and event routing with the
 * parent ArkDialogRoot. Portal children are restored to this element when it
 * disconnects, allowing the same portal instance to be mounted again.
 */
export class ArkDialogPortal extends LitElement {
  /** The detached <div> that lives inside document.body. */
  private _container: HTMLDivElement | null = null;
  /** Reference to the owning root — captured before the DOM move. */
  private _dialogRoot: ArkDialogRoot | null = null;

  /**
   * Forward close events that bubble up inside the portal container back to
   * the root element so the root's existing listener fires unchanged.
   */
  private _forwardClose = (e: Event) => {
    e.stopPropagation();
    if (this._dialogRoot) {
      this._dialogRoot.dispatchEvent(
        new CustomEvent("ark-dialog:close", { bubbles: false, composed: false }),
      );
    }
  };

  // No shadow root — we don't render anything; children are moved to body.
  protected override createRenderRoot(): HTMLElement {
    return this;
  }

  /**
   * React (via @lit/react) keeps modelling the teleported nodes as light-DOM
   * children of this <ark-dialog-portal>, even though connectedCallback() has
   * physically moved them into the body-mounted container. When React later
   * reconciles a conditional child away it calls portal.removeChild(node) — or
   * portal.insertBefore(node, ref) to add one back — with a node that now lives
   * in the container, which would throw "node is not a child of this node".
   *
   * These overrides transparently redirect React's light-DOM mutations to the
   * container so the reconciler stays in sync with where the nodes really live.
   * Lit's own render markers (comment nodes) are left on this element so the
   * element's render lifecycle is unaffected.
   */
  override insertBefore<T extends Node>(node: T, child: Node | null): T {
    if (this._container && node.nodeType !== Node.COMMENT_NODE) {
      const reference =
        child && child.parentNode === this._container ? child : null;
      return this._container.insertBefore(node, reference);
    }
    return super.insertBefore(node, child);
  }

  override appendChild<T extends Node>(node: T): T {
    if (this._container && node.nodeType !== Node.COMMENT_NODE) {
      return this._container.appendChild(node);
    }
    return super.appendChild(node);
  }

  override removeChild<T extends Node>(child: T): T {
    if (this._container && child.parentNode === this._container) {
      return this._container.removeChild(child);
    }
    return super.removeChild(child);
  }

  override connectedCallback() {
    super.connectedCallback();

    // Capture the root reference *before* moving children out of the tree.
    this._dialogRoot = this.closest("ark-dialog-root") as ArkDialogRoot | null;

    // Create and attach the portal container to document.body.
    this._container = document.createElement("div");
    this._container.setAttribute("data-ark-dialog-portal", "");
    document.body.appendChild(this._container);

    // Listen for close events bubbling within the portal container and
    // forward them to the root so root's handler closes the dialog.
    this._container.addEventListener("ark-dialog:close", this._forwardClose);

    // Move all light-DOM children into the portal container.
    while (this.firstChild) {
      this._container.appendChild(this.firstChild);
    }

    // Register with root so _updateChildren() can reach the teleported nodes.
    if (this._dialogRoot) {
      this._dialogRoot.registerPortalContainer(this._container);
    }
  }

  override disconnectedCallback() {
    const container = this._container;
    if (container) {
      container.removeEventListener("ark-dialog:close", this._forwardClose);
      if (this._dialogRoot) {
        this._dialogRoot.unregisterPortalContainer(container);
      }
      // Clear the container reference first so the DOM-mutation overrides stop
      // redirecting; otherwise this.appendChild() would loop the children
      // straight back into the container instead of restoring them here.
      this._container = null;
      while (container.firstChild) {
        this.appendChild(container.firstChild);
      }
      container.remove();
    }
    this._dialogRoot = null;
    super.disconnectedCallback();
  }

  // Nothing to render — content lives in the body-mounted container.
  override render() {
    return html``;
  }
}

/**
 * ArkDialogOverlay renders a dimmed background overlay that closes the dialog on click.
 */
export class ArkDialogOverlay extends LitElement {
  static override properties = {
    open: { type: Boolean, reflect: true },
  };

  open = false;

  static override styles = css`
    :host {
      background: var(
        --ark-dialog-overlay-bg,
        color-mix(in srgb, var(--ark-color-neutral-900) 55%, transparent)
      );
      inset: 0;
      opacity: 0;
      pointer-events: none;
      position: fixed;
      transition:
        opacity var(--ark-duration-normal) var(--ark-ease-standard),
        visibility var(--ark-duration-normal) step-end;
      visibility: hidden;
      z-index: 1000;
    }

    :host([open]) {
      opacity: 1;
      pointer-events: auto;
      transition:
        opacity var(--ark-duration-normal) var(--ark-ease-standard),
        visibility var(--ark-duration-normal) step-start;
      visibility: visible;
    }
  `;

  private _handleClick() {
    this.dispatchEvent(
      new CustomEvent("ark-dialog:close", {
        bubbles: true,
        composed: true,
      }),
    );
  }

  constructor() {
    super();
    this.addEventListener("click", this._handleClick);
  }

  override connectedCallback() {
    super.connectedCallback();
    const root = this.closest("ark-dialog-root");
    if (root) {
      this.open = (root as ArkDialogRoot).open;
    }
  }

  override render() {
    return html``;
  }
}

/**
 * ArkDialogContent contains the positioned dialog panel, manages focus loop and keyboard close.
 */
export class ArkDialogContent extends LitElement {
  static override properties = {
    open: { type: Boolean, reflect: true },
  };

  open = false;

  private _titleId = `ark-dialog-title-${Math.random().toString(36).substring(2, 9)}`;
  private _descId = `ark-dialog-desc-${Math.random().toString(36).substring(2, 9)}`;
  private _focusTimer: ReturnType<typeof setTimeout> | null = null;

  static override styles = css`
    :host {
      background: var(--ark-color-surface);
      border: 1px solid var(--ark-color-border);
      border-radius: var(--ark-radius-xs);
      box-shadow: var(--ark-shadow-lg);
      left: 50%;
      max-width: calc(100vw - var(--ark-space-8));
      opacity: 0;
      padding: var(--ark-space-6);
      pointer-events: none;
      position: fixed;
      top: 50%;
      transform: translate(-50%, -50%) translateY(12px);
      transition:
        opacity var(--ark-duration-normal) var(--ark-ease-standard),
        transform var(--ark-duration-normal) var(--ark-ease-standard),
        visibility var(--ark-duration-normal) step-end;
      visibility: hidden;
      width: 32rem;
      z-index: 1001;
    }

    :host([open]) {
      opacity: 1;
      pointer-events: auto;
      transform: translate(-50%, -50%) translateY(0);
      transition:
        opacity var(--ark-duration-normal) var(--ark-ease-standard),
        transform var(--ark-duration-normal) var(--ark-ease-standard),
        visibility var(--ark-duration-normal) step-start;
      visibility: visible;
    }

  `;

  constructor() {
    super();
    this.tabIndex = -1;
    this.setAttribute("role", "dialog");
    this.setAttribute("aria-modal", "true");
  }

  override connectedCallback() {
    super.connectedCallback();
    window.addEventListener("keydown", this._handleKeyDown);
    const root = this.closest("ark-dialog-root");
    if (root) {
      this.open = (root as ArkDialogRoot).open;
    }
  }

  override disconnectedCallback() {
    window.removeEventListener("keydown", this._handleKeyDown);
    this._clearFocusTimer();
    super.disconnectedCallback();
  }

  override firstUpdated() {
    this._syncAccessibleName();
  }

  private _syncAccessibleName = () => {
    const title = this.querySelector("ark-dialog-title");
    if (title) {
      if (!title.id) title.id = this._titleId;
      this.setAttribute("aria-labelledby", title.id);
    } else {
      this.removeAttribute("aria-labelledby");
    }

    const desc = this.querySelector("ark-dialog-description");
    if (desc) {
      if (!desc.id) desc.id = this._descId;
      this.setAttribute("aria-describedby", desc.id);
    } else {
      this.removeAttribute("aria-describedby");
    }
  };

  override updated(changedProperties: Map<PropertyKey, unknown>) {
    if (changedProperties.has("open")) {
      if (this.open) {
        this._clearFocusTimer();
        this._focusTimer = setTimeout(() => {
          this._focusTimer = null;
          if (!this.open) return;

          const focusables = this._getFocusableElements();
          if (focusables.length > 0) {
            focusables[0]?.focus();
          } else {
            this.focus();
          }
        }, 50);
      } else {
        this._clearFocusTimer();
      }
    }
  }

  private _clearFocusTimer() {
    if (this._focusTimer !== null) {
      clearTimeout(this._focusTimer);
      this._focusTimer = null;
    }
  }

  private _deepContains(child: Node | null): boolean {
    if (!child) return false;
    let node: Node | null = child;
    while (node) {
      if (node === this) return true;
      const parent = node.parentNode as Node | null;
      node = parent instanceof ShadowRoot ? parent.host : parent;
    }
    return false;
  }

  private _getFocusableElements(): HTMLElement[] {
    const selector = [
      "button",
      "[href]",
      "input",
      "select",
      "textarea",
      "[contenteditable]",
      "[tabindex]",
    ].join(",");
    const results: HTMLElement[] = [];

    const isUnavailable = (element: HTMLElement) => {
      if (
        element.hidden ||
        element.closest("[hidden], [inert], [aria-hidden='true']")
      ) {
        return true;
      }

      const disabled = "disabled" in element && Boolean(element.disabled);
      const tabIndex = element.getAttribute("tabindex");
      if (disabled || (tabIndex !== null && Number(tabIndex) < 0)) {
        return true;
      }

      const styles = getComputedStyle(element);
      return styles.display === "none" || styles.visibility === "hidden";
    };

    const collect = (root: Element | ShadowRoot) => {
      for (const el of Array.from(root.querySelectorAll("*")) as HTMLElement[]) {
        if (el.matches(selector) && !isUnavailable(el)) {
          results.push(el);
        }
        if (el.shadowRoot) {
          collect(el.shadowRoot);
        }
      }
    };

    collect(this);
    return results;
  }

  private _handleKeyDown = (e: KeyboardEvent) => {
    if (!this.open) return;

    if (e.key === "Escape") {
      e.preventDefault();
      this.dispatchEvent(
        new CustomEvent("ark-dialog:close", {
          bubbles: true,
          composed: true,
        }),
      );
      return;
    }

    if (e.key === "Tab") {
      const focusables = this._getFocusableElements();
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = getDeepActiveElement();

      if (e.shiftKey) {
        if (active === first || !this._deepContains(active as Node)) {
          last?.focus();
          e.preventDefault();
        }
      } else {
        if (active === last || !this._deepContains(active as Node)) {
          first?.focus();
          e.preventDefault();
        }
      }
    }
  };

  override render() {
    return html`<slot @slotchange=${this._syncAccessibleName}></slot>`;
  }
}

/**
 * ArkDialogTitle provides display font heading inside dialog.
 */
export class ArkDialogTitle extends LitElement {
  static override styles = css`
    :host {
      display: block;
      margin-bottom: var(--ark-space-2);
    }
    .title {
      color: var(--ark-color-text);
      font-family: var(--ark-font-display);
      font-size: var(--ark-font-size-xl);
      font-weight: 300;
      line-height: var(--ark-line-height-tight);
      margin: 0;
    }
  `;

  override render() {
    return html`
      <h2 class="title">
        <slot></slot>
      </h2>
    `;
  }
}

/**
 * ArkDialogDescription provides body font secondary message inside dialog.
 */
export class ArkDialogDescription extends LitElement {
  static override styles = css`
    :host {
      display: block;
      margin-bottom: var(--ark-space-4);
    }
    .desc {
      color: var(--ark-color-text-muted);
      font-family: var(--ark-font-sans);
      font-size: var(--ark-font-size-sm);
      font-weight: 300;
      line-height: var(--ark-line-height-normal);
      margin: 0;
    }
  `;

  override render() {
    return html`
      <p class="desc">
        <slot></slot>
      </p>
    `;
  }
}

/**
 * ArkDialogClose closes the dialog on click.
 */
export class ArkDialogClose extends LitElement {
  static override properties = {
    absolute: { type: Boolean, reflect: true },
  };

  absolute = false;

  static override styles = css`
    :host {
      display: inline-flex;
    }
    :host([absolute]) {
      position: absolute;
      right: var(--ark-space-3);
      top: var(--ark-space-3);
    }
    .close-button {
      background: transparent;
      border: none;
      color: var(--ark-color-text-muted);
      cursor: var(--ark-cursor-interactive, pointer);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--ark-space-2);
      transition: color var(--ark-duration-fast) var(--ark-ease-standard);
    }
    .close-button:hover {
      color: var(--ark-color-accent);
    }
    .close-button:focus-visible {
      border-radius: var(--ark-radius-xs);
      outline: 2px solid var(--ark-color-focus);
    }
  `;

  private _handleClick() {
    this.dispatchEvent(
      new CustomEvent("ark-dialog:close", {
        bubbles: true,
        composed: true,
      }),
    );
  }

  override render() {
    return html`
      <button
        type="button"
        class="close-button"
        @click=${this._handleClick}
        aria-label="Close"
      >
        <slot>
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path d="M1 1L13 13M1 13L13 1" stroke-linecap="round" />
          </svg>
        </slot>
      </button>
    `;
  }
}

/**
 * Compound namespace helper Dialog to allow:
 * <Dialog.Root>...
 */
export const Dialog = {
  Root: ArkDialogRoot,
  Trigger: ArkDialogTrigger,
  Portal: ArkDialogPortal,
  Overlay: ArkDialogOverlay,
  Content: ArkDialogContent,
  Title: ArkDialogTitle,
  Description: ArkDialogDescription,
  Close: ArkDialogClose,
};

export const defineArkDialogRoot = () => {
  defineElement("ark-dialog-root", ArkDialogRoot);
};

export const defineArkDialogTrigger = () => {
  defineElement("ark-dialog-trigger", ArkDialogTrigger);
};

export const defineArkDialogPortal = () => {
  defineElement("ark-dialog-portal", ArkDialogPortal);
};

export const defineArkDialogOverlay = () => {
  defineElement("ark-dialog-overlay", ArkDialogOverlay);
};

export const defineArkDialogContent = () => {
  defineElement("ark-dialog-content", ArkDialogContent);
};

export const defineArkDialogTitle = () => {
  defineElement("ark-dialog-title", ArkDialogTitle);
};

export const defineArkDialogDescription = () => {
  defineElement("ark-dialog-description", ArkDialogDescription);
};

export const defineArkDialogClose = () => {
  defineElement("ark-dialog-close", ArkDialogClose);
};

export const defineArkDialog = () => {
  defineArkDialogRoot();
  defineArkDialogTrigger();
  defineArkDialogPortal();
  defineArkDialogOverlay();
  defineArkDialogContent();
  defineArkDialogTitle();
  defineArkDialogDescription();
  defineArkDialogClose();
};

declare global {
  interface HTMLElementTagNameMap {
    "ark-dialog-root": ArkDialogRoot;
    "ark-dialog-trigger": ArkDialogTrigger;
    "ark-dialog-portal": ArkDialogPortal;
    "ark-dialog-overlay": ArkDialogOverlay;
    "ark-dialog-content": ArkDialogContent;
    "ark-dialog-title": ArkDialogTitle;
    "ark-dialog-description": ArkDialogDescription;
    "ark-dialog-close": ArkDialogClose;
  }
}
