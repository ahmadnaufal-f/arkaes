---
name: arkaes-brand-guideline
description: >
  The Arkaes personal brand system — use this skill whenever generating,
  reviewing, or modifying any frontend component, UI element, HTML file,
  CSS, or design token for the Arkaes portfolio or design system. Triggers
  include: "build a component for Arkaes", "create an Arkaes card/button/
  tag/section", "follow the Arkaes brand", "keep this on-brand", "comply
  with Arkaes guidelines", "design system component", or any task involving
  the arkaes.dev portfolio or Arkaes DS. Also use proactively when the user
  pastes existing Arkaes code and asks for changes — always ensure output
  complies with the full token system before responding.
---

# Arkaes Brand & Development Guideline

This skill defines the complete Arkaes design system — tokens, rules, coding guidelines, and implementation patterns — so any AI generating components or reviewing code produces output that is visually, structurally, and tonally consistent with the brand.

**Always read this file fully before generating or modifying any Arkaes component.**

---

## 1 · Brand Personality & Voice

> *"Architecture meets aesthetics."* — A refined creative individual.
> Not a studio. Not a freelancer. A senior frontend engineer with taste.

### Brand Personality
Calm authority. Never loud. Never generic. Confident without being boastful. The work leads — the words follow.

### Five Tone Attributes
1. **Precise** — exact language, no filler, every word earns its place.
2. **Warm** — approachable craft, not cold expertise.
3. **Considered** — explains why, not just what.
4. **Understated** — work speaks first, self-description is minimal.
5. **Curious** — genuine interest in problems, always learning.

### Voice & Copy Tone Rules
- **No exclamation marks** in brand copy — ever.
- **No superlatives**: avoid "best", "amazing", "world-class", "innovative".
- **No clichés**: avoid "passionate about", "driven by", "love for creating".
- **Numbers over words**: prefer "40+ components" over "over forty components".
- **Em dashes (—)** preferred over colons for appositive clauses.
- **Sentence case** for prose descriptions.
- **ALL CAPS** only for DM Mono label elements (never in prose).

### Copy Do / Don't Examples

#### Project Descriptions
- **Do**: *"A design system built for a multinational engineering team — 40+ components, zero visual inconsistencies, shipped in 6 weeks."*
- **Don't**: *"I am a passionate and driven developer with a love for creating amazing user experiences that delight users and stakeholders."*

#### About Copy
- **Do**: *"Frontend engineer. Obsessed with the intersection of systems and craft."*
- **Don't**: *"I'm a creative individual who loves bringing ideas to life through the power of technology and innovative design thinking!"*

#### Call to Action (CTA)
- **Do**: `"Let's build something remarkable."`
- **Don't**: `"Let's connect!"` / `"Hire me!"` / `"Get in touch today!"`

#### Status / Availability
- **Do**: `"Open to senior frontend roles — particularly design-system, architecture, or AI-adjacent work."`
- **Don't**: `"Available for freelance!"` / `"Looking for exciting opportunities!"`

---

## 2 · Design Tokens

Copy these into every component's `:root` or import from the token file ([tokens.css](file:///home/kiara-pc/project/arkaes/arkaes/packages/tokens/src/styles/tokens.css)).

