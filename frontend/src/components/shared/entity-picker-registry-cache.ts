import type { HomeAssistant } from "../../types";
import {
  type EntityRegistryEntry,
  isInhabitRegistryEntry,
} from "./entity-filter";

let registryCache: Set<string> | null = null;
let registryLoadPromise: Promise<Set<string>> | null = null;

export function getCachedIntegrationEntityIds(): Set<string> | null {
  return registryCache;
}

export async function loadIntegrationEntityIds(
  hass: HomeAssistant,
): Promise<Set<string>> {
  if (registryCache) return registryCache;

  registryLoadPromise ??= hass
    .callWS<EntityRegistryEntry[]>({
      type: "config/entity_registry/list",
    })
    .then(
      (entries) =>
        new Set(
          entries
            .filter((entry) => isInhabitRegistryEntry(entry))
            .map((entry) => entry.entity_id),
        ),
    );

  try {
    registryCache = await registryLoadPromise;
    return registryCache;
  } catch (err) {
    registryLoadPromise = null;
    throw err;
  }
}

export function resetEntityPickerRegistryCacheForTests(): void {
  registryCache = null;
  registryLoadPromise = null;
}
