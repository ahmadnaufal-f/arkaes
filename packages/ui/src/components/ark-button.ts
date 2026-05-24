import { css, html, LitElement } from "lit";

export class ArkButton extends LitElement {
  static override properties = {
    href: { type: String },
    size: { reflect: true, type: String },
    variant: { reflect: true, type: String },
  };

  static override styles = css`
    :host {
      display: inline-flex;
    }

    a,
    button {
      align-items: center;
      border: 0;
      cursor: none;
      display: inline-flex;
      font-family: var(--ark-font-mono);
      justify-content: center;
      min-height: 3rem;
      position: relative;
      text-decoration: none;
      transition:
        background var(--ark-duration-normal) var(--ark-ease-out),
        border-color var(--ark-duration-normal) var(--ark-ease-out),
        color var(--ark-duration-normal) var(--ark-ease-out);
    }

    a:focus-visible,
    button:focus-visible {
      outline: 2px solid var(--ark-color-focus);
      outline-offset: 4px;
    }

    .primary {
      background: var(--ark-color-text);
      color: var(--ark-color-background);
      font-size: var(--ark-font-size-sm);
      letter-spacing: var(--ark-letter-spacing-mono);
      overflow: hidden;
      padding: 1rem 2.25rem;
      text-transform: uppercase;
    }

    .primary::after {
      background: var(--ark-color-accent);
      bottom: 0;
      content: "";
      height: 2px;
      left: 0;
      position: absolute;
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 350ms var(--ark-ease-out);
      width: 100%;
    }

    .primary:hover {
      background: #2d2724;
    }

    .primary:hover::after {
      transform: scaleX(1);
    }

    .secondary {
      background: var(--ark-color-accent-soft);
      border: 1px solid var(--ark-color-border);
      color: var(--ark-color-accent-strong);
      font-size: var(--ark-font-size-sm);
      letter-spacing: var(--ark-letter-spacing-mono);
      padding: 0.75rem 1.35rem;
      text-transform: uppercase;
    }

    .secondary:hover {
      border-color: var(--ark-color-accent);
    }

    .ghost {
      background: transparent;
      border-bottom: 1px solid var(--ark-color-border);
      color: var(--ark-color-text-muted);
      font-family: var(--ark-font-serif);
      font-size: var(--ark-font-size-md);
      font-style: italic;
      min-height: auto;
      padding: 0 0 0.2rem;
    }

    .ghost:hover {
      border-color: var(--ark-color-accent);
      color: var(--ark-color-accent-strong);
    }

    :host([size="sm"]) a,
    :host([size="sm"]) button {
      min-height: 2.25rem;
      padding: 0.65rem 1rem;
    }

    :host([size="lg"]) a,
    :host([size="lg"]) button {
      min-height: 3.25rem;
      padding: 1rem 2.5rem;
    }

    @media (max-width: 520px) {
      .primary {
        width: 100%;
      }
    }
  `;

  href = "";
  size = "md";
  variant = "primary";

  override render() {
    const className = this.variant;

    if (this.href) {
      return html`<a class=${className} href=${this.href}><slot></slot></a>`;
    }

    return html`<button class=${className} type="button"><slot></slot></button>`;
  }
}
