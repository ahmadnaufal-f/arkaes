import { css, html, LitElement, nothing } from "lit";
import { when } from "lit/directives/when.js";
import { defineElement } from "../define-element";
import { defineArkBrandLogo } from "../primitives/ark-brand-logo";
import { defineArkSpinner } from "../primitives/ark-spinner";
import {
  lockBodyScroll,
  unlockBodyScroll,
} from "../utils/body-scroll-lock";

let mobileMenuId = 0;

/** Scroll depth (px) past which the bar takes on its condensed look. */
const SCROLLED_THRESHOLD_PX = 40;

/**
 * Viewport width (px) at or below which immersive mode is allowed — the same
 * breakpoint where the desktop links give way to the hamburger.
 */
const IMMERSIVE_BREAKPOINT_PX = 900;

/** Quiet time (ms) after the last scroll event before the pills settle back in. */
const IMMERSIVE_SETTLE_MS = 200;

/** Stand-in for the resting bar height until the first measurement lands. */
const DEFAULT_NAV_HEIGHT_PX = 80;

/**
 * ArkNavigationRoot manages the scroll and mobile menu state.
 *
 * On small screens it also drives *immersive mode* (the One UI trick): once the
 * page has scrolled past the resting height of the bar, the bar itself dissolves
 * and its children ride on top of a gradient scrim as separate floating pills.
 * While the page is moving the pills step out of the way, and they settle back
 * in once scrolling stops.
 *
 * @summary Fixed site header with condensed and immersive scroll states.
 * @csspart scrim - The gradient fill painted behind the floating pills.
 * @cssprop [--ark-nav-immersive-margin-block=12px] - Space above and below the
 *   floating row; the scrim is exactly the pill height plus these margins.
 * @cssprop [--ark-nav-immersive-pill-size=44px] - Minimum pill height (and the
 *   width of the square hamburger pill).
 * @cssprop [--ark-nav-immersive-pill-bg] - Pill background.
 * @cssprop [--ark-nav-immersive-pill-radius=var(--ark-radius-full)] - Pill radius.
 * @cssprop [--ark-nav-immersive-scrim] - The gradient fill under the pills.
 * @cssprop [--ark-nav-immersive-hidden-shift=-8px] - How far the pills travel
 *   while hidden mid-scroll.
 */
export class ArkNavigationRoot extends LitElement {
  static override properties = {
    scrolled: { type: Boolean, reflect: true },
    menuOpen: { type: Boolean, reflect: true, attribute: "menu-open" },
    immersive: { type: Boolean, reflect: true },
    immersiveHidden: {
      type: Boolean,
      reflect: true,
      attribute: "immersive-hidden",
    },
  };

  private _scrolled = false;
  private _menuOpen = false;
  private _immersive = false;
  private _immersiveHidden = false;

  /**
   * Resting (unscrolled) bar height — the depth the page has to scroll past
   * before immersive mode kicks in. Cached rather than read per scroll event so
   * the condensed and floating heights can never move the threshold under us.
   */
  private _navHeight = DEFAULT_NAV_HEIGHT_PX;
  private _lastScrollY = 0;
  private _settleTimer: number | null = null;
  private _viewportQuery: MediaQueryList | null = null;

  get scrolled(): boolean {
    return this._scrolled;
  }

  set scrolled(val: boolean) {
    const oldVal = this._scrolled;
    if (oldVal !== val) {
      this._scrolled = val;
      this.requestUpdate("scrolled", oldVal);
    }
  }

  get menuOpen(): boolean {
    return this._menuOpen;
  }

  set menuOpen(val: boolean) {
    const oldVal = this._menuOpen;
    if (oldVal !== val) {
      this._menuOpen = val;
      this.requestUpdate("menuOpen", oldVal);
      // The drawer hangs off a solid bar, so opening it suspends immersive mode.
      // Clearing the hidden flag keeps the close button from fading out under
      // the finger that just opened the menu.
      if (val) this.immersiveHidden = false;
      this._syncChildren();
      this._handleScrollLock(val);
    }
  }

