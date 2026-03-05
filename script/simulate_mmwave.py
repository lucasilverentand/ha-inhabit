#!/usr/bin/env python3
"""Simulate mmWave targets via the HA REST API.

Creates sensor entities and moves them with random walk so you can test
target rendering on the Inhabit floor plan.

Usage:
    # Start simulation (creates 3 targets, binds to first mmWave placement)
    python script/simulate_mmwave.py

    # Custom target count
    python script/simulate_mmwave.py --targets 5

    # Point at a different HA instance
    python script/simulate_mmwave.py --url http://192.168.1.100:8123

    # Specify a placement ID
    python script/simulate_mmwave.py --placement abc123

You need a long-lived access token. Set HA_TOKEN env var or pass --token.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import math
import random
import signal
import sys
from typing import Any

try:
    import aiohttp
except ImportError:
    print("pip install aiohttp")
    sys.exit(1)

DEFAULT_URL = "http://localhost:8123"
ENTITY_PREFIX = "sensor.inhabit_sim_mmwave"


async def ha_ws_connect(url: str, token: str) -> aiohttp.ClientWebSocketResponse:
    """Connect to HA WebSocket API and authenticate."""
    ws_url = url.replace("http", "ws", 1) + "/api/websocket"
    session = aiohttp.ClientSession()
    ws = await session.ws_connect(ws_url)

    # Wait for auth_required
    msg = await ws.receive_json()
    assert msg["type"] == "auth_required"

    await ws.send_json({"type": "auth", "access_token": token})
    msg = await ws.receive_json()
    if msg["type"] != "auth_ok":
        print(f"Auth failed: {msg}")
        sys.exit(1)

    return ws


async def ws_call(ws: aiohttp.ClientWebSocketResponse, msg_id: int, payload: dict) -> dict:
    """Send a WS command and return the result."""
    payload["id"] = msg_id
    await ws.send_json(payload)
    while True:
        resp = await ws.receive_json()
        if resp.get("id") == msg_id:
            return resp


async def ha_set_state(
    session: aiohttp.ClientSession, url: str, token: str,
    entity_id: str, state: str, attrs: dict | None = None,
) -> None:
    """Set an entity state via REST API."""
    data: dict[str, Any] = {"state": state}
    if attrs:
        data["attributes"] = attrs
    async with session.post(
        f"{url}/api/states/{entity_id}",
        json=data,
        headers={"Authorization": f"Bearer {token}"},
    ) as resp:
        if resp.status not in (200, 201):
            text = await resp.text()
            print(f"Failed to set {entity_id}: {resp.status} {text}")


async def run(
    url: str, token: str, target_count: int, placement_id: str | None
) -> None:
    session = aiohttp.ClientSession()
    ws = await ha_ws_connect(url, token)
    msg_id = 1

    # Find placement ID if not specified
    if not placement_id:
        msg_id += 1
        resp = await ws_call(ws, msg_id, {"type": "inhabit/floor_plans/list"})
        floor_plans = resp.get("result", [])
        if not floor_plans:
            print("No floor plans found.")
            return

        for fp in floor_plans:
            msg_id += 1
            resp = await ws_call(ws, msg_id, {
                "type": "inhabit/mmwave/list",
                "floor_plan_id": fp["id"],
            })
            placements = resp.get("result", [])
            if placements:
                placement_id = placements[0]["id"]
                print(f"Using placement: {placement_id}")
                break

        if not placement_id:
            print("No mmWave placements found. Place one on the floor plan first.")
            return

    # Create simulated entities
    entity_ids: list[tuple[str, str]] = []
    targets: list[dict[str, str]] = []
    for i in range(target_count):
        x_eid = f"{ENTITY_PREFIX}_{i + 1}_x"
        y_eid = f"{ENTITY_PREFIX}_{i + 1}_y"
        entity_ids.append((x_eid, y_eid))
        targets.append({"x_entity_id": x_eid, "y_entity_id": y_eid})

        await ha_set_state(session, url, token, x_eid, "0", {
            "unit_of_measurement": "mm",
            "friendly_name": f"Sim Target {i + 1} X",
        })
        await ha_set_state(session, url, token, y_eid, "0", {
            "unit_of_measurement": "mm",
            "friendly_name": f"Sim Target {i + 1} Y",
        })

    # Bind targets to placement
    msg_id += 1
    await ws_call(ws, msg_id, {
        "type": "inhabit/mmwave/update",
        "placement_id": placement_id,
        "targets": targets,
    })
    print(f"Bound {target_count} targets to placement {placement_id}")
    print("Simulating... Ctrl+C to stop.\n")

    # Target state
    states = [
        {
            "x": 0.0, "y": 0.0, "vx": 0.0, "vy": 0.0,
            "active": False,
            "appear_timer": random.uniform(0.3, 1.5 + i * 0.4),
            "disappear_timer": 0.0,
        }
        for i in range(target_count)
    ]

    interval = 0.15
    running = True

    def stop(_sig, _frame):
        nonlocal running
        running = False

    signal.signal(signal.SIGINT, stop)
    signal.signal(signal.SIGTERM, stop)

    try:
        while running:
            for i, s in enumerate(states):
                x_eid, y_eid = entity_ids[i]

                if not s["active"]:
                    s["appear_timer"] -= interval
                    if s["appear_timer"] <= 0:
                        s["x"] = random.uniform(-1000, 1000)
                        s["y"] = random.uniform(300, 2500)
                        s["vx"] = random.uniform(-100, 100)
                        s["vy"] = random.uniform(-80, 80)
                        s["active"] = True
                        s["disappear_timer"] = random.uniform(5.0, 15.0)
                        print(f"  T{i+1} appeared at ({s['x']:.0f}, {s['y']:.0f})")
                    continue

                # Random walk
                s["vx"] += random.uniform(-80, 80)
                s["vy"] += random.uniform(-60, 60)
                s["vx"] *= 0.92
                s["vy"] *= 0.92
                speed = math.sqrt(s["vx"] ** 2 + s["vy"] ** 2)
                if speed > 400:
                    s["vx"] = s["vx"] / speed * 400
                    s["vy"] = s["vy"] / speed * 400

                s["x"] += s["vx"] * interval
                s["y"] += s["vy"] * interval
                s["x"] = max(-1500, min(1500, s["x"]))
                s["y"] = max(200, min(3000, s["y"]))

                s["disappear_timer"] -= interval
                if s["disappear_timer"] <= 0:
                    s["active"] = False
                    s["appear_timer"] = random.uniform(2.0, 6.0)
                    await ha_set_state(session, url, token, x_eid, "0")
                    await ha_set_state(session, url, token, y_eid, "0")
                    print(f"  T{i+1} disappeared")
                    continue

                await ha_set_state(session, url, token, x_eid, str(round(s["x"])))
                await ha_set_state(session, url, token, y_eid, str(round(s["y"])))

            await asyncio.sleep(interval)

    finally:
        # Cleanup
        print("\nCleaning up...")
        for x_eid, y_eid in entity_ids:
            await ha_set_state(session, url, token, x_eid, "0")
            await ha_set_state(session, url, token, y_eid, "0")

        # Unbind targets
        msg_id += 1
        await ws_call(ws, msg_id, {
            "type": "inhabit/mmwave/update",
            "placement_id": placement_id,
            "targets": [],
        })
        print("Targets unbound. Done.")
        await ws.close()
        await session.close()


def main():
    parser = argparse.ArgumentParser(description="Simulate mmWave targets")
    parser.add_argument("--url", default=DEFAULT_URL, help="HA URL")
    parser.add_argument("--token", default=None, help="Long-lived access token")
    parser.add_argument("--targets", type=int, default=3, help="Number of targets")
    parser.add_argument("--placement", default=None, help="Placement ID")
    args = parser.parse_args()

    import os
    token = args.token or os.environ.get("HA_TOKEN")
    if not token:
        print("Set HA_TOKEN env var or pass --token")
        sys.exit(1)

    asyncio.run(run(args.url, token, args.targets, args.placement))


if __name__ == "__main__":
    main()
