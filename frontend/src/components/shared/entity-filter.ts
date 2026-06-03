import type { HassEntity } from "../../types";

export interface EntityRegistryEntry {
  entity_id: string;
  platform?: string;
  unique_id?: string;
}

export function isInhabitGeneratedUniqueId(uniqueId: unknown): boolean {
  return (
    typeof uniqueId === "string" &&
    uniqueId.startsWith("fp_") &&
    (uniqueId.endsWith("_occupancy") ||
      uniqueId.endsWith("_occupancy_override"))
  );
}

export function isInhabitRegistryEntry(entry: EntityRegistryEntry): boolean {
  return (
    entry.platform === "inhabit" || isInhabitGeneratedUniqueId(entry.unique_id)
  );
}

export function isInhabitGeneratedEntity(
  entityId: string,
  stateObj: HassEntity,
  integrationEntityIds: Set<string>,
): boolean {
  return (
    integrationEntityIds.has(entityId) ||
    isInhabitGeneratedUniqueId(stateObj.attributes?.unique_id)
  );
}