  /** True while the small-screen floating treatment is active. */
  get immersive(): boolean {
    return this._immersive;
  }

  set immersive(val: boolean) {
    const oldVal = this._immersive;
    if (oldVal !== val) {
      this._immersive = val;
      this.requestUpdate("immersive", oldVal);
    }
  }

  /** True while the floating elements are tucked away mid-scroll. */
  get immersiveHidden(): boolean {
    return this._immersiveHidden;
  }

  set immersiveHidden(val: boolean) {
    const oldVal = this._immersiveHidden;
    if (oldVal !== val) {
      this._immersiveHidden = val;
      this.requestUpdate("immersiveHidden", oldVal);
    }
  }

  static override styles = css`
    :host {
      align-items: center;
      backdrop-filter: blur(2px);
      background: linear-gradient(
        to bottom,
        color-mix(in srgb, var(--ark-navigation-bg, var(--ark-color-bg)) 96%, transparent) 60%,
        transparent
      );
      display: flex;
      inset-inline: 0;
      width: 100vw;
      justify-content: space-between;
      padding: 28px var(--site-content-padding);
      position: fixed;
      top: 0;
      transition:
        background var(--ark-duration-normal) var(--ark-ease-standard),
        box-shadow var(--ark-duration-normal) var(--ark-ease-standard),
        padding var(--ark-duration-normal) var(--ark-ease-standard);
      z-index: 100;
      --ark-nav-header-height: 80px;

      /* Immersive mode knobs — see the class doc comment. */
      --ark-nav-immersive-margin-block: 12px;
      --ark-nav-immersive-pill-size: 44px;
      --ark-nav-immersive-pill-bg: color-mix(
        in srgb,
        var(--ark-navigation-bg, var(--ark-color-bg)) 82%,
        transparent
      );
      --ark-nav-immersive-pill-radius: var(--ark-radius-full);
      --ark-nav-immersive-scrim: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.25),
        rgba(0, 0, 0, 0)
      );
      --ark-nav-immersive-hidden-shift: -8px;
    }

    :host([scrolled]) {
      backdrop-filter: blur(8px);
      background: color-mix(
        in srgb,
        var(--ark-navigation-bg, var(--ark-color-bg)) 97%,
        transparent
      );
      box-shadow: var(--ark-shadow-sm);
      padding-block: 16px;
      --ark-nav-header-height: 60px;
    }

    /* ── Immersive mode ────────────────────────────────────────────────
       The immersive attribute is set by the root itself and only on small
       screens (see _syncImmersive); the styles below are unconditional so a
       story or a test can pin the state at any viewport width. It is suspended
       while the mobile menu is open — the drawer needs the solid bar to hang
       off, and the bar has to catch pointer events again. */

    /* Painted behind the pills (negative z-index inside the host's own stacking
       context) and sized to the host box: pill height + both block margins. */
    .scrim {
      background: var(--ark-nav-immersive-scrim);
      inset: 0;
      opacity: 0;
      pointer-events: none;
      position: absolute;
      transition: opacity var(--ark-duration-normal) var(--ark-ease-standard);
      z-index: -1;
    }

    :host([immersive]:not([menu-open])) {
      backdrop-filter: none;
      background: none;
      box-shadow: none;
      padding-block: var(--ark-nav-immersive-margin-block);
      /* The bar is see-through now, so it must not swallow taps meant for the
         page underneath. The pills opt back in below. */
      pointer-events: none;

      & .scrim {
        opacity: 1;
      }

      & ::slotted(ark-navigation-brand),
      & ::slotted(ark-navigation-mobile-toggle),
      & ::slotted(ark-navigation-cta) {
        align-items: center;
        backdrop-filter: blur(10px);
        background: var(--ark-nav-immersive-pill-bg);
        box-shadow: var(--ark-shadow-md);
        min-height: var(--ark-nav-immersive-pill-size);
        pointer-events: auto;
        transition:
          opacity var(--ark-duration-normal) var(--ark-ease-standard),
          transform var(--ark-duration-normal) var(--ark-ease-standard);
      }

      & ::slotted(ark-navigation-brand),
      & ::slotted(ark-navigation-mobile-toggle) {
        border: 1px solid var(--ark-color-border);
        border-radius: var(--ark-nav-immersive-pill-radius);
      }

      & ::slotted(ark-navigation-brand) {
        padding-inline: 18px;
      }

      & ::slotted(ark-navigation-mobile-toggle) {
        justify-content: center;
        min-width: var(--ark-nav-immersive-pill-size);
      }

      /* The CTA draws its own border, so it only needs the float — matching the
         inner button's radius keeps it from reading as a pill inside a pill. */
      & ::slotted(ark-navigation-cta) {
        border-radius: var(--ark-radius-xs);
      }
    }

    /* Mid-scroll: the immersion steps aside, then settles back once the page
       stops moving. Keyboard focus wins over it — tabbing through the header
       scrolls the page, and a focused-but-invisible link is a trap. */
    :host([immersive][immersive-hidden]:not([menu-open]):not(:focus-within)) {
      & .scrim {
        opacity: 0;
      }

      & ::slotted(ark-navigation-brand),
      & ::slotted(ark-navigation-mobile-toggle),
      & ::slotted(ark-navigation-cta) {
        opacity: 0;
        pointer-events: none;
        transform: translateY(var(--ark-nav-immersive-hidden-shift));
      }
    }
  `;

