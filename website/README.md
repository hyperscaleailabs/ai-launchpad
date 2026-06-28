# AI Launchpad — Website

The marketing site and blog for AI Launchpad, built with
[Astro](https://astro.build). Pages are simple components and blog posts are
plain Markdown files — no database, no CMS.

## Quick start

```bash
cd website
npm install
npm run dev        # local dev server at http://localhost:4321
npm run build      # production build into ./dist
npm run preview    # preview the production build locally
```

Requires Node 22+ (see `.nvmrc`).

## Project structure

```
website/
├── src/
│   ├── config.ts              # Company name, tagline, email, nav, socials
│   ├── content.config.ts      # Blog collection schema (frontmatter rules)
│   ├── content/blog/          # ← Blog posts live here (Markdown)
│   ├── layouts/               # Page + blog post layouts
│   ├── components/            # Header, Footer
│   ├── pages/                 # Routes: index, about, offerings, blog, rss
│   └── styles/global.css      # Site-wide styling
└── public/                    # Static assets (favicon, images)
```

## Editing the site

- **Company info / nav / footer:** edit `src/config.ts`.
- **Home / About / Offerings copy:** edit the matching file in `src/pages/`.
- **Styling / colors:** edit the CSS variables at the top of
  `src/styles/global.css`.

## Adding a blog post

Create a Markdown file in `src/content/blog/`. The file name becomes the URL.

```markdown
---
title: "My new post"
description: "A one-line summary."
pubDate: 2026-06-28
author: "Your Name"
tags: ["news"]
draft: false
---

Write your post in Markdown here.
```

Commit and push — the deploy rebuilds automatically. See the
"How to add a blog post" entry on the live blog for the full walkthrough.

## Deployment

Configured for both **Vercel** (`vercel.json`) and **Netlify**
(`netlify.toml`). Connect the repo in whichever you prefer and point it at the
`website/` directory as the project/base directory; the framework is
auto-detected (build: `npm run build`, output: `dist`).

Before going live, set the production domain in `astro.config.mjs` (the `site`
constant) so canonical URLs, the sitemap, and the RSS feed are correct.
```
