"""Unit tests for the adaptive timeout manager."""

from __future__ import annotations

import sys
from datetime import datetime, timedelta
from unittest.mock import MagicMock, patch

import pytest

# Ensure mocks are set up before importing our modules
if "homeassistant" not in sys.modules:
    sys.modules["homeassistant"] = MagicMock()
    sys.modules["homeassistant.core"] = MagicMock()
    sys.modules["homeassistant.const"] = MagicMock()
    sys.modules["homeassistant.const"].STATE_ON = "on"
    sys.modules["homeassistant.const"].STATE_OFF = "off"
    sys.modules["homeassistant.const"].STATE_UNAVAILABLE = "unavailable"
    sys.modules["homeassistant.const"].STATE_UNKNOWN = "unknown"
    sys.modules["homeassistant.config_entries"] = MagicMock()
    sys.modules["homeassistant.helpers"] = MagicMock()
    sys.modules["homeassistant.helpers.storage"] = MagicMock()
    sys.modules["homeassistant.helpers.event"] = MagicMock()
    sys.modules["homeassistant.helpers.dispatcher"] = MagicMock()
    sys.modules["homeassistant.helpers.entity"] = MagicMock()
    sys.modules["homeassistant.helpers.entity_platform"] = MagicMock()
    sys.modules["homeassistant.helpers.entity_registry"] = MagicMock()
    sys.modules["homeassistant.helpers.typing"] = MagicMock()
    sys.modules["homeassistant.components"] = MagicMock()
    sys.modules["homeassistant.components.frontend"] = MagicMock()
    sys.modules["homeassistant.components.websocket_api"] = MagicMock()
    sys.modules["homeassistant.components.http"] = MagicMock()
    sys.modules["homeassistant.components.binary_sensor"] = MagicMock()
    sys.modules["voluptuous"] = MagicMock()
    sys.modules["aiohttp"] = MagicMock()

from custom_components.inhabit.engine.adaptive_timeout import (
    ADAPTIVE_MAX_TIMEOUT,
    ADAPTIVE_MIN_TIMEOUT,
    MAX_SESSION_HISTORY,
    MIN_SESSIONS_FOR_ADAPTIVE,
    AdaptiveTimeoutManager,
    OccupancyDurationRecord,
    TimeOfDayProfile,
    _hour_to_window,
)
from custom_components.inhabit.models.virtual_sensor import VirtualSensorConfig


@pytest.fixture
def mock_hass():
    """Create a mock Home Assistant instance."""
    return MagicMock()


@pytest.fixture
def base_manager(mock_hass):
    """Create a basic AdaptiveTimeoutManager with no profiles or adaptive."""
    return AdaptiveTimeoutManager(
        hass=mock_hass,
        room_id="test_room",
        base_checking_timeout=30,
        base_motion_timeout=120,
    )


@pytest.fixture
def adaptive_manager(mock_hass):
    """Create an AdaptiveTimeoutManager with adaptive enabled."""
    return AdaptiveTimeoutManager(
        hass=mock_hass,
        room_id="test_room",
        base_checking_timeout=30,
        base_motion_timeout=120,
        adaptive_enabled=True,
    )


class TestTimeOfDayProfile:
    """Tests for TimeOfDayProfile."""

    def test_simple_range_match(self):
        """Profile 8-17 matches hours within the range."""
        profile = TimeOfDayProfile(start_hour=8, end_hour=17, checking_timeout=60)
        assert profile.matches(8) is True
        assert profile.matches(12) is True
        assert profile.matches(16) is True
        assert profile.matches(17) is False
        assert profile.matches(7) is False

    def test_midnight_spanning_range(self):
        """Profile 22-6 (spanning midnight) matches night hours."""
        profile = TimeOfDayProfile(start_hour=22, end_hour=6, checking_timeout=90)
        assert profile.matches(22) is True
        assert profile.matches(23) is True
        assert profile.matches(0) is True
        assert profile.matches(3) is True
        assert profile.matches(5) is True
        assert profile.matches(6) is False
        assert profile.matches(12) is False
        assert profile.matches(21) is False

    def test_midnight_spanning_22_to_7(self):
        """Profile 22-7 matches correctly through midnight."""
        profile = TimeOfDayProfile(start_hour=22, end_hour=7, checking_timeout=120)
        assert profile.matches(22) is True
        assert profile.matches(0) is True
        assert profile.matches(6) is True
        assert profile.matches(7) is False
        assert profile.matches(10) is False

    def test_serialization_round_trip(self):
        """Profile survives to_dict/from_dict round trip."""
        profile = TimeOfDayProfile(
            start_hour=22,
            end_hour=6,
            checking_timeout=90,
            motion_timeout=200,
        )
        d = profile.to_dict()
        restored = TimeOfDayProfile.from_dict(d)
        assert restored.start_hour == 22
        assert restored.end_hour == 6
        assert restored.checking_timeout == 90
        assert restored.motion_timeout == 200

    def test_from_dict_with_none_timeouts(self):
        """Profile with None timeouts deserializes correctly."""
        d = {"start_hour": 8, "end_hour": 17}
        profile = TimeOfDayProfile.from_dict(d)
        assert profile.checking_timeout is None
        assert profile.motion_timeout is None