  override connectedCallback() {
    super.connectedCallback();
    window.addEventListener("scroll", this._handleScroll, { passive: true });
    this.addEventListener("ark-nav:menu-toggle", this._handleMenuToggle);
    this._setupViewportQuery();
    // Seed the baseline so a page restored mid-document doesn't read as a scroll.
    this._lastScrollY = window.scrollY;
    this._handleScroll();
  }

  override disconnectedCallback() {
    window.removeEventListener("scroll", this._handleScroll);
    this.removeEventListener("ark-nav:menu-toggle", this._handleMenuToggle);
    this._teardownViewportQuery();
    this._clearSettleTimer();
    this._handleScrollLock(false);
    super.disconnectedCallback();
  }

  override firstUpdated() {
    this._measureNavHeight();
    this._syncChildren();
  }

  private _handleScroll = () => {
    const y = window.scrollY;
    this.scrolled = y > SCROLLED_THRESHOLD_PX;
    this._syncImmersive(y);
  };

  /**
   * Immersive mode is a small-screen affordance, so it hangs off a media query
   * rather than a CSS breakpoint — the styles stay unconditional and this is the
   * only thing deciding when they apply.
   */
  private _setupViewportQuery() {
    if (typeof window === "undefined" || !window.matchMedia) return;
    this._viewportQuery = window.matchMedia(
      `(max-width: ${IMMERSIVE_BREAKPOINT_PX}px)`,
    );
    this._viewportQuery.addEventListener("change", this._handleViewportChange);
  }

  private _teardownViewportQuery() {
    this._viewportQuery?.removeEventListener(
      "change",
      this._handleViewportChange,
    );
    this._viewportQuery = null;
  }

  private _handleViewportChange = () => {
    this._measureNavHeight();
    this._handleScroll();
  };

  /**
   * Only measured in the resting state: the condensed bar is shorter and the
   * immersive one shorter still, so re-reading the height in either would drag
   * the threshold down behind the scroll position and flip the state back and
   * forth around the boundary.
   */
  private _measureNavHeight() {
    if (this._scrolled || this._immersive) return;
    const height = this.offsetHeight;
    if (height > 0) this._navHeight = height;
  }

  private _syncImmersive(y: number) {
    const moved = y !== this._lastScrollY;
    this._lastScrollY = y;

    if (!this._viewportQuery?.matches) {
      this._clearSettleTimer();
      this.immersive = false;
      this.immersiveHidden = false;
      return;
    }

    this.immersive = y > this._navHeight;

    if (!this.immersive || this.menuOpen) {
      this._clearSettleTimer();
      this.immersiveHidden = false;
      return;
    }

    // The floating elements are only in the way while the page is actually
    // moving, so any scroll tucks them and the settle timer brings them back.
    if (!moved) return;
    this.immersiveHidden = true;
    this._restartSettleTimer();
  }

