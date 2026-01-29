"""Unit tests for data migration."""
from __future__ import annotations

import pytest
from copy import deepcopy

from custom_components.inhabit.store.migration import migrate_data, _migrate_to_v2, MIGRATIONS


class TestMigration:
    """Test data migration utilities."""

    def test_same_version_returns_unchanged(self):
        """Test that same version returns data unchanged."""
        data = {"floor_plans": {"fp_1": {"name": "Test"}}}
        result = migrate_data(data, from_version=1, to_version=1)

        assert result == data

    def test_migrate_to_v2_adds_grid_size(self):
        """Test v1 to v2 migration adds grid_size."""
        data = {
            "floor_plans": {
                "fp_1": {
                    "name": "Test House",
                    "floors": [],
                }
            }
        }

        result = _migrate_to_v2(deepcopy(data))

        assert result["floor_plans"]["fp_1"]["grid_size"] == 10.0

    def test_migrate_to_v2_adds_unit(self):
        """Test v1 to v2 migration adds unit."""
        data = {
            "floor_plans": {
                "fp_1": {
                    "name": "Test House",
                    "floors": [],
                }
            }
        }

        result = _migrate_to_v2(deepcopy(data))

        assert result["floor_plans"]["fp_1"]["unit"] == "cm"

    def test_migrate_to_v2_adds_room_fields(self):
        """Test v1 to v2 migration adds room timeout fields."""
        data = {
            "floor_plans": {
                "fp_1": {
                    "name": "Test House",
                    "floors": [
                        {
                            "name": "Ground",
                            "rooms": [
                                {"id": "room_1", "name": "Living Room"}
                            ],
                        }
                    ],
                }
            }
        }

        result = _migrate_to_v2(deepcopy(data))

        room = result["floor_plans"]["fp_1"]["floors"][0]["rooms"][0]
        assert room["motion_timeout"] == 120
        assert room["checking_timeout"] == 30
        assert room["connected_rooms"] == []

    def test_migrate_to_v2_preserves_existing_values(self):
        """Test v1 to v2 migration preserves existing values."""
        data = {
            "floor_plans": {
                "fp_1": {
                    "name": "Test House",
                    "grid_size": 20.0,
                    "unit": "m",
                    "floors": [
                        {
                            "name": "Ground",
                            "rooms": [
                                {
                                    "id": "room_1",
                                    "name": "Living Room",
                                    "motion_timeout": 60,
                                    "checking_timeout": 15,
                                    "connected_rooms": ["room_2"],
                                }
                            ],
                        }
                    ],
                }
            }
        }

        result = _migrate_to_v2(deepcopy(data))

        # Existing values should be preserved
        assert result["floor_plans"]["fp_1"]["grid_size"] == 20.0
        assert result["floor_plans"]["fp_1"]["unit"] == "m"
        room = result["floor_plans"]["fp_1"]["floors"][0]["rooms"][0]
        assert room["motion_timeout"] == 60
        assert room["checking_timeout"] == 15
        assert room["connected_rooms"] == ["room_2"]

    def test_migrate_data_calls_migration_functions(self):
        """Test migrate_data calls correct migration functions."""
        data = {
            "floor_plans": {
                "fp_1": {
                    "name": "Test House",
                    "floors": [
                        {
                            "name": "Ground",
                            "rooms": [
                                {"id": "room_1", "name": "Living Room"}
                            ],
                        }
                    ],
                }
            }
        }

        result = migrate_data(deepcopy(data), from_version=1, to_version=2)

        # Should have applied v2 migration
        assert result["floor_plans"]["fp_1"]["grid_size"] == 10.0
        assert result["floor_plans"]["fp_1"]["unit"] == "cm"

    def test_migrate_data_handles_empty_floor_plans(self):
        """Test migration handles empty floor plans."""
        data = {"floor_plans": {}}

        result = migrate_data(deepcopy(data), from_version=1, to_version=2)

        assert result["floor_plans"] == {}

    def test_migrate_data_handles_missing_floors(self):
        """Test migration handles floor plan without floors."""
        data = {
            "floor_plans": {
                "fp_1": {
                    "name": "Test House",
                }
            }
        }

        result = migrate_data(deepcopy(data), from_version=1, to_version=2)

        # Should add grid_size and unit without error
        assert result["floor_plans"]["fp_1"]["grid_size"] == 10.0

    def test_migrate_data_handles_empty_rooms(self):
        """Test migration handles floor with no rooms."""
        data = {
            "floor_plans": {
                "fp_1": {
                    "name": "Test House",
                    "floors": [
                        {"name": "Ground"},
                    ],
                }
            }
        }

        result = migrate_data(deepcopy(data), from_version=1, to_version=2)

        # Should complete without error
        assert result["floor_plans"]["fp_1"]["grid_size"] == 10.0

    def test_migrations_dict_has_v2(self):
        """Test MIGRATIONS dict contains v2 migration."""
        assert 2 in MIGRATIONS
        assert MIGRATIONS[2] == _migrate_to_v2

    def test_migrate_multiple_floor_plans(self):
        """Test migration handles multiple floor plans."""
        data = {
            "floor_plans": {
                "fp_1": {
                    "name": "House 1",
                    "floors": [],
                },
                "fp_2": {
                    "name": "House 2",
                    "floors": [],
                },
            }
        }

        result = migrate_data(deepcopy(data), from_version=1, to_version=2)

        assert result["floor_plans"]["fp_1"]["grid_size"] == 10.0
        assert result["floor_plans"]["fp_2"]["grid_size"] == 10.0
        assert result["floor_plans"]["fp_1"]["unit"] == "cm"
        assert result["floor_plans"]["fp_2"]["unit"] == "cm"

    def test_migrate_multiple_floors_and_rooms(self):
        """Test migration handles multiple floors and rooms."""
        data = {
            "floor_plans": {
                "fp_1": {
                    "name": "Test House",
                    "floors": [
                        {
                            "name": "Ground",
                            "rooms": [
                                {"id": "room_1", "name": "Living Room"},
                                {"id": "room_2", "name": "Kitchen"},
                            ],
                        },
                        {
                            "name": "First",
                            "rooms": [
                                {"id": "room_3", "name": "Bedroom"},
                            ],
                        },
                    ],
                }
            }
        }

        result = migrate_data(deepcopy(data), from_version=1, to_version=2)

        # Check all rooms got new fields
        floor1_rooms = result["floor_plans"]["fp_1"]["floors"][0]["rooms"]
        floor2_rooms = result["floor_plans"]["fp_1"]["floors"][1]["rooms"]

        for room in floor1_rooms + floor2_rooms:
            assert "motion_timeout" in room
            assert "checking_timeout" in room
            assert "connected_rooms" in room