### CSS Design Tokens
```css
:root {
  /* --- Base --- */
  --warm-white:   #faf7f5;   /* Page background — never use #ffffff */
  --parchment:    #f0eae4;   /* Section alternating background */
  --parchment-d:  #e0d6ce;   /* Borders, rules, dividers */

  /* --- Ink --- */
  --ink:          #1c1917;   /* Primary text, dark panels — never use #000000 */
  --ink-muted:    #4a4240;   /* Body copy, secondary text */
  --ink-ghost:    #9e9490;   /* Metadata, placeholder text */

  /* --- Blush (Dominant Accent) --- */
  --blush:        #d4a898;
  --blush-light:  #e8c8bc;   /* Hover backgrounds, tints */
  --blush-deep:   #b8887a;   /* Active states, eyebrows, emphasis */
  --blush-tint:   #f7efec;   /* Subtle section tints */

  /* --- Sage (Rare Accent - max 5 uses per page) --- */
  --sage:         #7d9180;
  --sage-light:   #a8bfaa;
  --sage-tint:    #edf2ee;   /* Sage background tint */

  /* --- Typography --- */
  --font-display: 'Fraunces', serif;          /* Headlines, wordmark only */
  --font-body:    'Plus Jakarta Sans', sans-serif; /* Body text */
  --font-mono:    'DM Mono', monospace;        /* Labels, nav, tags, code */

  /* --- Shape --- */
  --radius-none: 0px;     /* Structural surfaces, full-bleed sections */
  --radius-xs:   2px;     /* DEFAULT for all components */
  --radius-sm:   4px;     /* Small elements: tooltips, dropdowns only */
  --radius-pill: 999px;   /* Tags and badges ONLY */

  /* --- Shadow --- */
  --shadow-none:  none;                              /* Default — everything at rest */
  --shadow-xs:    0 1px 3px rgba(28,25,23,.06);     /* Hover lift only — never static */
  --shadow-focus: 0 0 0 3px rgba(212,168,152,.25);  /* Keyboard focus ring */

  /* --- Motion --- */
  --ease-out:    cubic-bezier(.25,.46,.45,.94);
  --ease-spring: cubic-bezier(.34,1.56,.64,1);
  --duration-fast:   250ms;
  --duration-normal: 350ms;
  --duration-slow:   600ms;
  --duration-reveal: 850ms;

  /* --- Readability & Container Measures (v1.1+) --- */
  --ark-leading-none:    1;
  --ark-leading-tight:   1.08;
  --ark-leading-snug:    1.22;
  --ark-leading-normal:  1.75; /* Tapered for Plus Jakarta Sans' default metrics */
  --ark-leading-relaxed: 1.9;
  --ark-measure-xs: 42ch;
  --ark-measure-sm: 56ch;
  --ark-measure-md: 68ch; /* Use for case study & long-form container limit */
  --ark-measure-lg: 78ch;
}
```

