# Walkthrough: building a company website + blog and deploying to Vercel

This is the end-to-end recipe we used to build the AI Launchpad site. It produces
a fast, low-maintenance marketing site with a **Markdown-driven blog**, CI that
**proves the site runs and screenshots it**, and **gated automatic deploys** to
Vercel. The same steps work for any consulting/business site.

---

## 0. Decisions (and why)

| Decision | Choice | Why |
| --- | --- | --- |
| Framework | **Astro** | Best fit for "marketing pages + Markdown blog": fast, static by default, first-class content collections, looks professional with little effort. |
| Blog source | **Markdown files** | Publishing a post = adding one `.md` file. No CMS, no database. |
| Hosting | **Vercel** | Zero-config Astro support, free tier, per-PR preview URLs. (Netlify is an equally good alternative.) |
| Deploy trigger | **GitHub Actions, gated on CI** | Nothing reaches production unless the build + evidence checks pass. |
| Repo layout | Site in a **`website/` subfolder** | Keeps the site separate from any existing code (e.g. a Python package) and its CI. |

---

## 1. Scaffold the site

Create the structure under `website/`:

```
website/
├── package.json            # astro + @astrojs/rss + @astrojs/sitemap
├── astro.config.mjs        # set `site` to your production URL
├── tsconfig.json
├── src/
│   ├── config.ts           # company name, tagline, email, nav, socials
│   ├── content.config.ts   # blog collection + frontmatter schema
│   ├── content/blog/       # ← posts live here as .md files
│   ├── layouts/            # BaseLayout, BlogPostLayout
│   ├── components/         # Header, Footer
│   ├── pages/              # index, about, offerings, blog/, rss.xml.js, 404
│   └── styles/global.css   # CSS variables for theming
└── public/                 # favicon, images
```

Key ideas that make it maintainable:

- **One config file** (`src/config.ts`) holds all company-wide content (name,
  nav, email, social links) so it's edited in exactly one place.
- **Typed blog schema** (`src/content.config.ts`) validates frontmatter at build
  time, so a malformed post fails loudly instead of rendering broken.
- **Theme via CSS variables** at the top of `global.css` — rebrand by changing a
  handful of values.

Run locally:

```bash
cd website
npm install
npm run dev        # http://localhost:4321
npm run build      # static output in ./dist
```

## 2. The blog workflow

A post is a single Markdown file in `src/content/blog/`:

```markdown
---
title: "My new post"
description: "One-line summary for lists, SEO, and RSS."
pubDate: 2026-06-28
author: "Your Name"
tags: ["news"]
draft: false
---

Write the post in Markdown here.
```

The filename becomes the URL. Commit + push → the post is live. Include a
"How to add a blog post" entry as living documentation for non-technical authors.

## 3. CI that collects runtime evidence

A `.github/workflows/website.yml` job (`build-and-verify`) does more than build:

1. `npm ci` + `npm run build`
2. Install a browser: `npx playwright install --with-deps chromium`
3. Start the preview server and wait for it to answer
4. Run a Playwright script (`website/scripts/capture-evidence.mjs`) that:
   - requests each key route and **asserts HTTP 200** (fails CI otherwise)
   - captures full-page **screenshots** (desktop routes + a mobile home view)
   - writes a JSON + Markdown summary
5. Upload screenshots/summaries as the **`website-evidence`** artifact and add
   the summary table to the GitHub job summary

This turns "did the site actually run?" into a hard, reviewable gate with visual
proof attached to every run.

## 4. Gated automatic deploy to Vercel

Two more jobs in the same workflow, both `needs: build-and-verify`:

- **`deploy-preview`** — runs on PRs, deploys a preview (URL in the job summary)
- **`deploy-production`** — runs on push to `main`, deploys to production

Both use the Vercel CLI:

```bash
npm i -g vercel@latest
vercel pull --yes --environment=production --token="$VERCEL_TOKEN"
vercel build --prod --token="$VERCEL_TOKEN"
vercel deploy --prebuilt --prod --token="$VERCEL_TOKEN"
```

Required repo secrets (**Settings → Secrets and variables → Actions**):
`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.

Two robustness touches:
- A **guard step** checks for `VERCEL_TOKEN` and skips the deploy cleanly if it's
  missing — so CI stays green before Vercel is connected.
- Vercel's own Git auto-deploy is **disabled** (`"git": {"deploymentEnabled":
  false}` in `vercel.json`) so deploys happen only through the gated workflow —
  no duplicates.

## 5. Connect Vercel (one-time)

1. Import the repo in the Vercel dashboard.
2. **Set Root Directory to `website`** (it's a monorepo — this is the step people
   miss).
3. Astro is auto-detected. Deploy once to create/link the project.
4. Add the three secrets to GitHub.
5. Set the real production URL in `astro.config.mjs` (`site` constant) so
   canonical URLs, sitemap, and RSS are correct.

---

## Gotchas we hit (so you don't)

- **Vercel can't see `website/` until it's on the default branch.** The Root
  Directory picker reads `main`. Merge the PR first, then refresh the picker.
- **Vercel caches the repo tree.** After merging, the new folder can take a
  while to appear; reinstalling the Vercel GitHub app on the repo forces a
  refresh.
- **Playwright browser version mismatch** in sandboxes: the npm package may want
  a different Chromium build than is pre-installed. Honor a
  `PLAYWRIGHT_EXECUTABLE_PATH` override locally; in CI just run
  `npx playwright install`.
- **Keep the site out of the existing package's CI.** Path-filter the website
  workflow (`paths: ["website/**"]`) so it only runs on website changes, and
  leave the other project's CI untouched.

---

## Reusing this for another business

The structure is business-agnostic. To clone it for a new site, change:

1. `src/config.ts` — name, tagline, email, nav, socials
2. `src/pages/*.astro` — page copy (home/about/offerings)
3. `src/styles/global.css` — colors/fonts (CSS variables)
4. `src/content/blog/*` — replace the starter posts
5. `astro.config.mjs` — the production `site` URL

Everything else (CI, evidence capture, gated deploy) carries over unchanged.
See `.claude/skills/business-website/SKILL.md` for a repeatable, automated
version of this process.
