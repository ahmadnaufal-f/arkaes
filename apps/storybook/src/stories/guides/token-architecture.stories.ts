import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { groupByTier, tokensOfType } from "../foundations/tokens-data";

/**
 * Written as a story rather than MDX so the per-tier counts come from the
 * generated artifact instead of being retyped. Adding a token under
 * `packages/tokens/tokens/` moves these numbers on the next build.
 *
 * Only the generated tokens can be counted this way. The hand-authored
 * categories never reach `tokens.json`, which is exactly why they are listed
 * separately below rather than folded into the same table.
 */
const GENERATED = [...tokensOfType("color"), ...tokensOfType("dimension")];
const TIERS = groupByTier(GENERATED);

const TIER_NOTES: Record<string, string> = {
  primitive: "Raw values. The colour ramps and the spacing scale. No intent attached.",
  semantic: "Names an intent on top of a primitive, such as surface, border or focus.",
  component: "Aliases kept for existing component and portfolio CSS.",
};

/** Categories that live in hand-authored CSS, per the header comment in tokens.css. */
const HAND_AUTHORED = [
  "Typography",
  "Radius",
  "Shadow",
  "Motion",
  "Containers",
  "Cursor",
  "Layout",
];

/**
 * A real chain, not an illustration. Each row is the literal text of the
 * source or generated file named beside it.
 */
const TRACE = [
  {
    where: "tokens/primitive/color.json",
    code: '"neutral-0": { "$type": "color", "$value": "#fafaf9" }',
  },
  {
    where: "tokens/semantic/color.json",
    code: '"surface": { "$type": "color", "$value": "{color.neutral-0}" }',
  },
  {
    where: "src/styles/tokens.generated.css",
    code: "--ark-color-surface: var(--ark-color-neutral-0);",
  },
  {
    where: "packages/ui/src/components/ark-card.ts",
    code: "background: var(--ark-color-surface);",
  },
];

const styles = html`
  <style>
    .ark-tokenarch {
      background: var(--ark-color-bg);
      color: var(--ark-color-text);
      font-family: var(--ark-font-sans);
      min-height: 100vh;
      padding: clamp(2rem, 5vw, 5rem);
    }
    .ark-tokenarch section + section {
      margin-top: var(--ark-space-12);
    }
    .ark-tokenarch h2 {
      font-family: var(--ark-font-mono);
      font-size: var(--ark-text-xs);
      font-weight: var(--ark-weight-medium);
      letter-spacing: var(--ark-tracking-label);
      margin: 0 0 var(--ark-space-5);
      text-transform: uppercase;
    }
    .ark-tokenarch h1 {
      font-family: var(--ark-font-display);
      font-size: var(--ark-text-3xl);
      font-weight: var(--ark-weight-thin);
      line-height: var(--ark-leading-tight);
      margin: 0;
    }
    .ark-tokenarch p {
      color: var(--ark-color-text-muted);
      line-height: var(--ark-leading-normal);
      margin: var(--ark-space-4) 0 0;
      max-width: var(--ark-measure-sm);
    }
    .ark-tokenarch code {
      font-family: var(--ark-font-mono);
      font-size: var(--ark-text-xs);
    }
    .ark-tokenarch-tier {
      align-items: baseline;
      border-bottom: 1px solid var(--ark-color-border);
      display: flex;
      flex-wrap: wrap;
      gap: var(--ark-space-4);
      padding: var(--ark-space-4) 0;
    }
    .ark-tokenarch-tier__name {
      font-family: var(--ark-font-mono);
      font-size: var(--ark-text-xs);
      letter-spacing: var(--ark-tracking-label);
      text-transform: uppercase;
      width: 7rem;
    }
    .ark-tokenarch-tier__count {
      color: var(--ark-color-text-subtle);
      font-family: var(--ark-font-mono);
      font-size: var(--ark-text-xs);
      width: 5rem;
    }
    .ark-tokenarch-tier__note {
      color: var(--ark-color-text-muted);
      flex: 1;
      font-size: var(--ark-text-sm);
      min-width: 16rem;
    }
    /* The chain reads top to bottom, each step indented past the last, so the
       direction of the reference is visible without drawing arrows. */
    .ark-tokenarch-step {
      border-left: 2px solid var(--ark-color-border);
      margin-left: var(--ark-space-4);
      padding: var(--ark-space-3) 0 var(--ark-space-3) var(--ark-space-5);
    }
    .ark-tokenarch-step__where {
      color: var(--ark-color-text-subtle);
      display: block;
      font-family: var(--ark-font-mono);
      font-size: var(--ark-text-xs);
      margin-bottom: var(--ark-space-2);
    }
    .ark-tokenarch-step__code {
      background: var(--ark-color-surface);
      border: 1px solid var(--ark-color-border);
      border-radius: var(--ark-radius-sm);
      display: inline-block;
      padding: var(--ark-space-2) var(--ark-space-3);
    }
    .ark-tokenarch-pills {
      display: flex;
      flex-wrap: wrap;
      gap: var(--ark-space-2);
      margin-top: var(--ark-space-4);
    }
    .ark-tokenarch-rule {
      background: var(--ark-color-surface);
      border: 1px solid var(--ark-color-border);
      border-radius: var(--ark-radius-md);
      margin-top: var(--ark-space-4);
      padding: var(--ark-space-5);
    }
    .ark-tokenarch-rule ul {
      color: var(--ark-color-text-muted);
      font-size: var(--ark-text-sm);
      line-height: var(--ark-leading-normal);
      margin: 0;
      padding-left: var(--ark-space-5);
    }
    .ark-tokenarch-rule li + li {
      margin-top: var(--ark-space-2);
    }
  </style>
`;