  private _restartSettleTimer() {
    this._clearSettleTimer();
    this._settleTimer = window.setTimeout(() => {
      this._settleTimer = null;
      this.immersiveHidden = false;
    }, IMMERSIVE_SETTLE_MS);
  }

  private _clearSettleTimer() {
    if (this._settleTimer !== null) {
      window.clearTimeout(this._settleTimer);
      this._settleTimer = null;
    }
  }

  private _handleMenuToggle = (e: Event) => {
    e.stopPropagation();
    this.menuOpen = !this.menuOpen;
  };

  private _syncChildren() {
    const mobileMenu = this.querySelector<ArkNavigationMobileMenu>(
      "ark-navigation-mobile-menu",
    );

    this.querySelectorAll<ArkNavigationMobileToggle>(
      "ark-navigation-mobile-toggle",
    ).forEach((el) => {
      el.menuOpen = this.menuOpen;
      el.menuControls = mobileMenu?.id ?? "";
    });

    if (mobileMenu) {
      mobileMenu.menuOpen = this.menuOpen;
    }
  }

  private _handleScrollLock(lock: boolean) {
    // Skip body scroll lock inside the Storybook preview iframe so a statically
    // rendered `menu-open` story doesn't leave the page permanently unscrollable.
    if (window.location.pathname.includes("iframe.html")) {
      return;
    }
    if (lock) {
      lockBodyScroll(this);
    } else {
      unlockBodyScroll(this);
    }
  }

  override render() {
    return html`
      <div class="scrim" part="scrim" aria-hidden="true"></div>
      <slot></slot>
    `;
  }
}

/**
 * ArkNavigationBrand is the logo/brand wordmark component.
 * Delegates wordmark rendering to the <ark-brand-logo> primitive.
 */
export class ArkNavigationBrand extends LitElement {
  static override properties = {
    href: { type: String },
  };

  href = "/";

  static override styles = css`
    :host {
      display: inline-flex;
    }

    .brand {
      display: inline-flex;
      align-items: center;
      cursor: var(--ark-cursor-interactive, pointer);
      text-decoration: none;
    }

    .brand:focus-visible {
      border-radius: var(--ark-radius-xs);
      outline: 2px solid var(--ark-color-focus);
      outline-offset: 4px;
    }
  `;

  override render() {
    return html`
      <a class="brand" href=${this.href} aria-label="Arkaes home">
        <ark-brand-logo></ark-brand-logo>
      </a>
    `;
  }
}

/**
 * ArkNavigationLinks contains the horizontal desktop links.
 */
export class ArkNavigationLinks extends LitElement {
  static override styles = css`
    :host {
      display: flex;
    }

    .links {
      display: flex;
      gap: 48px;
    }

    @media (max-width: 900px) {
      :host {
        display: none;
      }
    }
  `;

  override render() {
    return html`
      <nav class="links" aria-label="Main navigation">
        <slot></slot>
      </nav>
    `;
  }
}

/**
 * ArkNavLink is an individual navigation link.
 */
export class ArkNavLink extends LitElement {
  static override properties = {
    href: { type: String },
    active: { type: Boolean, reflect: true },
    autoActive: { type: Boolean, attribute: "auto-active" },
    navigating: { type: Boolean, reflect: true },
  };

  href = "";
  active = false;
  autoActive = false;
  navigating = false;

