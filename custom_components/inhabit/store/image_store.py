"""Image storage for floor plan backgrounds."""

from __future__ import annotations

import hashlib
import logging
from pathlib import Path
from typing import TYPE_CHECKING

from homeassistant.core import HomeAssistant

if TYPE_CHECKING:
    pass

_LOGGER = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"}
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10 MB


class ImageStore:
    """Manages floor plan background images."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the image store."""
        self.hass = hass
        self._storage_path = Path(hass.config.path("www", "inhabit", "images"))

    async def async_setup(self) -> None:
        """Set up the image storage directory."""

        def _ensure_dir() -> None:
            self._storage_path.mkdir(parents=True, exist_ok=True)

        await self.hass.async_add_executor_job(_ensure_dir)

    def get_image_path(self, image_id: str) -> Path | None:
        """Get the path for an image by ID."""
        # Look for the image with any allowed extension
        for ext in ALLOWED_EXTENSIONS:
            path = self._storage_path / f"{image_id}{ext}"
            if path.exists():
                return path
        return None

    def get_image_url(self, image_id: str) -> str | None:
        """Get the URL for an image by ID."""
        path = self.get_image_path(image_id)
        if path:
            return f"/local/inhabit/images/{path.name}"
        return None

    async def async_save_image(self, content: bytes, filename: str) -> str | None:
        """Save an image and return its ID."""
        # Validate extension
        ext = Path(filename).suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            _LOGGER.error("Invalid image extension: %s", ext)
            return None

        # Validate size
        if len(content) > MAX_IMAGE_SIZE:
            _LOGGER.error("Image too large: %d bytes", len(content))
            return None

        # Generate ID from content hash
        image_id = hashlib.sha256(content).hexdigest()[:16]

        # Save the image
        def _save() -> None:
            path = self._storage_path / f"{image_id}{ext}"
            path.write_bytes(content)

        await self.hass.async_add_executor_job(_save)
        _LOGGER.info("Saved image: %s", image_id)
        return image_id

    async def async_delete_image(self, image_id: str) -> bool:
        """Delete an image by ID."""
        path = self.get_image_path(image_id)
        if not path:
            return False

        def _delete() -> None:
            path.unlink()

        await self.hass.async_add_executor_job(_delete)
        _LOGGER.info("Deleted image: %s", image_id)
        return True

    async def async_list_images(self) -> list[dict[str, str]]:
        """List all stored images."""

        def _list() -> list[dict[str, str]]:
            images = []
            if self._storage_path.exists():
                for path in self._storage_path.iterdir():
                    if path.suffix.lower() in ALLOWED_EXTENSIONS:
                        image_id = path.stem
                        images.append(
                            {
                                "id": image_id,
                                "filename": path.name,
                                "url": f"/local/inhabit/images/{path.name}",
                            }
                        )
            return images

        return await self.hass.async_add_executor_job(_list)
