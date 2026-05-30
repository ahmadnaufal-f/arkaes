# Arkaes · Typography Reference

## The Three Fonts

### 1. Fraunces — Display Only
- **Variable font** — optical size 9–144, weight 100–900
- **Arkaes uses:** weight 200 (thin) exclusively. 300 for slightly larger sub-elements.
- **Use for:** Hero title, section titles (H2), project names (H3), wordmark, pull quotes
- **Never use for:** Body paragraphs, labels, descriptions, anything smaller than ~20px
- **Italic:** Reserved for `em` emphasis and the Æ in the wordmark
- Letter-spacing: `-.02em` on large display, `-.01em` on section titles

### 2. Plus Jakarta Sans — Body & UI Prose
- **Variable font** — weight 300–800
- **Arkaes uses:** weight 300 for body, 400 for slightly heavier contexts, 500 for emphasis
- **Italic:** For subtitles, ghost CTAs, and stylistic emphasis where needed
- **Use for:** About section, project descriptions, hero subtitle, contact body,
  taglines, pillar body copy, positioning descriptions, stat labels
- **Line height:** 1.75–1.9 for paragraphs. 1.4–1.6 for larger display body.
- **Max width:** 640px (readable line length)
- **Note:** As a geometric sans-serif, Plus Jakarta Sans reads more modern and
  clean than the previous serif body. Lean into this — it reinforces the
  engineering-first positioning without losing warmth at weight 300.
- **Never use for:** Labels, nav links, tags, metadata, anything that should be DM Mono

### 3. DM Mono — Labels & UI
- **Weight:** 400 (regular) or 300 (light) for very small labels
- **Always:** UPPERCASE with letter-spacing
- **Letter-spacing:** 0.15em–0.28em depending on size
- **Use for:** Eyebrows, nav links, version numbers, section numbers, tag text,
  date metadata, skill labels, button text, "confidential" badges
- **Never:** Sentence case. Never without letter-spacing.

## Type Scale

```
80px  / Fraunces 200          → Hero display (clamp to viewport)
52px  / Fraunces 200          → H1 / section hero
36px  / Fraunces 200          → H2 / section title
24px  / Fraunces 300          → H3 / project name
20px  / Fraunces 300          → H4 / card title
18px  / Plus Jakarta Sans 300 → Body large / section lead
16px  / Plus Jakarta Sans 300 → Body regular
12px  / DM Mono 400           → Label large
11px  / DM Mono 400           → Label regular (eyebrows, nav)
10px  / DM Mono 400           → Label small (tags, metadata)
```

## Responsive Display

For hero and section titles, use `clamp()`:
```css
font-size: clamp(2.4rem, 4vw, 3.6rem); /* section title */
font-size: clamp(3rem, 6vw, 5.6rem);   /* hero name */
font-size: clamp(4rem, 8vw, 7rem);     /* cover logotype */
```

## Google Fonts Import

```
https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600&family=DM+Mono:wght@300;400&family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&display=swap
```

## CSS Token

```css
--font-display: 'Fraunces', serif;
--font-body:    'Plus Jakarta Sans', sans-serif;
--font-mono:    'DM Mono', monospace;
```

## Hierarchy Enforcement

Never mix roles. If a label needs to be larger — make it larger in DM Mono,
not switch it to Fraunces. If a heading needs to be smaller — scale Fraunces
down, not switch to Plus Jakarta Sans.

Pull quotes use Fraunces italic at display sizes — not Plus Jakarta Sans.
Plus Jakarta Sans does not carry enough display personality for pull quotes.

## Readability Tokens (from v1.1+)

```css
--ark-leading-none:    1;
--ark-leading-tight:   1.08;
--ark-leading-snug:    1.22;
--ark-leading-normal:  1.75;
--ark-leading-relaxed: 1.9;
--ark-measure-xs: 42ch;
--ark-measure-sm: 56ch;
--ark-measure-md: 68ch;
--ark-measure-lg: 78ch;
```

Use `--ark-measure-md` for case study and long-form content containers.
Note: `--ark-leading-normal` updated to 1.75 (from 1.62) to suit
Plus Jakarta Sans's tighter default metrics compared to Cormorant Garamond.
