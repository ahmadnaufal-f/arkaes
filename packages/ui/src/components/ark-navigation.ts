import { css, html, LitElement, nothing } from "lit";
import { when } from "lit/directives/when.js";
import { defineElement } from "../define-element";
import { defineArkBrandLogo } from "../primitives/ark-brand-logo";
import {
  lockBodyScroll,
  unlockBodyScroll,
} from "../utils/body-scroll-lock";

let mobileMenuId = 0;

/**
 * ArkNavigationRoot manages the scroll and mobile menu state.
 */
export class ArkNavigationRoot extends LitElement {
  static override properties = {
    scrolled: { type: Boolean, reflect: true },
    menuOpen: { type: Boolean, reflect: true, attribute: "menu-open" },
  };

  private _scrolled = false;
  private _menuOpen = false;

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
      this._syncChildren();
      this._handleScrollLock(val);
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
  `;

  override connectedCallback() {
    super.connectedCallback();
    window.addEventListener("scroll", this._handleScroll, { passive: true });
    this.addEventListener("ark-nav:menu-toggle", this._handleMenuToggle);
    this._handleScroll();
  }

  override disconnectedCallback() {
    window.removeEventListener("scroll", this._handleScroll);
    this.removeEventListener("ark-nav:menu-toggle", this._handleMenuToggle);
    this._handleScrollLock(false);
    super.disconnectedCallback();
  }

  override firstUpdated() {
    this._syncChildren();
  }

  private _handleScroll = () => {
    this.scrolled = window.scrollY > 40;
  };

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
    return html`<slot></slot>`;
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

    @keyframes nav-spin {
      to { transform: rotate(360deg); }
    }

    .spinner {
      animation: nav-spin 0.9s cubic-bezier(0.4, 0, 0.2, 1) infinite;
      border-color: transparent;
      border-radius: 50%;
      border-right-color: color-mix(in srgb, currentColor 33%, transparent);
      border-style: solid;
      border-top-color: currentColor;
      border-width: 2px;
      display: inline-block;
      flex-shrink: 0;
      height: 1em;
      width: 1em;
    }

    @media (prefers-reduced-motion: reduce) {
      .spinner {
        animation: none;
        border-bottom-color: transparent;
        border-left-color: transparent;
        border-right-color: currentColor;
        border-top-color: currentColor;
      }
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
        ${when(this.navigating, () => html`<span class="spinner" aria-hidden="true"></span>`)}
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

    @keyframes nav-spin {
      to { transform: rotate(360deg); }
    }

    .spinner {
      animation: nav-spin 0.9s cubic-bezier(0.4, 0, 0.2, 1) infinite;
      border-color: transparent;
      border-radius: 50%;
      border-right-color: color-mix(in srgb, currentColor 33%, transparent);
      border-style: solid;
      border-top-color: currentColor;
      border-width: 2px;
      display: inline-block;
      flex-shrink: 0;
      height: 1em;
      width: 1em;
    }

    @media (prefers-reduced-motion: reduce) {
      .spinner {
        animation: none;
        border-bottom-color: transparent;
        border-left-color: transparent;
        border-right-color: currentColor;
        border-top-color: currentColor;
      }
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
        ${when(this.navigating, () => html`<span class="spinner" aria-hidden="true"></span>`)}
        <slot></slot>
      </a>
    `;
  }
}

/**
 * ArkNavigationMobileToggle toggles the mobile menu.
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
  defineElement("ark-nav-link", ArkNavLink);
};

export const defineArkNavigationCta = () => {
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
