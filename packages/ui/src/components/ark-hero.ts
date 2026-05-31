import { css, html, LitElement, nothing } from "lit";
import { choose } from "lit/directives/choose.js";
import { defineElement } from "../define-element";
import { defineArkBadge } from "../primitives/ark-badge";
import { defineArkBrandLogo } from "../primitives/ark-brand-logo";
import { defineArkButton } from "../primitives/ark-button";

export enum HeroTitleVariant {
  Text = "text",
  Brand = "brand",
}

/**
 * ArkHero — the full-bleed two-column hero section used across Arkaes apps.
 *
 * Structure:
 *   .hero (grid 1fr 1fr)
 *   ├── .hero-left  — eyebrow badge, H1, subtitle, CTAs
 *   ├── .hero-right — blush-tinted panel with abstract geometric composition
 *   └── .hero-scroll — animated scroll indicator at bottom-left
 *
 * Title modes (title-variant attribute):
 *   "text"  — plain-text headline (default, portfolio)
 *   "brand" — renders the <ark-brand-logo size="display"> wordmark (brand-guideline)
 *
 * Mouse parallax on the composition block is handled internally via
 * connectedCallback / disconnectedCallback.
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

  // ── Mouse parallax ──────────────────────────────────────────────────────
  private _handleParallax = (e: MouseEvent) => {
    const comp = this.shadowRoot?.querySelector<HTMLElement>(".composition");
    if (!comp) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return;
    const x = (e.clientX / window.innerWidth - 0.5) * 14;
    const y = (e.clientY / window.innerHeight - 0.5) * 9;
    comp.style.transform = `translate(${x}px, ${y}px)`;
  };

  override connectedCallback() {
    super.connectedCallback();
    document.addEventListener("mousemove", this._handleParallax);
  }

  override disconnectedCallback() {
    document.removeEventListener("mousemove", this._handleParallax);
    super.disconnectedCallback();
  }

  // ── Styles ─────────────────────────────────────────────────────────────
  static override styles = css`
    :host {
      display: block;
    }

    /* ── Layout ─────────────────────────────────────────────────────── */
    .hero {
      column-gap: 60px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      /* nav-height + hero-height = 100vh
         --ark-nav-header-height is set by <ark-navigation-root> (default 80px) */
      min-height: calc(max(100vh, 960px) - var(--ark-nav-header-height, 80px));
      overflow: hidden;
      padding-inline: var(--site-content-padding);
      padding-top: 100px;
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
    .hero-title {
      animation: fadeSlideUp 1000ms var(--ark-ease-out) forwards 400ms;
      color: var(--ark-color-text);
      font-family: var(--ark-font-display);
      font-size: 4rem;
      font-weight: var(--ark-weight-thin);
      letter-spacing: 0;
      line-height: var(--ark-line-height-tight);
      margin-top: 36px;
      opacity: 0;
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
    .hero-title--brand {
      font-size: 4rem;
    }

    .hero-title--brand ark-brand-logo {
      font-size: inherit;
      line-height: inherit;
    }

    /* ── Subtitle ───────────────────────────────────────────────────── */
    .hero-subtitle {
      animation: fadeSlideUp 900ms var(--ark-ease-out) forwards 650ms;
      color: var(--ark-color-text-muted);
      font-size: var(--ark-font-size-xl);
      font-weight: var(--ark-font-weight-light);
      line-height: var(--ark-line-height-relaxed);
      margin-block: 40px 56px;
      max-width: 380px;
      opacity: 0;
    }

    /* ── Actions ────────────────────────────────────────────────────── */
    .hero-actions {
      align-items: center;
      animation: fadeSlideUp 900ms var(--ark-ease-out) forwards 850ms;
      display: flex;
      gap: 40px;
      opacity: 0;
    }

    .hero-left ark-badge {
      animation: fadeSlideUp 900ms var(--ark-ease-out) forwards 200ms;
      opacity: 0;
    }

    /* ── Right panel (composition) ─────────────────────────────────── */
    .hero-right {
      animation: fadeIn 1200ms var(--ark-ease-out) forwards 300ms;
      opacity: 0;
      overflow: hidden;
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
    .composition {
      height: 440px;
      position: relative;
      transition: transform 600ms var(--ark-ease-out);
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
      left: 24px;
      letter-spacing: 0.22em;
      position: absolute;
      text-transform: uppercase;
      top: 318px;
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

    /* ── Responsive: wide ───────────────────────────────────────────── */
    @media (min-width: 1120px) {
      .hero-title {
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

      .hero-title {
        font-size: 4rem;
      }

      .title-line2 {
        padding-left: 0;
      }

      .hero-subtitle {
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

      .composition {
        height: 370px;
        transform: none !important;
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

      .hero-title {
        font-size: 3rem;
      }
    }

    /* ── Reduced motion ──────────────────────────────────────────────── */
    @media (prefers-reduced-motion: reduce) {
      .composition {
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
              ${this.titleEmphasis
                ? html`<em><span class="title-line2">${this.titleEmphasis}</span></em>`
                : nothing}
            </h1>
          `,
        ],
      ],
      // default: "text"
      () => html`
        <h1 class="hero-title">
          ${this.heading}
          ${this.titleEmphasis
            ? html`<em><span class="title-line2">${this.titleEmphasis}</span></em>`
            : nothing}
        </h1>
      `,
    );
  }

  override render() {
    return html`
      <div class="hero">
        <!-- ── Left column ──────────────────────────────────── -->
        <div class="hero-left">
          ${this.eyebrow
            ? html`<ark-badge variant="eyebrow">${this.eyebrow}</ark-badge>`
            : nothing}
          ${this._renderTitle()}
          ${this.subtitle
            ? html`<p class="hero-subtitle">${this.subtitle}</p>`
            : nothing}
          <div class="hero-actions">
            ${this.primaryLabel
              ? html`<ark-button href=${this.primaryHref}
                  >${this.primaryLabel}</ark-button
                >`
              : nothing}
            ${this.ghostLabel
              ? html`<ark-button href=${this.ghostHref} variant="ghost"
                  >${this.ghostLabel}</ark-button
                >`
              : nothing}
          </div>
        </div>

        <!-- ── Right column: geometric composition ─────────── -->
        <div class="hero-right">
          <div class="hero-image-panel">
            <div class="composition">
              <div class="comp-block-large"></div>
              <div class="comp-block-accent"></div>
              <div class="comp-block-sage"></div>
              <div class="comp-circle"></div>
              <div class="comp-sage-dot"></div>
              <div class="comp-label">${this.compLabel}</div>
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
