"""Tests for the standalone logic simulator web server."""

from __future__ import annotations

import pytest

from custom_components.inhabit.const import OccupancyState
from tools.logic_simulator.server import LogicSimulatorError, run_request_payload


def test_standalone_server_runs_named_preset():
    """The standalone server routes presets into the real simulator engine."""
    result = run_request_payload({"preset": "door_left_open_shower_then_close"})

    assert result["ok"] is True
    assert result["final"]["short_stay"]["state"] == OccupancyState.OCCUPIED
    assert result["final"]["short_stay"]["sealed"] is True


def test_standalone_server_requires_actions_or_preset():
    """Standalone requests must identify the scenario to run."""
    with pytest.raises(LogicSimulatorError, match="actions or a preset"):
        run_request_payload({})


def test_standalone_server_rejects_non_list_actions():
    """The standalone server validates action payload shape before running."""
    with pytest.raises(LogicSimulatorError, match="actions must be a list"):
        run_request_payload({"actions": {"type": "wait", "seconds": 1}})
