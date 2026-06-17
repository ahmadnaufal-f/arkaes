import { css, html, LitElement } from "lit";
import { choose } from "lit/directives/choose.js";
import { when } from "lit/directives/when.js";
import { defineElement } from "../define-element";
import { defineArkBadge } from "../primitives/ark-badge";
import { defineArkBrandLogo } from "../primitives/ark-brand-logo";
import { defineArkButton } from "../primitives/ark-button";

export enum HeroTitleVariant {
  Text = "text",
  Brand = "brand",
}

/**
 * ArkHero is a two-column hero shell with slots for eyebrow, title, subtitle,
 * actions, and visual content. The existing attributes render default slot
 * content for simple use cases and backwards compatibility.
 *
 * The default visual includes pointer parallax. Custom visuals inherit the
 * same local parallax wrapper, which is disabled for reduced-motion users.
 */
export class ArkHero extends LitElement {
  static override properties = {
    eyebrow: { type: String },
    heading: { type: String, attribute: "title" },
    titleEmphasis: { type: String, attribute: "title-emphasis" },
    titleVariant: { type: String, attribute: "title-variant", reflect: true },
    subtitle: { type: String },
    primaryHref: { type: String, attribute: "primary-href" },
    primaryLabel: { type: String, attribute: "primary-label" },
    ghostHref: { type: String, attribute: "ghost-href" },
    ghostLabel: { type: String, attribute: "ghost-label" },
    compLabel: { type: String, attribute: "comp-label" },
    scrollLabel: { type: String, attribute: "scroll-label" },
  };

  eyebrow = "";
  heading = "";
  titleEmphasis = "";
  titleVariant: HeroTitleVariant | string = HeroTitleVariant.Text;
  subtitle = "";
  primaryHref = "#";
  primaryLabel = "";
  ghostHref = "#";
  ghostLabel = "";
  compLabel = "arkaes.dev - mmxxvi";
  scrollLabel = "Explore the work";

  private _heroElement: HTMLElement | null = null;
  private _motionPreference: MediaQueryList | null = null;

  private _handleParallax = (e: MouseEvent) => {
    const visual = this.renderRoot.querySelector<HTMLElement>(".visual");
    if (!visual || !this._heroElement) return;

    const bounds = this._heroElement.getBoundingClientRect();
    const x = ((e.clientX - bounds.left) / bounds.width - 0.5) * 14;
    const y = ((e.clientY - bounds.top) / bounds.height - 0.5) * 9;
    visual.style.transform = `translate(${x}px, ${y}px)`;
  };

  private _resetParallax = () => {
    const visual = this.renderRoot.querySelector<HTMLElement>(".visual");
    visual?.style.removeProperty("transform");
  };

  private _syncParallaxListener = () => {
    if (!this._heroElement || !this._motionPreference) return;

    this._heroElement.removeEventListener("mousemove", this._handleParallax);
    this._heroElement.removeEventListener("mouseleave", this._resetParallax);

    if (this._motionPreference.matches) {
      this._resetParallax();
      return;
    }

    this._heroElement.addEventListener("mousemove", this._handleParallax);
    this._heroElement.addEventListener("mouseleave", this._resetParallax);
  };

  private _setupParallax() {
    this._heroElement = this.renderRoot.querySelector<HTMLElement>(".hero");
    this._motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    this._motionPreference.addEventListener("change", this._syncParallaxListener);
    this._syncParallaxListener();
  }

  override connectedCallback() {
    super.connectedCallback();
    if (this.hasUpdated) this._setupParallax();
  }

  protected override firstUpdated() {
    this._setupParallax();
  }

  override disconnectedCallback() {
    this._heroElement?.removeEventListener("mousemove", this._handleParallax);
    this._heroElement?.removeEventListener("mouseleave", this._resetParallax);
    this._motionPreference?.removeEventListener(
      "change",
      this._syncParallaxListener,
    );
    this._heroElement = null;
    this._motionPreference = null;
    super.disconnectedCallback();
  }

