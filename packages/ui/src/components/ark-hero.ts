import { css, html, LitElement } from "lit";
import { choose } from "lit/directives/choose.js";
import { map } from "lit/directives/map.js";
import { when } from "lit/directives/when.js";
import { defineElement } from "../define-element";
import { defineArkBrandLogo } from "../primitives/ark-brand-logo";
import { defineArkButton } from "../primitives/ark-button";
import { defineArkChip } from "../primitives/ark-chip";

export enum HeroTitleVariant {
  Text = "text",
  Brand = "brand",
}

/**
 * ArkHero is a two-column hero shell with slots for eyebrow, title, subtitle,
 * actions, and visual content. The existing attributes render default slot
 * content for simple use cases and backwards compatibility.
 *
 * The headline sets each line unbroken (`white-space: nowrap`) and the
 * emphasis renders as a filled band rather than an italic accent run. Below
 * 1400px that band bleeds out to the hero's own inline edge; above it — where
 * the page gutter stops being a gutter and starts being open margin — it stays
 * self-contained. See `.hero-title em` for the reasoning.
 *
 * The default visual includes pointer parallax. Custom visuals inherit the
 * same local parallax wrapper, which is disabled for reduced-motion users.
 *
 * @summary Two-column page hero.
 * @slot eyebrow - Chip row above the title; overrides the `chips` attribute.
 * @slot title - The hero headline.
 * @slot subtitle - Supporting sentence beneath the title.
 * @slot actions - Call-to-action controls (e.g. ark-button).
 * @slot visual - The right-column visual / media.
 */
