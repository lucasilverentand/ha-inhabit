"""HTTP endpoints for Inhabit Floor Plan Builder."""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING

from aiohttp import web
from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant

from ..const import DOMAIN

if TYPE_CHECKING:
    from ..store.image_store import ImageStore

_LOGGER = logging.getLogger(__name__)


def async_register_http_handlers(hass: HomeAssistant) -> None:
    """Register HTTP endpoints."""
    hass.http.register_view(ImageUploadView)
    hass.http.register_view(ImageListView)
    hass.http.register_view(ImageDeleteView)
    _LOGGER.debug("Registered HTTP handlers")


class ImageUploadView(HomeAssistantView):
    """Handle image uploads."""

    url = "/api/inhabit/images/upload"
    name = "api:inhabit:images:upload"
    requires_auth = True

    async def post(self, request: web.Request) -> web.Response:
        """Handle POST request for image upload."""
        hass: HomeAssistant = request.app["hass"]
        image_store: ImageStore = hass.data[DOMAIN]["image_store"]

        # Read multipart data
        reader = await request.multipart()
        field = await reader.next()

        if not field or field.name != "file":
            return web.json_response(
                {"error": "No file field in request"},
                status=400,
            )

        filename = field.filename
        if not filename:
            return web.json_response(
                {"error": "No filename provided"},
                status=400,
            )

        # Read file content
        content = await field.read()

        # Save image
        image_id = await image_store.async_save_image(content, filename)
        if not image_id:
            return web.json_response(
                {"error": "Failed to save image"},
                status=400,
            )

        return web.json_response(
            {
                "id": image_id,
                "url": image_store.get_image_url(image_id),
            }
        )


class ImageListView(HomeAssistantView):
    """List uploaded images."""

    url = "/api/inhabit/images"
    name = "api:inhabit:images:list"
    requires_auth = True

    async def get(self, request: web.Request) -> web.Response:
        """Handle GET request to list images."""
        hass: HomeAssistant = request.app["hass"]
        image_store: ImageStore = hass.data[DOMAIN]["image_store"]

        images = await image_store.async_list_images()
        return web.json_response({"images": images})


class ImageDeleteView(HomeAssistantView):
    """Delete an uploaded image."""

    url = "/api/inhabit/images/{image_id}"
    name = "api:inhabit:images:delete"
    requires_auth = True

    async def delete(self, request: web.Request, image_id: str) -> web.Response:
        """Handle DELETE request to remove an image."""
        hass: HomeAssistant = request.app["hass"]
        image_store: ImageStore = hass.data[DOMAIN]["image_store"]

        if await image_store.async_delete_image(image_id):
            return web.json_response({"success": True})
        else:
            return web.json_response(
                {"error": "Image not found"},
                status=404,
            )
