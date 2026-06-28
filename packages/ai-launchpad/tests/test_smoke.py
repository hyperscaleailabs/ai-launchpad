"""Smoke tests that keep the CI pipeline meaningful until real code lands."""

from ai_launchpad import __version__, hello


def test_version_is_set() -> None:
    assert __version__


def test_hello_greeting() -> None:
    assert hello() == "Hello from AI Launchpad!"
