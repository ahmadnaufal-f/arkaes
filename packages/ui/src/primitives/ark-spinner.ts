import { css, html, LitElement, svg } from "lit";
import { choose } from "lit/directives/choose.js";
import { defineElement } from "../define-element";

export enum SpinnerVariant {
  Arc = "arc",
  Segment = "segment",
  Orbital = "orbital",
  Dash = "dash",
  Dots = "dots",
}

export class ArkSpinner extends LitElement {
  static override properties = {
    variant: { type: String, reflect: true },
    size: { type: String, reflect: true },
    thickness: { type: Number, reflect: true },
  };

  static override styles = css`
    :host {
      align-items: center;
      display: inline-flex;
      justify-content: center;
      --color: var(--spinner-color, var(--ark-color-accent));
    }

    /* ── Sizes ──────────────────────────────────────────────────── */
    :host,
    :host([size="md"]) {
      --size: 24px;
    }

    :host([size="sm"]) {
      --size: 16px;
    }

    :host([size="lg"]) {
      --size: 36px;
    }

    :host([size="xl"]) {
      --size: 48px;
    }

    /* ── Arc Spinner ─────────────────────────────────────────────── */
    @keyframes arc-spin {
      0%   { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .spinner-arc {
      animation: arc-spin 0.9s cubic-bezier(0.4, 0, 0.2, 1) infinite;
      border-color: transparent;
      border-radius: 50%;
      border-style: solid;
      border-width: var(--thickness, 2px);
      border-top-color: var(--color);
      border-right-color: color-mix(in srgb, var(--color) 33%, transparent);
      display: inline-block;
      flex-shrink: 0;
      height: var(--size);
      width: var(--size);
    }

    /* ── Segment Spinner ─────────────────────────────────────────── */
    @keyframes seg-rotate {
      to { transform: rotate(360deg); }
    }
    .spinner-segments {
      animation: seg-rotate 1.2s steps(8, end) infinite;
      flex-shrink: 0;
    }

    /* ── Orbital Spinner ─────────────────────────────────────────── */
    @keyframes orbit {
      to { transform: rotate(360deg); }
    }
    @keyframes counter-orbit {
      to { transform: rotate(-360deg); }
    }
    .spinner-orbital-outer {
      animation: orbit 1.4s linear infinite;
      flex-shrink: 0;
      transform-origin: center;
    }
    .spinner-orbital-inner {
      animation: counter-orbit 0.9s linear infinite;
    }

    /* ── Dash Spinner ─────────────────────────────────────────────── */
    @keyframes dash-rotate { to { transform: rotate(360deg); } }
    @keyframes dash-stroke {
      0%   { stroke-dashoffset: 150; animation-timing-function: ease-in; }
      50%  { stroke-dashoffset: 20;  animation-timing-function: ease-out; }
      100% { stroke-dashoffset: 150; transform: rotate(360deg); }
    }
    .spinner-dash-svg {
      animation: dash-rotate 1.5s linear infinite;
      flex-shrink: 0;
      transform-origin: center;
    }
    .spinner-dash-circle {
      animation: dash-stroke 1.5s linear infinite;
      stroke-dasharray: 160;
      transform-origin: center;
    }

    /* ── Dot Pulse ─────────────────────────────────────────────────── */
    @keyframes dot-pulse {
      0%, 80%, 100% { transform: scale(0.5); opacity: 0.3; }
      40%            { transform: scale(1);   opacity: 1; }
    }
    .dot-pulse-dot {
      animation: dot-pulse 1.2s ease-in-out infinite;
      border-radius: 50%;
    }
  `;

  variant: SpinnerVariant | string = SpinnerVariant.Arc;
  size = "md";
  thickness?: number;

  get _pixelSize(): number {
    return { sm: 16, md: 24, lg: 36, xl: 48 }[this.size as "sm" | "md" | "lg" | "xl"] ?? 24;
  }

  private _renderArc() {
    const style = this.thickness !== undefined ? `--thickness: ${this.thickness}px;` : "";
    return html`
      <span
        class="spinner-arc"
        style=${style}
        role="status"
        aria-label="Loading"
      ></span>
    `;
  }

  private _renderSegment() {
    const s = this._pixelSize;
    const r = s / 2;
    const segments = 8;
    const lines = [];
    const strokeWidth = this.size === "sm" ? 1.5 : this.size === "xl" ? 3 : 2;

    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * 2 * Math.PI;
      const inner = r * 0.42;
      const outer = r * 0.78;
      const x1 = r + inner * Math.cos(angle);
      const y1 = r + inner * Math.sin(angle);
      const x2 = r + outer * Math.cos(angle);
      const y2 = r + outer * Math.sin(angle);
      const opacity = 0.12 + (i / segments) * 0.88;
      lines.push(svg`
        <line
          x1=${x1}
          y1=${y1}
          x2=${x2}
          y2=${y2}
          stroke="var(--color)"
          stroke-width=${strokeWidth}
          stroke-linecap="round"
          opacity=${opacity}
        />
      `);
    }

