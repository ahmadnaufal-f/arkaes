// Shared taxonomy for the portfolio. This is the single source of truth for the
// expertise areas (used by the home page services section AND the listing-page
// filters) and the work categories (professional vs side projects).
//
// Each expertise area lists the `relatedWork` it covers, keyed by the canonical
// project name. A case study / project is associated with an expertise area when
// its `projectName` appears in that area's `relatedWork`. Keep the project names
// here in sync with the `projectName` field in the content frontmatter.

export const EXPERTISE_SLUGS = [
  "frontend-architecture",
  "design-systems",
  "performance",
  "cross-platform",
] as const;

export type ExpertiseSlug = (typeof EXPERTISE_SLUGS)[number];

export interface ExpertiseArea {
  slug: ExpertiseSlug;
  label: string;
  description: string;
  techStack: string[];
  relatedWork: string[];
}

export const EXPERTISE: ExpertiseArea[] = [
  {
    slug: "frontend-architecture",
    label: "Frontend Architecture & UI Systems",
    description:
      "I design frontend foundations for scalable product interfaces, including component structure, routing, state management, API integration, accessibility, and maintainable UI patterns.",
    techStack: [
      "React",
      "Next.js",
      "Lit",
      "TypeScript",
      "Zustand",
      "Redux Toolkit",
      "React Query",
      "Zod",
    ],
    relatedWork: [
      "SmartThings Virtual Home",
      "SmartThings Air Care",
      "Treely - Family Tree App",
      "Arkaes Design System",
    ],
  },
  {
    slug: "design-systems",
    label: "Design Systems Engineering",
    description:
      "I build reusable UI systems that help teams ship consistent interfaces faster, with attention to accessibility, design tokens, variants, component APIs, and documentation.",
    techStack: ["React", "Lit", "Web Components", "Storybook", "Tailwind CSS", "Figma", "Design Tokens"],
    relatedWork: ["Arkaes Design System", "Internal React Design System"],
  },
  {
    slug: "performance",
    label: "Performance-focused Frontend Engineering",
    description:
      "I improve frontend performance through caching, bundle optimization, lazy loading, rendering strategy, and refactoring heavy UI logic.",
    techStack: [
      "Vite",
      "Zustand",
      "Browser Performance Tools",
      "Code Splitting",
      "Caching Strategies",
      "Bundle Analysis",
    ],
    relatedWork: [
      "SmartThings Air Care",
      "SmartThings Virtual Home",
      "SmartThings Virtual Home for TV",
    ],
  },
  {
    slug: "cross-platform",
    label: "Cross-platform Product Development",
    description:
      "I build product interfaces across web and mobile, focusing on consistent user experience, maintainable architecture, and practical engineering tradeoffs.",
    techStack: ["React Native", "Expo", "React", "Next.js", "TypeScript", "NativeWind"],
    relatedWork: [
      "Treely - Family Tree App",
      "SmartThings Virtual Home for TV",
      "Milk Pumping Tracker",
    ],
  },
];

export const CATEGORIES = [
  { slug: "professional-work", label: "Professional Work" },
  { slug: "side-project", label: "Side Projects" },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

// Expertise slugs whose related work includes the given project name.
export const expertiseForProject = (projectName: string): ExpertiseSlug[] =>
  EXPERTISE.filter((area) => area.relatedWork.includes(projectName)).map((area) => area.slug);

// Look up an expertise label by slug (falls back to the slug if unknown).
export const expertiseLabel = (slug: string): string =>
  EXPERTISE.find((e) => e.slug === slug)?.label ?? slug;

// Look up a category label by slug (falls back to the slug if unknown).
export const categoryLabel = (slug: string): string =>
  CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
