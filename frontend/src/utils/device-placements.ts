import type {
  ButtonPlacement,
  FanPlacement,
  LightPlacement,
  OtherPlacement,
  SwitchPlacement,
} from "../types";

export interface NormalDevicePlacementGroups {
  lights: LightPlacement[];
  switches: SwitchPlacement[];
  fans: FanPlacement[];
  buttons: ButtonPlacement[];
  others: OtherPlacement[];
}

type NormalDevicePlacement =
  | LightPlacement
  | SwitchPlacement
  | FanPlacement
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
    ...groups.fans,
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
