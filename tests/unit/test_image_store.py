"""Unit tests for ImageStore."""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.inhabit.store.image_store import ImageStore


@pytest.fixture
def image_store(tmp_path):
    """Create an ImageStore backed by a temporary directory."""
    hass = MagicMock()
    hass.config.path = lambda *parts: str(tmp_path.joinpath(*parts))
    hass.async_add_executor_job = AsyncMock(side_effect=lambda func, *args: func(*args))
    return ImageStore(hass)


@pytest.mark.asyncio
async def test_save_image_rejects_svg_uploads(image_store: ImageStore) -> None:
    """SVG uploads are rejected because they can carry active content."""
    image_id = await image_store.async_save_image(b"<svg></svg>", "floor.svg")

    assert image_id is None


@pytest.mark.asyncio
async def test_legacy_svg_images_can_still_be_listed_and_deleted(
    image_store: ImageStore,
) -> None:
    """Existing SVG files remain visible and removable."""
    await image_store.async_setup()
    svg_path = image_store._storage_path / "legacy.svg"
    svg_path.write_text("<svg></svg>")

    images = await image_store.async_list_images()
    deleted = await image_store.async_delete_image("legacy")

    assert images == [
        {
            "id": "legacy",
            "filename": "legacy.svg",
            "url": "/local/inhabit/images/legacy.svg",
        }
    ]
    assert deleted is True
    assert not svg_path.exists()
