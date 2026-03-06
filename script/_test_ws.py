"""Quick WS test to check connectivity and placements."""
import asyncio, aiohttp, os, sys

async def test():
    token = os.environ.get("HA_TOKEN", "")
    if not token:
        print("Set HA_TOKEN"); return
    session = aiohttp.ClientSession()
    try:
        ws = await session.ws_connect("ws://localhost:8123/api/websocket")
        msg = await ws.receive_json()
        print(f"Connected: {msg['type']}")
        await ws.send_json({"type": "auth", "access_token": token})
        msg = await ws.receive_json()
        print(f"Auth: {msg['type']}")
        if msg["type"] != "auth_ok":
            return

        await ws.send_json({"id": 1, "type": "inhabit/floor_plans/list"})
        msg = await ws.receive_json()
        fps = msg.get("result", [])
        print(f"Floor plans: {len(fps)}")
        if not fps:
            return

        await ws.send_json({"id": 2, "type": "inhabit/mmwave/list", "floor_plan_id": fps[0]["id"]})
        msg = await ws.receive_json()
        placements = msg.get("result", [])
        print(f"mmWave placements: {len(placements)}")
        for p in placements:
            print(f"  id={p['id']} targets={p.get('targets', [])}")
        await ws.close()
    finally:
        await session.close()

asyncio.run(test())
