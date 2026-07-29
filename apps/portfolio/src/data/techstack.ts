export interface TechItem {
  name: string;
  primary?: boolean;
  learning?: boolean;
}

export interface TechGroup {
  label: string;
  emerging?: boolean;
  wide?: boolean;
  items: TechItem[];
}

export const techGroups: TechGroup[] = [
  {
    label: "Frontend Engineering",
    items: [
      { name: "React", primary: true },
      { name: "Lit", primary: true },
      { name: "TypeScript", primary: true },
      { name: "Next.js" },
      { name: "Astro" },
      { name: "JavaScript" },
      { name: "HTML" },
      { name: "CSS" },
      { name: "Vue JS", learning: true },
    ],
  },
  {
    label: "UI Systems & Design Systems",
    items: [
      { name: "Web Components", primary: true },
      { name: "Design Tokens", primary: true },
      { name: "DTCG" },
      { name: "Storybook" },
      { name: "Accessibility" },
      { name: "Tailwind CSS" },
    ],
  },
  {
    label: "State & Data",
    items: [
      { name: "React Query", primary: true },
      { name: "Zustand", primary: true },
      { name: "Pinia" },
      { name: "Redux Toolkit" },
      { name: "REST API" },
      { name: "Zod" },
    ],
  },
  {
    label: "Mobile & Cross-platform",
    items: [
      { name: "React Native", primary: true },
      { name: "Expo", primary: true },
      { name: "NativeWind" },
      { name: "React Native Skia" },
    ],
  },
  {
    label: "AI Product Integration",
    emerging: true,
    items: [
      { name: "OpenAI API", primary: true },
      { name: "Prompt Design", primary: true },
      { name: "RAG" },
      { name: "MCP Server" },
      { name: "AI-assisted Workflows" },
    ],
  },
  {
    label: "Animation & Interaction",
    items: [
      { name: "Framer Motion", primary: true },
      { name: "GSAP", primary: true },
      { name: "Lottie" },
      { name: "View Transition API" },
    ],
  },
  {
    label: "Tooling",
    wide: true,
    items: [
      { name: "Turborepo", primary: true },
      { name: "GitHub Actions", primary: true },
      { name: "Vite" },
      { name: "PNPM" },
      { name: "ESLint" },
      { name: "Vitest" },
      { name: "Playwright" },
    ],
  },
];
