import { css, html, LitElement } from "lit";

export class ArkCard extends LitElement {
  static override properties = {
    interactive: { reflect: true, type: Boolean },
    variant: { reflect: true, type: String },
  };

  static override styles = css`
    :host {
      display: block;
    }

    .card {
      background: var(--ark-color-surface);
      border: 1px solid var(--ark-color-border);
      border-radius: var(--ark-radius-md);
      color: var(--ark-color-text);
      height: 100%;
      overflow: hidden;
      transition:
        border-color var(--ark-duration-normal) var(--ark-ease-out),
        transform var(--ark-duration-slow) var(--ark-ease-standard);
    }

    :host([interactive]:hover) .card {
      border-color: var(--ark-color-accent);
      transform: translateY(-2px);
    }

    :host([variant="project"]) .card {
      background: var(--ark-color-background);
      border: 0;
      border-radius: 0;
    }
  `;

  interactive = false;
  variant = "surface";

  override render() {
    return html`<div class="card"><slot></slot></div>`;
  }
}