  static override styles = css`
    :host {
      display: block;
    }

    /* ── Layout ─────────────────────────────────────────────────────── */
    .hero {
      column-gap: 60px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      min-height: var(
        --ark-hero-min-height,
        calc(max(100vh, 960px) - var(--ark-nav-header-height, 80px))
      );
      /* clip instead of hidden: hidden creates a scroll container (per the
         Scroll-Driven Animations spec), which would intercept view-timeline
         lookups and prevent the mobile scatter from reaching the root viewport. */
      overflow: clip;
      padding-inline: var(
        --ark-hero-content-padding,
        var(--site-content-padding, 60px)
      );
      padding-top: var(--ark-hero-padding-top, 100px);
      position: relative;
    }

    .hero-left {
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 80px 0;
      position: relative;
      z-index: 2;
    }

    /* ── Hero title ─────────────────────────────────────────────────── */
    .hero-title-slot {
      animation: fadeSlideUp 1000ms var(--ark-ease-out) forwards 400ms;
      opacity: 0;
    }

    .hero-title,
    ::slotted([slot="title"]) {
      color: var(--ark-color-text);
      font-family: var(--ark-font-display);
      font-size: 4rem;
      font-weight: var(--ark-weight-thin);
      letter-spacing: 0;
      line-height: var(--ark-line-height-tight);
      margin: 36px 0 0;
    }

    .hero-title em {
      color: var(--ark-color-accent-strong);
      font-style: italic;
      font-weight: var(--ark-weight-thin);
    }

    .title-line2 {
      display: block;
      padding-left: 80px;
    }

    /* ── Brand-variant title ────────────────────────────────────────── */
    .hero-title--brand,
    ::slotted([slot="title"][data-variant="brand"]) {
      font-size: 4rem;
    }

    .hero-title--brand ark-brand-logo {
      font-size: inherit;
      line-height: inherit;
    }

    /* ── Subtitle ───────────────────────────────────────────────────── */
    .hero-subtitle-slot {
      animation: fadeSlideUp 900ms var(--ark-ease-out) forwards 650ms;
      opacity: 0;
    }

    .hero-subtitle,
    ::slotted([slot="subtitle"]) {
      color: var(--ark-color-text-muted);
      font-size: var(--ark-font-size-xl);
      font-weight: var(--ark-font-weight-light);
      line-height: var(--ark-line-height-relaxed);
      margin-block: 40px 56px;
      max-width: 380px;
    }

    /* ── Actions ────────────────────────────────────────────────────── */
    .hero-actions {
      align-items: center;
      animation: fadeSlideUp 900ms var(--ark-ease-out) forwards 850ms;
      display: flex;
      gap: 40px;
      opacity: 0;
    }

    .hero-eyebrow {
      animation: fadeSlideUp 900ms var(--ark-ease-out) forwards 200ms;
      opacity: 0;
    }

    slot {
      display: contents;
    }

    /* ── Right panel (composition) ─────────────────────────────────── */
    .hero-right {
      animation: fadeIn 1200ms var(--ark-ease-out) forwards 300ms;
      opacity: 0;
      overflow: clip; /* same reason as .hero above */
      position: relative;
    }

    .hero-image-panel {
      align-items: center;
      background: var(--ark-color-accent-soft);
      display: flex;
      inset: 0;
      justify-content: center;
      position: absolute;
    }

    /* ── Geometric composition ──────────────────────────────────────── */
    .visual {
      align-items: center;
      display: flex;
      justify-content: center;
      transition: transform 600ms var(--ark-ease-out);
    }

    ::slotted([slot="visual"]) {
      max-height: 100%;
      max-width: 100%;
    }

    .composition {
      height: 440px;
      position: relative;
      width: 340px;
    }

    .comp-block-large,
    .comp-block-accent,
    .comp-block-sage,
    .comp-circle,
    .comp-sage-dot {
      opacity: 0;
      position: absolute;
    }

    .comp-block-large {
      animation: compIn 1000ms var(--ark-ease-out) forwards 500ms;
      background: var(--ark-color-blush-light);
      border-radius: var(--ark-radius-md);
      height: 300px;
      left: 20px;
      top: 0;
      width: 260px;
    }

    .comp-block-accent {
      animation: compIn 1000ms var(--ark-ease-out) forwards 720ms;
      background: var(--ark-color-blush-deep);
      border-radius: var(--ark-radius-md);
      height: 160px;
      mix-blend-mode: multiply;
      right: 0;
      top: 50px;
      width: 110px;
    }

    .comp-block-sage {
      animation: compIn 1000ms var(--ark-ease-out) forwards 920ms;
      background: var(--ark-color-counterpoint);
      border-radius: var(--ark-radius-md);
      bottom: 70px;
      height: 100px;
      left: 0;
      width: 140px;
    }

    .comp-circle {
      animation: compIn 1100ms var(--ark-ease-out) forwards 1100ms;
      border: 1.5px solid var(--ark-color-blush-deep);
      border-radius: 50%;
      bottom: 30px;
      height: 90px;
      right: 30px;
      width: 90px;
    }

    .comp-sage-dot {
      animation: compIn 1000ms var(--ark-ease-out) forwards 1300ms;
      background: var(--ark-color-sage-light);
      border-radius: 50%;
      bottom: 68px;
      height: 14px;
      right: 68px;
      width: 14px;
    }

    .comp-label {
      color: var(--ark-color-text-ghost);
      font-family: var(--ark-font-mono);
      font-size: var(--ark-font-size-xs);
      left: 40px;
      letter-spacing: 0.22em;
      position: absolute;
      text-transform: uppercase;
      top: 20px;
    }

    /* ── Scroll indicator ───────────────────────────────────────────── */
    .hero-scroll {
      align-items: center;
      animation: fadeIn 1000ms var(--ark-ease-out) forwards 1300ms;
      bottom: 40px;
      color: var(--ark-color-text-ghost);
      display: flex;
      font-family: var(--ark-font-mono);
      font-size: var(--ark-font-size-xs);
      gap: 14px;
      left: 60px;
      letter-spacing: 0.22em;
      opacity: 0;
      position: absolute;
      text-transform: uppercase;
    }

    .scroll-line {
      background: var(--ark-color-border);
      height: 1px;
      overflow: hidden;
      position: relative;
      width: 48px;
    }

    .scroll-line::after {
      animation: scrollLine 2200ms ease-in-out infinite;
      background: var(--ark-color-accent);
      content: "";
      height: 100%;
      left: -100%;
      position: absolute;
      top: 0;
      width: 100%;
    }

    /* ── Keyframes ──────────────────────────────────────────────────── */
    @keyframes fadeSlideUp {
      from {
        opacity: 0;
        transform: translateY(36px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    @keyframes compIn {
      from {
        opacity: 0;
        transform: scale(0.9) translateY(18px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    @keyframes scrollLine {
      0%   { left: -100%; }
      50%  { left: 0; }
      100% { left: 100%; }
    }

    @keyframes compScatter {
      to {
        scale: var(--scatter-scale, 1.4);
        translate: var(--scatter-x, 0) var(--scatter-y, 0);
        opacity: 0;
      }
    }

    /* Native scroll-driven scatter — the composition pieces drift apart and
       grow as the hero scrolls away, flying out of frame. Each piece keeps its
       time-based entrance (auto timeline) and rides the root scroll timeline
       for the scatter, animating the independent translate/scale properties so
       it composes with the entrance transform instead of overriding it.
       Progressive enhancement: browsers without scroll-driven animation, and
       reduced-motion users, keep the static composition. */
    @supports (animation-timeline: scroll()) {
      @media (prefers-reduced-motion: no-preference) {
        .comp-block-large {
          --scatter-x: -132px;
          --scatter-y: -102px;
          animation:
            compIn 1000ms var(--ark-ease-out) forwards 500ms,
            compScatter linear both;
          animation-range: normal, 0 90vh;
          animation-timeline: auto, scroll(root block);
        }

        .comp-block-accent {
          --scatter-x: 130px;
          --scatter-y: -74px;
          animation:
            compIn 1000ms var(--ark-ease-out) forwards 720ms,
            compScatter linear both;
          animation-range: normal, 0 90vh;
          animation-timeline: auto, scroll(root block);
        }

        .comp-block-sage {
          --scatter-x: -120px;
          --scatter-y: 98px;
          animation:
            compIn 1000ms var(--ark-ease-out) forwards 920ms,
            compScatter linear both;
          animation-range: normal, 0 90vh;
          animation-timeline: auto, scroll(root block);
        }

        .comp-circle {
          --scatter-x: 132px;
          --scatter-y: 90px;
          animation:
            compIn 1100ms var(--ark-ease-out) forwards 1100ms,
            compScatter linear both;
          animation-range: normal, 0 90vh;
          animation-timeline: auto, scroll(root block);
        }

        .comp-sage-dot {
          --scatter-x: 170px;
          --scatter-y: 72px;
          animation:
            compIn 1000ms var(--ark-ease-out) forwards 1300ms,
            compScatter linear both;
          animation-range: normal, 0 90vh;
          animation-timeline: auto, scroll(root block);
        }

        .comp-label {
          --scatter-x: -54px;
          --scatter-y: -42px;
          animation: compScatter linear both;
          animation-range: 0 90vh;
          animation-timeline: scroll(root block);
        }

        /* ── Mobile: scatter relative to composition's own viewport position ─
           On narrow screens the composition is below the fold, so the
           absolute scroll-range "0 90vh" starts the scatter before the user
           has even seen the composition.  Instead we track the composition
           element itself with a named view-timeline and begin scattering only
           once its centre crosses 50 vh (cover 50%) — right in the middle of
           the screen — finishing as it exits the top (cover 100%). */
        @media (max-width: 900px) {
          .composition {
            view-timeline-axis: block;
            view-timeline-name: --comp-view;
          }

          .comp-block-large,
          .comp-block-accent,
          .comp-block-sage,
          .comp-circle,
          .comp-sage-dot {
            animation-range: normal, cover 50% cover 100%;
            animation-timeline: auto, --comp-view;
          }

          .comp-label {
            animation-range: cover 50% cover 100%;
            animation-timeline: --comp-view;
          }
        }
      }
    }

    /* ── Responsive: wide ───────────────────────────────────────────── */
    @media (min-width: 1120px) {
      .hero-title,
      ::slotted([slot="title"]) {
        font-size: 6.5rem;
      }
    }

    /* ── Responsive: tablet / mobile ────────────────────────────────── */
    @media (max-width: 900px) {
      .hero {
        grid-template-columns: 1fr;
        min-height: auto;
        padding-inline: 0;
        padding-top: 86px;
      }

      .hero-left {
        padding: 72px 24px 56px;
      }

      .hero-title,
      ::slotted([slot="title"]) {
        font-size: 4rem;
      }

      .title-line2 {
        padding-left: 0;
      }

      .hero-subtitle,
      ::slotted([slot="subtitle"]) {
        font-size: 1.14rem;
        max-width: none;
      }

      .hero-actions {
        align-items: flex-start;
        flex-direction: column;
        gap: 22px;
      }

      .hero-right {
        min-height: 420px;
      }

      .visual {
        transform: none !important;
      }

      .composition {
        height: 370px;
        width: 280px;
      }

      .comp-block-large {
        height: 245px;
        width: 215px;
      }

      .comp-block-accent {
        height: 130px;
        width: 88px;
      }

      .comp-block-sage {
        height: 82px;
        width: 112px;
      }

      .hero-scroll {
        display: none;
      }
    }

    /* ── Responsive: small mobile ────────────────────────────────────── */
    @media (max-width: 520px) {
      ark-button {
        width: 100%;
      }

      .hero-title,
      ::slotted([slot="title"]) {
        font-size: 3rem;
      }
    }

    /* ── Reduced motion ──────────────────────────────────────────────── */
    @media (prefers-reduced-motion: reduce) {
      .visual {
        transform: none !important;
      }
    }
  `;