const render = () => html`
  ${styles}
  <main class="ark-tokenarch">
    <section>
      <ark-badge variant="eyebrow">Guide</ark-badge>
      <h1>Token architecture</h1>
      <p>
        Colour and spacing are generated from
        <a href="https://tr.designtokens.org/" target="_blank" rel="noreferrer">DTCG</a> JSON sources
        with Style Dictionary. Everything else in the token layer is still hand-authored CSS. This
        page describes both halves and the check that keeps components out of the raw values.
      </p>
    </section>

    <section>
      <h2>Generated tiers</h2>
      <p>
        The tier is the directory a token is authored in, under
        <code>packages/tokens/tokens/</code>. Counts here come from the generated artifact.
      </p>
      ${TIERS.map(
        (group) => html`
          <div class="ark-tokenarch-tier">
            <span class="ark-tokenarch-tier__name">${group.tier}</span>
            <span class="ark-tokenarch-tier__count">${group.rows.length} tokens</span>
            <span class="ark-tokenarch-tier__note">${TIER_NOTES[group.tier] ?? ""}</span>
          </div>
        `,
      )}
      <p>
        Most semantic tokens hold their own literal value rather than pointing at a primitive. No
        token currently passes through all three tiers in one chain.
      </p>
    </section>

    <section>
      <h2>One token, end to end</h2>
      ${TRACE.map(
        (step) => html`
          <div class="ark-tokenarch-step">
            <span class="ark-tokenarch-step__where">${step.where}</span>
            <code class="ark-tokenarch-step__code">${step.code}</code>
          </div>
        `,
      )}
      <p>
        Style Dictionary keeps the alias as a <code>var()</code> chain rather than flattening it, so
        overriding <code>--ark-color-neutral-0</code> moves every surface built on it.
      </p>
    </section>

    <section>
      <h2>Generated and hand-authored</h2>
      <p>
        Two categories are generated from the JSON sources. Edit those in
        <code>packages/tokens/tokens/</code>, never in the CSS.
      </p>
      <div class="ark-tokenarch-pills">
        <ark-chip variant="accent">Colour</ark-chip>
        <ark-chip variant="accent">Spacing</ark-chip>
      </div>
      <p>
        The rest are declared by hand in <code>packages/tokens/src/styles/tokens.css</code>. They do
        not appear in the generated JSON, so tooling that reads that file does not see them.
      </p>
      <div class="ark-tokenarch-pills">
        ${HAND_AUTHORED.map((name) => html`<ark-chip>${name}</ark-chip>`)}
      </div>
    </section>

    <section>
      <h2>The compliance check</h2>
      <p>
        CI runs <code>pnpm lint:tokens</code> before the build, so a violation fails the run before
        anything compiles. The script is <code>scripts/token-lint.mjs</code>.
      </p>
      <div class="ark-tokenarch-rule">
        <ul>
          <li>It scans <code>packages/ui/src</code>, every <code>.ts</code> file, comments stripped.</li>
          <li>It rejects any raw hex colour, in the form <code>#rgb</code> through <code>#rrggbbaa</code>.</li>
          <li>
            It rejects a raw <code>px</code> or <code>rem</code> value inside a spacing property when
            that value duplicates a <code>--ark-space-*</code> step. Padding, margin, gap and inset
            count as spacing properties.
          </li>
          <li>
            It leaves layout sizes and font sizes alone. Only values with a token equivalent are
            flagged.
          </li>
          <li>
            The spacing steps are read from the generated JSON, so adding a step to the scale teaches
            the linter about it.
          </li>
          <li>
            A genuine one-off takes <code>token-lint-disable-line</code> in a comment on the line,
            with a reason.
          </li>
          <li>
            Pre-existing violations sit in <code>scripts/token-lint-baseline.json</code>. The check is
            green on those and fails on anything new.
          </li>
        </ul>
      </div>
    </section>

    <section>
      <h2>Why semantic, not primitive</h2>
      <p>
        A primitive says what a colour is. A semantic token says what it is for. A component that
        reads <code>--ark-color-surface</code> keeps working when the ramp step behind it changes,
        and it rethemes correctly when a consumer redefines the semantic layer. A component that
        reads <code>--ark-color-neutral-0</code> pins itself to one step and skips that. Reach for a
        primitive only when no semantic token names what you mean.
      </p>
      <p>
        See <strong>Foundations, then Color</strong> for every token, its tier, and its resolved
        value.
      </p>
    </section>
  </main>
`;

const meta = {
  parameters: {
    docs: {
      description: {
        component:
          "How the token layer is built: which parts are generated from DTCG sources, which are still hand-authored CSS, and the CI check that keeps raw values out of component source. Tier counts are read from the generated artifact at build time.",
      },
    },
    layout: "fullscreen",
  },
  render,
  title: "Guides/Token architecture",
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const TokenArchitecture = {} satisfies Story;
