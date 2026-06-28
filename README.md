# AI Launchpad

[![Website](https://github.com/hyperscaleailabs/ai-launchpad/actions/workflows/website.yml/badge.svg)](https://github.com/hyperscaleailabs/ai-launchpad/actions/workflows/website.yml)
[![CI](https://github.com/hyperscaleailabs/ai-launchpad/actions/workflows/ci.yml/badge.svg)](https://github.com/hyperscaleailabs/ai-launchpad/actions/workflows/ci.yml)
[![CodeQL](https://github.com/hyperscaleailabs/ai-launchpad/actions/workflows/codeql.yml/badge.svg)](https://github.com/hyperscaleailabs/ai-launchpad/actions/workflows/codeql.yml)
[![Coverage gate: 80%](https://img.shields.io/badge/coverage%20gate-%E2%89%A580%25-brightgreen)](docs/ci-cd.md#ci-jobs)
[![License](https://img.shields.io/badge/license-Apache%202.0-green)](LICENSE)

The home of **AI Launchpad** — the marketing site and blog at the repository
root, plus the supporting Python package and CI/CD framework. AI Launchpad helps
teams design, build, and ship production-grade AI products.

## Repository layout

```
.                          ← AI Launchpad website (Astro) — the main site
├── src/                   # Site source: pages, layouts, components, content/blog
├── public/                # Static assets (favicon, images)
├── scripts/               # capture-evidence.mjs (build smoke test + screenshots)
├── astro.config.mjs       # Astro config (site URL, sitemap)
├── package.json           # Website dependencies & scripts
├── vercel.json            # Vercel deploy config
├── netlify.toml           # Netlify config (alternative host)
│
├── packages/
│   └── ai-launchpad/      # Python package (formerly the repo root project)
│       ├── src/ai_launchpad/
│       ├── tests/
│       └── pyproject.toml
│
├── docs/                  # Shared documentation (CI/CD framework, etc.)
└── .github/workflows/     # CI: website build/deploy, Python CI, CodeQL, release
```

## Website (this repo's root)

The marketing site and blog, built with [Astro](https://astro.build). Pages are
simple components and blog posts are plain Markdown — no database, no CMS.

```bash
npm install
npm run dev        # local dev server at http://localhost:4321
npm run build      # production build into ./dist
npm run preview    # preview the production build locally
```

Requires Node 22+ (see `.nvmrc`).

### Editing the site

- **Company info / nav / footer:** edit `src/config.ts`.
- **Home / About / Offerings copy:** edit the matching file in `src/pages/`.
- **Styling / colors:** edit the CSS variables at the top of `src/styles/global.css`.

### Adding a blog post

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

Commit and push — the deploy rebuilds automatically.

### Deployment

Deploys run **from GitHub Actions** (`.github/workflows/website.yml`), gated on
the build/evidence job passing:

- **Push to `main`** → production deploy
- **Pull request** → preview deploy (URL shown in the job summary)

Both use the Vercel CLI and require these repository secrets
(**Settings → Secrets and variables → Actions**): `VERCEL_TOKEN`,
`VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`. The deploy jobs **skip cleanly** (no
failure) until these are set, so CI stays green before Vercel is connected.
Vercel's own Git auto-deploy is disabled (`git.deploymentEnabled: false` in
`vercel.json`) so deploys happen only through the gated workflow.

Before going live, set the production domain in `astro.config.mjs` (the `site`
constant) so canonical URLs, the sitemap, and the RSS feed are correct.

## Python package

The Python package lives in [`packages/ai-launchpad/`](packages/ai-launchpad/).
Run its tooling from that directory:

```bash
cd packages/ai-launchpad
pip install -e ".[dev]"
ruff check . && ruff format --check .
mypy src
pytest --cov=ai_launchpad        # tests + coverage (gate: 80%)
```

## CI/CD

See [docs/ci-cd.md](docs/ci-cd.md) for the full CI/CD framework — the website
build/deploy pipeline, the Python test matrix, CodeQL analysis, and the PyPI
release process.
