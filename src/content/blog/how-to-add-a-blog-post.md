---
title: "How to add a blog post"
description: "A quick guide to publishing a new post by adding a single Markdown file."
pubDate: 2026-06-27
author: "AI Launchpad"
tags: ["guide", "how-to"]
---

Publishing a new post is intentionally simple: **create one Markdown file** and
the site does the rest. No code changes, no database.

## Steps

1. Create a new file in `website/src/content/blog/`, for example
   `my-new-post.md`. The file name becomes the URL
   (`/blog/my-new-post/`), so use lowercase words separated by hyphens.
2. Add the frontmatter block at the top (between the `---` lines):

   ```markdown
   ---
   title: "My new post"
   description: "A one-line summary shown in lists and previews."
   pubDate: 2026-06-28
   author: "Your Name"
   tags: ["news"]
   ---
   ```

3. Write your post below the frontmatter using normal Markdown.
4. Commit and push. The site rebuilds and deploys automatically.

## Frontmatter fields

| Field | Required | Notes |
| --- | --- | --- |
| `title` | yes | Post title. |
| `description` | yes | Short summary for lists, SEO, and the RSS feed. |
| `pubDate` | yes | Publish date, e.g. `2026-06-28`. |
| `author` | no | Defaults to "AI Launchpad". |
| `tags` | no | A list, e.g. `["news", "engineering"]`. |
| `draft` | no | Set to `true` to hide the post from the site. |

## Previewing locally

```bash
cd website
npm install
npm run dev
```

Then open the URL it prints (usually `http://localhost:4321`). That's it —
your post is live the moment you push.
