import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { EXPERTISE_SLUGS } from "./data/expertise";

const expertiseSchema = z.array(z.enum(EXPERTISE_SLUGS)).default([]);
const categorySchema = z.enum(["professional-work", "side-project"]);

const caseStudies = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/case-studies" }),
  schema: z.object({
    title: z.string(),
    shortDesc: z.string(),
    featured: z.boolean().default(false),
    visual: z.string(),
    tags: z.array(z.string()).default([]),
    category: categorySchema.default("professional-work"),
    expertise: expertiseSchema,
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    featured: z.boolean().default(false),
    impact: z.string(),
    role: z.string(),
    stack: z.array(z.string()).default([]),
    category: categorySchema,
    expertise: expertiseSchema,
  }),
});

export const collections = { caseStudies, projects };
