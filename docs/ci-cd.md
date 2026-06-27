# CI/CD Framework

This repository uses **GitHub Actions** for continuous integration and delivery.
The setup is intentionally lightweight but covers the full path from a pull
request to a published release.

## Workflows

| Workflow | File | Triggers | Purpose |
| --- | --- | --- | --- |
| **CI** | `.github/workflows/ci.yml` | push/PR to `main`, manual | Lint, format check, type check, and a test matrix across Python 3.10–3.13 (plus macOS/Windows spot checks). |
| **CodeQL** | `.github/workflows/codeql.yml` | push/PR to `main`, weekly schedule | Static security and quality analysis. |
| **Release** | `.github/workflows/release.yml` | push of a `v*.*.*` tag, manual | Build sdist/wheel, publish to PyPI via Trusted Publishing (OIDC), and create a GitHub Release. |

## CI jobs

- **Lint & format** — `ruff check` and `ruff format --check`.
- **Type check** — `mypy` in strict mode against `src`.
- **Test** — `pytest` with coverage across a Python version matrix. A
  **coverage gate** (`fail_under = 80` in `pyproject.toml`) fails the build if
  total coverage drops below 80%.
- **CI success** — an aggregate gate job. Configure branch protection to
  require this single check rather than every matrix combination.

## Local development

Match CI locally before pushing:

```bash
pip install -e ".[dev]"
pre-commit install          # run the same checks on every commit
pre-commit run --all-files  # or run them on demand

ruff check . && ruff format --check .
mypy src
pytest --cov=ai_launchpad
```

## Releasing

1. Bump `version` in `pyproject.toml` (and `__version__` in
   `src/ai_launchpad/__init__.py`).
2. Tag the commit: `git tag v0.1.0 && git push origin v0.1.0`.
3. The Release workflow builds, publishes to PyPI, and drafts a GitHub Release.

### One-time setup for publishing

- **PyPI Trusted Publishing**: add a pending publisher on PyPI for this repo and
  the `Release` workflow (`publish-pypi` job). No API token/secret is needed —
  it uses OIDC.
- **Environment**: a `pypi` environment is referenced for the publish job so you
  can add required reviewers or deployment protections if desired.

## Dependency updates

`.github/dependabot.yml` keeps Python dependencies and GitHub Actions versions
up to date with grouped weekly pull requests.
