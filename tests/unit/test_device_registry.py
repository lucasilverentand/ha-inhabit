"""Unit tests for Inhabit device registry helpers."""

from __future__ import annotations

from unittest.mock import MagicMock, patch

from custom_components.inhabit.const import DOMAIN
from custom_components.inhabit.device_registry import ensure_floor_plan_device


def test_ensure_floor_plan_device_registers_parent_device(mock_hass):
    """Floor-plan parent devices must exist before child entities use via_device."""
    dev_reg = MagicMock()

    with patch(
        "custom_components.inhabit.device_registry.dr.async_get",
        return_value=dev_reg,
    ):
        ensure_floor_plan_device(mock_hass, "entry_1", "fp_1", "Home")

    dev_reg.async_get_or_create.assert_called_once_with(
        config_entry_id="entry_1",
        identifiers={(DOMAIN, "fp_1")},
        manufacturer="Inhabit",
        model="Floor Plan",
        name="Home",
    )


def test_ensure_floor_plan_device_ignores_missing_mock_registry(mock_hass):
    """Stripped unit-test hass mocks do not always initialize HA registries."""
    with patch(
        "custom_components.inhabit.device_registry.dr.async_get",
        side_effect=KeyError("device_registry"),
    ):
        ensure_floor_plan_device(mock_hass, "entry_1", "fp_1", "Home")
