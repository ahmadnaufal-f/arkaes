// Shared taxonomy for the portfolio. This is the single source of truth for the
// expertise areas (used by the home page services section and the listing-page
// filters) and the work categories (professional vs side projects).

export const EXPERTISE = [
  { slug: "frontend-architecture", label: "Frontend Architecture & UI Systems" },
  { slug: "design-systems", label: "Design Systems Engineering" },
  { slug: "performance", label: "Performance-focused Frontend Engineering" },
  { slug: "cross-platform", label: "Cross-platform Product Development" },
] as const;

// Declared as a literal tuple so it can feed `z.enum(...)` in content.config.ts
// without casting. Keep in sync with EXPERTISE above.
export const EXPERTISE_SLUGS = [
  "frontend-architecture",
  "design-systems",
  "performance",
  "cross-platform",
] as const;

export type ExpertiseSlug = (typeof EXPERTISE)[number]["slug"];

export const CATEGORIES = [
  { slug: "professional-work", label: "Professional Work" },
  { slug: "side-project", label: "Side Projects" },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

// Look up an expertise label by slug (falls back to the slug if unknown).
export const expertiseLabel = (slug: string): string =>
  EXPERTISE.find((e) => e.slug === slug)?.label ?? slug;

// Look up a category label by slug (falls back to the slug if unknown).
export const categoryLabel = (slug: string): string =>
  CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