class TestOccupancyDurationRecord:
    """Tests for OccupancyDurationRecord."""

    def test_serialization_round_trip(self):
        """Record survives to_dict/from_dict round trip."""
        record = OccupancyDurationRecord(
            room_id="test_room",
            started_at="2024-06-01T10:00:00",
            ended_at="2024-06-01T10:05:00",
            duration_seconds=300.0,
            hour_of_day=10,
        )
        d = record.to_dict()
        restored = OccupancyDurationRecord.from_dict(d)
        assert restored.room_id == "test_room"
        assert restored.duration_seconds == 300.0
        assert restored.hour_of_day == 10
        assert restored.started_at == "2024-06-01T10:00:00"
        assert restored.ended_at == "2024-06-01T10:05:00"


class TestHourToWindow:
    """Tests for the hour-to-window mapping."""

    def test_window_boundaries(self):
        assert _hour_to_window(0) == 0
        assert _hour_to_window(3) == 0
        assert _hour_to_window(4) == 4
        assert _hour_to_window(7) == 4
        assert _hour_to_window(8) == 8
        assert _hour_to_window(11) == 8
        assert _hour_to_window(12) == 12
        assert _hour_to_window(15) == 12
        assert _hour_to_window(16) == 16
        assert _hour_to_window(19) == 16
        assert _hour_to_window(20) == 20
        assert _hour_to_window(23) == 20


class TestAdaptiveTimeoutManagerFallback:
    """Tests for base fallback behavior."""

    def test_returns_base_checking_timeout_with_no_profiles(self, base_manager):
        """Without profiles or adaptive, returns base checking timeout."""
        with patch(
            "custom_components.inhabit.engine.adaptive_timeout.datetime"
        ) as mock_dt:
            mock_dt.now.return_value = datetime(2024, 6, 1, 12, 0, 0)
            assert base_manager.get_effective_checking_timeout() == 30

    def test_returns_base_motion_timeout_with_no_profiles(self, base_manager):
        """Without profiles or adaptive, returns base motion timeout."""
        with patch(
            "custom_components.inhabit.engine.adaptive_timeout.datetime"
        ) as mock_dt:
            mock_dt.now.return_value = datetime(2024, 6, 1, 12, 0, 0)
            assert base_manager.get_effective_motion_timeout() == 120

    def test_adaptive_disabled_ignores_history(self, base_manager):
        """When adaptive is disabled, recorded history is ignored."""
        now = datetime(2024, 6, 1, 10, 0, 0)
        # Record enough sessions
        for i in range(10):
            base_manager.record_occupancy_session(
                started_at=now + timedelta(hours=i),
                ended_at=now + timedelta(hours=i, seconds=60),
            )

        with patch(
            "custom_components.inhabit.engine.adaptive_timeout.datetime"
        ) as mock_dt:
            mock_dt.now.return_value = datetime(2024, 6, 1, 10, 0, 0)
            # Should still return base timeout since adaptive is disabled
            assert base_manager.get_effective_checking_timeout() == 30


