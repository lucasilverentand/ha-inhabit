import type {
  ButtonPlacement,
  LightPlacement,
  OtherPlacement,
  SwitchPlacement,
} from "../types";

export interface NormalDevicePlacementGroups {
  lights: LightPlacement[];
  switches: SwitchPlacement[];
  buttons: ButtonPlacement[];
  others: OtherPlacement[];
}

type NormalDevicePlacement =
  | LightPlacement
  | SwitchPlacement
  | ButtonPlacement
  | OtherPlacement;

export function getPlacedDeviceEntityIds(
  groups: NormalDevicePlacementGroups,
  excludePlacementId?: string,
): string[] {
  const entityIds = new Set<string>();
  const placements: NormalDevicePlacement[] = [
    ...groups.lights,
    ...groups.switches,
    ...groups.buttons,
    ...groups.others,
  ];

  for (const placement of placements) {
    if (placement.id === excludePlacementId) continue;
    if (placement.entity_id) entityIds.add(placement.entity_id);
  }

  return [...entityIds];
}

export function isDeviceEntityAlreadyPlaced(
  groups: NormalDevicePlacementGroups,
  entityId: string,
  excludePlacementId?: string,
): boolean {
  return getPlacedDeviceEntityIds(groups, excludePlacementId).includes(
    entityId,
  );
}
