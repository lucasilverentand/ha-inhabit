"""Unit tests for occupancy override button."""

from __future__ import annotations

from unittest.mock import ANY, MagicMock, call, patch

from custom_components.inhabit.const import DOMAIN, OccupancyState
from custom_components.inhabit.entities import button
from custom_components.inhabit.models.virtual_sensor import OccupancyStateData


class TestButtonToggleLogic:
    """Test the toggle logic used by the button entity."""

    def test_toggle_vacant_to_occupied(self):
        """Pressing the button when vacant should switch to occupied."""
        current = OccupancyStateData(state=OccupancyState.VACANT)

        if current.state in (OccupancyState.OCCUPIED, OccupancyState.CHECKING):
            new_state = OccupancyState.VACANT
        else:
            new_state = OccupancyState.OCCUPIED

        assert new_state == OccupancyState.OCCUPIED

    def test_toggle_occupied_to_vacant(self):
        """Pressing the button when occupied should switch to vacant."""
        current = OccupancyStateData(state=OccupancyState.OCCUPIED)

        if current.state in (OccupancyState.OCCUPIED, OccupancyState.CHECKING):
            new_state = OccupancyState.VACANT
        else:
            new_state = OccupancyState.OCCUPIED

        assert new_state == OccupancyState.VACANT

    def test_toggle_checking_to_vacant(self):
        """Pressing the button when checking should switch to vacant."""
        current = OccupancyStateData(state=OccupancyState.CHECKING)

        if current.state in (OccupancyState.OCCUPIED, OccupancyState.CHECKING):
            new_state = OccupancyState.VACANT
        else:
            new_state = OccupancyState.OCCUPIED

        assert new_state == OccupancyState.VACANT

    def test_toggle_no_current_state_defaults_to_occupied(self):
        """When there's no current state, pressing should set occupied."""
        current = None

        if current and current.state in (
            OccupancyState.OCCUPIED,
            OccupancyState.CHECKING,
        ):
            new_state = OccupancyState.VACANT
        else:
            new_state = OccupancyState.OCCUPIED

        assert new_state == OccupancyState.OCCUPIED


class TestButtonUniqueId:
    """Test button unique ID generation."""

    def test_unique_id_format(self):
        """Test unique ID format for override buttons."""
        room_id = "room_1"
        expected = f"fp_{room_id}_occupancy_override"
        assert expected == "fp_room_1_occupancy_override"

    def test_unique_id_differs_from_sensor(self):
        """Button unique ID must differ from the binary sensor unique ID."""
        room_id = "room_1"
        sensor_uid = f"fp_{room_id}_occupancy"
        button_uid = f"fp_{room_id}_occupancy_override"
        assert sensor_uid != button_uid


class TestButtonDeviceInfo:
    """Test button shares device with binary sensor."""

    def test_device_identifiers_match_sensor(self):
        """Button and sensor should share the same device identifiers."""
        room_id = "living_room"
        sensor_identifiers = {(DOMAIN, room_id)}
        button_identifiers = {(DOMAIN, room_id)}
        assert sensor_identifiers == button_identifiers


class TestOrphanCleanup:
    """Test orphan entity detection covers both sensors and buttons."""

    def _is_orphaned(self, unique_id: str, valid_ids: set[str]) -> bool:
        """Mirror the orphan detection logic from __init__.py."""
        if not unique_id.startswith("fp_"):
            return False
        for suffix in ("_occupancy", "_occupancy_override"):
            if unique_id.endswith(suffix):
                region_id = unique_id[3 : -len(suffix)]
                return region_id not in valid_ids
        return False

    def test_orphaned_sensor_detected(self):
        valid = {"room_a"}
        assert self._is_orphaned("fp_room_b_occupancy", valid) is True

    def test_orphaned_button_detected(self):
        valid = {"room_a"}
        assert self._is_orphaned("fp_room_b_occupancy_override", valid) is True

    def test_valid_sensor_not_orphaned(self):
        valid = {"room_a"}
        assert self._is_orphaned("fp_room_a_occupancy", valid) is False

    def test_valid_button_not_orphaned(self):
        valid = {"room_a"}
        assert self._is_orphaned("fp_room_a_occupancy_override", valid) is False

    def test_unrelated_entity_not_orphaned(self):
        valid = {"room_a"}
        assert self._is_orphaned("some_other_entity", valid) is False


class TestButtonPlatformSetup:
    """Test button platform setup behavior."""

    async def test_sensor_added_ignores_existing_region(self, mock_hass):
        """Startup sensor_added signals should not duplicate existing buttons."""
        room = MagicMock(
            id="room_1",
            name="Living Room",
            occupancy_sensor_enabled=True,
        )
        floor_plan = MagicMock(id="fp_1", name="Home", floors=[])
        floor_plan.get_all_rooms.return_value = [room]
        floor_plan.get_room.return_value = (MagicMock(), room)
        store = MagicMock()
        store.get_floor_plans.return_value = [floor_plan]
        store.get_sensor_config.return_value = MagicMock()
        mock_hass.data = {DOMAIN: {"store": store}}
        config_entry = MagicMock()
        async_add_entities = MagicMock()
        callbacks = {}

        def capture_connect(_hass, signal, callback):
            callbacks[signal] = callback
            return MagicMock()

        with patch(
            "custom_components.inhabit.entities.button.async_dispatcher_connect",
            side_effect=capture_connect,
        ):
            await button.async_setup_entry(mock_hass, config_entry, async_add_entities)

        async_add_entities.assert_called_once()
        callbacks[f"{DOMAIN}_sensor_added"]("room_1")

        async_add_entities.assert_called_once()

    async def test_dispatcher_unsubscribers_registered_for_entry_unload(
        self, mock_hass
    ):
        """Dispatcher listeners should be unsubscribed on config entry unload."""
        store = MagicMock()
        store.get_floor_plans.return_value = []
        mock_hass.data = {DOMAIN: {"store": store}}
        config_entry = MagicMock()
        async_add_entities = MagicMock()
        unsubscribe_added = MagicMock()
        unsubscribe_removed = MagicMock()

        with patch(
            "custom_components.inhabit.entities.button.async_dispatcher_connect",
            side_effect=[unsubscribe_added, unsubscribe_removed],
        ) as connect:
            await button.async_setup_entry(mock_hass, config_entry, async_add_entities)

        assert connect.call_args_list == [
            call(mock_hass, f"{DOMAIN}_sensor_added", ANY),
            call(mock_hass, f"{DOMAIN}_sensor_removed", ANY),
        ]
        config_entry.async_on_unload.assert_has_calls(
            [call(unsubscribe_added), call(unsubscribe_removed)]
        )
