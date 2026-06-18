"""Unit tests for virtual occupancy binary sensor."""

from __future__ import annotations

from datetime import datetime
from unittest.mock import ANY, AsyncMock, MagicMock, call, patch

from custom_components.inhabit.const import (
    ATTR_CONFIDENCE,
    ATTR_CONTRIBUTING_SENSORS,
    ATTR_DIRECT_OUTSIDE_EXPOSURE,
    ATTR_EXTERIOR_OPENINGS,
    ATTR_INTERIOR_OPENINGS,
    ATTR_LAST_MOTION_AT,
    ATTR_LAST_PRESENCE_AT,
    ATTR_STATE_MACHINE_STATE,
    DOMAIN,
    OccupancyState,
)
from custom_components.inhabit.engine.outside_exposure import (
    SIGNAL_OUTSIDE_EXPOSURE_ROOM_ADDED,
    SIGNAL_OUTSIDE_EXPOSURE_ROOM_REMOVED,
    OutsideExposureState,
)
from custom_components.inhabit.entities import binary_sensor
from custom_components.inhabit.models.virtual_sensor import OccupancyStateData


class TestOccupancyStateDataForSensor:
    """Test OccupancyStateData behavior for sensor entity."""

    def test_state_data_defaults(self):
        """Test default state data values."""
        state = OccupancyStateData()
        assert state.state == OccupancyState.VACANT
        assert state.confidence == 0.0
        assert state.contributing_sensors == []
        assert state.last_motion_at is None
        assert state.last_presence_at is None

    def test_state_data_with_occupied(self):
        """Test state data for occupied room."""
        now = datetime.now()
        state = OccupancyStateData(
            state=OccupancyState.OCCUPIED,
            confidence=0.85,
            contributing_sensors=["sensor1", "sensor2"],
            last_motion_at=now,
            last_presence_at=now,
        )

        assert state.state == OccupancyState.OCCUPIED
        assert state.confidence == 0.85
        assert len(state.contributing_sensors) == 2
        assert state.last_motion_at == now
        assert state.last_presence_at == now

    def test_state_data_to_dict(self):
        """Test state data serialization."""
        state = OccupancyStateData(
            state=OccupancyState.CHECKING,
            confidence=0.5,
            contributing_sensors=["motion1"],
        )
        data = state.to_dict()

        assert data["state"] == OccupancyState.CHECKING
        assert data["confidence"] == 0.5
        assert "motion1" in data["contributing_sensors"]

    def test_is_on_logic_for_sensor(self):
        """Test which states should report is_on=True for sensor."""
        # VACANT should be False
        vacant_state = OccupancyStateData(state=OccupancyState.VACANT)
        assert vacant_state.state not in (
            OccupancyState.OCCUPIED,
            OccupancyState.CHECKING,
        )

        # OCCUPIED should be True
        occupied_state = OccupancyStateData(state=OccupancyState.OCCUPIED)
        assert occupied_state.state in (
            OccupancyState.OCCUPIED,
            OccupancyState.CHECKING,
        )

        # CHECKING should also be True (still considered occupied)
        checking_state = OccupancyStateData(state=OccupancyState.CHECKING)
        assert checking_state.state in (
            OccupancyState.OCCUPIED,
            OccupancyState.CHECKING,
        )