### Google Fonts Import
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600&family=DM+Mono:wght@300;400&family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&display=swap" rel="stylesheet">
```

---

## 3 · Typography & Type Scale

### Font Characteristics & Constraints

1. **Fraunces (Display Only)**
   - **Variable Font**: Optical size 9–144, weight 100–900.
   - **Arkaes Weight**: Weight 200 (thin) exclusively. Weight 300 for slightly larger sub-elements.
   - **Usage**: Hero titles, section titles (H2), project names (H3), wordmarks, and display pull quotes.
   - **Italic**: Reserved for `em` emphasis (e.g., italicized words inside a display title) and the Æ character in the wordmark.
   - **Letter Spacing**: `-.02em` on large display, `-.01em` on section titles.
   - **Never Use For**: Body paragraphs, labels, descriptions, or any copy smaller than ~20px. Never bold Fraunces.

2. **Plus Jakarta Sans (Body & UI Prose)**
   - **Variable Font**: Weight 300–800.
   - **Arkaes Weight**: Weight 300 for body/descriptions, weight 400 for slightly heavier contexts, weight 500 for emphasis.
   - **Usage**: About sections, project descriptions, hero subtitle, contact body copy, taglines, positioning statements, and list labels.
   - **Italic**: Subtitles, ghost CTAs, and stylistic emphasis.
   - **Line Height**: `--ark-leading-normal` (1.75) up to `--ark-leading-relaxed` (1.9) for paragraphs. 1.4–1.6 for larger display body.
   - **Max Width**: Limit containers to `--ark-measure-md` (68ch) or max `640px` for optimal line length readability.
   - **Never Use For**: Labels, nav links, tags, metadata, or anything that should be DM Mono.

3. **DM Mono (Labels & UI)**
   - **Weight**: 400 (regular) or 300 (light) for very small labels.
   - **Style Constraint**: **Always** uppercase, **always** letter-spaced.
   - **Letter Spacing**: `.15em` to `.28em` (wider spacing for smaller font sizes).
   - **Usage**: Eyebrows, nav links, version numbers, section numbers, tag text, date metadata, skills tags, button labels, "confidential" badges.
   - **Never Use For**: Sentence-case text or prose. Never render without letter-spacing.

### Type Scale Hierarchy

| Role | Font Family | Weight | Size | Letter Spacing & Line Height |
|---|---|---|---|---|
| Hero Display | Fraunces | 200 | 48–80px | `letter-spacing: -.02em` |
| Section Title (H2) | Fraunces | 200 | 32–40px | `letter-spacing: -.01em` |
| Project Name (H3) | Fraunces | 300 | 20–28px | snuggest line height |
| Card Title (H4) | Fraunces | 300 | 20px | default |
| Body Large / Lead | Plus Jakarta Sans | 300 | 18px | `line-height: 1.4–1.6` |
| Body Regular | Plus Jakarta Sans | 300 | 16px | `line-height: 1.75` |
| Label Large | DM Mono | 400 | 12px | `letter-spacing: .15em`, UPPERCASE |
| Label Regular / Eyebrows | DM Mono | 400 | 11px | `letter-spacing: .28em`, UPPERCASE |
| Label Small / Tags / Meta | DM Mono | 400 | 10px | `letter-spacing: .24em`, UPPERCASE |

### Responsive Font Sizes (clamp)
For hero and section titles, use fluid type via `clamp()` to scale gracefully:
```css
.hero-name { font-size: clamp(3rem, 6vw, 5.6rem); }
.section-title { font-size: clamp(2.4rem, 4vw, 3.6rem); }
.cover-logotype { font-size: clamp(4rem, 8vw, 7rem); }
```

### Hierarchy Enforcement
- Never mix roles. If a label needs to be larger, increase the font-size of DM Mono, do not change the font to Fraunces.
- If a heading needs to be smaller, scale Fraunces down, do not switch it to Plus Jakarta Sans.
- Pull quotes must use Fraunces italic at display sizes — Plus Jakarta Sans lacks the display personality required for quotes.
- Never use more than these 3 typefaces in one component layout.

---

## 4 · Color Usage Rules

### Full Color Token Rationale

| Token | Hex | Role & Application |
|---|---|---|
| `--warm-white` | `#faf7f5` | Main page background only. **Never use `#ffffff`.** |
| `--parchment` | `#f0eae4` | Alternating section background / subtle containers. |
| `--parchment-d` | `#e0d6ce` | Borders, divider lines, rules at rest. |
| `--ink` | `#1c1917` | Primary text, titles, buttons, dark panels. **Never use pure `#000000`.** |
| `--ink-muted` | `#4a4240` | Body copy, secondary text, main paragraphs. |
| `--ink-ghost` | `#9e9490` | Metadata, tags, placeholders, subtle UI captions. |
| `--blush` | `#d4a898` | Dominant brand accent. Used for hovers, decorations. |
| `--blush-light` | `#e8c8bc` | Light tints, hover backgrounds, active indicators. |
| `--blush-deep` | `#b8887a` | Eyebrow labels, emphasis text, active UI, high-contrast accent. |
| `--blush-tint` | `#f7efec` | Extremely subtle section background tints. |
| `--sage` | `#7d9180` | Rare brand accent. **Strict limit of 5 placements per page.** |
| `--sage-light` | `#a8bfaa` | Sage accent hover states, light tints. |
| `--sage-tint` | `#edf2ee` | Ultra-subtle sage background container tint. |

### Blush — Where to Use It
Use freely for:
- Eyebrow lines and the rule prepended to them.
- Italicized title emphasis (`em` inside Fraunces headlines).
- Hover border accents on cards, tags, and list items.
- Button underline hover animations (`scaleX` effect).
- Scroll line indicators and scrollbars.
- Marquee divider dots.
- Statistics / numbers.
- Nav active states.
- Table of contents (TOC) arrows on hover.
- Focus rings (`--shadow-focus` is blush-tinted).
- Image/portrait bottom rule (3px blush strip).

### Sage — Where to Use It (Maximum 5 Placements per Page/Component Set)
Sage must be budgeted carefully. Count every placement on the page:
1. Portrait/image bottom rule (3px sage strip).
2. Service row / list item left border on hover.
3. Hero composition accent block (the green-tinted rectangle overlay).
4. Social links in dark/contact sections.
5. Typography scale accent line or structural pillar rule.

*If you hit the 5 placements limit or are in doubt, always default to Blush.*

### Prohibited Color Practices
- **No `#ffffff` (pure white)**: Always use `--warm-white` (`#faf7f5`) for light backgrounds.
- **No `#000000` (pure black)**: Always use `--ink` (`#1c1917`) for text, headings, or dark panels.
- **No drop shadows on text**: Never apply drop-shadow filters or text-shadows to typography.
- **No colored shadows**: Shadows must remain neutral/dark, except the focus ring (`--shadow-focus`).
- **No visual imbalance**: Do not allow blush and sage to have equal weight. Blush must be dominant, Sage rare.
- **No gradients on UI surfaces**: Keep interfaces solid and flat; only ambient radial light sources in dark panels are permitted.

