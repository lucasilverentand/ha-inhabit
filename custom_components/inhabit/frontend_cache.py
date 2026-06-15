"""Frontend cache helpers for the Inhabit panel."""

from __future__ import annotations

import logging
from pathlib import Path

_LOGGER = logging.getLogger(__name__)


def panel_module_url(panel_path: str) -> str:
    """Return the frontend module URL, cache-busted by the bundled file mtime."""
    try:
        version = int(Path(panel_path).stat().st_mtime)
    except OSError:
        _LOGGER.debug("Unable to stat Inhabit frontend bundle for cache busting")
        return "/inhabit/panel.js"
    return f"/inhabit/panel.js?v={version}"