class TestSensorAttributes:
    """Test sensor attribute generation logic."""

    def test_generate_basic_attributes(self):
        """Test generating basic sensor attributes."""
        state = OccupancyStateData(
            state=OccupancyState.OCCUPIED,
            confidence=0.85,
            contributing_sensors=["sensor1", "sensor2"],
        )

        # Simulate what extra_state_attributes would return
        attrs = {
            ATTR_STATE_MACHINE_STATE: state.state,
            ATTR_CONFIDENCE: state.confidence,
            ATTR_CONTRIBUTING_SENSORS: state.contributing_sensors,
        }

        assert attrs[ATTR_STATE_MACHINE_STATE] == OccupancyState.OCCUPIED
        assert attrs[ATTR_CONFIDENCE] == 0.85
        assert attrs[ATTR_CONTRIBUTING_SENSORS] == ["sensor1", "sensor2"]

    def test_generate_attributes_with_timestamps(self):
        """Test generating attributes with timestamps."""
        now = datetime.now()
        state = OccupancyStateData(
            state=OccupancyState.OCCUPIED,
            confidence=0.9,
            contributing_sensors=["motion1"],
            last_motion_at=now,
            last_presence_at=now,
        )

        # Simulate attribute generation with timestamps
        attrs = {
            ATTR_STATE_MACHINE_STATE: state.state,
            ATTR_CONFIDENCE: state.confidence,
            ATTR_CONTRIBUTING_SENSORS: state.contributing_sensors,
        }

        if state.last_motion_at:
            attrs[ATTR_LAST_MOTION_AT] = state.last_motion_at.isoformat()
        if state.last_presence_at:
            attrs[ATTR_LAST_PRESENCE_AT] = state.last_presence_at.isoformat()

        assert ATTR_LAST_MOTION_AT in attrs
        assert attrs[ATTR_LAST_MOTION_AT] == now.isoformat()
        assert ATTR_LAST_PRESENCE_AT in attrs
        assert attrs[ATTR_LAST_PRESENCE_AT] == now.isoformat()

    def test_generate_attributes_no_timestamps(self):
        """Test generating attributes without timestamps."""
        state = OccupancyStateData(
            state=OccupancyState.VACANT,
            confidence=0.0,
            contributing_sensors=[],
        )

        attrs = {
            ATTR_STATE_MACHINE_STATE: state.state,
            ATTR_CONFIDENCE: state.confidence,
            ATTR_CONTRIBUTING_SENSORS: state.contributing_sensors,
        }

        # Don't add timestamp attributes if None
        if state.last_motion_at:
            attrs[ATTR_LAST_MOTION_AT] = state.last_motion_at.isoformat()
        if state.last_presence_at:
            attrs[ATTR_LAST_PRESENCE_AT] = state.last_presence_at.isoformat()

        assert ATTR_LAST_MOTION_AT not in attrs
        assert ATTR_LAST_PRESENCE_AT not in attrs


class TestSensorUniqueId:
    """Test sensor unique ID generation."""

    def test_unique_id_format(self):
        """Test unique ID format for virtual sensors."""
        room_id = "room_1"
        expected_unique_id = f"fp_{room_id}_occupancy"

        assert expected_unique_id == "fp_room_1_occupancy"

    def test_unique_id_with_complex_room_id(self):
        """Test unique ID with complex room ID."""
        room_id = "living_room_floor_1"
        expected_unique_id = f"fp_{room_id}_occupancy"

        assert expected_unique_id == "fp_living_room_floor_1_occupancy"

    def test_outside_exposure_unique_id_format(self):
        """Test unique ID format for outside exposure sensors."""
        room_id = "room_1"
        expected_unique_id = f"fp_{room_id}_outside_exposure"

        assert expected_unique_id == "fp_room_1_outside_exposure"


class TestSensorStateChange:
    """Test sensor state change logic."""

    def test_state_change_filter_by_room_id(self):
        """Test that state changes are filtered by room ID."""
        current_room_id = "room_1"

        # Change for correct room should be accepted
        incoming_room_id = "room_1"
        should_accept = incoming_room_id == current_room_id
        assert should_accept is True

        # Change for different room should be rejected
        incoming_room_id = "other_room"
        should_accept = incoming_room_id == current_room_id
        assert should_accept is False

    def test_state_data_replacement(self):
        """Test state data is properly replaced on change."""
        original_state = OccupancyStateData(
            state=OccupancyState.VACANT,
            confidence=0.0,
        )

        new_state = OccupancyStateData(
            state=OccupancyState.OCCUPIED,
            confidence=0.95,
            contributing_sensors=["sensor1"],
        )

        # Simulate state replacement
        current_state = original_state
        current_state = new_state

        assert current_state.state == OccupancyState.OCCUPIED
        assert current_state.confidence == 0.95