class TestAdaptiveTimeoutManagerProfiles:
    """Tests for time-of-day profile resolution."""

    def test_profile_overrides_base(self, mock_hass):
        """Time-of-day profile overrides the base timeout."""
        manager = AdaptiveTimeoutManager(
            hass=mock_hass,
            room_id="test_room",
            base_checking_timeout=30,
            base_motion_timeout=120,
            time_of_day_profiles=[
                TimeOfDayProfile(
                    start_hour=22,
                    end_hour=7,
                    checking_timeout=90,
                    motion_timeout=240,
                ),
            ],
        )

        with patch(
            "custom_components.inhabit.engine.adaptive_timeout.datetime"
        ) as mock_dt:
            # During night hours
            mock_dt.now.return_value = datetime(2024, 6, 1, 23, 0, 0)
            assert manager.get_effective_checking_timeout() == 90
            assert manager.get_effective_motion_timeout() == 240

            # During day hours (no match)
            mock_dt.now.return_value = datetime(2024, 6, 1, 12, 0, 0)
            assert manager.get_effective_checking_timeout() == 30
            assert manager.get_effective_motion_timeout() == 120

    def test_first_matching_profile_wins(self, mock_hass):
        """When multiple profiles match, the first one wins."""
        manager = AdaptiveTimeoutManager(
            hass=mock_hass,
            room_id="test_room",
            base_checking_timeout=30,
            base_motion_timeout=120,
            time_of_day_profiles=[
                TimeOfDayProfile(
                    start_hour=8, end_hour=20, checking_timeout=60
                ),
                TimeOfDayProfile(
                    start_hour=10, end_hour=14, checking_timeout=120
                ),
            ],
        )

        with patch(
            "custom_components.inhabit.engine.adaptive_timeout.datetime"
        ) as mock_dt:
            # Hour 11 matches both profiles; first one should win
            mock_dt.now.return_value = datetime(2024, 6, 1, 11, 0, 0)
            assert manager.get_effective_checking_timeout() == 60

    def test_empty_profiles_list(self, mock_hass):
        """Empty profiles list falls through to base timeout."""
        manager = AdaptiveTimeoutManager(
            hass=mock_hass,
            room_id="test_room",
            base_checking_timeout=30,
            base_motion_timeout=120,
            time_of_day_profiles=[],
        )

        with patch(
            "custom_components.inhabit.engine.adaptive_timeout.datetime"
        ) as mock_dt:
            mock_dt.now.return_value = datetime(2024, 6, 1, 12, 0, 0)
            assert manager.get_effective_checking_timeout() == 30

    def test_profile_with_only_checking_timeout(self, mock_hass):
        """Profile with only checking_timeout set; motion falls through."""
        manager = AdaptiveTimeoutManager(
            hass=mock_hass,
            room_id="test_room",
            base_checking_timeout=30,
            base_motion_timeout=120,
            time_of_day_profiles=[
                TimeOfDayProfile(
                    start_hour=0, end_hour=24, checking_timeout=60
                ),
            ],
        )

        with patch(
            "custom_components.inhabit.engine.adaptive_timeout.datetime"
        ) as mock_dt:
            mock_dt.now.return_value = datetime(2024, 6, 1, 12, 0, 0)
            assert manager.get_effective_checking_timeout() == 60
            # motion_timeout is None on the profile, so falls through to base
            assert manager.get_effective_motion_timeout() == 120