---

## 5 · Shape & Shadow Rules

### Border Radius Rules (Radius Follows Size)
- **Structural Surfaces / Full-Bleed Sections**: `--radius-none` (0px).
- **Default Component Resting Surfaces**: `--radius-xs` (2px). Applies to cards, buttons, input fields, containers, and images.
- **Small UI Overlays**: `--radius-sm` (4px). Applies to tooltips, toast notifications, and dropdown menus only.
- **Tags & Badges Exclusively**: `--radius-pill` (999px). Never use a pill radius on buttons or cards.
- **Constraint**: Never exceed `--radius-sm` (4px) on any surface larger than a chip.

### Functional Shadows Only
- **At Rest**: `--shadow-none` (no shadow).
- **Interactive States**: `--shadow-xs` on `:hover` only. Never apply a static shadow to an element at rest.
- **Keyboard Access**: `--shadow-focus` on `:focus-visible` only.
- **Constraints**:
  - Never use shadows as decorative elements.
  - Never use shadows inside dark-themed sections or panels.
  - If something needs to stand out, use borders, background tints, or whitespace instead of shadows.

---

## 6 · Component Patterns

### Button — Primary
- Solid `--ink` background, `--warm-white` mono text.
- Underline blush animates (`scaleX`) from left on hover.
- Custom cursor is suppressed on hover (`cursor: none` because site uses custom cursor).
```css
.btn-primary {
  background: var(--ink);
  color: var(--warm-white);
  font-family: var(--font-mono);
  font-size: .66rem;
  letter-spacing: .18em;
  text-transform: uppercase;
  padding: 15px 32px;
  border-radius: var(--radius-xs);
  border: none;
  position: relative;
  overflow: hidden;
  cursor: none; /* site-wide custom cursor */
  transition: background var(--duration-normal) var(--ease-out);
}
/* Blush underline scale-in from left */
.btn-primary::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0;
  width: 100%; height: 2px;
  background: var(--blush);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--duration-normal) var(--ease-out);
}
.btn-primary:hover { background: #2d2724; }
.btn-primary:hover::after { transform: scaleX(1); }
.btn-primary:focus-visible { box-shadow: var(--shadow-focus); outline: none; }
```

### Button — Ghost
- Subtle body-font italic underline button.
```css
.btn-ghost {
  font-family: var(--font-body);
  font-size: 1rem;
  font-style: italic;
  font-weight: 300;
  color: var(--ink-muted);
  background: none;
  border: none;
  border-bottom: 1px solid var(--parchment-d);
  padding-bottom: 3px;
  cursor: none;
  transition: color var(--duration-fast) var(--ease-out),
              border-color var(--duration-fast) var(--ease-out);
}
.btn-ghost:hover { color: var(--blush-deep); border-color: var(--blush); }
.btn-ghost:focus-visible { box-shadow: var(--shadow-focus); outline: none; }
```

### Tag / Badge
- Mono uppercase pill with solid/dashed borders.
```css
.tag {
  font-family: var(--font-mono);
  font-size: .56rem;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--ink-ghost);
  padding: 3px 10px;
  border: 1px solid var(--parchment-d);
  border-radius: var(--radius-pill); /* tags/badges only */
  transition: border-color var(--duration-fast), color var(--duration-fast);
}
.tag:hover, .card:hover .tag {
  border-color: var(--blush-light);
  color: var(--blush-deep);
}
/* Special variant (e.g. confidential work) */
.tag--dashed {
  border-style: dashed;
  color: var(--parchment-d);
}
```

### Eyebrow Label
- Uppercase DM Mono, blush colored, preceded by a horizontal rule.
```css
.eyebrow {
  font-family: var(--font-mono);
  font-size: .64rem;
  letter-spacing: .28em;
  text-transform: uppercase;
  color: var(--blush-deep);
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
}
.eyebrow::before {
  content: '';
  display: block;
  width: 22px; height: 1px;
  background: var(--blush);
  flex-shrink: 0;
}
```

