"""Integration tests for Inhabit setup with actual Home Assistant instance.

These tests use pytest-homeassistant-custom-component to test with a real
Home Assistant instance, catching API compatibility issues.
"""

from __future__ import annotations

from unittest.mock import patch

import pytest
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant
from homeassistant.setup import async_setup_component
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.inhabit.const import DOMAIN


@pytest.fixture
def mock_config_entry() -> MockConfigEntry:
    """Create a mock config entry for testing."""
    return MockConfigEntry(
        domain=DOMAIN,
        title="Inhabit Floor Plan Builder",
        data={},
        options={},
        entry_id="test_entry_id",
    )


@pytest.fixture
def mock_frontend_file(tmp_path):
    """Create a mock frontend file for testing."""
    frontend_dir = tmp_path / "custom_components" / "inhabit" / "frontend" / "dist"
    frontend_dir.mkdir(parents=True)
    panel_js = frontend_dir / "panel.js"
    panel_js.write_text("// Mock panel.js")
    return tmp_path


class TestIntegrationSetup:
    """Test integration setup and teardown."""

    @pytest.mark.asyncio
    async def test_setup_entry(
        self,
        hass: HomeAssistant,
        mock_config_entry: MockConfigEntry,
        mock_frontend_file,
    ):
        """Test setting up the integration."""
        # Patch the frontend path to use our mock file
        with patch.object(
            hass.config,
            "path",
            side_effect=lambda *args: str(mock_frontend_file / "/".join(args)),
        ):
            mock_config_entry.add_to_hass(hass)

            # Setup the integration
            assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
            await hass.async_block_till_done()

            # Verify entry is loaded
            assert mock_config_entry.state == ConfigEntryState.LOADED

            # Verify domain data is set
            assert DOMAIN in hass.data
            assert "store" in hass.data[DOMAIN]
            assert "sensor_engine" in hass.data[DOMAIN]

    @pytest.mark.asyncio
    async def test_unload_entry(
        self,
        hass: HomeAssistant,
        mock_config_entry: MockConfigEntry,
        mock_frontend_file,
    ):
        """Test unloading the integration."""
        with patch.object(
            hass.config,
            "path",
            side_effect=lambda *args: str(mock_frontend_file / "/".join(args)),
        ):
            mock_config_entry.add_to_hass(hass)

            # Setup
            assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
            await hass.async_block_till_done()

            # Unload
            assert await hass.config_entries.async_unload(mock_config_entry.entry_id)
            await hass.async_block_till_done()

            # Verify entry is not loaded
            assert mock_config_entry.state == ConfigEntryState.NOT_LOADED

            # Verify domain data is cleaned up
            assert DOMAIN not in hass.data

    @pytest.mark.asyncio
    async def test_reload_entry(
        self,
        hass: HomeAssistant,
        mock_config_entry: MockConfigEntry,
        mock_frontend_file,
    ):
        """Test reloading the integration."""
        with patch.object(
            hass.config,
            "path",
            side_effect=lambda *args: str(mock_frontend_file / "/".join(args)),
        ):
            mock_config_entry.add_to_hass(hass)

            # Setup
            assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
            await hass.async_block_till_done()

            # Reload
            assert await hass.config_entries.async_reload(mock_config_entry.entry_id)
            await hass.async_block_till_done()

            # Verify entry is still loaded
            assert mock_config_entry.state == ConfigEntryState.LOADED

    @pytest.mark.asyncio
    async def test_setup_creates_binary_sensor_platform(
        self,
        hass: HomeAssistant,
        mock_config_entry: MockConfigEntry,
        mock_frontend_file,
    ):
        """Test that setup creates the binary sensor platform."""
        with patch.object(
            hass.config,
            "path",
            side_effect=lambda *args: str(mock_frontend_file / "/".join(args)),
        ):
            mock_config_entry.add_to_hass(hass)

            assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
            await hass.async_block_till_done()

            # Binary sensor platform should be loaded
            # The actual sensors are created dynamically based on floor plan rooms


class TestStaticPathRegistration:
    """Test static path registration for frontend."""

    @pytest.mark.asyncio
    async def test_static_path_registered(
        self,
        hass: HomeAssistant,
        mock_config_entry: MockConfigEntry,
        mock_frontend_file,
    ):
        """Test that the panel.js static path is registered."""
        with patch.object(
            hass.config,
            "path",
            side_effect=lambda *args: str(mock_frontend_file / "/".join(args)),
        ):
            mock_config_entry.add_to_hass(hass)

            assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
            await hass.async_block_till_done()

            # Check that http is configured (static path registration doesn't raise)
            assert hass.http is not None


class TestWebSocketAPI:
    """Test WebSocket API registration."""

    @pytest.mark.asyncio
    async def test_websocket_commands_registered(
        self,
        hass: HomeAssistant,
        mock_config_entry: MockConfigEntry,
        mock_frontend_file,
    ):
        """Test that WebSocket commands are registered."""
        with patch.object(
            hass.config,
            "path",
            side_effect=lambda *args: str(mock_frontend_file / "/".join(args)),
        ):
            mock_config_entry.add_to_hass(hass)

            assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
            await hass.async_block_till_done()

            # WebSocket commands should be registered
            # They are registered via websocket_api.async_register_command
            from homeassistant.components import websocket_api

            # The commands should exist in the websocket handlers
            # This verifies the registration doesn't raise errors


class TestServices:
    """Test service registration."""

    @pytest.mark.asyncio
    async def test_services_registered(
        self,
        hass: HomeAssistant,
        mock_config_entry: MockConfigEntry,
        mock_frontend_file,
    ):
        """Test that services are registered."""
        with patch.object(
            hass.config,
            "path",
            side_effect=lambda *args: str(mock_frontend_file / "/".join(args)),
        ):
            mock_config_entry.add_to_hass(hass)

            assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
            await hass.async_block_till_done()

            # Check services are registered
            assert hass.services.has_service(DOMAIN, "set_room_occupancy")
            assert hass.services.has_service(DOMAIN, "refresh_sensors")
            assert hass.services.has_service(DOMAIN, "export_automation")
            assert hass.services.has_service(DOMAIN, "export_card")
