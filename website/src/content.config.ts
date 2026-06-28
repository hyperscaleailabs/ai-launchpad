import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Blog posts live as Markdown files in src/content/blog/.
// To publish a new post, drop a new .md file in that folder with the
// frontmatter fields below — no code changes required.
const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // Accepts e.g. 2026-06-28 in frontmatter and parses it to a Date.
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default("AI Launchpad"),
    tags: z.array(z.string()).default([]),
    // Set to true to hide a post from the blog index and feeds.
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
