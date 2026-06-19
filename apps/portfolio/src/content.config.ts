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
  loader: glob({ pattern: "**/*.json", base: "./src/content/projects" }),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    projectName: z.string(),
    shippedDate: z.coerce.date(),
    // Long-form prose, paragraphs separated by blank lines. Rendered as <p>s.
    body: z.string(),
    featured: z.boolean().default(false),
    role: z.string(),
    challenges: z.string(),
    stack: z.array(z.string()).default([]),
    category: categorySchema,
    // Side-project-only fields. Professional work omits both; screenshots
    // defaults to an empty array so the gallery simply renders nothing.
    "github-url": z.string().url().optional(),
    screenshots: z.array(z.string()).default([]),
  }),
});

export const collections = { caseStudies, projects };