  static override styles = css`
    :host {
      display: inline-flex;
    }

    .nav-link {
      color: var(--ark-color-text-ghost);
      cursor: var(--ark-cursor-interactive, pointer);
      display: inline-flex;
      align-items: center;
      flex-direction: row;
      gap: 0.5rem;
      font-family: var(--ark-font-mono);
      font-size: var(--ark-font-size-sm);
      letter-spacing: var(--ark-letter-spacing-mono);
      position: relative;
      text-decoration: none;
      text-transform: uppercase;
      transition: color var(--ark-duration-fast) var(--ark-ease-standard);
    }

    .nav-link:hover,
    .nav-link[aria-current="page"] {
      color: var(--ark-color-accent-strong);
    }

    .nav-link:focus-visible {
      border-radius: var(--ark-radius-xs);
      outline: 2px solid var(--ark-color-focus);
      outline-offset: 4px;
    }

    /* Blush underline — scaleX from left on hover/active */
    .underline {
      background: var(--ark-color-accent);
      bottom: -3px;
      height: 1.5px;
      left: 0;
      position: absolute;
      transform: scaleX(0);
      transform-origin: left;
      transition: transform var(--ark-duration-normal) var(--ark-ease-standard);
      width: 100%;
    }

    .nav-link:hover .underline,
    .nav-link[aria-current="page"] .underline {
      transform: scaleX(1);
    }

    ark-spinner {
      --spinner-color: currentColor;
    }

    :host([navigating]) .nav-link {
      cursor: progress;
      opacity: 0.6;
    }

    :host([navigating]) .nav-link:hover {
      color: var(--ark-color-text-ghost);
    }

    :host([navigating]) .nav-link:hover .underline {
      transform: scaleX(0);
    }
  `;

  override connectedCallback() {
    super.connectedCallback();
    this._checkActive();
    window.addEventListener("hashchange", this._checkActive);
    window.addEventListener("popstate", this._checkActive);
    document.addEventListener("astro:page-load", this._checkActive);
  }

  override disconnectedCallback() {
    window.removeEventListener("hashchange", this._checkActive);
    window.removeEventListener("popstate", this._checkActive);
    document.removeEventListener("astro:page-load", this._checkActive);
    super.disconnectedCallback();
  }

  protected override updated(changedProperties: Map<PropertyKey, unknown>) {
    if (
      changedProperties.has("autoActive") ||
      changedProperties.has("href")
    ) {
      this._checkActive();
    }
  }

  private _normalizePath(path: string) {
    return path.replace(/\/$/, "") || "/";
  }

  private _checkActive = () => {
    if (!this.autoActive) return;
    // Skip auto-detection in Storybook preview iframe to respect explicit control/story attributes
    if (window.location.pathname.includes("iframe.html")) {
      return;
    }
    if (!this.href) return;
    try {
      const url = new URL(this.href, window.location.href);
      const matchesPath =
        this._normalizePath(url.pathname) ===
        this._normalizePath(window.location.pathname);
      const matchesHash = url.hash === "" || url.hash === window.location.hash;
      this.active = matchesPath && matchesHash;
    } catch {
      this.active = false;
    }
  };

  override render() {
    return html`
      <a
        class="nav-link"
        href=${this.href}
        aria-current=${this.active ? "page" : nothing}
      >
        ${when(this.navigating, () => html`<ark-spinner size="sm" decorative></ark-spinner>`)}
        <slot></slot>
        <span class="underline"></span>
      </a>
    `;
  }
}

/**
 * ArkNavigationCta is the CTA button.
 */
export class ArkNavigationCta extends LitElement {
  static override properties = {
    href: { type: String },
    navigating: { type: Boolean, reflect: true },
  };

  href = "";
  navigating = false;