export class ArkHero extends LitElement {
  static override properties = {
    chips: { type: Array },
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

  /**
   * Labels for the chip row above the headline. Every entry renders as an
   * `ark-chip` with the same variant; mixing variants (e.g. marking one
   * practice area as `emerging`) needs the `eyebrow` slot, which also puts the
   * chips in the server-rendered HTML the way the portfolio's headline is.
   */
  chips: string[] = [];
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
      /* The hero's own resolved inline padding, re-exposed as a variable so
         the emphasis band can bleed by exactly that much (see .hero-title em)
         instead of hard-coding a length that would drift from the layout. */
      --hero-pad: var(
        --ark-hero-content-padding,
        var(--site-content-padding, 60px)
      );

      column-gap: 60px;
      display: grid;
      /* Not 1fr 1fr: the headline holds each line unbroken, and "Frontend
         engineering" does not fit a half-width column at this size. */
      grid-template-columns: 1.45fr 1fr;
      min-height: var(
        --ark-hero-min-height,
        calc(max(100vh, 960px) - var(--ark-nav-header-height, 80px))
      );
      /* clip instead of hidden: hidden creates a scroll container (per the
         Scroll-Driven Animations spec), which would intercept view-timeline
         lookups and prevent the mobile scatter from reaching the root viewport. */
      overflow: clip;
      padding-inline: var(--hero-pad);
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
    /* Spacing and sizing live on this wrapper, not on the title itself.
       ::slotted() declarations sit in the shadow tree, and for a slotted
       element the outer tree wins the cascade for normal declarations — so a
       consumer's global reset (h1 { margin-block: 0 }) silently beats any
       margin set through ::slotted(), and the slotted heading loses its
       spacing while inherited properties like font-size still apply. The
       wrapper is shadow DOM proper, out of the document's reach, so the box
       model is identical whether the title arrives via the attribute or the
       slot. Same reasoning for .hero-subtitle-slot below. */
    .hero-title-slot {
      animation: fadeSlideUp 1000ms var(--ark-ease-out) forwards 400ms;
      margin-top: var(--ark-space-12);
      opacity: 0;
    }

    .hero-title,
    ::slotted([slot="title"]) {
      color: var(--ark-color-text);
      font-family: var(--ark-font-display);
      /* This is the single-column scale; the two-column rule further down
         takes over from 901px, where the measure becomes the left column
         rather than the viewport. Each line is nowrap, so the scale is bounded
         by the measure: the longest line renders at roughly 8.2x the font size
         in Fraunces (a ratio that holds steady across the range, measured, not
         derived). Held to ~79% of the measure rather than the ~88% it can
         technically reach — at 88% the headline runs so close to the gutter
         that the whole block reads as wider than the screen, which on a phone
         is the difference between confident and broken. */
      font-size: clamp(1.7rem, 9.6vw - 4.4px, 3.5rem);
      font-weight: var(--ark-weight-medium);
      letter-spacing: -0.018em;
      line-height: 1.14;
      margin: 0;
    }

    /* Each line is held on one line by design — the emphasis band reads as a
       band only if the phrase it fills cannot rewrap out from under it. */
    .title-line {
      display: block;
      white-space: nowrap;
    }

    /* The lead line is raised above the band rather than the band being pushed
       to a negative z-index: a negative index would sit behind the nearest
       stacking context's background, so any consumer that gives .hero or a
       wrapper its own background would silently lose the fill. */
    .title-line--lead {
      position: relative;
      z-index: 1;
    }

    .hero-title em {
      background: var(--ark-color-accent);
      color: var(--ark-color-bg);
      /* inline-block, not inline: vertical padding on an inline box does not
         grow the line box, so the fill would overlap the subtitle below. */
      display: inline-block;
      font-style: normal;
      font-weight: inherit;
      /* Overhangs left by exactly its own padding, so the emphasised line's
         glyphs stay flush with the lead line above it. */
      margin-left: -0.5em;
      padding: 0.1em 0.5em 0.18em;
      position: relative;
      z-index: 0;
    }

    /* Below the layout's max width the page gutter is capped at 60px, so
       running the band out to the hero's edge reads as the headline breaking
       its own margin. Past that point the gutter grows without limit (310px at
       1900, 640px at 2560) and the same rule would drag a slab of colour across
       open margin, so the bleed is scoped to the range where it means
       something. 1400px is where clamp(24px, 5vw, 60px) and the centring maths
       for an 80rem max width cross. */
    @media (max-width: 1399.98px) {
      .hero-title em {
        margin-left: calc(-1 * var(--hero-pad));
        padding-left: var(--hero-pad);
      }
    }

    /* ── Brand-variant title ────────────────────────────────────────── */
    /* No size override for the brand variant: it follows the same scale as
       the text variant so its emphasis line stays inside the column unbroken. */
    .hero-title--brand ark-brand-logo {
      font-size: inherit;
      line-height: inherit;
    }

    /* ── Subtitle ───────────────────────────────────────────────────── */
    .hero-subtitle-slot {
      animation: fadeSlideUp 900ms var(--ark-ease-out) forwards 650ms;
      margin-block: 40px 56px;
      max-width: 460px;
      opacity: 0;
    }

    .hero-subtitle,
    ::slotted([slot="subtitle"]) {
      color: var(--ark-color-text-muted);
      font-size: var(--ark-font-size-xl);
      font-weight: var(--ark-font-weight-light);
      line-height: var(--ark-line-height-relaxed);
      margin: 0;
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
      display: flex;
      flex-wrap: wrap;
      gap: var(--ark-space-2);
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

    /* ── Responsive: two-column ─────────────────────────────────────── */
    /* From here the measure is the left column, not the viewport, so the
       headline scales against the column's own growth curve and tops out at
       60px. The column stops growing at 1400px — content caps at 80rem and
       every extra pixel becomes gutter — which is where the cap lands. Kept
       well short of the column's actual capacity (~68% filled at 1280px): the
       point of this headline is that it is smaller than the one it replaced. */
    @media (min-width: 901px) {
      .hero-title,
      ::slotted([slot="title"]) {
        font-size: clamp(2.75rem, 3.6vw + 0.5rem, 3.75rem);
      }
    }

    /* ── Responsive: tablet / mobile ────────────────────────────────── */
    @media (max-width: 900px) {
      .hero {
        /* .hero-left carries the inline padding in this layout, so the band's
           bleed has to track that value rather than the site gutter. */
        --hero-pad: 24px;

        grid-template-columns: 1fr;
        min-height: auto;
        padding-inline: 0;
        padding-top: 86px;
      }

      .hero-left {
        padding: 72px 24px 56px;
      }

      /* max-width belongs to the wrapper (see .hero-subtitle-slot). Left
         unconstrained on purpose: a ch-based measure narrow enough to pull the
         subtitle off the gutter on a phone also strands it in the middle of a
         768px column, and it buys ~10% of width at the cost of an extra line.
         The headline scale above is what the crowding was actually coming
         from. */
      .hero-subtitle-slot {
        max-width: none;
      }

      .hero-subtitle,
      ::slotted([slot="subtitle"]) {
        font-size: 1.14rem;
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
    /* No headline override here: the base clamp already lands at 28-32px
       across this range, which is what keeps each line unbroken on a 360px
       screen. Re-introducing a fixed size would overflow the nowrap lines. */
    @media (max-width: 520px) {
      ark-button {
        width: 100%;
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
  /**
   * `?? []` guards the attribute path: Lit's Array converter yields `null`
   * when the attribute is not valid JSON, and `map()` cannot iterate that.
   */
  private _renderChips() {
    return map(
      this.chips ?? [],
      (label) => html`<ark-chip variant="primary">${label}</ark-chip>`,
    );
  }

  /** The emphasis is its own line so the fill spans the phrase, not the run. */
  private _renderEmphasis() {
    return when(
      this.titleEmphasis,
      () => html`<span class="title-line"><em>${this.titleEmphasis}</em></span>`,
    );
  }

  private _renderTitle() {
    return choose(
      this.titleVariant,
      [
        [
          HeroTitleVariant.Brand,
          () => html`
            <h1 class="hero-title hero-title--brand">
              <span class="title-line title-line--lead">
                <ark-brand-logo size="display"></ark-brand-logo>
              </span>
              ${this._renderEmphasis()}
            </h1>
          `,
        ],
      ],
      // default: "text"
      () => html`
        <h1 class="hero-title">
          <span class="title-line title-line--lead">${this.heading}</span>
          ${this._renderEmphasis()}
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
              ${this._renderChips()}
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
                  html`<ark-button href=${this.ghostHref} variant="link"
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
  defineArkBrandLogo();
  defineArkButton();
  defineArkChip();
  defineElement("ark-hero", ArkHero);
};

declare global {
  interface HTMLElementTagNameMap {
    "ark-hero": ArkHero;
  }
}
