---
name: business-website
description: >-
  Scaffold a fast company/marketing website with a Markdown-driven blog and set
  up gated automatic deployment to Vercel. Use when the user wants to create a
  website for a business (consulting, agency, startup, product, portfolio) that
  has informational pages (home/about/services/offerings) plus a simple blog
  edited as Markdown files, and wants it deployed. Produces an Astro site under a
  website/ subfolder, CI that proves the site runs and captures screenshots, and
  preview/production deploys gated on that CI.
---

# Build a business website (Astro + Markdown blog + gated Vercel deploy)

This skill creates a production-ready marketing site for any business and wires
up CI/CD. It is a generalization of the AI Launchpad site; see
`docs/website-walkthrough.md` in that repo for the worked example.

## When to use

Trigger this for requests like "build a website for my consulting business",
"I need a company site with a blog", "make a landing page + blog and deploy it".
The output is intentionally simple to maintain: pages are small components and
**every blog post is one Markdown file**.

## Step 0 — Gather the essentials (ask, don't assume)

Collect before scaffolding (use sensible placeholders if the user wants to fill
in later):

- Business name, one-line tagline, longer description
- Contact email and any social links
- The set of pages (default: Home, About, Offerings/Services, Blog)
- 3–5 offerings/services with one-line descriptions
- Brand direction: light or dark theme, accent color (default: dark, blue accent)
- Hosting target (default: Vercel) and whether deploys should be **gated on CI**
  (recommended) or use the host's built-in git auto-deploy

## Step 1 — Scaffold the Astro site under `website/`

Always put the site in a `website/` subfolder so it stays independent of any
other code in the repo. Create:

- `package.json` — deps: `astro`, `@astrojs/rss`, `@astrojs/sitemap`;
  dev dep: `playwright`. Scripts: `dev`, `build`, `preview`,
  `screenshots: node scripts/capture-evidence.mjs`.
- `astro.config.mjs` — `site` set to the production URL (placeholder ok),
  `sitemap()` integration.
- `tsconfig.json` — extends `astro/tsconfigs/strict`.
- `src/config.ts` — single source of truth: name, tagline, description, email,
  socials, and the nav array. **All company-wide content lives here.**
- `src/content.config.ts` — a `blog` collection using the `glob` loader over
  `src/content/blog/`, with a Zod schema: `title`, `description`, `pubDate`
  (coerce.date), optional `updatedDate`, `author` (default), `tags` (default
  []), `draft` (default false).
- `src/layouts/BaseLayout.astro` — `<head>` (title, description, canonical, OG,
  RSS link), Header, `<slot/>`, Footer.
- `src/layouts/BlogPostLayout.astro` — post header (title/date/author/tags) + prose.
- `src/components/Header.astro` + `Footer.astro` — driven by `config.ts`.
- `src/pages/` — `index.astro` (hero + offerings + recent posts),
  `about.astro`, `offerings.astro`, `blog/index.astro`,
  `blog/[...slug].astro` (uses `getStaticPaths` + `render`), `rss.xml.js`,
  `404.astro`.
- `src/styles/global.css` — theme via CSS variables at the top (colors, radius,
  fonts) so rebranding is a few edits.
- `public/favicon.svg` and two starter posts in `src/content/blog/`, one of
  which is a "how to add a blog post" guide.

Keep copy concrete and specific to the business; avoid lorem ipsum.

## Step 2 — Verify locally

```bash
cd website && npm install && npm run build
```

Fix any build errors before proceeding. Optionally run `npm run dev` and view it.

## Step 3 — Evidence script + CI workflow

Create `website/scripts/capture-evidence.mjs` (Playwright): visit each route,
**assert HTTP 200** (exit 1 otherwise), save full-page screenshots (desktop
routes + one mobile home), write `summary.json` and `summary.md`. Honor a
`PLAYWRIGHT_EXECUTABLE_PATH` env override (useful in sandboxes where the
pre-installed Chromium differs from what the npm package expects). Gitignore the
generated `evidence/` folder.

Create `.github/workflows/website.yml`:
- Triggers: push/PR to `main` filtered to `website/**` and the workflow file,
  plus `workflow_dispatch`.
- `defaults.run.working-directory: website`.
- Job `build-and-verify`: setup Node 22 → `npm ci` → `npm run build` →
  `npx playwright install --with-deps chromium` → start `npm run preview` in
  background → wait for it via a curl loop → `npm run screenshots` → upload the
  `evidence/` and `dist/` artifacts → append `evidence/summary.md` to
  `$GITHUB_STEP_SUMMARY`.

## Step 4 — Gated Vercel deploy (if chosen)

Add two jobs to the workflow, both `needs: build-and-verify`:
- `deploy-preview` (`if: github.event_name == 'pull_request'`)
- `deploy-production` (`if: push to main`, `environment: production`)

Each: a **guard step** that checks `secrets.VERCEL_TOKEN` and skips cleanly when
absent, then a deploy step using the Vercel CLI (`vercel pull` → `vercel build`
[`--prod`] → `vercel deploy --prebuilt` [`--prod`]) with `VERCEL_TOKEN`,
`VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` from secrets. Print the resulting URL to the
job summary.

Set `"git": {"deploymentEnabled": false}` in `website/vercel.json` so deploys
only run through the gated workflow (no duplicate auto-deploys). Also include a
`netlify.toml` if the user might switch hosts.

## Step 5 — Document + hand off

Write a `website/README.md` covering: local dev, project structure, how to edit
company info/pages/theme, how to add a blog post, and the deploy flow + required
secrets. Then tell the user the manual one-time steps you cannot do for them:

1. Import the repo in Vercel and **set Root Directory to `website`**.
2. Add the three Vercel secrets to the repo.
3. Set the real production URL in `astro.config.mjs`.

## Known gotchas (call these out to the user)

- Vercel's Root Directory picker reads the **default branch** — the `website/`
  folder must be merged to `main` before it appears. Vercel also caches the repo
  tree; reinstalling its GitHub app on the repo forces a refresh.
- Path-filter the workflow so it never interferes with any other project's CI in
  the same repo.
- Don't commit `node_modules/`, `dist/`, `.astro/`, `.vercel/`, or `evidence/`.

## Recommendation: how to package this as YOUR reusable skill

- **Scope it personal, not per-repo.** Move this skill to `~/.claude/skills/`
  (instead of a repo's `.claude/skills/`) so it's available in every project.
- **Add a template instead of regenerating from scratch.** Drop a known-good
  `website/` template (this structure, sanitized) into the skill folder, e.g.
  `~/.claude/skills/business-website/template/`. The skill can then copy the
  template and only rewrite `config.ts`, page copy, theme, and starter posts —
  faster and more consistent than hand-building each time.
- **Parameterize branding.** Keep all per-business values in `config.ts` +
  `global.css` so cloning a new site is "answer a few questions → find/replace".
- **Keep the description trigger-rich.** The `description` frontmatter is what
  makes the skill auto-activate; mention the concrete phrasings clients use
  ("consulting website", "company site with a blog", "landing page + blog").
- **Version the gotchas.** As you reuse it and hit new edge cases, append them to
  the gotchas list so the skill keeps getting smarter.
