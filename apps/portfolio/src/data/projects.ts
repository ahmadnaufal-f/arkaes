export type ProjectCategory = "professional-work" | "side-project";

export interface Project {
  category: ProjectCategory;
  featured: boolean;
  impact: string;
  role: string;
  slug: string;
  stack: string[];
  summary: string;
  title: string;
}

export const projects: Project[] = [
  {
    title: "SmartThings Air Care Service",
    slug: "smartthings-air-care-service",
    category: "professional-work",
    summary:
      "A production SmartThings service experience focused on reliable frontend delivery and faster repeated loading.",
    role: "Frontend engineer",
    stack: ["JavaScript", "SmartThings", "Performance"],
    impact: "Performance, caching strategy, and production constraints",
    featured: true,
  },
  {
    title: "Virtual Home - SmartThings Simulator Plugin",
    slug: "virtual-home-smartthings-simulator-plugin",
    category: "professional-work",
    summary:
      "A simulator plugin story centered on refactoring, maintainability, and output optimization.",
    role: "Frontend engineer",
    stack: ["JavaScript", "Plugin architecture", "Refactoring"],
    impact: "Maintainability and bundle/output optimization",
    featured: true,
  },
  {
    title: "Virtual Home for TV",
    slug: "virtual-home-for-tv",
    category: "professional-work",
    summary:
      "A large-screen adaptation of Virtual Home shaped around TV interaction patterns and platform constraints.",
    role: "Frontend engineer",
    stack: ["TV UX", "Platform adaptation", "Frontend"],
    impact: "Large-screen UX and remote-friendly interaction",
    featured: false,
  },
  {
    title: "Treely",
    slug: "treely",
    category: "side-project",
    summary:
      "A family tree maker app that combines product ownership, cross-platform direction, and team leadership.",
    role: "Product-minded frontend lead",
    stack: ["React Native", "Product strategy", "Mobile"],
    impact: "Product ownership and cross-platform execution",
    featured: true,
  },
  {
    title: "Milk Tracker App",
    slug: "milk-tracker-app",
    category: "side-project",
    summary:
      "A personal utility app concept for tracking feeding patterns and turning routine data into useful summaries.",
    role: "Product designer and builder",
    stack: ["Mobile", "AI-assisted insights", "Utility"],
    impact: "Product empathy and practical everyday workflows",
    featured: false,
  },
];

export const featuredProjects = projects.filter((project) => project.featured);

export const professionalProjects = projects.filter(
  (project) => project.category === "professional-work",
);

export const sideProjects = projects.filter((project) => project.category === "side-project");

