# ai-launchpad (Python package)

The Python package for AI Launchpad. This lives in the AI Launchpad monorepo
under `packages/ai-launchpad/`; the marketing site and blog live at the repo
root (see the [repository README](../../README.md)).

## Development

Run all commands from this directory (`packages/ai-launchpad/`):

```bash
pip install -e ".[dev]"     # install with dev tooling
pre-commit install          # enable local pre-commit checks

ruff check . && ruff format --check .   # lint + format
mypy src                                # type check
pytest --cov=ai_launchpad               # tests + coverage (gate: 80%)
```

See [docs/ci-cd.md](../../docs/ci-cd.md) for the full CI/CD framework and
release process.