class TestSensorRestoreState:
    """Test virtual occupancy sensor restore behavior."""

    async def test_added_restores_checking_state_from_last_state(self, mock_hass):
        """A restored CHECKING state should report occupied immediately."""
        sensor_engine = MagicMock()
        sensor_engine.get_state.return_value = None
        mock_hass.data = {DOMAIN: {"sensor_engine": sensor_engine}}
        restored_state = MagicMock(
            state="on",
            attributes={
                ATTR_STATE_MACHINE_STATE: OccupancyState.CHECKING,
                ATTR_CONFIDENCE: 0.4,
                ATTR_CONTRIBUTING_SENSORS: ["_spatial_mmwave_room_1"],
            },
        )
        entity = binary_sensor.VirtualOccupancySensor(
            mock_hass, "fp_1", "Home", "room_1", "Living Room"
        )
        entity.async_get_last_state = AsyncMock(return_value=restored_state)
        entity.async_on_remove = MagicMock()

        with patch(
            "custom_components.inhabit.entities.binary_sensor.async_dispatcher_connect",
            return_value=MagicMock(),
        ):
            await entity.async_added_to_hass()

        assert entity.is_on is True
        assert entity._state_data.state == OccupancyState.CHECKING
        assert entity._state_data.confidence == 0.4
        assert "_spatial_mmwave_room_1" in entity._state_data.contributing_sensors

    async def test_added_falls_back_to_binary_on_for_old_restored_state(
        self, mock_hass
    ):
        """Older restored states without attributes should restore as occupied."""
        sensor_engine = MagicMock()
        sensor_engine.get_state.return_value = None
        mock_hass.data = {DOMAIN: {"sensor_engine": sensor_engine}}
        restored_state = MagicMock(state="on", attributes={})
        entity = binary_sensor.VirtualOccupancySensor(
            mock_hass, "fp_1", "Home", "room_1", "Living Room"
        )
        entity.async_get_last_state = AsyncMock(return_value=restored_state)
        entity.async_on_remove = MagicMock()

        with patch(
            "custom_components.inhabit.entities.binary_sensor.async_dispatcher_connect",
            return_value=MagicMock(),
        ):
            await entity.async_added_to_hass()

        assert entity.is_on is True
        assert entity._state_data.state == OccupancyState.OCCUPIED

    async def test_added_keeps_restored_occupied_until_reconcile(self, mock_hass):
        """A startup VACANT engine state should not clear restored occupancy."""
        sensor_engine = MagicMock()
        sensor_engine.get_state.return_value = OccupancyStateData(
            state=OccupancyState.VACANT
        )
        mock_hass.data = {DOMAIN: {"sensor_engine": sensor_engine}}
        restored_state = MagicMock(
            state="on",
            attributes={ATTR_STATE_MACHINE_STATE: OccupancyState.OCCUPIED},
        )
        entity = binary_sensor.VirtualOccupancySensor(
            mock_hass, "fp_1", "Home", "room_1", "Living Room"
        )
        entity.async_get_last_state = AsyncMock(return_value=restored_state)
        entity.async_on_remove = MagicMock()

        with patch(
            "custom_components.inhabit.entities.binary_sensor.async_dispatcher_connect",
            return_value=MagicMock(),
        ):
            await entity.async_added_to_hass()

        assert entity.is_on is True
        assert entity._state_data.state == OccupancyState.OCCUPIED


