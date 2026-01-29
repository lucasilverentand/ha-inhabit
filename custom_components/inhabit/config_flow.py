"""Config flow for Inhabit Floor Plan Builder."""
from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol
from homeassistant.config_entries import ConfigFlow, ConfigFlowResult
from homeassistant.core import callback

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)


class InhabitConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Inhabit Floor Plan Builder."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Handle the initial step."""
        # Only allow a single instance
        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()

        if user_input is not None:
            return self.async_create_entry(
                title="Inhabit Floor Plan Builder",
                data={},
            )

        return self.async_show_form(
            step_id="user",
            description_placeholders={
                "name": "Inhabit Floor Plan Builder",
            },
        )

    @staticmethod
    @callback
    def async_get_options_flow(config_entry):
        """Get the options flow for this handler."""
        return InhabitOptionsFlow(config_entry)


class InhabitOptionsFlow:
    """Handle options flow for Inhabit."""

    def __init__(self, config_entry) -> None:
        """Initialize options flow."""
        self.config_entry = config_entry

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Manage the options."""
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(
                {
                    vol.Optional(
                        "default_motion_timeout",
                        default=self.config_entry.options.get("default_motion_timeout", 120),
                    ): vol.All(vol.Coerce(int), vol.Range(min=10, max=600)),
                    vol.Optional(
                        "default_checking_timeout",
                        default=self.config_entry.options.get("default_checking_timeout", 30),
                    ): vol.All(vol.Coerce(int), vol.Range(min=5, max=120)),
                    vol.Optional(
                        "default_grid_size",
                        default=self.config_entry.options.get("default_grid_size", 10),
                    ): vol.All(vol.Coerce(int), vol.Range(min=1, max=100)),
                }
            ),
        )