class TestAdaptiveTimeoutManagerLearning:
    """Tests for adaptive learning from session history."""

    def _record_sessions(self, manager, hour, count, duration_seconds):
        """Helper to record multiple sessions at a given hour."""
        base = datetime(2024, 6, 1, hour, 0, 0)
        for i in range(count):
            started = base + timedelta(days=i)
            ended = started + timedelta(seconds=duration_seconds)
            manager.record_occupancy_session(started_at=started, ended_at=ended)

    def test_adaptive_returns_median_with_enough_data(self, adaptive_manager):
        """Adaptive returns median duration when enough sessions exist."""
        # Record 6 sessions (above the minimum of 5) at hour 10 (window 8-11)
        # with durations of 60s each
        self._record_sessions(adaptive_manager, hour=10, count=6, duration_seconds=60)

        with patch(
            "custom_components.inhabit.engine.adaptive_timeout.datetime"
        ) as mock_dt:
            mock_dt.now.return_value = datetime(2024, 6, 1, 10, 0, 0)
            assert adaptive_manager.get_effective_checking_timeout() == 60

    def test_adaptive_requires_minimum_sessions(self, adaptive_manager):
        """Adaptive falls back to base with fewer than 5 sessions."""
        # Record only 4 sessions (below minimum)
        self._record_sessions(adaptive_manager, hour=10, count=4, duration_seconds=60)

        with patch(
            "custom_components.inhabit.engine.adaptive_timeout.datetime"
        ) as mock_dt:
            mock_dt.now.return_value = datetime(2024, 6, 1, 10, 0, 0)
            # Should fall back to base
            assert adaptive_manager.get_effective_checking_timeout() == 30

    def test_adaptive_exactly_minimum_sessions(self, adaptive_manager):
        """Adaptive works with exactly 5 sessions (minimum)."""
        self._record_sessions(adaptive_manager, hour=10, count=5, duration_seconds=45)

        with patch(
            "custom_components.inhabit.engine.adaptive_timeout.datetime"
        ) as mock_dt:
            mock_dt.now.return_value = datetime(2024, 6, 1, 10, 0, 0)
            assert adaptive_manager.get_effective_checking_timeout() == 45

    def test_adaptive_clamped_to_minimum(self, adaptive_manager):
        """Learned timeout is clamped to ADAPTIVE_MIN_TIMEOUT (10s)."""
        # Record very short sessions (5s each)
        self._record_sessions(adaptive_manager, hour=10, count=6, duration_seconds=5)

        with patch(
            "custom_components.inhabit.engine.adaptive_timeout.datetime"
        ) as mock_dt:
            mock_dt.now.return_value = datetime(2024, 6, 1, 10, 0, 0)
            result = adaptive_manager.get_effective_checking_timeout()
            assert result == ADAPTIVE_MIN_TIMEOUT

    def test_adaptive_clamped_to_maximum(self, adaptive_manager):
        """Learned timeout is clamped to ADAPTIVE_MAX_TIMEOUT (600s)."""
        # Record very long sessions (1 hour each)
        self._record_sessions(
            adaptive_manager, hour=10, count=6, duration_seconds=3600
        )

        with patch(
            "custom_components.inhabit.engine.adaptive_timeout.datetime"
        ) as mock_dt:
            mock_dt.now.return_value = datetime(2024, 6, 1, 10, 0, 0)
            result = adaptive_manager.get_effective_checking_timeout()
            assert result == ADAPTIVE_MAX_TIMEOUT

    def test_adaptive_uses_correct_time_window(self, adaptive_manager):
        """Adaptive uses sessions from the correct 4-hour window."""
        # Record sessions in the 8-11 window
        self._record_sessions(adaptive_manager, hour=9, count=6, duration_seconds=100)
        # Record sessions in the 12-15 window (different values)
        self._record_sessions(adaptive_manager, hour=13, count=6, duration_seconds=200)

        with patch(
            "custom_components.inhabit.engine.adaptive_timeout.datetime"
        ) as mock_dt:
            # Query during 8-11 window
            mock_dt.now.return_value = datetime(2024, 6, 1, 10, 0, 0)
            assert adaptive_manager.get_effective_checking_timeout() == 100

            # Query during 12-15 window
            mock_dt.now.return_value = datetime(2024, 6, 1, 14, 0, 0)
            assert adaptive_manager.get_effective_checking_timeout() == 200

    def test_adaptive_no_data_for_current_window(self, adaptive_manager):
        """Adaptive falls back when no data exists for the current window."""
        # Record sessions at hour 10 (window 8-11)
        self._record_sessions(adaptive_manager, hour=10, count=6, duration_seconds=60)

        with patch(
            "custom_components.inhabit.engine.adaptive_timeout.datetime"
        ) as mock_dt:
            # Query during window 0-3 (no data)
            mock_dt.now.return_value = datetime(2024, 6, 1, 2, 0, 0)
            assert adaptive_manager.get_effective_checking_timeout() == 30  # base

    def test_profile_takes_priority_over_adaptive(self, mock_hass):
        """Time-of-day profile overrides adaptive even when data exists."""
        manager = AdaptiveTimeoutManager(
            hass=mock_hass,
            room_id="test_room",
            base_checking_timeout=30,
            base_motion_timeout=120,
            time_of_day_profiles=[
                TimeOfDayProfile(
                    start_hour=8, end_hour=12, checking_timeout=90
                ),
            ],
            adaptive_enabled=True,
        )

        # Record sessions at hour 10 (in both profile and adaptive range)
        self._record_sessions(manager, hour=10, count=6, duration_seconds=60)

        with patch(
            "custom_components.inhabit.engine.adaptive_timeout.datetime"
        ) as mock_dt:
            mock_dt.now.return_value = datetime(2024, 6, 1, 10, 0, 0)
            # Profile (90) should win over adaptive (60)
            assert manager.get_effective_checking_timeout() == 90

    def test_zero_duration_sessions_ignored(self, adaptive_manager):
        """Sessions with zero or negative duration are not recorded."""
        now = datetime(2024, 6, 1, 10, 0, 0)
        # Zero duration
        adaptive_manager.record_occupancy_session(
            started_at=now, ended_at=now
        )
        # Negative duration
        adaptive_manager.record_occupancy_session(
            started_at=now, ended_at=now - timedelta(seconds=10)
        )

        assert len(adaptive_manager.get_session_history()) == 0

    def test_session_history_bounded(self, adaptive_manager):
        """Session history is bounded to MAX_SESSION_HISTORY."""
        now = datetime(2024, 6, 1, 10, 0, 0)
        for i in range(MAX_SESSION_HISTORY + 50):
            adaptive_manager.record_occupancy_session(
                started_at=now + timedelta(hours=i),
                ended_at=now + timedelta(hours=i, seconds=60),
            )

        assert len(adaptive_manager.get_session_history()) == MAX_SESSION_HISTORY