### Card
- Background warm-white with transition effect (translate Y and shadow-xs on hover).
- Thumbnail zooms slightly (scale 1.04) and arrow translates on hover.
```css
.card {
  background: var(--warm-white);
  border-radius: var(--radius-xs);
  overflow: hidden;
  cursor: none;
  transition: box-shadow var(--duration-normal) var(--ease-out),
              transform var(--duration-normal) var(--ease-out);
}
.card:hover {
  box-shadow: var(--shadow-xs); /* hover only */
  transform: translateY(-2px);
}
.card-thumb { overflow: hidden; }
.card-thumb-inner {
  transition: transform var(--duration-slow) var(--ease-out);
}
.card:hover .card-thumb-inner { transform: scale(1.04); }
.card-info {
  padding: 20px 22px;
  border-top: 1px solid var(--parchment-d);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}
.card-name {
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 300;
  color: var(--ink);
  margin-bottom: 8px;
  transition: color var(--duration-fast);
}
.card:hover .card-name { color: var(--blush-deep); }
.card-arrow {
  color: var(--parchment-d);
  transition: color var(--duration-fast), transform var(--duration-fast);
}
.card:hover .card-arrow {
  color: var(--blush-deep);
  transform: translate(3px, -3px);
}
```

### Section Divider (Sage rule — counts toward the 5 limit)
```css
.sage-rule {
  height: 3px;
  background: var(--sage);
  opacity: 0.7;
  border: none;
}
```

### Scroll Reveal Pattern
- Fade and slide elements in on scroll using `IntersectionObserver`.
```css
.reveal {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity var(--duration-reveal) var(--ease-out),
              transform var(--duration-reveal) var(--ease-out);
}
.reveal.vis { opacity: 1; transform: translateY(0); }
.reveal.d1 { transition-delay: .08s; }
.reveal.d2 { transition-delay: .18s; }
.reveal.d3 { transition-delay: .30s; }
.reveal.d4 { transition-delay: .44s; }
.reveal.d5 { transition-delay: .58s; }
```
*Setup IntersectionObserver with threshold `0.08` to toggle the `.vis` class.*

---

## 7 · Dark Panel Pattern

Used in contact sections, footers, and ink-background content blocks:
```css
.dark-panel {
  background: var(--ink);
  color: var(--warm-white);
  position: relative;
  overflow: hidden;
}
/* Blush ambient glow — optional, max one per dark panel */
.dark-panel::before {
  content: '';
  position: absolute;
  top: -80px; left: -80px;
  width: 500px; height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(212,168,152,.07) 0%, transparent 70%);
  pointer-events: none;
}
/* Sage ambient glow — optional, counts toward Sage placement limit */
.dark-panel::after {
  content: '';
  position: absolute;
  bottom: -60px; right: -60px;
  width: 350px; height: 350px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(125,145,128,.05) 0%, transparent 70%);
  pointer-events: none;
}
```

### Text Color Overrides Inside Dark Panels

| Element Type | Color Value & Rationale |
|---|---|
| Headlines | `rgba(250,247,245,.92)` |
| Body Text | `rgba(250,247,245,.55)` |
| Accent Links | `var(--blush-light)` |
| Sage Links (at rest) | `rgba(125,145,128,.6)` |
| Sage Links (hover) | `var(--sage-light)` |
| Borders & Rules | `rgba(255,255,255,.05)` to `rgba(255,255,255,.08)` |

---

## 8 · Grain Texture & Custom Cursor

### Grain Overlay (Non-negotiable Site-wide Overlay)
Apply to `body::before` via a fixed SVG noise filter to add a subtle tactile feel. Never remove or lower below 2.0% opacity.
```css
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  opacity: 0.022; /* 2.0% - 2.5% max */
  pointer-events: none;
  z-index: 9000;
}
```

### Custom Cursor (Required Pattern)
Do not use default browser pointers. Provide custom cursor elements: an inner dot `#cur` and an outer tracking ring `#curR`.

```html
<div id="cur"></div>
<div id="curR"></div>
```

```css
body { cursor: none; }
#cur  { position:fixed; width:8px; height:8px; background:var(--blush); border-radius:50%; pointer-events:none; z-index:9999; transform:translate(-50%,-50%); transition:width .3s,height .3s,background .3s; }
#curR { position:fixed; width:34px; height:34px; border:1px solid var(--blush-light); border-radius:50%; pointer-events:none; z-index:9998; transform:translate(-50%,-50%); transition:width .4s,height .4s,border-color .4s; }

/* Interactive Hover States */
body.hov #cur  { width:14px; height:14px; background:var(--sage); }
body.hov #curR { width:54px; height:54px; border-color:var(--sage-light); }
```