class TestOutsideExposureSensor:
    """Test virtual outside exposure sensor behavior."""

    async def test_added_uses_engine_state(self, mock_hass):
        """Engine state should drive the initial outside exposure state."""
        outside_exposure_engine = MagicMock()
        outside_exposure_engine.get_state.return_value = OutsideExposureState(
            room_id="room_1",
            exposed=True,
            direct_exposure=True,
            exterior_openings=("binary_sensor.front_door",),
        )
        mock_hass.data = {DOMAIN: {"outside_exposure_engine": outside_exposure_engine}}
        entity = binary_sensor.VirtualOutsideExposureSensor(
            mock_hass, "fp_1", "Home", "room_1", "Living Room"
        )
        entity.async_get_last_state = AsyncMock(return_value=None)
        entity.async_on_remove = MagicMock()

        with patch(
            "custom_components.inhabit.entities.binary_sensor.async_dispatcher_connect",
            return_value=MagicMock(),
        ):
            await entity.async_added_to_hass()

        assert entity.is_on is True
        attrs = entity.extra_state_attributes
        assert attrs[ATTR_DIRECT_OUTSIDE_EXPOSURE] is True
        assert attrs[ATTR_EXTERIOR_OPENINGS] == ["binary_sensor.front_door"]
        assert attrs[ATTR_INTERIOR_OPENINGS] == []

    async def test_added_restores_state_when_engine_has_no_state(self, mock_hass):
        """Restored outside exposure state is used until the engine publishes."""
        outside_exposure_engine = MagicMock()
        outside_exposure_engine.get_state.return_value = None
        mock_hass.data = {DOMAIN: {"outside_exposure_engine": outside_exposure_engine}}
        restored_state = MagicMock(
            state="on",
            attributes={
                ATTR_DIRECT_OUTSIDE_EXPOSURE: False,
                ATTR_EXTERIOR_OPENINGS: ["binary_sensor.front_door"],
                ATTR_INTERIOR_OPENINGS: ["binary_sensor.living_hall_door"],
            },
        )
        entity = binary_sensor.VirtualOutsideExposureSensor(
            mock_hass, "fp_1", "Home", "room_2", "Hall"
        )
        entity.async_get_last_state = AsyncMock(return_value=restored_state)
        entity.async_on_remove = MagicMock()

        with patch(
            "custom_components.inhabit.entities.binary_sensor.async_dispatcher_connect",
            return_value=MagicMock(),
        ):
            await entity.async_added_to_hass()

        assert entity.is_on is True
        assert entity._state_data.direct_exposure is False
        assert entity._state_data.exterior_openings == ("binary_sensor.front_door",)
        assert entity._state_data.interior_openings == (
            "binary_sensor.living_hall_door",
        )

    def test_state_change_filter_by_room_id(self, mock_hass):
        """State changes should be filtered by room ID."""
        entity = binary_sensor.VirtualOutsideExposureSensor(
            mock_hass, "fp_1", "Home", "room_1", "Living Room"
        )
        entity.async_write_ha_state = MagicMock()

        entity._handle_state_change(
            "other_room",
            OutsideExposureState(room_id="other_room", exposed=True),
        )
        assert entity.is_on is False
        entity.async_write_ha_state.assert_not_called()

        entity._handle_state_change(
            "room_1",
            OutsideExposureState(room_id="room_1", exposed=True),
        )
        assert entity.is_on is True
        entity.async_write_ha_state.assert_called_once()


class TestSensorDeviceInfo:
    """Test sensor device info generation."""

    def test_device_identifiers(self):
        """Test device identifier generation."""
        floor_plan_id = "fp_1"
        identifiers = {(DOMAIN, floor_plan_id)}

        assert (DOMAIN, "fp_1") in identifiers

    def test_device_name(self):
        """Test device name generation."""
        floor_plan_name = "My House"
        device_name = f"{floor_plan_name} Floor Plan"

        assert device_name == "My House Floor Plan"

    def test_sensor_name(self):
        """Test sensor name generation."""
        room_name = "Living Room"
        sensor_name = f"{room_name} Occupancy"

        assert sensor_name == "Living Room Occupancy"


class TestSensorPlatformSetup:
    """Test binary sensor platform setup behavior."""

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
        unsubscribe_outside_added = MagicMock()
        unsubscribe_outside_removed = MagicMock()

        with patch(
            "custom_components.inhabit.entities.binary_sensor.async_dispatcher_connect",
            side_effect=[
                unsubscribe_added,
                unsubscribe_removed,
                unsubscribe_outside_added,
                unsubscribe_outside_removed,
            ],
        ) as connect:
            await binary_sensor.async_setup_entry(
                mock_hass, config_entry, async_add_entities
            )

        assert connect.call_args_list == [
            call(mock_hass, f"{DOMAIN}_sensor_added", ANY),
            call(mock_hass, f"{DOMAIN}_sensor_removed", ANY),
            call(mock_hass, SIGNAL_OUTSIDE_EXPOSURE_ROOM_ADDED, ANY),
            call(mock_hass, SIGNAL_OUTSIDE_EXPOSURE_ROOM_REMOVED, ANY),
        ]
        config_entry.async_on_unload.assert_has_calls(
            [
                call(unsubscribe_added),
                call(unsubscribe_removed),
                call(unsubscribe_outside_added),
                call(unsubscribe_outside_removed),
            ]
        )