    return html`
      <svg
        class="spinner-segments"
        width=${s}
        height=${s}
        viewBox="0 0 ${s} ${s}"
        style="width: ${s}px; height: ${s}px;"
        role="status"
        aria-label="Loading"
      >
        ${lines}
      </svg>
    `;
  }

  private _renderOrbital() {
    const s = this._pixelSize;
    const r = s / 2;
    const orbitR = r * 0.62;
    const dotR = this.size === "sm" ? 1.8 : this.size === "xl" ? 4 : 2.5;

    return html`
      <svg
        class="spinner-orbital-outer"
        width=${s}
        height=${s}
        viewBox="0 0 ${s} ${s}"
        style="width: ${s}px; height: ${s}px;"
        role="status"
        aria-label="Loading"
      >
        <!-- track -->
        <circle
          cx=${r}
          cy=${r}
          r=${orbitR}
          fill="none"
          stroke="color-mix(in srgb, var(--color) 9%, transparent)"
          stroke-width="1"
        />
        <!-- center dot -->
        <circle
          cx=${r}
          cy=${r}
          r=${dotR * 0.6}
          fill="var(--color)"
          opacity="0.5"
        />
        <!-- orbiting dot -->
        <circle
          cx=${r}
          cy=${r - orbitR}
          r=${dotR}
          fill="var(--color)"
        />
        <!-- inner counter-orbit -->
        <g
          class="spinner-orbital-inner"
          style="transform-origin: ${r}px ${r}px;"
        >
          <circle
            cx=${r}
            cy=${r - orbitR * 0.52}
            r=${dotR * 0.75}
            fill="var(--color)"
            opacity="0.65"
          />
        </g>
      </svg>
    `;
  }

  private _renderDash() {
    const s = this._pixelSize;
    const r = s / 2;
    const cr = r - 3;
    const strokeWidth = this.size === "sm" ? 1.5 : 2;

    return html`
      <svg
        class="spinner-dash-svg"
        width=${s}
        height=${s}
        viewBox="0 0 ${s} ${s}"
        style="width: ${s}px; height: ${s}px;"
        role="status"
        aria-label="Loading"
      >
        <circle
          cx=${r}
          cy=${r}
          r=${cr}
          fill="none"
          stroke="color-mix(in srgb, var(--color) 9%, transparent)"
          stroke-width=${strokeWidth}
        />
        <circle
          class="spinner-dash-circle"
          cx=${r}
          cy=${r}
          r=${cr}
          fill="none"
          stroke="var(--color)"
          stroke-width=${strokeWidth}
          stroke-linecap="round"
          style="transform-origin: ${r}px ${r}px;"
        />
      </svg>
    `;
  }

  private _renderDots() {
    const dotSize = { sm: 4, md: 6, lg: 9, xl: 12 }[this.size as "sm" | "md" | "lg" | "xl"] ?? 6;
    const gap = { sm: 4, md: 6, lg: 8, xl: 10 }[this.size as "sm" | "md" | "lg" | "xl"] ?? 6;

    return html`
      <span
        style="display: inline-flex; gap: ${gap}px; align-items: center;"
        role="status"
        aria-label="Loading"
      >
        <span
          class="dot-pulse-dot"
          style="width: ${dotSize}px; height: ${dotSize}px; background: var(--color); animation-delay: 0s;"
        ></span>
        <span
          class="dot-pulse-dot"
          style="width: ${dotSize}px; height: ${dotSize}px; background: var(--color); animation-delay: 0.16s;"
        ></span>
        <span
          class="dot-pulse-dot"
          style="width: ${dotSize}px; height: ${dotSize}px; background: var(--color); animation-delay: 0.32s;"
        ></span>
      </span>
    `;
  }

  override render() {
    return choose(
      this.variant,
      [
        [SpinnerVariant.Segment, () => this._renderSegment()],
        [SpinnerVariant.Orbital, () => this._renderOrbital()],
        [SpinnerVariant.Dash, () => this._renderDash()],
        [SpinnerVariant.Dots, () => this._renderDots()],
      ],
      () => this._renderArc(),
    );
  }
}

export const defineArkSpinner = () => {
  defineElement("ark-spinner", ArkSpinner);
};

declare global {
  interface HTMLElementTagNameMap {
    "ark-spinner": ArkSpinner;
  }
}
