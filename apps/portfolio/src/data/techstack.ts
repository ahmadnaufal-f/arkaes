export interface TechItem {
  name: string;
  primary?: boolean;
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
      { name: "JavaScript" },
      { name: "HTML" },
      { name: "CSS" },
    ],
  },
  {
    label: "UI Systems & Design Systems",
    items: [
      { name: "Web Components", primary: true },
      { name: "Design Tokens", primary: true },
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
    ],
  },
  {
    label: "AI Product Integration",
    emerging: true,
    items: [
      { name: "OpenAI API", primary: true },
      { name: "Prompt Design", primary: true },
      { name: "AI-assisted Workflows" },
    ],
  },
  {
    label: "Animation & Interaction",
    items: [
      { name: "Framer Motion", primary: true },
      { name: "GSAP", primary: true },
      { name: "Lottie" },
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

export const currentlyLearning: string[] = ["Angular", "Edge AI"];
