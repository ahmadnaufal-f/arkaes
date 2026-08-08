import { css, html, LitElement, nothing } from "lit";
import { when } from "lit/directives/when.js";
import { defineElement } from "../define-element";
import { defineArkBrandLogo } from "../primitives/ark-brand-logo";
import { defineArkSpinner } from "../primitives/ark-spinner";
import {
  lockBodyScroll,
  unlockBodyScroll,
} from "../utils/body-scroll-lock";
import { hasKeyboardFocusWithin } from "../utils/keyboard-focus";

let mobileMenuId = 0;

/**
 * Custom property written onto each item slotted into the mobile menu, holding
 * its zero-based position in the list. It is what the drawer's stagger
 * multiplies its per-item delay by — see `ArkNavigationMobileMenu`.
 */
const MENU_ITEM_INDEX_PROP = "--ark-nav-menu-item-index";

/** Scroll depth (px) past which the bar takes on its condensed look. */
const SCROLLED_THRESHOLD_PX = 40;

/**
 * Custom property published on `:root` carrying `1` while the immersive pills
 * are tucked away mid-scroll and `0` the rest of the time. It is what lets other
 * fixed chrome move with the header instead of holding room for pills that have
 * stepped aside — see `ark-project-header`, which pulls its own clearance up by
 * exactly this flag. A page with no immersive header never writes it, and the
 * `0` fallback leaves consumers where they were.
 */
const CHROME_AWAY_PROP = "--ark-nav-chrome-away";

/**
 * Identity of the header that last wrote {@link CHROME_AWAY_PROP}. A page has
 * one header, but ClientRouter navigations overlap two — the incoming one
 * publishes while the outgoing one is still mounted, and without this the
 * outgoing teardown would clear the value its replacement had just written.
 */
let chromeAwayOwner: symbol | null = null;

/** Quiet time (ms) after the last scroll event before the pills settle back in. */
const IMMERSIVE_SETTLE_MS = 200;

/** Stand-in for the resting bar height until the first measurement lands. */
const DEFAULT_NAV_HEIGHT_PX = 80;