  static override styles = css`
    :host {
      display: inline-flex;
    }

    .cta {
      align-items: center;
      border: 1px solid var(--ark-color-border);
      border-radius: var(--ark-radius-xs);
      color: var(--ark-color-text);
      cursor: var(--ark-cursor-interactive, pointer);
      display: inline-flex;
      font-family: var(--ark-font-mono);
      font-size: var(--ark-font-size-sm);
      gap: 0.5rem;
      letter-spacing: var(--ark-letter-spacing-mono);
      overflow: hidden;
      padding: 10px 22px;
      position: relative;
      text-decoration: none;
      text-transform: uppercase;
      transition:
        background var(--ark-duration-normal) var(--ark-ease-standard),
        border-color var(--ark-duration-normal) var(--ark-ease-standard),
        color var(--ark-duration-normal) var(--ark-ease-standard),
        transform var(--ark-duration-normal) var(--ark-ease-standard);
    }

    /* Blush underline — scaleX from left on hover (primary button pattern §6) */
    .cta::after {
      background: var(--ark-color-accent);
      bottom: 0;
      content: '';
      height: 2px;
      left: 0;
      position: absolute;
      transform: scaleX(0);
      transform-origin: left;
      transition: transform var(--ark-duration-normal) var(--ark-ease-standard);
      width: 100%;
    }

    .cta:hover {
      background: var(--ark-color-accent-soft);
      border-color: var(--ark-color-accent);
      color: var(--ark-color-accent-strong);
      transform: translateY(-1px);
    }

    .cta:hover::after {
      transform: scaleX(1);
    }

    .cta:focus-visible {
      box-shadow: var(--ark-shadow-focus);
      outline: none;
    }

    ark-spinner {
      --spinner-color: currentColor;
    }

    :host([navigating]) .cta {
      cursor: progress;
      opacity: 0.6;
    }

    :host([navigating]) .cta:hover {
      background: transparent;
      border-color: var(--ark-color-border);
      color: var(--ark-color-text);
      transform: none;
    }

    :host([navigating]) .cta:hover::after {
      transform: scaleX(0);
    }

    @media (max-width: 520px) {
      :host {
        display: none;
      }
    }
  `;

  override render() {
    return html`
      <a class="cta" href=${this.href}>
        ${when(this.navigating, () => html`<ark-spinner size="sm" decorative></ark-spinner>`)}
        <slot></slot>
      </a>
    `;
  }
}

/**
 * ArkNavigationMobileToggle toggles the mobile menu. Place it inside
 * ark-navigation-root; the root listens for its event.
 *
 * @summary Mobile menu toggle button.
 * @fires ark-nav:menu-toggle - Bubbles, composed. detail: `{ open: boolean }`.
 */
export class ArkNavigationMobileToggle extends LitElement {
  static override properties = {
    menuOpen: { type: Boolean, reflect: true, attribute: "menu-open" },
    menuControls: { type: String, attribute: "menu-controls" },
  };

  menuOpen = false;
  menuControls = "";

  static override styles = css`
    :host {
      display: none;
    }

    @media (max-width: 900px) {
      :host {
        display: inline-flex;
      }
    }

    .toggle {
      align-items: center;
      background: transparent;
      border: none;
      color: var(--ark-color-text);
      cursor: var(--ark-cursor-interactive, pointer);
      display: flex;
      justify-content: center;
      padding: 6px;
      transition: color var(--ark-duration-fast) var(--ark-ease-standard);
    }

    .toggle:hover {
      color: var(--ark-color-accent-strong);
    }

    .toggle:focus-visible {
      border-radius: var(--ark-radius-xs);
      outline: 2px solid var(--ark-color-focus);
      outline-offset: 4px;
    }
  `;

  private _handleClick = () => {
    this.dispatchEvent(
      new CustomEvent("ark-nav:menu-toggle", {
        bubbles: true,
        composed: true,
      }),
    );
  };

  override render() {
    return html`
      <button
        class="toggle"
        type="button"
        @click=${this._handleClick}
        aria-label=${this.menuOpen ? "Close menu" : "Open menu"}
        aria-expanded=${this.menuOpen ? "true" : "false"}
        aria-controls=${this.menuControls || nothing}
      >
        ${when(
          this.menuOpen,
          () => html`
            <!-- Close icon (X) -->
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
              <path d="M4 4L16 16M4 16L16 4"/>
            </svg>
          `,
          () => html`
            <!-- Hamburger icon (three lines) -->
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
              <line x1="3" y1="6" x2="17" y2="6"/>
              <line x1="3" y1="10" x2="17" y2="10"/>
              <line x1="3" y1="14" x2="17" y2="14"/>
            </svg>
          `,
        )}
      </button>
    `;
  }
}

/**
 * ArkNavigationMobileMenu is the sliding drawer for mobile links.
 */
export class ArkNavigationMobileMenu extends LitElement {
  static override properties = {
    menuOpen: { type: Boolean, reflect: true, attribute: "menu-open" },
    label: { type: String },
  };