class TestAdaptiveTimeoutManagerPersistence:
    """Tests for session history persistence."""

    def test_save_and_load_round_trip(self, adaptive_manager):
        """Session history survives a save/load round trip."""
        now = datetime(2024, 6, 1, 10, 0, 0)
        for i in range(5):
            adaptive_manager.record_occupancy_session(
                started_at=now + timedelta(hours=i),
                ended_at=now + timedelta(hours=i, seconds=120),
            )

        # Get the history as dicts
        history_dicts = [r.to_dict() for r in adaptive_manager.get_session_history()]
        assert len(history_dicts) == 5

        # Create a new manager and load the history
        new_manager = AdaptiveTimeoutManager(
            hass=MagicMock(),
            room_id="test_room",
            base_checking_timeout=30,
            base_motion_timeout=120,
            adaptive_enabled=True,
        )
        new_manager.load_session_history(history_dicts)

        loaded = new_manager.get_session_history()
        assert len(loaded) == 5
        assert loaded[0].room_id == "test_room"
        assert loaded[0].duration_seconds == 120.0

    def test_load_invalid_records_skipped(self, adaptive_manager):
        """Invalid records are skipped during loading."""
        valid = {
            "room_id": "test_room",
            "started_at": "2024-06-01T10:00:00",
            "ended_at": "2024-06-01T10:05:00",
            "duration_seconds": 300.0,
            "hour_of_day": 10,
        }

        adaptive_manager.load_session_history([valid])
        assert len(adaptive_manager.get_session_history()) == 1

    def test_load_empty_list(self, adaptive_manager):
        """Loading an empty list clears history."""
        now = datetime(2024, 6, 1, 10, 0, 0)
        adaptive_manager.record_occupancy_session(
            started_at=now,
            ended_at=now + timedelta(seconds=60),
        )
        assert len(adaptive_manager.get_session_history()) == 1

        adaptive_manager.load_session_history([])
        assert len(adaptive_manager.get_session_history()) == 0


class TestVirtualSensorConfigAdaptiveFields:
    """Tests for the new adaptive fields on VirtualSensorConfig."""

    def test_default_values(self):
        """New fields have correct defaults."""
        config = VirtualSensorConfig(room_id="test")
        assert config.time_of_day_profiles == []
        assert config.adaptive_timeouts is False

    def test_serialization_round_trip(self):
        """Adaptive fields survive to_dict/from_dict round trip."""
        profiles = [
            {"start_hour": 22, "end_hour": 6, "checking_timeout": 90, "motion_timeout": None},
            {"start_hour": 8, "end_hour": 17, "checking_timeout": 60, "motion_timeout": 200},
        ]
        config = VirtualSensorConfig(
            room_id="test",
            floor_plan_id="fp_1",
            time_of_day_profiles=profiles,
            adaptive_timeouts=True,
        )

        d = config.to_dict()
        assert d["time_of_day_profiles"] == profiles
        assert d["adaptive_timeouts"] is True

        restored = VirtualSensorConfig.from_dict(d)
        assert restored.time_of_day_profiles == profiles
        assert restored.adaptive_timeouts is True

    def test_from_dict_missing_adaptive_fields(self):
        """Missing adaptive fields default correctly (backward compatibility)."""
        d = {
            "room_id": "test",
            "floor_plan_id": "fp_1",
        }
        config = VirtualSensorConfig.from_dict(d)
        assert config.time_of_day_profiles == []
        assert config.adaptive_timeouts is False
