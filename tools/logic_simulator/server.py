"""Standalone web server for the Inhabit logic simulator."""

from __future__ import annotations

import argparse
import json
import logging
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

from custom_components.inhabit.engine.logic_simulator import (
    LOGIC_SIMULATOR_PRESETS,
    logic_simulator_presets_payload,
    run_logic_simulation,
)

_LOGGER = logging.getLogger(__name__)
STATIC_DIR = Path(__file__).with_name("static")


class LogicSimulatorError(ValueError):
    """User-facing simulator request error."""


def run_request_payload(payload: dict[str, Any]) -> dict[str, Any]:
    """Run a simulator request payload through the real state-machine simulator."""
    actions = payload.get("actions")
    preset = payload.get("preset")

    if actions is None:
        if not preset:
            raise LogicSimulatorError("Provide either actions or a preset id.")
        preset_payload = LOGIC_SIMULATOR_PRESETS.get(str(preset))
        if preset_payload is None:
            raise LogicSimulatorError(f"Unknown preset: {preset}")
        actions = preset_payload["actions"]

    if not isinstance(actions, list):
        raise LogicSimulatorError("actions must be a list.")

    policy_overrides = payload.get("policy_overrides_by_room")
    if policy_overrides is not None and not isinstance(policy_overrides, dict):
        raise LogicSimulatorError("policy_overrides_by_room must be an object.")

    return run_logic_simulation(
        actions,
        policy_overrides_by_room=policy_overrides,
    )


class LogicSimulatorHandler(SimpleHTTPRequestHandler):
    """Serve static simulator assets and local JSON endpoints."""

    server_version = "InhabitLogicSimulator/1.0"

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, directory=str(STATIC_DIR), **kwargs)

    def end_headers(self) -> None:
        """Prevent stale simulator assets while iterating locally."""
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_GET(self) -> None:  # noqa: N802 - stdlib handler API
        """Serve API payloads or static files."""
        parsed = urlparse(self.path)
        if parsed.path == "/api/health":
            self._send_json({"ok": True})
            return
        if parsed.path == "/api/presets":
            self._send_json(logic_simulator_presets_payload())
            return
        if parsed.path in {"", "/"}:
            self.path = "/index.html"
        super().do_GET()

    def do_POST(self) -> None:  # noqa: N802 - stdlib handler API
        """Run simulator JSON requests."""
        parsed = urlparse(self.path)
        if parsed.path != "/api/run":
            self._send_json(
                {"ok": False, "error": "Not found"},
                status=HTTPStatus.NOT_FOUND,
            )
            return

        try:
            content_length = int(self.headers.get("Content-Length", "0"))
            raw_body = self.rfile.read(content_length).decode("utf-8")
            payload = json.loads(raw_body) if raw_body else {}
            if not isinstance(payload, dict):
                raise LogicSimulatorError("Request body must be a JSON object.")
            result = run_request_payload(payload)
        except LogicSimulatorError as err:
            self._send_json(
                {"ok": False, "error": str(err)},
                status=HTTPStatus.BAD_REQUEST,
            )
            return
        except json.JSONDecodeError as err:
            self._send_json(
                {"ok": False, "error": f"Invalid JSON: {err.msg}"},
                status=HTTPStatus.BAD_REQUEST,
            )
            return
        except Exception as err:  # noqa: BLE001 - displayed in local dev tool
            _LOGGER.exception("Logic simulation failed")
            self._send_json(
                {"ok": False, "error": str(err)},
                status=HTTPStatus.INTERNAL_SERVER_ERROR,
            )
            return

        self._send_json(result)

    def log_message(self, format: str, *args: Any) -> None:
        """Route request logs through Python logging."""
        _LOGGER.info("%s", format % args)

    def _send_json(
        self,
        payload: dict[str, Any],
        *,
        status: HTTPStatus = HTTPStatus.OK,
    ) -> None:
        body = json.dumps(payload, indent=2).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def run_server(host: str, port: int) -> None:
    """Run the standalone simulator server."""
    server = ThreadingHTTPServer((host, port), LogicSimulatorHandler)
    url_host = "localhost" if host in {"", "0.0.0.0", "::"} else host
    print(f"Inhabit logic simulator: http://{url_host}:{port}", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping logic simulator.", flush=True)
    finally:
        server.server_close()


def main() -> None:
    """CLI entry point."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--verbose", action="store_true")
    args = parser.parse_args()

    logging.basicConfig(
        level=logging.INFO if args.verbose else logging.WARNING,
        format="%(levelname)s %(name)s: %(message)s",
    )
    run_server(args.host, args.port)


if __name__ == "__main__":
    main()