  menuOpen = false;
  label = "Mobile navigation";

  override connectedCallback() {
    if (!this.id) {
      mobileMenuId += 1;
      this.id = `ark-navigation-mobile-menu-${mobileMenuId}`;
    }
    super.connectedCallback();
  }

  static override styles = css`
    :host {
      background: var(--ark-color-background);
      border-top: 1px solid var(--ark-color-border);
      box-shadow: var(--ark-shadow-md);
      display: none;
      inset-inline: 0;
      overflow: hidden;
      position: fixed;
      top: var(--ark-nav-header-height, 60px);
      transform: translateY(-8px);
      transition:
        opacity var(--ark-duration-normal) var(--ark-ease-standard),
        transform var(--ark-duration-normal) var(--ark-ease-standard),
        visibility var(--ark-duration-normal) step-end;
      opacity: 0;
      visibility: hidden;
      z-index: 99;
    }

    :host([menu-open]) {
      opacity: 1;
      transform: translateY(0);
      transition:
        opacity var(--ark-duration-normal) var(--ark-ease-standard),
        transform var(--ark-duration-normal) var(--ark-ease-standard),
        visibility var(--ark-duration-normal) step-start;
      visibility: visible;
    }

    @media (max-width: 900px) {
      :host {
        display: block;
      }
    }

    .mobile-menu {
      display: flex;
      flex-direction: column;
      gap: 0;
      padding: 24px var(--site-content-padding, 24px);
    }

    /* Style slotted ark-nav-link elements in the mobile menu context */
    ::slotted(ark-nav-link) {
      border-bottom: 1px solid var(--ark-color-border);
      display: block;
      padding-block: 18px;
    }
  `;

  override render() {
    return html`
      <nav class="mobile-menu" aria-label=${this.label}>
        <slot></slot>
      </nav>
    `;
  }
}

/**
 * Compound namespace helper Navigation.
 */
export const Navigation = {
  Root: ArkNavigationRoot,
  Brand: ArkNavigationBrand,
  Links: ArkNavigationLinks,
  NavLink: ArkNavLink,
  Cta: ArkNavigationCta,
  MobileToggle: ArkNavigationMobileToggle,
  MobileMenu: ArkNavigationMobileMenu,
};

export const defineArkNavigationRoot = () => {
  defineElement("ark-navigation-root", ArkNavigationRoot);
};

export const defineArkNavigationBrand = () => {
  defineArkBrandLogo();
  defineElement("ark-navigation-brand", ArkNavigationBrand);
};

export const defineArkNavigationLinks = () => {
  defineElement("ark-navigation-links", ArkNavigationLinks);
};

export const defineArkNavLink = () => {
  defineArkSpinner();
  defineElement("ark-nav-link", ArkNavLink);
};

export const defineArkNavigationCta = () => {
  defineArkSpinner();
  defineElement("ark-navigation-cta", ArkNavigationCta);
};

export const defineArkNavigationMobileToggle = () => {
  defineElement("ark-navigation-mobile-toggle", ArkNavigationMobileToggle);
};

export const defineArkNavigationMobileMenu = () => {
  defineElement("ark-navigation-mobile-menu", ArkNavigationMobileMenu);
};

export const defineArkNavigation = () => {
  defineArkNavigationRoot();
  defineArkNavigationBrand();
  defineArkNavigationLinks();
  defineArkNavLink();
  defineArkNavigationCta();
  defineArkNavigationMobileToggle();
  defineArkNavigationMobileMenu();
};

declare global {
  interface HTMLElementTagNameMap {
    "ark-navigation-root": ArkNavigationRoot;
    "ark-navigation-brand": ArkNavigationBrand;
    "ark-navigation-links": ArkNavigationLinks;
    "ark-nav-link": ArkNavLink;
    "ark-navigation-cta": ArkNavigationCta;
    "ark-navigation-mobile-toggle": ArkNavigationMobileToggle;
    "ark-navigation-mobile-menu": ArkNavigationMobileMenu;
  }
}