/**
 * ArkNavigationRoot manages the scroll and mobile menu state.
 *
 * It also drives *immersive mode* (the One UI trick): once the page has
 * scrolled past the resting height of the bar, the bar itself dissolves and its
 * children float free as separate pills. While the page is moving the pills step
 * out of the way, and they settle back in once scrolling stops. This runs at
 * every viewport width — on a desktop the links ride in a pill of their own
 * between the brand and the CTA; below the links' own 900px breakpoint they are
 * already gone and the hamburger pill takes their place.
 *
 * The scrim behind the pills is unfilled by default — see
 * `--ark-nav-immersive-scrim`.
 *
 * While the pills are tucked away it publishes `--ark-nav-chrome-away: 1` on
 * `:root` (`0` otherwise), so other fixed chrome can travel with them rather
 * than hold room for pills that have stepped aside — `ark-project-header` pulls
 * its own clearance up by exactly that flag.
 *
 * @summary Fixed site header with condensed and immersive scroll states.
 * @csspart scrim - The layer painted behind the floating pills. Unfilled by
 *   default.
 * @cssprop [--ark-nav-immersive-margin-block=var(--ark-space-3)] - Space above
 *   and below the floating row; the scrim is exactly the pill height plus
 *   these margins.
 * @cssprop [--ark-nav-immersive-pill-size=44px] - Minimum pill height (and the
 *   width of the square hamburger pill).
 * @cssprop [--ark-nav-immersive-pill-bg] - Pill background. Derived from
 *   `--ark-navigation-pill-bg` (falling back to `--ark-color-surface-floating`)
 *   at 92% opacity; override either one to retint the pills.
 * @cssprop [--ark-nav-immersive-pill-radius=var(--ark-radius-full)] - Pill radius.
 * @cssprop [--ark-nav-immersive-links-gap=var(--ark-space-6)] - Gap between the
 *   desktop links while they are boxed into their pill.
 * @cssprop [--ark-nav-immersive-scrim=none] - Fill under the pills. Unset for
 *   now; give it a value to paint a scrim there again.
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

  /** This instance's stand-in for `this` in {@link chromeAwayOwner}. */
  private readonly _ownerToken = Symbol("ark-navigation-root");
  private _publishedChromeAway = -1;

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
      /* No fill at rest. The gradient that used to sit here read badly over
         real pages, and its 2px backdrop blur went with it: the gradient was
         what hid the blur's hard bottom edge, so on its own the blur is the
         same banding one step fainter. The scrolled state below still paints. */
      background: none;
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
      --ark-nav-immersive-margin-block: var(--ark-space-3);
      --ark-nav-immersive-pill-size: 44px;
      /* A sage tint rather than the page background: the pills float over
         arbitrary content and have to read as chrome, and a fill mixed from
         --ark-color-bg made them the same colour as whatever they were
         covering. Kept only slightly translucent — at the old 82% the tint
         washed out into the page behind it. */
      --ark-nav-immersive-pill-bg: color-mix(
        in srgb,
        var(--ark-navigation-pill-bg, var(--ark-color-surface-floating)) 92%,
        transparent
      );
      --ark-nav-immersive-pill-radius: var(--ark-radius-full);
      /* The desktop links ride in a pill of their own, and the resting 48px
         gap reads as three separate things once there is a border around it. */
      --ark-nav-immersive-links-gap: var(--ark-space-6);
      /* No fill for now — the gradient scrim read badly over real pages. The
         layer is still here and still sized to the floating row, so setting
         this property (or styling the scrim part) puts a fill back. */
      --ark-nav-immersive-scrim: none;
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
       The immersive attribute is set by the root itself from the scroll depth
       (see _syncImmersive), at every viewport width. Which pills exist is left
       to the children's own breakpoints: below 900px the links are display:none
       and the hamburger appears, so the rules below cover both sets and the
       irrelevant half is simply inert. Suspended while the mobile menu is open —
       the drawer needs the solid bar to hang off, and the bar has to catch
       pointer events again. */

    /* Sits behind the pills (negative z-index inside the host's own stacking
       context) and sized to the host box: pill height + both block margins.
       Unfilled by default — see --ark-nav-immersive-scrim. */
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
      & ::slotted(ark-navigation-links),
      & ::slotted(ark-navigation-mobile-toggle),
      & ::slotted(ark-navigation-cta) {
        align-items: center;
        backdrop-filter: blur(10px);
        background: var(--ark-nav-immersive-pill-bg);
        /* Not --ark-shadow-float, which the dock's actions use: the pills share
           the top of the screen with ark-project-header, itself elevated when
           pinned, and two float-height shadows stacked there is more depth than
           that corner can carry. */
        box-shadow: var(--ark-shadow-md);
        min-height: var(--ark-nav-immersive-pill-size);
        pointer-events: auto;
        transition:
          opacity var(--ark-duration-normal) var(--ark-ease-standard),
          transform var(--ark-duration-normal) var(--ark-ease-standard);
      }

      & ::slotted(ark-navigation-brand),
      & ::slotted(ark-navigation-links),
      & ::slotted(ark-navigation-mobile-toggle) {
        border: 1px solid var(--ark-color-border);
        border-radius: var(--ark-nav-immersive-pill-radius);
      }

      & ::slotted(ark-navigation-brand),
      & ::slotted(ark-navigation-links) {
        padding-inline: 18px;
      }

      /* Custom properties inherit through the shadow boundary, so this is how
         the links pill tightens the gap its own stylesheet draws. The link
         colour steps up one notch for the same reason: the tinted pill is
         darker than the page, and the resting ghost grey drops under 4.5:1
         against it. */
      & ::slotted(ark-navigation-links) {
        --ark-nav-links-gap: var(--ark-nav-immersive-links-gap);
        --ark-nav-link-color: var(--ark-color-text-muted);
      }

      & ::slotted(ark-navigation-mobile-toggle) {
        justify-content: center;
        min-width: var(--ark-nav-immersive-pill-size);
      }

      /* The CTA draws its own border, so the host only supplies the float; the
         radius has to reach the inner button too, or the border inside would
         stay square inside a rounded backdrop. Stretching rather than centring
         it makes the two outlines concentric — at this radius a button a couple
         of pixels shorter than its host shows as a crescent of background at
         the ends. The hover underline goes: a straight 2px bar across the foot
         of a pill is clipped by the curve into a stub. Hover still reads
         through the background and border-colour change. */
      & ::slotted(ark-navigation-cta) {
        align-items: stretch;
        border-radius: var(--ark-nav-immersive-pill-radius);
        --ark-nav-cta-radius: var(--ark-nav-immersive-pill-radius);
        --ark-nav-cta-underline-opacity: 0;
      }
    }

    /* Mid-scroll only the pills step aside, then settle back once the page
       stops moving. The scrim stays put: it is the backdrop the content travels
       under, so it has nothing to get out of the way of.
       (Keyboard focus is handled in _syncImmersive, not here — a pointer
       tap leaves focus on the button it hit, so a :focus-within guard would
       latch on after the first tap of the hamburger.) */
    :host([immersive][immersive-hidden]:not([menu-open])) {
      & ::slotted(ark-navigation-brand),
      & ::slotted(ark-navigation-links),
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
    this.addEventListener("focusin", this._handleFocusIn);
    window.addEventListener("resize", this._handleResize, { passive: true });
    // Seed the baseline so a page restored mid-document doesn't read as a scroll.
    this._lastScrollY = window.scrollY;
    this._handleScroll();
  }

  override disconnectedCallback() {
    window.removeEventListener("scroll", this._handleScroll);
    this.removeEventListener("ark-nav:menu-toggle", this._handleMenuToggle);
    this.removeEventListener("focusin", this._handleFocusIn);
    window.removeEventListener("resize", this._handleResize);
    this._clearSettleTimer();
    this._handleScrollLock(false);
    if (chromeAwayOwner === this._ownerToken) {
      document.documentElement.style.removeProperty(CHROME_AWAY_PROP);
      chromeAwayOwner = null;
    }
    this._publishedChromeAway = -1;
    super.disconnectedCallback();
  }

  override firstUpdated() {
    this._measureNavHeight();
    this._syncChildren();
  }

  /**
   * Every input to the flag — immersive, immersive-hidden, menu-open — is a
   * reactive property, so publishing from here covers all of them at once
   * rather than from each place that sets one.
   */
  override updated() {
    this._publishChromeAway();
  }

  private _publishChromeAway() {
    const away =
      this._immersive && this._immersiveHidden && !this._menuOpen ? 1 : 0;
    if (away === this._publishedChromeAway && chromeAwayOwner === this._ownerToken) {
      return;
    }

    this._publishedChromeAway = away;
    chromeAwayOwner = this._ownerToken;
    document.documentElement.style.setProperty(CHROME_AWAY_PROP, String(away));
  }

  private _handleScroll = () => {
    const y = window.scrollY;
    this.scrolled = y > SCROLLED_THRESHOLD_PX;
    this._syncImmersive(y);
  };

  /**
   * A resize can change the resting bar height (the links wrap away below the
   * breakpoint, the inline padding tracks the viewport), and that height is the
   * immersive threshold, so it has to be re-read rather than kept from mount.
   */
  private _handleResize = () => {
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

    this.immersive = y > this._navHeight;

    if (!this.immersive || this.menuOpen) {
      this._clearSettleTimer();
      this.immersiveHidden = false;
      return;
    }

    // The floating elements are only in the way while the page is actually
    // moving, so any scroll tucks them and the settle timer brings them back.
    // Tabbing through the header scrolls the page too, and hiding the control
    // the focus ring is on would leave the keyboard user with nothing to look at.
    if (!moved || this._hasKeyboardFocus()) return;
    this.immersiveHidden = true;
    this._restartSettleTimer();
  }

  /** Focus arriving by keyboard brings the pills straight back. */
  private _handleFocusIn = () => {
    if (this._hasKeyboardFocus()) this.immersiveHidden = false;
  };

  /**
   * True only for focus the browser is actually drawing a ring for — a pointer
   * tap on the hamburger leaves focus on it, and that must not count.
   */
  private _hasKeyboardFocus(): boolean {
    return hasKeyboardFocusWithin(this);
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
      /* Set by ark-navigation-root in immersive mode, where the row is boxed
         into a pill and the resting gap is too wide for it. */
      gap: var(--ark-nav-links-gap, var(--ark-space-12));
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
 *
 * @cssprop [--ark-nav-link-color=var(--ark-color-text-ghost)] - Resting link
 *   colour. Darkened by ark-navigation-root on the immersive links pill, whose
 *   tinted background the ghost grey is too light for.
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
      /* Set by ark-navigation-root on the links pill, where the tinted
         background needs a darker ink to stay readable. */
      color: var(--ark-nav-link-color, var(--ark-color-text-ghost));
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
      color: var(--ark-nav-link-color, var(--ark-color-text-ghost));
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
 *
 * @cssprop [--ark-nav-cta-radius=var(--ark-radius-xs)] - Button radius. Set to
 *   the pill radius by ark-navigation-root while the header is immersive.
 * @cssprop [--ark-nav-cta-underline-opacity=1] - Opacity of the hover
 *   underline. Zeroed by ark-navigation-root while the button is a pill, where
 *   the curve would clip a straight bar into a stub.
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
      /* Set by ark-navigation-root in immersive mode, where the button floats
         as a pill of its own rather than sitting on a solid bar. */
      border-radius: var(--ark-nav-cta-radius, var(--ark-radius-xs));
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
        border-radius var(--ark-duration-normal) var(--ark-ease-standard),
        color var(--ark-duration-normal) var(--ark-ease-standard),
        transform var(--ark-duration-normal) var(--ark-ease-standard);
    }

    /* Blush underline — scaleX from left on hover (primary button pattern §6).
       Suppressed while the button is a floating pill, where the curve would
       clip it to a stub; ark-navigation-root sets the opacity for that. */
    .cta::after {
      background: var(--ark-color-accent);
      bottom: 0;
      content: '';
      height: 2px;
      left: 0;
      opacity: var(--ark-nav-cta-underline-opacity, 1);
      position: absolute;
      transform: scaleX(0);
      transform-origin: left;
      transition:
        opacity var(--ark-duration-normal) var(--ark-ease-standard),
        transform var(--ark-duration-normal) var(--ark-ease-standard);
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
 *
 * The panel slides and fades as one, and the items inside it come in behind it
 * on a stagger — each one a fixed step later than the one above, so the list
 * reads top to bottom rather than arriving as a single block. The step is
 * driven by {@link MENU_ITEM_INDEX_PROP}, written onto each slotted child as it
 * is assigned rather than matched with `:nth-child()`, so a menu of any length
 * staggers without the stylesheet having to know how many items there are.
 *
 * Closing is deliberately quicker than opening and drops the stagger: on the
 * way out the drawer is in the way of whatever the tap was aiming at, and a
 * reversed cascade only holds it there longer.
 *
 * @summary Sliding mobile navigation drawer.
 * @cssprop [--ark-nav-menu-duration=460ms] - Slide/fade duration on open.
 * @cssprop [--ark-nav-menu-exit-duration=240ms] - Slide/fade duration on close.
 * @cssprop [--ark-nav-menu-ease=var(--ark-ease-expo-out)] - Easing for the
 *   panel and its items.
 * @cssprop [--ark-nav-menu-shift=-16px] - How far the panel travels.
 * @cssprop [--ark-nav-menu-item-duration=380ms] - Per-item fade/slide duration.
 * @cssprop [--ark-nav-menu-item-shift=-10px] - How far each item travels.
 * @cssprop [--ark-nav-menu-item-delay=90ms] - Delay before the first item
 *   starts, measured from the moment the panel starts moving.
 * @cssprop [--ark-nav-menu-stagger=60ms] - Extra delay per item after the first.
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
      z-index: 99;

      /* Drawer motion knobs — see the class doc comment. Spelled out in ms
         rather than taken from --ark-duration-*: the panel is a large surface
         travelling a long way and wants a slower ramp than the shared
         normal/slow steps, which are tuned for small state changes. The
         reduced-motion block at the bottom collapses all of them. */
      --ark-nav-menu-duration: 460ms;
      --ark-nav-menu-exit-duration: 240ms;
      --ark-nav-menu-ease: var(--ark-ease-expo-out);
      --ark-nav-menu-shift: -16px;
      --ark-nav-menu-item-duration: 380ms;
      --ark-nav-menu-item-shift: -10px;
      --ark-nav-menu-item-delay: 90ms;
      --ark-nav-menu-stagger: 60ms;

      opacity: 0;
      transform: translateY(var(--ark-nav-menu-shift));
      visibility: hidden;
      /* Declared on the closed state, so this is the transition that runs on
         the way out; the open state below carries the slower entry. */
      transition:
        opacity var(--ark-nav-menu-exit-duration) var(--ark-nav-menu-ease),
        transform var(--ark-nav-menu-exit-duration) var(--ark-nav-menu-ease),
        visibility var(--ark-nav-menu-exit-duration) step-end;
    }

    :host([menu-open]) {
      opacity: 1;
      transform: translateY(0);
      transition:
        opacity var(--ark-nav-menu-duration) var(--ark-nav-menu-ease),
        transform var(--ark-nav-menu-duration) var(--ark-nav-menu-ease),
        visibility var(--ark-nav-menu-duration) step-start;
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

    /* Every item, not just ark-nav-link: a drawer may hold a CTA or a divider
       and a row left out of the cascade is the one thing the eye catches. */
    ::slotted(*) {
      opacity: 0;
      transform: translateY(var(--ark-nav-menu-item-shift));
      transition:
        opacity var(--ark-nav-menu-exit-duration) var(--ark-nav-menu-ease),
        transform var(--ark-nav-menu-exit-duration) var(--ark-nav-menu-ease);
    }

    :host([menu-open]) ::slotted(*) {
      opacity: 1;
      transform: translateY(0);
      transition:
        opacity var(--ark-nav-menu-item-duration) var(--ark-nav-menu-ease),
        transform var(--ark-nav-menu-item-duration) var(--ark-nav-menu-ease);
      /* The index is unitless, so this multiplies out to a time. Items with no
         index yet (first paint, before slotchange) fall back to 0 and simply
         arrive with the first one. */
      transition-delay: calc(
        var(--ark-nav-menu-item-delay) + var(--ark-nav-menu-item-index, 0) *
          var(--ark-nav-menu-stagger)
      );
    }

    /* The shared --ark-duration-* overrides in theme.css can't reach in here,
       and its blanket \`*\` rule doesn't cross the shadow boundary either, so
       the knobs above have to be collapsed by hand. */
    @media (prefers-reduced-motion: reduce) {
      :host {
        --ark-nav-menu-duration: 1ms;
        --ark-nav-menu-exit-duration: 1ms;
        --ark-nav-menu-shift: 0px;
        --ark-nav-menu-item-duration: 1ms;
        --ark-nav-menu-item-shift: 0px;
        --ark-nav-menu-item-delay: 0ms;
        --ark-nav-menu-stagger: 0ms;
      }
    }
  `;

  /**
   * Numbers the slotted items so each one can offset its own transition.
   *
   * Driven from `slotchange` — which covers the menu being re-populated across
   * an Astro ClientRouter navigation — and once from `firstUpdated`, because
   * the items are already in the light DOM before the slot that will hold them
   * exists and not every environment replays that first assignment as an event.
   */
  private _indexItems = () => {
    const slot = this.renderRoot.querySelector("slot");
    slot?.assignedElements().forEach((el, i) => {
      (el as HTMLElement).style.setProperty(MENU_ITEM_INDEX_PROP, String(i));
    });
  };

  override firstUpdated() {
    this._indexItems();
  }

  override render() {
    return html`
      <nav class="mobile-menu" aria-label=${this.label}>
        <slot @slotchange=${this._indexItems}></slot>
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
