"""Unit tests for config flow."""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock

import pytest
import voluptuous as vol
from homeassistant.data_entry_flow import AbortFlow, FlowResultType

from custom_components.inhabit.config_flow import InhabitConfigFlow, InhabitOptionsFlow
from custom_components.inhabit.const import DOMAIN

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _make_config_flow(**overrides) -> InhabitConfigFlow:
    """Create an InhabitConfigFlow with mocked HA infrastructure."""
    flow = InhabitConfigFlow()
    flow.async_set_unique_id = AsyncMock(return_value=None)
    flow._abort_if_unique_id_configured = MagicMock()
    flow.async_show_form = MagicMock(
        return_value={"type": FlowResultType.FORM, "step_id": "user"}
    )
    flow.async_create_entry = MagicMock(
        return_value={
            "type": FlowResultType.CREATE_ENTRY,
            "title": "Inhabit Floor Plan Builder",
            "data": {},
        }
    )
    for k, v in overrides.items():
        setattr(flow, k, v)
    return flow


def _make_options_flow(options: dict | None = None) -> InhabitOptionsFlow:
    """Create an InhabitOptionsFlow with a mock config entry."""
    entry = MagicMock()
    entry.options = options or {}
    return InhabitOptionsFlow(entry)


async def _extract_schema(flow: InhabitOptionsFlow) -> vol.Schema:
    """Call async_step_init(None) and return the data_schema passed to async_show_form."""
    flow.async_show_form = MagicMock(
        return_value={"type": FlowResultType.FORM, "step_id": "init"}
    )
    await flow.async_step_init(user_input=None)
    return flow.async_show_form.call_args.kwargs["data_schema"]


# ---------------------------------------------------------------------------
# InhabitConfigFlow
# ---------------------------------------------------------------------------


class TestConfigFlow:
    """Test the user-facing config flow."""

    @pytest.mark.asyncio
    async def test_step_user_shows_form_on_first_call(self):
        """First call without user_input should present a confirmation form."""
        flow = _make_config_flow()

        result = await flow.async_step_user(user_input=None)

        assert result["type"] == FlowResultType.FORM
        assert result["step_id"] == "user"
        flow.async_show_form.assert_called_once()

    @pytest.mark.asyncio
    async def test_step_user_creates_entry_with_correct_title(self):
        """Submitting the form should create an entry titled 'Inhabit Floor Plan Builder'."""
        flow = _make_config_flow()

        result = await flow.async_step_user(user_input={})

        assert result["type"] == FlowResultType.CREATE_ENTRY
        assert result["title"] == "Inhabit Floor Plan Builder"
        flow.async_create_entry.assert_called_once_with(
            title="Inhabit Floor Plan Builder",
            data={},
        )

    @pytest.mark.asyncio
    async def test_step_user_creates_entry_with_empty_data(self):
        """The created entry should carry an empty data dict (no config needed)."""
        flow = _make_config_flow()

        await flow.async_step_user(user_input={})

        _, kwargs = flow.async_create_entry.call_args
        assert kwargs["data"] == {}

    @pytest.mark.asyncio
    async def test_step_user_sets_unique_id_to_domain(self):
        """async_set_unique_id should be called with the DOMAIN constant."""
        flow = _make_config_flow()

        await flow.async_step_user(user_input=None)

        flow.async_set_unique_id.assert_called_once_with(DOMAIN)

    @pytest.mark.asyncio
    async def test_step_user_aborts_if_already_configured(self):
        """A second instance should be blocked by _abort_if_unique_id_configured."""
        flow = _make_config_flow()
        flow._abort_if_unique_id_configured = MagicMock(
            side_effect=AbortFlow("already_configured")
        )

        with pytest.raises(AbortFlow) as exc_info:
            await flow.async_step_user(user_input=None)

        assert exc_info.value.reason == "already_configured"

    @pytest.mark.asyncio
    async def test_step_user_checks_unique_id_before_creating_entry(self):
        """Unique-id guard must run even when user_input is provided."""
        flow = _make_config_flow()
        flow._abort_if_unique_id_configured = MagicMock(
            side_effect=AbortFlow("already_configured")
        )
        flow.async_create_entry = MagicMock()

        with pytest.raises(AbortFlow):
            await flow.async_step_user(user_input={})

        flow.async_create_entry.assert_not_called()

    def test_version_is_1(self):
        """Config flow version should be 1."""
        assert InhabitConfigFlow.VERSION == 1

    def test_async_get_options_flow_returns_options_flow(self):
        """The factory should return an InhabitOptionsFlow bound to the entry."""
        entry = MagicMock()
        options_flow = InhabitConfigFlow.async_get_options_flow(entry)

        assert isinstance(options_flow, InhabitOptionsFlow)
        assert options_flow.config_entry is entry