  // ── Render helpers ──────────────────────────────────────────────────────
  private _renderTitle() {
    return choose(
      this.titleVariant,
      [
        [
          HeroTitleVariant.Brand,
          () => html`
            <h1 class="hero-title hero-title--brand">
              <ark-brand-logo size="display"></ark-brand-logo>
              ${when(
                this.titleEmphasis,
                () =>
                  html`<em
                    ><span class="title-line2"
                      >${this.titleEmphasis}</span
                    ></em
                  >`,
              )}
            </h1>
          `,
        ],
      ],
      // default: "text"
      () => html`
        <h1 class="hero-title">
          ${this.heading}
          ${when(
            this.titleEmphasis,
            () =>
              html`<em
                ><span class="title-line2">${this.titleEmphasis}</span></em
              >`,
          )}
        </h1>
      `,
    );
  }

  override render() {
    return html`
      <div class="hero">
        <!-- ── Left column ──────────────────────────────────── -->
        <div class="hero-left">
          <div class="hero-eyebrow">
            <slot name="eyebrow">
              ${when(
                this.eyebrow,
                () =>
                  html`<ark-badge variant="eyebrow"
                    >${this.eyebrow}</ark-badge
                  >`,
              )}
            </slot>
          </div>
          <div class="hero-title-slot">
            <slot name="title">${this._renderTitle()}</slot>
          </div>
          <div class="hero-subtitle-slot">
            <slot name="subtitle">
              ${when(
                this.subtitle,
                () => html`<p class="hero-subtitle">${this.subtitle}</p>`,
              )}
            </slot>
          </div>
          <div class="hero-actions">
            <slot name="actions">
              ${when(
                this.primaryLabel,
                () =>
                  html`<ark-button href=${this.primaryHref}
                    >${this.primaryLabel}</ark-button
                  >`,
              )}
              ${when(
                this.ghostLabel,
                () =>
                  html`<ark-button href=${this.ghostHref} variant="ghost"
                    >${this.ghostLabel}</ark-button
                  >`,
              )}
            </slot>
          </div>
        </div>

        <!-- ── Right column: custom visual or default composition ──── -->
        <div class="hero-right">
          <div class="hero-image-panel">
            <div class="visual">
              <slot name="visual">
                <div class="composition">
                  <div class="comp-block-large"></div>
                  <div class="comp-block-accent"></div>
                  <div class="comp-block-sage"></div>
                  <div class="comp-circle"></div>
                  <div class="comp-sage-dot"></div>
                  <div class="comp-label">${this.compLabel}</div>
                </div>
              </slot>
            </div>
          </div>
        </div>

        <!-- ── Scroll indicator ─────────────────────────────── -->
        <div class="hero-scroll">
          <div class="scroll-line"></div>
          ${this.scrollLabel}
        </div>
      </div>
    `;
  }
}

/** Compound namespace export */
export const Hero = {
  Root: ArkHero,
};

export const defineArkHero = () => {
  defineArkBadge();
  defineArkBrandLogo();
  defineArkButton();
  defineElement("ark-hero", ArkHero);
};

declare global {
  interface HTMLElementTagNameMap {
    "ark-hero": ArkHero;
  }
}
