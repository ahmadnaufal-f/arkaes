import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const categorySchema = z.enum(["professional-work", "side-project"]);

const caseStudies = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/case-studies" }),
  schema: z.object({
    title: z.string(),
    shortDesc: z.string(),
    projectName: z.string(),
    featured: z.boolean().default(false),
    visual: z.string(),
    tags: z.array(z.string()).default([]),
    category: categorySchema.default("professional-work"),
    order: z.number().default(999),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    projectName: z.string(),
    summary: z.string(),
    featured: z.boolean().default(false),
    impact: z.string(),
    role: z.string(),
    stack: z.array(z.string()).default([]),
    category: categorySchema,
    shippedDate: z.coerce.date(),
  }),
});

export const collections = { caseStudies, projects };
