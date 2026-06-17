import type {
  BasePlacement,
  HassEntity,
  HomeAssistant,
  MmwavePlacement,
} from "../types";

export type DeviceIssueSeverity = "warning";

export interface DeviceIssue {
  code: string;
  message: string;
  severity: DeviceIssueSeverity;
}

type HassStates = HomeAssistant["states"] | Record<string, HassEntity>;

function issue(code: string, message: string): DeviceIssue {
  return { code, message, severity: "warning" };
}

function entityStateIssue(
  entityId: string,
  states: HassStates,
): DeviceIssue | null {
  if (!entityId) return issue("missing_entity_id", "No entity is bound");

  const state = states[entityId];
  if (!state) {
    return issue("entity_missing", `${entityId} no longer exists`);
  }
  if (state.state === "unavailable") {
    return issue("entity_unavailable", `${entityId} is unavailable`);
  }
  if (state.state === "unknown") {
    return issue("entity_unknown", `${entityId} is unknown`);
  }
  return null;
}

export function getNormalDeviceIssues(
  placement: Pick<BasePlacement, "entity_id">,
  states: HassStates,
): DeviceIssue[] {
  const found = entityStateIssue(placement.entity_id, states);
  return found ? [found] : [];
}

export function getMmwavePlacementIssues(
  placement: Pick<MmwavePlacement, "targets">,
  states: HassStates,
): DeviceIssue[] {
  const issues: DeviceIssue[] = [];
  const targets = placement.targets ?? [];

  if (targets.length === 0) {
    issues.push(issue("mmwave_no_targets", "No target slots are configured"));
    return issues;
  }

  for (const [index, target] of targets.entries()) {
    const label = `Target ${index + 1}`;
    if (!target.x_entity_id) {
      issues.push(issue("mmwave_missing_x", `${label} is missing an X entity`));
    }
    if (!target.y_entity_id) {
      issues.push(issue("mmwave_missing_y", `${label} is missing a Y entity`));
    }

    for (const [axis, entityId] of [
      ["X", target.x_entity_id],
      ["Y", target.y_entity_id],
    ] as const) {
      if (!entityId) continue;
      const stateIssue = entityStateIssue(entityId, states);
      if (stateIssue) {
        issues.push({
          ...stateIssue,
          code: `mmwave_${axis.toLowerCase()}_${stateIssue.code}`,
          message: `${label} ${axis}: ${stateIssue.message}`,
        });
        continue;
      }
      const value = Number(states[entityId]?.state);
      if (!Number.isFinite(value)) {
        issues.push(
          issue(
            `mmwave_${axis.toLowerCase()}_nonnumeric`,
            `${label} ${axis}: ${entityId} is not numeric`,
          ),
        );
      }
    }
  }

  return issues;
}

export function summarizeIssues(issues: DeviceIssue[]): string {
  return issues.map((found) => found.message).join("; ");
}
