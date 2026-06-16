import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const caseStudies = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/case-studies" }),
  schema: z.object({
    title: z.string(),
    shortDesc: z.string(),
    featured: z.boolean().default(false),
    visual: z.string(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { caseStudies };