```js
const cur = document.getElementById('cur');
const curR = document.getElementById('curR');
let mx=0, my=0, rx=0, ry=0;

document.addEventListener('mousemove', e => {
  mx=e.clientX; my=e.clientY;
  cur.style.left=mx+'px'; cur.style.top=my+'px';
});

(function loop(){ 
  rx+=(mx-rx)*.12; 
  ry+=(my-ry)*.12; 
  curR.style.left=rx+'px'; 
  curR.style.top=ry+'px'; 
  requestAnimationFrame(loop); 
})();

document.querySelectorAll('a,button,.card,[role="button"]').forEach(el=>{
  el.addEventListener('mouseenter',()=>document.body.classList.add('hov'));
  el.addEventListener('mouseleave',()=>document.body.classList.remove('hov'));
});
```

---

## 9 · Coding Guidelines (Lit & TypeScript)

These rules dictate component code structure within the Arkaes workspace.

### Lit Directives
Always prioritize using Lit directives (`choose`, `when`, `map`) instead of native JavaScript conditional or mapping structures inside templates. This keeps the rendering logic clean, optimal, and reactive:

```ts
import { choose } from "lit/directives/choose.js";
import { when } from "lit/directives/when.js";
import { map } from "lit/directives/map.js";

// Example pattern:
render() {
  return html`
    <div class="container">
      ${when(this.hasHeading, () => html`<h2>${this.heading}</h2>`)}
      
      ${choose(this.variant, [
        [SpinnerVariant.Segment, () => this._renderSegment()],
        [SpinnerVariant.Arc, () => this._renderArc()]
      ], () => this._renderArc())}
      
      <div class="tags-list">
        ${map(this.tags, (tag) => html`<span class="tag">${tag}</span>`)}
      </div>
    </div>
  `;
}
```

