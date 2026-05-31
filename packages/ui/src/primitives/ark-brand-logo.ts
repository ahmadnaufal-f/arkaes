import { css, html, LitElement } from "lit";

/**
 * ArkBrandLogo renders the Arkaes wordmark: ARK + Æ (italic, blush-deep) + S.
 *
 * Extracted as a standalone primitive so it can be composed in both
 * ark-navigation-brand and ark-hero (title="brand") without duplication.
 *
 * Usage:
 *   <ark-brand-logo></ark-brand-logo>
 *   <ark-brand-logo size="display"></ark-brand-logo>
 */
export class ArkBrandLogo extends LitElement {
  static override properties = {
    size: { type: String, reflect: true },
  };

  /**
   * "nav"     — default, nav-bar size (~1.15rem), with hover letter-spacing
   * "display" — large hero display size, no hover behaviour (static)
   */
  size: "nav" | "display" | string = "nav";

  static override styles = css`
    :host {
      display: inline-flex;
    }

    /* ── NAV SIZE (default) ─────────────────────────────────────────── */
    :host(:not([size="display"])) .wordmark {
      color: var(--ark-color-text);
      font-family: var(--ark-font-display);
      font-size: 1.15rem;
      font-weight: var(--ark-weight-thin);
      letter-spacing: 0.14em;
      overflow: hidden;
      padding-bottom: 3px;
      position: relative;
      text-decoration: none;
      text-transform: uppercase;
      transition:
        color var(--ark-duration-fast) var(--ark-ease-standard),
        letter-spacing var(--ark-duration-normal) var(--ark-ease-standard);
    }

    /* Blush underline — scaleX from left on hover (matches btn-primary §6) */
    :host(:not([size="display"])) .wordmark::after {
      background: var(--ark-color-accent);
      bottom: 0;
      content: "";
      height: 1.5px;
      left: 0;
      position: absolute;
      transform: scaleX(0);
      transform-origin: left;
      transition: transform var(--ark-duration-normal) var(--ark-ease-standard);
      width: 100%;
    }

    :host(:not([size="display"])) .wordmark:hover {
      color: var(--ark-color-accent-strong);
      letter-spacing: 0.18em;
    }

    :host(:not([size="display"])) .wordmark:hover::after {
      transform: scaleX(1);
    }

    :host(:not([size="display"])) .wordmark:focus-visible {
      border-radius: var(--ark-radius-xs);
      outline: 2px solid var(--ark-color-focus);
      outline-offset: 4px;
    }

    /* ── DISPLAY SIZE ───────────────────────────────────────────────── */
    :host([size="display"]) .wordmark {
      color: var(--ark-color-text);
      font-family: var(--ark-font-display);
      font-size: inherit; /* inherits from hero-title context */
      font-weight: var(--ark-weight-thin);
      letter-spacing: 0;
      line-height: inherit;
      text-decoration: none;
      text-transform: uppercase;
    }

    /* ── SHARED: Æ glyph ────────────────────────────────────────────── */
    .ae {
      color: var(--ark-color-accent-strong);
      display: inline-block;
      font-style: italic;
      transition: transform var(--ark-duration-normal) var(--ark-ease-spring);
    }

    /* Nav hover: Æ tilts slightly */
    :host(:not([size="display"])) .wordmark:hover .ae {
      transform: rotate(-6deg) scale(1.08);
    }
  `;

  override render() {
    return html`
      <span class="wordmark" aria-label="Arkaes">
        ARK<em class="ae">Æ</em>S
      </span>
    `;
  }
}
