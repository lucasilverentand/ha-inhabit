"""Export floor plans as Lovelace cards."""
from __future__ import annotations

import logging
from typing import TYPE_CHECKING, Any

import yaml
from homeassistant.core import HomeAssistant

if TYPE_CHECKING:
    from ..store.floor_plan_store import FloorPlanStore

_LOGGER = logging.getLogger(__name__)


class CardExporter:
    """Exports floor plans as Lovelace card configurations."""

    def __init__(self, hass: HomeAssistant, store: FloorPlanStore) -> None:
        """Initialize the exporter."""
        self.hass = hass
        self._store = store

    def export_room_card(
        self, floor_plan_id: str, room_id: str
    ) -> dict[str, Any]:
        """Export a single room as a Lovelace card."""
        floor_plan = self._store.get_floor_plan(floor_plan_id)
        if not floor_plan:
            return {"error": "Floor plan not found"}

        result = floor_plan.get_room(room_id)
        if not result:
            return {"error": "Room not found"}

        floor, room = result

        # Get devices in the room
        collection = self._store.get_device_placements(floor_plan_id)
        devices = collection.get_devices_in_room(room_id)

        # Build entity list
        entities = []

        # Add occupancy sensor
        entities.append({
            "entity": f"binary_sensor.fp_{room_id}_occupancy",
            "name": "Occupancy",
        })

        # Add placed devices
        for device in devices:
            state = self.hass.states.get(device.entity_id)
            entity_config: dict[str, Any] = {"entity": device.entity_id}

            if device.label:
                entity_config["name"] = device.label
            elif state and state.attributes.get("friendly_name"):
                entity_config["name"] = state.attributes["friendly_name"]

            entities.append(entity_config)

        return {
            "type": "entities",
            "title": room.name,
            "entities": entities,
            "state_color": True,
        }

    def export_floor_plan_card(self, floor_plan_id: str) -> dict[str, Any]:
        """Export a floor plan as a picture-elements card configuration."""
        floor_plan = self._store.get_floor_plan(floor_plan_id)
        if not floor_plan:
            return {"error": "Floor plan not found"}

        # Get all devices
        collection = self._store.get_device_placements(floor_plan_id)

        # Build card for each floor
        cards = []
        for floor in floor_plan.floors:
            elements = []

            # Add room labels with occupancy indicators
            for room in floor.rooms:
                if room.polygon.bounding_box:
                    center = room.polygon.bounding_box.center
                    elements.append({
                        "type": "state-label",
                        "entity": f"binary_sensor.fp_{room.id}_occupancy",
                        "style": {
                            "left": f"{center.x}px",
                            "top": f"{center.y}px",
                            "transform": "translate(-50%, -50%)",
                            "font-weight": "bold",
                            "color": "white",
                            "text-shadow": "1px 1px 2px black",
                        },
                        "tap_action": {
                            "action": "more-info",
                        },
                    })

            # Add device markers
            for device in collection.get_devices_on_floor(floor.id):
                state = self.hass.states.get(device.entity_id)
                if not state:
                    continue

                element: dict[str, Any] = {
                    "type": "state-icon",
                    "entity": device.entity_id,
                    "style": {
                        "left": f"{device.position.x}px",
                        "top": f"{device.position.y}px",
                        "transform": f"translate(-50%, -50%) rotate({device.rotation}deg)",
                    },
                    "tap_action": {
                        "action": "toggle" if self._is_toggleable(device.entity_id) else "more-info",
                    },
                }

                if device.label:
                    element["title"] = device.label

                elements.append(element)

            # Create picture-elements card for this floor
            floor_card: dict[str, Any] = {
                "type": "picture-elements",
                "title": floor.name,
                "elements": elements,
            }

            # Add background image if available
            if floor.background_image:
                image_store = self.hass.data["inhabit"]["image_store"]
                url = image_store.get_image_url(floor.background_image)
                if url:
                    floor_card["image"] = url

            cards.append(floor_card)

        # If single floor, return just the card
        if len(cards) == 1:
            return cards[0]

        # Multiple floors - return a vertical stack
        return {
            "type": "vertical-stack",
            "title": floor_plan.name,
            "cards": cards,
        }

    def export_summary_card(self, floor_plan_id: str) -> dict[str, Any]:
        """Export a summary card showing all room occupancy states."""
        floor_plan = self._store.get_floor_plan(floor_plan_id)
        if not floor_plan:
            return {"error": "Floor plan not found"}

        rooms = floor_plan.get_all_rooms()
        entities = []

        for room in rooms:
            entities.append({
                "entity": f"binary_sensor.fp_{room.id}_occupancy",
                "name": room.name,
                "secondary_info": "last-changed",
            })

        return {
            "type": "entities",
            "title": f"{floor_plan.name} - Occupancy",
            "entities": entities,
            "state_color": True,
        }

    def export_yaml(self, floor_plan_id: str, card_type: str = "picture-elements") -> str:
        """Export card configuration as YAML string."""
        if card_type == "summary":
            card = self.export_summary_card(floor_plan_id)
        else:
            card = self.export_floor_plan_card(floor_plan_id)

        yaml_str = "# Generated by Inhabit Floor Plan Builder\n"
        yaml_str += yaml.dump(
            card,
            default_flow_style=False,
            allow_unicode=True,
            sort_keys=False,
        )

        return yaml_str

    def _is_toggleable(self, entity_id: str) -> bool:
        """Check if an entity can be toggled."""
        domain = entity_id.split(".")[0]
        return domain in (
            "light",
            "switch",
            "fan",
            "cover",
            "lock",
            "input_boolean",
            "automation",
            "script",
        )
