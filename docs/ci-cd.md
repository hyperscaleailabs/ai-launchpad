# CI/CD Framework

This repository uses **GitHub Actions** for continuous integration and delivery.
The setup is intentionally lightweight but covers the full path from a pull
request to a published release.

The repo is a small monorepo: the **AI Launchpad website** (Astro) lives at the
repository root, and the **Python package** lives in `packages/ai-launchpad/`.
The workflows below are scoped accordingly.

## Workflows

| Workflow | File | Triggers | Purpose |
| --- | --- | --- | --- |
| **Website** | `.github/workflows/website.yml` | push/PR touching site files, manual | Build the Astro site, capture evidence (route status checks + screenshots), and deploy to Vercel (preview on PR, production on `main`). |
| **CI** | `.github/workflows/ci.yml` | push/PR to `main`, manual | Lint, format check, type check, and a test matrix across Python 3.10–3.13 (plus macOS/Windows spot checks) for `packages/ai-launchpad/`. |
| **CodeQL** | `.github/workflows/codeql.yml` | push/PR to `main`, weekly schedule | Static security and quality analysis of the Python code. |
| **Release** | `.github/workflows/release.yml` | push of a `v*.*.*` tag, manual | Build sdist/wheel from `packages/ai-launchpad/`, publish to PyPI via Trusted Publishing (OIDC), and create a GitHub Release. |

## Website jobs

- **Build & capture evidence** — `npm ci && npm run build`, then a Playwright
  smoke test (`scripts/capture-evidence.mjs`) hits each route, asserts HTTP 200,
  and saves screenshots + a summary. Uploads `website-dist` (the built site) and
  `website-evidence` artifacts.
- **Deploy preview / production** — deploy via the Vercel CLI, gated on the
  build job. These **skip cleanly** until the `VERCEL_*` repository secrets are
  configured, so CI stays green before Vercel is connected.

## CI jobs (Python)

- **Lint & format** — `ruff check` and `ruff format --check`.
- **Type check** — `mypy` in strict mode against `src`.
- **Test** — `pytest` with coverage across a Python version matrix. A
  **coverage gate** (`fail_under = 80` in `pyproject.toml`) fails the build if
  total coverage drops below 80%.
- **CI success** — an aggregate gate job. Configure branch protection to
  require this single check rather than every matrix combination.

## Local development

Match CI locally before pushing. Python commands run from
`packages/ai-launchpad/`:

```bash
cd packages/ai-launchpad
pip install -e ".[dev]"
pre-commit install          # run the same checks on every commit
pre-commit run --all-files  # or run them on demand

ruff check . && ruff format --check .
mypy src
pytest --cov=ai_launchpad
```

For the website, from the repository root:

```bash
npm install
npm run build      # production build into ./dist
npm run preview    # serve the build locally
npm run screenshots  # the evidence smoke test (needs a running preview server)
```

## Releasing

1. Bump `version` in `packages/ai-launchpad/pyproject.toml` (and `__version__`
   in `packages/ai-launchpad/src/ai_launchpad/__init__.py`).
2. Tag the commit: `git tag v0.1.0 && git push origin v0.1.0`.
3. The Release workflow builds, publishes to PyPI, and drafts a GitHub Release.

### One-time setup for publishing

- **PyPI Trusted Publishing**: add a pending publisher on PyPI for this repo and
  the `Release` workflow (`publish-pypi` job). No API token/secret is needed —
  it uses OIDC.
- **Environment**: a `pypi` environment is referenced for the publish job so you
  can add required reviewers or deployment protections if desired.

## Dependency updates

`.github/dependabot.yml` keeps Python dependencies (`packages/ai-launchpad/`),
website npm dependencies (repo root), and GitHub Actions versions up to date
with grouped weekly pull requests.