# ---------------------------------------------------------------------------
# InhabitOptionsFlow
# ---------------------------------------------------------------------------


class TestOptionsFlow:
    """Test the options flow and its voluptuous schema."""

    @pytest.mark.asyncio
    async def test_init_shows_form_without_user_input(self):
        """First call should present the options form."""
        flow = _make_options_flow()
        flow.async_show_form = MagicMock(
            return_value={"type": FlowResultType.FORM, "step_id": "init"}
        )

        result = await flow.async_step_init(user_input=None)

        assert result["type"] == FlowResultType.FORM
        flow.async_show_form.assert_called_once()

    @pytest.mark.asyncio
    async def test_init_creates_entry_with_user_input(self):
        """Submitting options should create an entry with the provided data."""
        user_data = {
            "default_motion_timeout": 180,
            "default_checking_timeout": 45,
            "default_grid_size": 20,
        }
        flow = _make_options_flow()
        flow.async_create_entry = MagicMock(
            return_value={"type": FlowResultType.CREATE_ENTRY, "data": user_data}
        )

        result = await flow.async_step_init(user_input=user_data)

        assert result["type"] == FlowResultType.CREATE_ENTRY
        flow.async_create_entry.assert_called_once_with(title="", data=user_data)

    @pytest.mark.asyncio
    async def test_init_passes_user_input_through_to_entry(self):
        """The options flow should forward user_input as-is to the entry data."""
        custom = {"default_motion_timeout": 300}
        flow = _make_options_flow()
        flow.async_create_entry = MagicMock(return_value={})

        await flow.async_step_init(user_input=custom)

        _, kwargs = flow.async_create_entry.call_args
        assert kwargs["data"] == custom

    # -- Schema defaults ---------------------------------------------------

    @pytest.mark.asyncio
    async def test_schema_uses_fallback_defaults_when_no_options(self):
        """With an empty options dict the schema defaults should be 120 / 30 / 10."""
        schema = await _extract_schema(_make_options_flow(options={}))

        defaults = {str(k): k.default() for k in schema.schema}
        assert defaults["default_motion_timeout"] == 120
        assert defaults["default_checking_timeout"] == 30
        assert defaults["default_grid_size"] == 10

    @pytest.mark.asyncio
    async def test_schema_uses_existing_options_as_defaults(self):
        """Existing entry options should be reflected as schema defaults."""
        existing = {
            "default_motion_timeout": 200,
            "default_checking_timeout": 50,
            "default_grid_size": 15,
        }
        schema = await _extract_schema(_make_options_flow(options=existing))

        defaults = {str(k): k.default() for k in schema.schema}
        assert defaults["default_motion_timeout"] == 200
        assert defaults["default_checking_timeout"] == 50
        assert defaults["default_grid_size"] == 15

    # -- Schema validation: motion_timeout (10-600) ------------------------

    @pytest.mark.asyncio
    async def test_schema_accepts_motion_timeout_at_minimum(self):
        schema = await _extract_schema(_make_options_flow())
        result = schema({"default_motion_timeout": 10})
        assert result["default_motion_timeout"] == 10

    @pytest.mark.asyncio
    async def test_schema_accepts_motion_timeout_at_maximum(self):
        schema = await _extract_schema(_make_options_flow())
        result = schema({"default_motion_timeout": 600})
        assert result["default_motion_timeout"] == 600

    @pytest.mark.asyncio
    async def test_schema_rejects_motion_timeout_below_minimum(self):
        schema = await _extract_schema(_make_options_flow())
        with pytest.raises(vol.Invalid):
            schema({"default_motion_timeout": 9})

    @pytest.mark.asyncio
    async def test_schema_rejects_motion_timeout_above_maximum(self):
        schema = await _extract_schema(_make_options_flow())
        with pytest.raises(vol.Invalid):
            schema({"default_motion_timeout": 601})

    # -- Schema validation: checking_timeout (5-120) -----------------------

    @pytest.mark.asyncio
    async def test_schema_accepts_checking_timeout_at_minimum(self):
        schema = await _extract_schema(_make_options_flow())
        result = schema({"default_checking_timeout": 5})
        assert result["default_checking_timeout"] == 5

    @pytest.mark.asyncio
    async def test_schema_accepts_checking_timeout_at_maximum(self):
        schema = await _extract_schema(_make_options_flow())
        result = schema({"default_checking_timeout": 120})
        assert result["default_checking_timeout"] == 120

    @pytest.mark.asyncio
    async def test_schema_rejects_checking_timeout_below_minimum(self):
        schema = await _extract_schema(_make_options_flow())
        with pytest.raises(vol.Invalid):
            schema({"default_checking_timeout": 4})

    @pytest.mark.asyncio
    async def test_schema_rejects_checking_timeout_above_maximum(self):
        schema = await _extract_schema(_make_options_flow())
        with pytest.raises(vol.Invalid):
            schema({"default_checking_timeout": 121})

    # -- Schema validation: grid_size (1-100) ------------------------------

    @pytest.mark.asyncio
    async def test_schema_accepts_grid_size_at_minimum(self):
        schema = await _extract_schema(_make_options_flow())
        result = schema({"default_grid_size": 1})
        assert result["default_grid_size"] == 1

    @pytest.mark.asyncio
    async def test_schema_accepts_grid_size_at_maximum(self):
        schema = await _extract_schema(_make_options_flow())
        result = schema({"default_grid_size": 100})
        assert result["default_grid_size"] == 100

    @pytest.mark.asyncio
    async def test_schema_rejects_grid_size_below_minimum(self):
        schema = await _extract_schema(_make_options_flow())
        with pytest.raises(vol.Invalid):
            schema({"default_grid_size": 0})

    @pytest.mark.asyncio
    async def test_schema_rejects_grid_size_above_maximum(self):
        schema = await _extract_schema(_make_options_flow())
        with pytest.raises(vol.Invalid):
            schema({"default_grid_size": 101})

    # -- Schema validation: type coercion ----------------------------------

    @pytest.mark.asyncio
    async def test_schema_coerces_string_to_int(self):
        """String values should be coerced to integers."""
        schema = await _extract_schema(_make_options_flow())
        result = schema({"default_motion_timeout": "120"})
        assert result["default_motion_timeout"] == 120
        assert isinstance(result["default_motion_timeout"], int)

    @pytest.mark.asyncio
    async def test_schema_rejects_non_numeric_string(self):
        """Non-numeric strings should be rejected."""
        schema = await _extract_schema(_make_options_flow())
        with pytest.raises(vol.Invalid):
            schema({"default_motion_timeout": "abc"})

    # -- Schema validation: all fields together ----------------------------

    @pytest.mark.asyncio
    async def test_schema_accepts_all_valid_options(self):
        """All three fields with valid values should pass."""
        schema = await _extract_schema(_make_options_flow())
        result = schema(
            {
                "default_motion_timeout": 180,
                "default_checking_timeout": 45,
                "default_grid_size": 20,
            }
        )
        assert result == {
            "default_motion_timeout": 180,
            "default_checking_timeout": 45,
            "default_grid_size": 20,
        }

    @pytest.mark.asyncio
    async def test_schema_fills_defaults_when_fields_omitted(self):
        """Omitting all fields should succeed and fill in the defaults."""
        schema = await _extract_schema(_make_options_flow())
        result = schema({})
        assert result == {
            "default_motion_timeout": 120,
            "default_checking_timeout": 30,
            "default_grid_size": 10,
        }