### Component Variant Enums
- Define enums for component `variant` properties inside the component's implementation file.
- Type properties strictly using union types like `FooVariant | string` to allow flexibility while maintaining type safety.
- Re-export all variant enums in the entrypoint file [index.ts](file:///home/kiara-pc/project/arkaes/arkaes/packages/ui/src/primitives/index.ts) (or [index.ts](file:///home/kiara-pc/project/arkaes/arkaes/packages/ui/src/components/index.ts)) so they are accessible to consuming applications.

```ts
// [ark-spinner.ts](file:///home/kiara-pc/project/arkaes/arkaes/packages/ui/src/primitives/ark-spinner.ts)
export enum SpinnerVariant { 
  Arc = "arc", 
  Segment = "segment" 
}

@customElement('ark-spinner')
export class ArkSpinner extends LitElement {
  @property({ type: String })
  variant: SpinnerVariant | string = SpinnerVariant.Arc;
  
  // ...
}
```

---

## 10 · Hard Rules — Never Violate

1. **Never use `#ffffff`** — always `--warm-white` (`#faf7f5`).
2. **Never use pure black (`#000000`)** — always `--ink` (`#1c1917`).
3. **Never bold Fraunces** — weight 200–300 only.
4. **Never use Fraunces for body text** — use Plus Jakarta Sans.
5. **Never use more than 3 typefaces** in any component or layout.
6. **Sage maximum of 5 placements** per page/component set.
7. **Never exceed `--radius-sm` (4px)** on surfaces larger than a chip.
8. **Never use `--radius-pill`** on anything except tags and badges.
9. **Never drop shadow on type** — ever.
10. **Never animate more than 2 elements simultaneously** to maintain high-end restraint.
11. **Never use exclamation marks** in copy or labels.
12. **The grain overlay is non-negotiable** — always include it.
13. **The custom cursor is non-negotiable** — always include it.
14. **Always prioritize using Lit directives** (`choose`, `when`, `map`, etc.) in Lit element templates.
15. **Always render the wordmark as**: `<span class="wordmark">ARK<em class="ae">Æ</em>S</span>`.

---

## 11 · Wordmark Pattern

Always render the wordmark as HTML with the italicized Æ glyph. Do not write "ARKAES", "ArkAes", or "Arkaes" as plain text in the interface, and never substitute "AE" for "Æ".

```html
<!-- Always render as: ARK + Æ (blush-deep, italic) + S -->
<span class="wordmark">ARK<em class="ae">Æ</em>S</span>
```

```css
.wordmark {
  font-family: var(--font-display);
  font-weight: 200;
  letter-spacing: .08em;
}
.wordmark .ae {
  color: var(--blush-deep); /* use blush-light on dark background panels */
  font-style: italic;
  font-family: var(--font-display);
}
```

---

## 12 · Digital Touchpoints & Consistency

Every public profile and platform must reflect the same quiet, considered creative persona. Platform-native conventions are respected, but the Arkaes voice, tone, and visual restraint are non-negotiable.

### 1. Primary Portfolio (arkaes.dev)
- **Visual Theme**: "Full Warm Luxe" — blush + sage palette, all token values applied.
- **Fonts**: Fraunces (display), Plus Jakarta Sans (body), DM Mono (labels).
- **Light Mode Only**: The portfolio has no dark mode toggle.
- **Grain overlay**: 2.2% fixed opacity, always present.
- **Motion Patterns**:
  - Staggered scroll reveals using IntersectionObserver (threshold `0.08`).
  - Spring physics on interactive elements.
  - Mouse parallax on hero components (within a strict `±8–16px` range).
  - Hovers: Card scale to `1.04`, translate Y `-2px`, trigger `--shadow-xs`.
  - Custom cursor: Blush dot (`8px`) scaling to a sage ring on hover (`54px`).
- **Hero Grid Structure**:
  1. Status badge (Sage pulse dot + "Open to senior frontend roles")
  2. Full name (H1 headline, Fraunces 200)
  3. Role title (DM Mono uppercase, blush-deep)
  4. Current company/history line (Plus Jakarta Sans italic, ink-ghost)
  5. Blush horizontal divider rule (40px × 1px)
  6. Concise bio paragraph
  7. CTAs (Primary block button + Ghost italic button)
  8. Arkaes byline at bottom-left (DM Mono, parchment-d)
- **Work Section Layout**:
  - Enterprise/Agency projects: Labeled with a "confidential" dashed badge, taking up full-width rows.
  - Experiments / personal projects: Litled "Modern Experiments" in a 3-column grid of cards.
- **About Copy Integration**:
  - *"This site is built on Arkaes — my personal design system and visual language for frontend projects."*
  - Portrait placeholder uses the `AN` monogram in Fraunces italic.
  - Sage 3px bottom accent rule under the portrait image (counts toward the 5-use limit).

### 2. GitHub
- **Bio**: `Frontend Engineer. Craft meets architecture. arkaes.dev`
- **README Wordmark**: Use the mono text variant: `ARKÆS`.
- **Commits**: Always use lowercase imperative sentences (e.g. `add button primitive`, not `Added button primitive!`), no emojis.
- **Pinned Repos**: Show the design system source, portfolio repository, and AI-adjacent experiments.

### 3. LinkedIn
- **Headline**: `Frontend Engineer — UI Architecture, Motion Design & AI Integration`
- **Banner**: Warm White (`#faf7f5`) base background, Arkaes wordmark, thin blush accent line.
- **Copy Constraints**: Zero exclamation marks. Featured section links to `arkaes.dev` as the primary action.

### 4. Dribbble
- **Mockups**: Parchment (`#f0eae4`) or blush-tint (`#f7efec`) backgrounds on all mockups.
- **Captions**: Strictly factual explanations of design choices and outcomes. No enthusiasm inflation.

---

## 13 · Reference Files

For local references and guides:
- [colors.md](file:///home/kiara-pc/project/arkaes/arkaes/.claude/skills/references/colors.md) — Full color palette rationale and usage examples
- [typography.md](file:///home/kiara-pc/project/arkaes/arkaes/.claude/skills/references/typography.md) — Complete type scale, specimen, readability tokens
- [voice.md](file:///home/kiara-pc/project/arkaes/arkaes/.claude/skills/references/voice.md) — Writing examples, do/don't comparisons
- [touchpoints.md](file:///home/kiara-pc/project/arkaes/arkaes/.claude/skills/references/touchpoints.md) — GitHub, LinkedIn, Dribbble, arkaes.dev rules
