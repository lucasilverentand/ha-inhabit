"""Unit tests for image HTTP endpoints."""

from __future__ import annotations

import importlib
import sys
import types
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from custom_components.inhabit.const import DOMAIN

ha_http_module = sys.modules.get("homeassistant.components.http")
if ha_http_module is None:
    ha_http_module = types.ModuleType("homeassistant.components.http")
    ha_http_module.HomeAssistantView = object
    sys.modules["homeassistant.components.http"] = ha_http_module
elif isinstance(getattr(ha_http_module, "HomeAssistantView", None), MagicMock):
    ha_http_module.HomeAssistantView = object

http = importlib.reload(importlib.import_module("custom_components.inhabit.api.http"))


class _JsonResponse:
    def __init__(self, data: dict, status: int = 200) -> None:
        self.data = data
        self.status = status


class _Request(dict):
    def __init__(self, *, user_is_admin: bool, image_store: MagicMock) -> None:
        super().__init__()
        self["hass_user"] = SimpleNamespace(is_admin=user_is_admin)
        self.app = {
            "hass": SimpleNamespace(
                data={
                    DOMAIN: {
                        "image_store": image_store,
                    },
                },
            ),
        }
        self.multipart = AsyncMock()


class _UploadField:
    name = "file"
    filename = "floor.png"

    def __init__(self, chunks: list[bytes]) -> None:
        self._chunks = chunks
        self.read_chunk = AsyncMock(side_effect=[*chunks, b""])


class _MultipartReader:
    def __init__(self, field: _UploadField | None) -> None:
        self._field = field

    async def next(self) -> _UploadField | None:
        return self._field


@pytest.fixture(autouse=True)
def json_response_patch():
    """Return simple response objects from the aiohttp helper."""
    with patch(
        "custom_components.inhabit.api.http.web.json_response",
        side_effect=lambda data, status=200: _JsonResponse(data, status),
    ):
        yield


@pytest.mark.asyncio
async def test_non_admin_upload_is_rejected_before_multipart_read() -> None:
    """Non-admin image uploads should not read request body data."""
    image_store = MagicMock()
    image_store.async_save_image = AsyncMock()
    request = _Request(user_is_admin=False, image_store=image_store)

    response = await http.ImageUploadView.post(object(), request)

    assert response.status == 403
    request.multipart.assert_not_called()
    image_store.async_save_image.assert_not_called()


@pytest.mark.asyncio
async def test_admin_upload_reads_chunks_and_saves_image() -> None:
    """Admin uploads should save image content and return the image URL."""
    image_store = MagicMock()
    image_store.async_save_image = AsyncMock(return_value="image123")
    image_store.get_image_url.return_value = "/local/inhabit/images/image123.png"
    request = _Request(user_is_admin=True, image_store=image_store)
    request.multipart.return_value = _MultipartReader(_UploadField([b"abc", b"def"]))

    response = await http.ImageUploadView.post(object(), request)

    assert response.status == 200
    assert response.data == {
        "id": "image123",
        "url": "/local/inhabit/images/image123.png",
    }
    image_store.async_save_image.assert_awaited_once_with(b"abcdef", "floor.png")


@pytest.mark.asyncio
async def test_admin_upload_rejects_oversized_file_without_reading_remaining_chunks() -> (
    None
):
    """Oversized uploads should stop reading as soon as the limit is exceeded."""
    image_store = MagicMock()
    image_store.async_save_image = AsyncMock()
    request = _Request(user_is_admin=True, image_store=image_store)
    field = _UploadField([b"123", b"456", b"789"])
    request.multipart.return_value = _MultipartReader(field)

    with patch("custom_components.inhabit.api.http.MAX_IMAGE_SIZE", 5):
        response = await http.ImageUploadView.post(object(), request)

    assert response.status == 413
    assert field.read_chunk.await_count == 2
    image_store.async_save_image.assert_not_called()


@pytest.mark.asyncio
async def test_non_admin_delete_is_rejected_before_storage_call() -> None:
    """Non-admin image deletes should not reach storage."""
    image_store = MagicMock()
    image_store.async_delete_image = AsyncMock()
    request = _Request(user_is_admin=False, image_store=image_store)

    response = await http.ImageDeleteView.delete(object(), request, "image123")

    assert response.status == 403
    image_store.async_delete_image.assert_not_called()


@pytest.mark.asyncio
async def test_admin_delete_removes_image() -> None:
    """Admin image deletes should call storage."""
    image_store = MagicMock()
    image_store.async_delete_image = AsyncMock(return_value=True)
    request = _Request(user_is_admin=True, image_store=image_store)

    response = await http.ImageDeleteView.delete(object(), request, "image123")

    assert response.status == 200
    assert response.data == {"success": True}
    image_store.async_delete_image.assert_awaited_once_with("image123")


def test_image_write_views_require_admin() -> None:
    """Home Assistant should also admin-gate upload and delete routes."""
    assert http.ImageUploadView.__dict__["requires_admin"] is True
    assert http.ImageDeleteView.__dict__["requires_admin"] is True
    assert getattr(http.ImageListView, "requires_admin", False) is False
