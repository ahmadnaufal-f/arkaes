# Arkaes · Color Reference

## Full Token Set

| Token | Hex | Role |
|---|---|---|
| `--warm-white` | `#faf7f5` | Page background only |
| `--parchment` | `#f0eae4` | Alternating section background |
| `--parchment-d` | `#e0d6ce` | Borders, dividers, rules |
| `--ink` | `#1c1917` | Primary text, dark panels |
| `--ink-muted` | `#4a4240` | Body copy, descriptions |
| `--ink-ghost` | `#9e9490` | Metadata, labels, placeholders |
| `--blush` | `#d4a898` | Dominant accent |
| `--blush-light` | `#e8c8bc` | Hover backgrounds, tints |
| `--blush-deep` | `#b8887a` | Active states, eyebrows |
| `--blush-tint` | `#f7efec` | Subtle section tints |
| `--sage` | `#7d9180` | Rare accent (max 5/page) |
| `--sage-light` | `#a8bfaa` | Sage tints |
| `--sage-tint` | `#edf2ee` | Sage background tint |

## Blush — Where to Use It

Freely permitted on:
- Eyebrow lines and the rule before them
- Italic title emphasis (`em` inside Fraunces headlines)
- Hover border accents on cards and list items
- Button underline animations on hover
- Scroll line animation
- Marquee divider dots
- Stat numbers
- Focus ring (`--shadow-focus` is blush-tinted)
- Nav active state
- TOC arrow on hover
- Portrait/image bottom rule (3px)

## Sage — Where to Use It (max 5 per page)

Count every placement:
1. Portrait/image bottom rule (3px sage strip)
2. Service row / list item left border on hover
3. Hero composition block (the green-tinted rectangle)
4. Social links in dark/contact sections
5. Type scale accent or pillar rule

When you've placed sage 5 times — stop. Use blush for anything else.

## Dark Panel Colors

Inside `background: var(--ink)` sections:

| Element | Color |
|---|---|
| Headlines | `rgba(250,247,245,.92)` |
| Body text | `rgba(250,247,245,.55)` |
| Accent links | `var(--blush-light)` |
| Sage links at rest | `rgba(125,145,128,.6)` |
| Sage links on hover | `var(--sage-light)` |
| Borders | `rgba(255,255,255,.05)–.08` |

## Prohibited

- `#ffffff` — never. Use `--warm-white`
- `#000000` — never. Use `--ink`
- Drop shadows on type — ever
- Colored shadows (except `--shadow-focus`)
- Blush and sage at equal visual weight on the same page
- Gradients on text or UI surfaces
- Glow effects except the radial ambient blobs in dark panels
