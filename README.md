# ai-launchpad

[![CI](https://github.com/hyperscaleailabs/ai-launchpad/actions/workflows/ci.yml/badge.svg)](https://github.com/hyperscaleailabs/ai-launchpad/actions/workflows/ci.yml)
[![CodeQL](https://github.com/hyperscaleailabs/ai-launchpad/actions/workflows/codeql.yml/badge.svg)](https://github.com/hyperscaleailabs/ai-launchpad/actions/workflows/codeql.yml)
[![Coverage gate: 80%](https://img.shields.io/badge/coverage%20gate-%E2%89%A580%25-brightgreen)](docs/ci-cd.md#ci-jobs)
[![Python](https://img.shields.io/badge/python-3.10%20%7C%203.11%20%7C%203.12%20%7C%203.13-blue)](https://www.python.org)
[![License](https://img.shields.io/badge/license-Apache%202.0-green)](LICENSE)

AI Launchpad

## Development

```bash
pip install -e ".[dev]"     # install with dev tooling
pre-commit install          # enable local pre-commit checks

ruff check . && ruff format --check .   # lint + format
mypy src                                # type check
pytest --cov=ai_launchpad               # tests + coverage (gate: 80%)
```

See [docs/ci-cd.md](docs/ci-cd.md) for the full CI/CD framework and release process.
