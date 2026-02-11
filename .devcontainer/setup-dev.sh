#!/usr/bin/env bash
# Seeds the HA dev server with areas matching the floor plan.
# Usage: ./setup-dev.sh [HA_TOKEN]
#   HA_TOKEN: Long-lived access token from HA (Profile → Long-Lived Access Tokens)
#   Or set HA_TOKEN env var.

set -euo pipefail

HA_URL="${HA_URL:-http://localhost:8123}"
TOKEN="${1:-${HA_TOKEN:-}}"

if [ -z "$TOKEN" ]; then
  echo "Usage: $0 <HA_TOKEN>"
  echo "  Create a long-lived access token in HA: Profile → Security → Long-Lived Access Tokens"
  exit 1
fi

AUTH="Authorization: Bearer $TOKEN"

# Areas matching the 2nd Floor floor plan
AREAS=(
  "Toilet"
  "Shower"
  "Bathroom"
  "Living Room"
  "Storage"
  "Hallway"
  "Bedroom"
)

echo "Creating areas in HA..."
for area in "${AREAS[@]}"; do
  echo -n "  $area... "
  resp=$(curl -s -X POST "${HA_URL}/api/config/area_registry/create" \
    -H "$AUTH" \
    -H "Content-Type: application/json" \
    -d "{\"name\": \"$area\"}")
  if echo "$resp" | grep -q '"area_id"'; then
    echo "created"
  elif echo "$resp" | grep -q 'name already in use'; then
    echo "already exists"
  else
    echo "error: $resp"
  fi
done

echo "Done."
