"""Pytest configuration for integration tests.

These tests require pytest-homeassistant-custom-component and run with
a real Home Assistant instance, so we don't mock anything here.
"""

from __future__ import annotations

import pytest

# Use pytest-homeassistant-custom-component fixtures
pytest_plugins = ["pytest_homeassistant_custom_component"]


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    """Automatically enable custom integrations for all tests."""
    yield
