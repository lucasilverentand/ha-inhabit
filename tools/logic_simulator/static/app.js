const roomLayout = {
  side_room_alpha: { x: 120, y: 90, w: 165, h: 76 },
  open_west: { x: 120, y: 230, w: 165, h: 88 },
  service_room: { x: 120, y: 375, w: 165, h: 76 },
  transit_hall: { x: 360, y: 230, w: 175, h: 88 },
  short_stay: { x: 365, y: 375, w: 160, h: 76 },
  entry_nook: { x: 610, y: 375, w: 150, h: 76 },
  open_east: { x: 610, y: 230, w: 175, h: 88 },
};

const SAVED_SCENARIOS_KEY = "inhabit.logicSimulator.savedScenarios.v1";
const WORKSPACE_KEY = "inhabit.logicSimulator.workspace.v1";
const COMMAND_SUGGESTIONS = [
  "walk from office to hallway to toilet",
  "enter, wait 30, leave",
  "light on motion off door open mmwave in room",
  "light on in short stay motion off in transit hall",
  "light on in toilet motion off in hallway",
  "light on",
  "motion off",
  "door open",
  "mmwave in room",
  "mmwave in zone",
];
const PACKED_COMMAND_PHRASES = [
  "expect light off",
  "expect light on",
  "expect occupied",
  "expect vacant",
  "motion not detected",
  "mmwave in room",
  "mmwave in zone",
  "mmwave clear",
  "motion detected",
  "motion clear",
  "motion off",
  "motion on",
  "enter room",
  "clear room",
  "leave room",
  "enter",
  "leave",
  "door closed",
  "door close",
  "door open",
  "light off",
  "light on",
  "override off",
  "override on",
  "occupancy off",
  "occupancy on",
  "vacant",
  "occupied",
];
const ROOM_COMMAND_CONNECTORS = ["in", "at", "into", "to", "from"];

const state = {
  presets: {},
  topology: { rooms: [], doors: [] },
  selectedPreset: "",
  selectedRoomId: "",
  selectedTimelineIndex: 0,
  selectedActionIndex: null,
  insertAfterActionIndex: null,
  replaceActionIndex: null,
  recordedFilter: "all",
  scenarioName: "Untitled scenario",
  savedScenarios: [],
  actions: [],
  result: null,
};

const els = {
  status: document.querySelector("#run-status"),
  summaryResult: document.querySelector("#summary-result"),
  summaryTime: document.querySelector("#summary-time"),
  summaryActions: document.querySelector("#summary-actions"),
  summaryOccupied: document.querySelector("#summary-occupied"),
  summaryLights: document.querySelector("#summary-lights"),
  summaryChecks: document.querySelector("#summary-checks"),
  resultCallout: document.querySelector("#result-callout"),
  presetSelect: document.querySelector("#preset-select"),
  loadPreset: document.querySelector("#load-preset-button"),
  reset: document.querySelector("#reset-button"),
  copy: document.querySelector("#copy-button"),
  scenarioName: document.querySelector("#scenario-name-input"),
  savedScenarioSelect: document.querySelector("#saved-scenario-select"),
  saveScenario: document.querySelector("#save-scenario-button"),
  loadScenario: document.querySelector("#load-scenario-button"),
  deleteScenario: document.querySelector("#delete-scenario-button"),
  run: document.querySelector("#run-button"),
  roomSelect: document.querySelector("#room-select"),
  doorSelect: document.querySelector("#door-select"),
  commandInput: document.querySelector("#command-input"),
  commandAdd: document.querySelector("#command-add-button"),
  commandFeedback: document.querySelector("#command-feedback"),
  commandPreview: document.querySelector("#command-preview"),
  scenarioStrip: document.querySelector("#scenario-strip"),
  scenarioStepActions: document.querySelector("#scenario-step-actions"),
  commandContext: document.querySelector("#command-context"),
  editTargetHint: document.querySelector("#edit-target-hint"),
  selectedRoomStatus: document.querySelector("#selected-room-status"),
  quickRooms: document.querySelector("#quick-room-chips"),
  quickPhrases: document.querySelector("#quick-phrase-chips"),
  commandUndo: document.querySelector("#command-undo-button"),
  commandClear: document.querySelector("#command-clear-button"),
  situationStarters: document.querySelector("#situation-starters"),
  recordedFilters: document.querySelector("#recorded-event-filters"),
  recordedEvents: document.querySelector("#recorded-events"),
  validationPanel: document.querySelector("#validation-panel"),
  validationSummary: document.querySelector("#validation-summary"),
  waitInput: document.querySelector("#wait-input"),
  wait: document.querySelector("#wait-button"),
  undo: document.querySelector("#undo-action-button"),
  actionCount: document.querySelector("#action-count"),
  actionsEditor: document.querySelector("#actions-editor"),
  topologyMap: document.querySelector("#topology-map"),
  stateInspector: document.querySelector("#state-inspector"),
  roomOutcomes: document.querySelector("#room-outcomes"),
  roomTrace: document.querySelector("#room-trace"),
  pinSelectedOutcome: document.querySelector("#pin-selected-outcome-button"),
  pinAllOutcomes: document.querySelector("#pin-all-outcomes-button"),
  clearChecks: document.querySelector("#clear-checks-button"),
  timelineFirst: document.querySelector("#timeline-first-button"),
  timelinePrev: document.querySelector("#timeline-prev-button"),
  timelineNext: document.querySelector("#timeline-next-button"),
  timelineLatest: document.querySelector("#timeline-latest-button"),
  timelineRange: document.querySelector("#timeline-range"),
  timelineCurrent: document.querySelector("#timeline-current"),
  timeline: document.querySelector("#timeline"),
  diagnostics: document.querySelector("#diagnostics"),
  actionList: document.querySelector("#action-list"),
  transitions: document.querySelector("#transitions"),
  rawResult: document.querySelector("#raw-result"),
};

function setStatus(text, tone = "") {
  els.status.textContent = text;
  els.status.className = `status ${tone}`.trim();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function selectedRoomId() {
  return state.selectedRoomId || els.roomSelect.value || state.topology.rooms[0]?.id || "";
}

function selectedDoor() {
  return state.topology.doors.find((door) => door.id === els.doorSelect.value);
}

function defaultRoomId() {
  const preferred = state.topology.rooms.find((room) => room.id === "short_stay");
  if (preferred && doorsForRoom(preferred.id).length) {
    return preferred.id;
  }
  return (
    state.topology.rooms.find((room) => doorsForRoom(room.id).length)?.id ||
    state.topology.rooms[0]?.id ||
    ""
  );
}

function selectRoom(roomId, preferredDoorId = "") {
  if (!roomId) return;
  state.selectedRoomId = roomId;
  els.roomSelect.value = roomId;
  renderDoorOptions(preferredDoorId);
}

function doorsForRoom(roomId) {
  return state.topology.doors.filter((door) => door.room1_id === roomId || door.room2_id === roomId);
}

function doorLabelForRoom(door, roomId) {
  const otherRoomId = door.room1_id === roomId ? door.room2_id : door.room1_id;
  return `${roomName(roomId)} <-> ${roomName(otherRoomId)}`;
}

function normalizeLookupValue(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/[^a-z0-9 ]+/g, "")
    .replace(/\s+/g, " ");
}

function roomAliases(room) {
  return [
    room.id,
    room.id.replaceAll("_", " "),
    room.name,
    ...(room.aliases || []),
  ].map(normalizeLookupValue);
}

function commandRoomAliasEntries() {
  return state.topology.rooms
    .flatMap((room) => roomAliases(room).map((alias) => ({ alias, room })))
    .sort((a, b) => b.alias.length - a.alias.length);
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findRoomByName(value) {
  const normalized = normalizeLookupValue(value);
  return state.topology.rooms.find((room) => roomAliases(room).includes(normalized));
}

function roomCommandContext(command) {
  const normalizedCommand = normalizeLookupValue(command);
  const aliases = commandRoomAliasEntries();

  for (const { alias, room } of aliases) {
    for (const connector of [" in ", " at ", " into ", " to ", " from ", " "]) {
      const suffix = `${connector}${alias}`;
      if (normalizedCommand.endsWith(suffix)) {
        return {
          command: normalizedCommand.slice(0, -suffix.length).trim(),
          roomId: room.id,
        };
      }
    }
  }

  return { command: normalizedCommand, roomId: selectedRoomId() };
}

function doorByRooms(room1Id, room2Id) {
  return state.topology.doors.find(
    (door) =>
      (door.room1_id === room1Id && door.room2_id === room2Id) ||
      (door.room1_id === room2Id && door.room2_id === room1Id),
  );
}

function doorActionForDoor(type, door) {
  if (!door) {
    throw commandParseError("No matching door found for the selected room.", [
      "Door open to Transit Hall.",
      "Door close between Short Stay and Transit Hall.",
      "Door open.",
    ]);
  }
  const base = { room1_id: door.room1_id, room2_id: door.room2_id };
  switch (type) {
    case "open_door":
      return { type: "open_door", ...base };
    case "close_door":
      return { type: "close_door", ...base };
    case "door_unavailable":
      return { type: "door_unavailable", ...base };
    case "snapshot_open":
      return { type: "door_snapshot", ...base, open: true };
    case "snapshot_closed":
      return { type: "door_snapshot", ...base, open: false };
    default:
      throw new Error(`Unknown door action: ${type}`);
  }
}

function roomName(roomId) {
  return state.topology.rooms.find((room) => room.id === roomId)?.name || roomId;
}

function roomProfile(room) {
  return room?.is_transit ? "transit" : room?.profile || "default";
}

function readStoredJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeStoredJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function syncScenarioNameFromInput() {
  state.scenarioName = els.scenarioName.value.trim() || "Untitled scenario";
}

function saveWorkspace() {
  syncScenarioNameFromInput();
  writeStoredJson(WORKSPACE_KEY, {
    name: state.scenarioName,
    actions: state.actions,
    preset: state.selectedPreset,
    selectedRoomId: state.selectedRoomId,
    selectedDoorId: els.doorSelect.value,
  });
}

function loadSavedScenarios() {
  const stored = readStoredJson(SAVED_SCENARIOS_KEY, []);
  state.savedScenarios = Array.isArray(stored) ? stored : [];
}

function renderSavedScenarioOptions() {
  if (!state.savedScenarios.length) {
    els.savedScenarioSelect.innerHTML = '<option value="">No saved scenarios</option>';
    els.loadScenario.disabled = true;
    els.deleteScenario.disabled = true;
    return;
  }
  els.savedScenarioSelect.innerHTML = state.savedScenarios
    .map(
      (scenario) =>
        `<option value="${escapeHtml(scenario.id)}">${escapeHtml(scenario.name)} (${scenario.actions.length})</option>`,
    )
    .join("");
  els.loadScenario.disabled = false;
  els.deleteScenario.disabled = false;
}

function renderSituationStarters() {
  const entries = Object.entries(state.presets);
  if (!entries.length) {
    els.situationStarters.innerHTML = '<div class="meta">No situation presets loaded.</div>';
    return;
  }

  els.situationStarters.innerHTML = entries
    .map(
      ([id, preset]) => `
        <button type="button" class="situation-card" data-situation-preset="${escapeHtml(id)}">
          <strong>${escapeHtml(preset.label)}</strong>
          <span>${preset.actions.length} events</span>
        </button>
      `,
    )
    .join("");
}

function saveScenario() {
  try {
    const actions = parseActions();
    syncScenarioNameFromInput();
    const now = new Date().toISOString();
    const existing = state.savedScenarios.find(
      (scenario) => scenario.name.toLowerCase() === state.scenarioName.toLowerCase(),
    );
    const saved = {
      id: existing?.id || `${Date.now()}`,
      name: state.scenarioName,
      actions: structuredClone(actions),
      updatedAt: now,
    };
    state.savedScenarios = [
      saved,
      ...state.savedScenarios.filter((scenario) => scenario.id !== saved.id),
    ].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    writeStoredJson(SAVED_SCENARIOS_KEY, state.savedScenarios);
    renderSavedScenarioOptions();
    els.savedScenarioSelect.value = saved.id;
    saveWorkspace();
    setStatus("Scenario saved", "ok");
  } catch (err) {
    setStatus(err.message, "fail");
  }
}

function loadSavedScenario() {
  const saved = state.savedScenarios.find(
    (scenario) => scenario.id === els.savedScenarioSelect.value,
  );
  if (!saved) return;
  state.scenarioName = saved.name;
  els.scenarioName.value = saved.name;
  setActions(structuredClone(saved.actions));
  saveWorkspace();
  runScenario();
}

function deleteSavedScenario() {
  const selectedId = els.savedScenarioSelect.value;
  if (!selectedId) return;
  state.savedScenarios = state.savedScenarios.filter(
    (scenario) => scenario.id !== selectedId,
  );
  writeStoredJson(SAVED_SCENARIOS_KEY, state.savedScenarios);
  renderSavedScenarioOptions();
  setStatus("Scenario deleted", "ok");
}

function setActions(actions) {
  state.actions = actions;
  if (state.selectedActionIndex !== null && state.selectedActionIndex >= actions.length) {
    state.selectedActionIndex = actions.length ? actions.length - 1 : null;
  }
  if (state.insertAfterActionIndex !== null && state.insertAfterActionIndex >= actions.length) {
    state.insertAfterActionIndex = null;
  }
  if (state.replaceActionIndex !== null && state.replaceActionIndex >= actions.length) {
    state.replaceActionIndex = null;
  }
  els.actionsEditor.value = JSON.stringify(actions, null, 2);
  els.actionCount.textContent = `${actions.length} action${actions.length === 1 ? "" : "s"}`;
  els.summaryActions.textContent = String(actions.length);
  renderActionList();
  saveWorkspace();
}

function parseActions() {
  const parsed = JSON.parse(els.actionsEditor.value || "[]");
  if (!Array.isArray(parsed)) {
    throw new Error("Actions JSON must be a list.");
  }
  state.actions = parsed;
  els.actionCount.textContent = `${parsed.length} action${parsed.length === 1 ? "" : "s"}`;
  els.summaryActions.textContent = String(parsed.length);
  renderActionList();
  return parsed;
}

function actionsWithEditTarget(existingActions, newActions) {
  if (state.replaceActionIndex !== null) {
    const replaceAt = Math.max(0, Math.min(state.replaceActionIndex, existingActions.length - 1));
    return [
      ...existingActions.slice(0, replaceAt),
      ...newActions,
      ...existingActions.slice(replaceAt + 1),
    ];
  }
  if (state.insertAfterActionIndex === null) {
    return [...existingActions, ...newActions];
  }
  const insertAt = Math.max(0, Math.min(state.insertAfterActionIndex + 1, existingActions.length));
  return [
    ...existingActions.slice(0, insertAt),
    ...newActions,
    ...existingActions.slice(insertAt),
  ];
}

function editTargetFeedback(actionCount) {
  if (state.replaceActionIndex !== null) {
    return `Replaced step ${state.replaceActionIndex + 1} with ${actionCount} event step${actionCount === 1 ? "" : "s"}.`;
  }
  if (state.insertAfterActionIndex === null) {
    return `Added ${actionCount} event step${actionCount === 1 ? "" : "s"}.`;
  }
  return `Inserted ${actionCount} event step${actionCount === 1 ? "" : "s"} after step ${state.insertAfterActionIndex + 1}.`;
}

function editTargetFocusIndex(actionCount) {
  if (state.replaceActionIndex !== null) {
    return state.replaceActionIndex;
  }
  if (state.insertAfterActionIndex !== null) {
    return state.insertAfterActionIndex + Math.max(1, actionCount);
  }
  return null;
}

function clearEditTarget() {
  state.insertAfterActionIndex = null;
  state.replaceActionIndex = null;
}

function appendAction(action) {
  try {
    const feedback = editTargetFeedback(1);
    const focusActionIndex = editTargetFocusIndex(1);
    setActions(actionsWithEditTarget(parseActions(), [action]));
    clearEditTarget();
    setCommandFeedback(feedback, "ok");
    runScenario({ focusActionIndex });
  } catch (err) {
    setStatus(err.message, "fail");
  }
}

function roomAction(type) {
  return roomActionForRoom(type, selectedRoomId());
}

function roomActionForRoom(type, roomId) {
  switch (type) {
    case "enter_room":
      return {
        type: "enter_room",
        person_id: "subject",
        room_id: roomId,
        pir: true,
        mmwave: true,
        spatial_targets: 1,
      };
    case "set_pir":
      return { type: "set_pir", room_id: roomId, active: true };
    case "clear_pir":
      return { type: "clear_pir", room_id: roomId };
    case "clear_room":
      return { type: "clear_room", room_id: roomId };
    case "mmwave_0":
      return { type: "spatial_targets", room_id: roomId, count: 0 };
    case "mmwave_1":
      return { type: "spatial_targets", room_id: roomId, count: 1 };
    case "mmwave_2":
      return { type: "spatial_targets", room_id: roomId, count: 2 };
    case "override_on":
      return { type: "override_room", room_id: roomId, state: "occupied" };
    case "override_off":
      return { type: "override_room", room_id: roomId, state: "vacant" };
    case "expect_occupied":
      return { type: "expect_room", room_id: roomId, state: "occupied" };
    case "expect_vacant":
      return { type: "expect_room", room_id: roomId, state: "vacant" };
    case "expect_light_on":
      return { type: "expect_light", room_id: roomId, state: "on" };
    case "expect_light_off":
      return { type: "expect_light", room_id: roomId, state: "off" };
    case "recalculate":
      return { type: "recalculate", reason: "manual scenario refresh" };
    default:
      throw new Error(`Unknown room action: ${type}`);
  }
}

function doorAction(type) {
  const door = selectedDoor();
  if (!door) throw new Error("Select a door first.");
  return doorActionForDoor(type, door);
}

function doorActionForRoom(type, roomId) {
  const selected = selectedDoor();
  const roomDoors = doorsForRoom(roomId);
  const door =
    roomDoors.find((item) => item.id === selected?.id) ||
    roomDoors[0];
  return doorActionForDoor(type, door);
}

function noteAction(label) {
  return { type: "note", label };
}

function commandParseError(message, suggestions = COMMAND_SUGGESTIONS) {
  const error = new Error(message);
  error.suggestions = suggestions;
  return error;
}

function doorTypeFromPhrase(command) {
  if (["door open", "door opened", "door opens", "door is open", "open door"].includes(command)) {
    return "open_door";
  }
  if (["door close", "door closed", "door closes", "door is closed", "door shut", "close door"].includes(command)) {
    return "close_door";
  }
  if (["door unavailable", "door offline"].includes(command)) {
    return "door_unavailable";
  }
  return null;
}

function targetedDoorAction(command) {
  const betweenMatch = command.match(/^(.+?) between (.+?) (?:and|to) (.+)$/);
  if (betweenMatch) {
    const actionType = doorTypeFromPhrase(betweenMatch[1]);
    const firstRoom = findRoomByName(betweenMatch[2]);
    const secondRoom = findRoomByName(betweenMatch[3]);
    if (actionType && firstRoom && secondRoom) {
      return doorActionForDoor(actionType, doorByRooms(firstRoom.id, secondRoom.id));
    }
  }

  const toMatch = command.match(/^(.+?) to (.+)$/);
  if (toMatch) {
    const actionType = doorTypeFromPhrase(toMatch[1]);
    const targetRoom = findRoomByName(toMatch[2]);
    if (actionType && targetRoom) {
      return doorActionForDoor(actionType, doorByRooms(selectedRoomId(), targetRoom.id));
    }
  }

  return null;
}

function normalizeCommand(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[.!?]+$/g, "")
    .replace(/\s+/g, " ");
}

function normalizeActorCommand(command) {
  return command
    .replace(/^(?:i|we|someone|somebody|a person|the person|person|people)\s+/, "")
    .replace(/\bwalks\b/g, "walk")
    .replace(/\benters\b/g, "enter")
    .replace(/\bleaves\b/g, "leave")
    .replace(/\bgoes\b/g, "go")
    .replace(/^(?:am|is|are)\s+in$/, "enter")
    .trim();
}

function parseWalkPathCommand(rawCommand) {
  const command = normalizeActorCommand(normalizeLookupValue(rawCommand));
  if (!/^(?:walk|go|move|travel)\b/.test(command)) return null;

  const matches = [];
  for (const { alias, room } of commandRoomAliasEntries()) {
    const pattern = new RegExp(`\\b(?:from|to|into|in|through|via) ${escapeRegExp(alias)}\\b`, "g");
    for (const match of command.matchAll(pattern)) {
      matches.push({ index: match.index ?? 0, room });
    }
  }

  const rooms = matches
    .sort((a, b) => a.index - b.index)
    .map((match) => match.room)
    .filter((room, index, allRooms) => index === 0 || room.id !== allRooms[index - 1].id);
  if (rooms.length < 2) return null;

  const actions = [roomActionForRoom("enter_room", rooms[0].id)];
  for (let index = 1; index < rooms.length; index += 1) {
    actions.push({ type: "wait", seconds: 2 });
    actions.push(roomActionForRoom("clear_room", rooms[index - 1].id));
    actions.push(roomActionForRoom("enter_room", rooms[index].id));
  }
  return actions;
}

function parseSingleCommand(rawCommand) {
  const normalizedCommand = normalizeCommand(rawCommand);
  const walkPath = parseWalkPathCommand(normalizedCommand);
  if (walkPath) return walkPath;

  const targetCommand = normalizeLookupValue(rawCommand);
  const targetedDoor = targetedDoorAction(targetCommand);
  if (targetedDoor) return targetedDoor;

  const context = roomCommandContext(normalizedCommand);
  const command = normalizeActorCommand(context.command);
  const roomId = context.roomId;
  if (!command) return null;

  const waitMatch = command.match(/^(?:wait|pause)(?: for)?\s+(\d+)(?:\s*(s|sec|second|seconds|m|min|minute|minutes))?$/);
  if (waitMatch) {
    const amount = Number(waitMatch[1]);
    const unit = waitMatch[2] || "seconds";
    return { type: "wait", seconds: unit.startsWith("m") ? amount * 60 : amount };
  }

  if (["motion on", "motion detected", "motion is on", "movement on", "movement detected"].includes(command)) {
    return { type: "set_pir", room_id: roomId, active: true };
  }
  if (["motion off", "no motion", "motion clear", "motion is off", "motion not detected", "movement off", "movement clear"].includes(command)) {
    return { type: "clear_pir", room_id: roomId };
  }
  if (["door open", "door opened", "door is open", "open door"].includes(command)) {
    return doorActionForRoom("open_door", roomId);
  }
  if (["door close", "door closed", "door is closed", "door shut", "close door"].includes(command)) {
    return doorActionForRoom("close_door", roomId);
  }
  if (["door unavailable", "door offline"].includes(command)) {
    return doorActionForRoom("door_unavailable", roomId);
  }
  if (["mmwave in room", "mmwave room", "mmwave detected", "presence in room", "presence detected", "person in room"].includes(command)) {
    return { type: "set_mmwave", room_id: roomId, active: true, spatial_targets: 1 };
  }
  if (["mmwave in zone", "mmwave zone", "zone detected", "presence in zone", "person in zone"].includes(command)) {
    return { type: "spatial_targets", room_id: roomId, count: 1, source: "command_zone" };
  }
  if (["mmwave clear", "mmwave off", "no mmwave", "presence clear", "presence off", "zone clear", "zone off"].includes(command)) {
    return [
      { type: "set_mmwave", room_id: roomId, active: false, spatial_targets: 0 },
      { type: "spatial_targets", room_id: roomId, count: 0, source: "command_zone" },
    ];
  }
  if (["enter", "enter room", "walk", "walk in", "walk into room", "walk into", "walk to", "go", "go to", "in"].includes(command)) {
    return roomActionForRoom("enter_room", roomId);
  }
  if (["leave", "leave room", "walk out", "clear room", "empty room"].includes(command)) {
    return roomActionForRoom("clear_room", roomId);
  }
  if (["override on", "occupancy on", "occupied"].includes(command)) {
    return roomActionForRoom("override_on", roomId);
  }
  if (["override off", "occupancy off", "vacant"].includes(command)) {
    return roomActionForRoom("override_off", roomId);
  }
  if (["expect occupied", "should be occupied"].includes(command)) {
    return roomActionForRoom("expect_occupied", roomId);
  }
  if (["expect vacant", "should be vacant"].includes(command)) {
    return roomActionForRoom("expect_vacant", roomId);
  }
  if (["expect light on", "should light be on", "light should be on", "should have light on"].includes(command)) {
    return roomActionForRoom("expect_light_on", roomId);
  }
  if (["expect light off", "should light be off", "light should be off", "should have light off"].includes(command)) {
    return roomActionForRoom("expect_light_off", roomId);
  }
  if (["light on", "light is on", "lights on", "lights are on"].includes(command)) {
    return { type: "set_light", room_id: roomId, active: true };
  }
  if (["light off", "light is off", "lights off", "lights are off"].includes(command)) {
    return { type: "set_light", room_id: roomId, active: false };
  }

  throw commandParseError(`Could not understand "${rawCommand.trim()}".`);
}

function consumePackedCommand(command) {
  const waitMatch = command.match(/^(wait(?: for)?\s+\d+(?:\s*(?:s|sec|second|seconds|m|min|minute|minutes))?)(?:\s+|$)(.*)$/);
  if (waitMatch) {
    return { command: waitMatch[1], rest: waitMatch[2] };
  }

  const phrase = PACKED_COMMAND_PHRASES.find((candidate) => (
    command === candidate || command.startsWith(`${candidate} `)
  ));
  if (!phrase) return null;

  const rest = command.slice(phrase.length).trim();
  const targeted = consumePackedRoomTarget(rest);
  if (targeted) {
    return {
      command: `${phrase} ${targeted.connector} ${targeted.alias}`,
      rest: targeted.rest,
    };
  }

  return { command: phrase, rest };
}

function parsePackedCommands(rawCommand) {
  let remaining = normalizeCommand(rawCommand);
  const actions = [];

  while (remaining) {
    const consumed = consumePackedCommand(remaining);
    if (!consumed) return null;
    actions.push(...[parseSingleCommand(consumed.command)].flat());
    remaining = consumed.rest;
  }

  return actions;
}

function startsWithPackedCommand(command) {
  return (
    PACKED_COMMAND_PHRASES.some((phrase) => command === phrase || command.startsWith(`${phrase} `)) ||
    /^(?:wait|pause)(?: for)?\s+\d+/.test(command)
  );
}

function consumePackedRoomTarget(rest) {
  if (!rest) return null;
  const aliases = commandRoomAliasEntries();

  for (const connector of ROOM_COMMAND_CONNECTORS) {
    for (const { alias } of aliases) {
      const prefix = `${connector} ${alias}`;
      if (rest !== prefix && !rest.startsWith(`${prefix} `)) continue;
      const next = rest.slice(prefix.length).trim();
      if (!next || startsWithPackedCommand(next)) {
        return { connector, alias, rest: next };
      }
    }
  }

  return null;
}

function parseCommandSegment(part) {
  try {
    return [parseSingleCommand(part)].flat();
  } catch (err) {
    const packed = parsePackedCommands(part);
    if (packed) return packed;
    throw err;
  }
}

function parseCommandInput(value) {
  const parts = value.split(/\s+(?:and\s+)?then\s+|[,;.\n]+/i).map((item) => item.trim()).filter(Boolean);
  if (!parts.length) {
    throw new Error("Type a command first.");
  }
  return parts.flatMap((part) => parseCommandSegment(part) || []);
}

function setCommandFeedback(text, tone = "") {
  els.commandFeedback.textContent = text;
  els.commandFeedback.className = `command-feedback ${tone}`.trim();
}

function clearCommandPreview() {
  els.commandPreview.innerHTML = "";
}

function setCommandAddReady(ready) {
  els.commandAdd.disabled = !ready;
}

function commandPreviewTitle() {
  if (state.replaceActionIndex !== null) {
    return `Enter will replace step ${state.replaceActionIndex + 1}`;
  }
  if (state.insertAfterActionIndex !== null) {
    return `Enter will insert after step ${state.insertAfterActionIndex + 1}`;
  }
  return "Enter will add";
}

function renderCommandPreview(actions, title = "Will add") {
  if (!actions.length) {
    clearCommandPreview();
    return;
  }
  els.commandPreview.innerHTML = `
    <div class="command-preview-title">${escapeHtml(title)}</div>
    <div class="command-preview-list">
      ${actions.map((action) => `<span class="command-preview-item">${escapeHtml(actionLabel(action))}</span>`).join("")}
    </div>
  `;
}

function renderCommandSuggestions(suggestions = COMMAND_SUGGESTIONS) {
  els.commandPreview.innerHTML = `
    <div class="command-preview-title">Try</div>
    <div class="command-preview-list">
      ${suggestions.map((suggestion) => `<button type="button" class="command-preview-item fail" data-command-suggestion="${escapeHtml(suggestion)}">${escapeHtml(suggestion)}</button>`).join("")}
    </div>
  `;
}

function applyCommandSuggestion(suggestion) {
  els.commandInput.value = suggestion;
  updateCommandPreview();
  els.commandInput.focus();
}

function applyCommandAlias(alias) {
  const current = els.commandInput.value.trim();
  els.commandInput.value = current ? `${current} in ${alias}` : `in ${alias}`;
  updateCommandPreview();
  els.commandInput.focus();
}

function roomPrimaryAlias(room) {
  return room?.aliases?.[0] || room?.name || room?.id || "room";
}

function applyRoomTarget(roomId) {
  selectRoom(roomId);
  updateCommandPreview();
  renderSelectedState();
  els.commandInput.focus();
}

function renderQuickRooms() {
  if (!els.quickRooms) return;
  const selectedId = selectedRoomId();
  els.quickRooms.innerHTML = state.topology.rooms
    .map((room) => {
      const label = roomPrimaryAlias(room);
      return `
        <button
          type="button"
          class="quick-room-chip ${room.id === selectedId ? "active" : ""}"
          data-quick-room="${escapeHtml(room.id)}"
          title="${escapeHtml(room.name)}"
        >${escapeHtml(label)}</button>
      `;
    })
    .join("");
}

function quickPhraseState(phrase, snapshot = selectedSnapshot()) {
  const roomId = selectedRoomId();
  const item = snapshot[roomId] || {};
  const lightState = selectedLightSnapshot()[roomId] || "off";
  const occupied = item.state === "occupied";
  const motionOn = Boolean(item.motion_active);
  const presenceOn = Boolean(item.presence_active);
  const zoneOn = Boolean(item.spatial_presence_active);
  const sealed = Boolean(item.sealed);

  switch (phrase) {
    case "enter":
    case "leave":
      return { current: false, category: "person" };
    case "occupied":
      return { current: occupied, category: "occupancy" };
    case "vacant":
      return { current: !occupied, category: "occupancy" };
    case "light on":
      return { current: lightState === "on", category: "light" };
    case "light off":
      return { current: lightState !== "on", category: "light" };
    case "motion on":
      return { current: motionOn, category: "motion" };
    case "motion off":
      return { current: !motionOn, category: "motion" };
    case "door open":
      return { current: !sealed, category: "door" };
    case "door close":
      return { current: sealed, category: "door" };
    case "mmwave in room":
      return { current: presenceOn, category: "presence" };
    case "mmwave in zone":
      return { current: zoneOn, category: "presence" };
    case "mmwave clear":
      return { current: !presenceOn && !zoneOn, category: "presence" };
    case "wait 15":
    case "wait 30":
    case "wait 2 minutes":
      return { current: false, category: "wait" };
    default:
      return { current: false, category: "" };
  }
}

function quickPhraseLabel(phrase) {
  switch (phrase) {
    case "enter":
      return "Enter";
    case "leave":
      return "Leave";
    case "occupied":
      return "Occupied";
    case "vacant":
      return "Vacant";
    case "light on":
    case "motion on":
      return "On";
    case "light off":
    case "motion off":
      return "Off";
    case "door open":
      return "Open";
    case "door close":
      return "Closed";
    case "mmwave in room":
      return "In room";
    case "mmwave in zone":
      return "In zone";
    case "mmwave clear":
      return "Clear";
    case "wait 15":
      return "15 s";
    case "wait 30":
      return "30 s";
    case "wait 2 minutes":
      return "2 min";
    default:
      return phrase;
  }
}

function renderQuickPhrases(snapshot = selectedSnapshot()) {
  if (!els.quickPhrases) return;
  const currentLabel = isViewingLatestTimeline() ? "current" : "here";
  const groups = [
    {
      label: "Person",
      phrases: ["enter", "leave"],
    },
    {
      label: "Occupancy",
      phrases: ["occupied", "vacant"],
    },
    {
      label: "Light",
      phrases: ["light on", "light off"],
    },
    {
      label: "Motion",
      phrases: ["motion on", "motion off"],
    },
    {
      label: "Door",
      phrases: ["door open", "door close"],
    },
    {
      label: "mmWave",
      phrases: ["mmwave in room", "mmwave in zone", "mmwave clear"],
    },
    {
      label: "Timing",
      phrases: ["wait 15", "wait 30", "wait 2 minutes"],
    },
  ];
  els.quickPhrases.innerHTML = groups
    .map((group) => `
      <section class="quick-phrase-group" aria-label="${escapeHtml(group.label)} states">
        <h4>${escapeHtml(group.label)}</h4>
        <div>
          ${group.phrases
            .map((phrase) => {
              const phraseState = quickPhraseState(phrase, snapshot);
              const classes = [
                "quick-phrase-chip",
                phraseState.category,
                phraseState.current ? "current" : "",
              ].filter(Boolean).join(" ");
              return `
                <button
                  type="button"
                  class="${escapeHtml(classes)}"
                  data-quick-phrase="${escapeHtml(phrase)}"
                  aria-pressed="${phraseState.current ? "true" : "false"}"
                  aria-label="${escapeHtml(`${group.label} ${quickPhraseLabel(phrase)}`)}"
                  title="${escapeHtml(phrase)}"
                >
                  <span>${escapeHtml(quickPhraseLabel(phrase))}</span>
                  ${phraseState.current ? `<span class="quick-phrase-state">${escapeHtml(currentLabel)}</span>` : ""}
                </button>
              `;
            })
            .join("")}
        </div>
      </section>
    `)
    .join("");
}

function updateCommandPreview() {
  if (!els.commandInput.value.trim()) {
    setCommandFeedback("Ready.");
    clearCommandPreview();
    setCommandAddReady(false);
    return;
  }
  try {
    const actions = parseCommandInput(els.commandInput.value);
    setCommandFeedback(`${actions.length} event step${actions.length === 1 ? "" : "s"} ready.`);
    renderCommandPreview(actions, commandPreviewTitle());
    setCommandAddReady(actions.length > 0);
  } catch (err) {
    setCommandFeedback(err.message, "fail");
    renderCommandSuggestions(err.suggestions);
    setCommandAddReady(false);
  }
}

function renderCommandEntryMode() {
  if (state.replaceActionIndex !== null) {
    els.commandAdd.textContent = "Replace step";
    els.commandInput.placeholder = "replacement state, e.g. door closed";
    return;
  }
  if (state.insertAfterActionIndex !== null) {
    els.commandAdd.textContent = "Insert states";
    els.commandInput.placeholder = "states to insert, e.g. motion on";
    return;
  }
  els.commandAdd.textContent = "Add states";
  els.commandInput.placeholder = "light on, motion off, door open, mmwave in room, mmwave in zone";
}

function appendCommandInput(value = els.commandInput.value) {
  try {
    const actions = parseCommandInput(value);
    const feedback = editTargetFeedback(actions.length);
    const focusActionIndex = editTargetFocusIndex(actions.length);
    setActions(actionsWithEditTarget(parseActions(), actions));
    clearEditTarget();
    els.commandInput.value = "";
    setCommandFeedback(feedback, "ok");
    clearCommandPreview();
    setCommandAddReady(false);
    runScenario({ focusActionIndex });
  } catch (err) {
    setCommandFeedback(err.message, "fail");
    renderCommandSuggestions(err.suggestions);
    setCommandAddReady(false);
    setStatus(err.message, "fail");
  }
}

function appendCommandExample(command) {
  appendCommandInput(command);
}

function resetScenario() {
  state.scenarioName = "Untitled scenario";
  clearEditTarget();
  els.scenarioName.value = state.scenarioName;
  selectRoom(defaultRoomId());
  setActions([]);
  renderResult(null);
  localStorage.removeItem(WORKSPACE_KEY);
  els.commandInput.value = "";
  setCommandFeedback("Ready.");
  clearCommandPreview();
  setCommandAddReady(false);
  setStatus("Ready");
}

function undoLastAction() {
  try {
    const actions = parseActions();
    if (!actions.length) {
      setCommandFeedback("No actions to undo.");
      return;
    }
    const removedAction = actions[actions.length - 1];
    setActions(actions.slice(0, -1));
    clearCommandPreview();
    setCommandFeedback("Removed the last action.", "ok");
    runScenario();
  } catch (err) {
    setCommandFeedback(err.message, "fail");
    setStatus(err.message, "fail");
  }
}

function renderDoorOptions(preferredDoorId = els.doorSelect.value) {
  const roomId = selectedRoomId();
  const roomDoors = doorsForRoom(roomId);
  els.doorSelect.innerHTML = roomDoors.length
    ? roomDoors
        .map((door) => `<option value="${escapeHtml(door.id)}">${escapeHtml(doorLabelForRoom(door, roomId))}</option>`)
        .join("")
    : '<option value="">No connected door</option>';
  if (roomDoors.some((door) => door.id === preferredDoorId)) {
    els.doorSelect.value = preferredDoorId;
  } else if (roomDoors[0]) {
    els.doorSelect.value = roomDoors[0].id;
  }
}

function renderOptions() {
  els.presetSelect.innerHTML = Object.entries(state.presets)
    .map(([id, preset]) => `<option value="${escapeHtml(id)}">${escapeHtml(preset.label)}</option>`)
    .join("");
  renderSituationStarters();
  els.roomSelect.innerHTML = state.topology.rooms
    .map((room) => `<option value="${escapeHtml(room.id)}">${escapeHtml(room.name)}</option>`)
    .join("");
  state.selectedPreset = els.presetSelect.value;
  state.selectedRoomId = defaultRoomId();
  els.roomSelect.value = state.selectedRoomId;
  renderDoorOptions();
  renderQuickPhrases();
  renderQuickRooms();
}

function loadSelectedPreset() {
  loadPreset(els.presetSelect.value);
}

function loadPreset(presetId) {
  const preset = state.presets[presetId];
  if (!preset) return;
  state.selectedPreset = presetId;
  els.presetSelect.value = presetId;
  state.scenarioName = preset.label;
  els.scenarioName.value = preset.label;
  setActions(structuredClone(preset.actions));
  setCommandFeedback(`Loaded ${preset.label}.`, "ok");
  clearCommandPreview();
  runScenario();
}

function selectedTimelineEntry() {
  const timeline = state.result?.timeline || [];
  if (!timeline.length) return null;
  const clamped = Math.max(0, Math.min(state.selectedTimelineIndex, timeline.length - 1));
  state.selectedTimelineIndex = clamped;
  return timeline[clamped];
}

function selectedSnapshot() {
  return selectedTimelineEntry()?.rooms || state.result?.final || {};
}

function selectedLightSnapshot() {
  return selectedTimelineEntry()?.lights || state.result?.final_lights || {};
}

function latestTimelineIndex() {
  return Math.max(0, (state.result?.timeline || []).length - 1);
}

function isViewingLatestTimeline() {
  const timeline = state.result?.timeline || [];
  return !timeline.length || state.selectedTimelineIndex >= timeline.length - 1;
}

function actionIndexForTimelineIndex(timelineIndex) {
  if (timelineIndex <= 0 || !state.actions.length) return null;
  const mapping = state.result?.action_timeline || [];
  const match = mapping.find(
    (item) =>
      timelineIndex >= item.start_timeline_index &&
      timelineIndex <= item.end_timeline_index,
  );
  if (match) return match.index;
  return Math.min(state.actions.length - 1, timelineIndex - 1);
}

function countOccupied(snapshot) {
  return Object.values(snapshot || {}).filter((room) => room.state === "occupied").length;
}

function countLightsOn(lights) {
  return Object.values(lights || {}).filter((value) => value === "on").length;
}

function checkSummary(result = state.result) {
  const expectations = result?.expectations || [];
  const passed = expectations.filter((item) => item.passed).length;
  return { passed, total: expectations.length };
}

function resultLabel(result = state.result) {
  if (!result) return "Not run";
  if (!result.ok) return "Failed";
  const checks = checkSummary(result);
  return checks.total ? "Passed" : "Ran";
}

function resultStatusText(result = state.result) {
  if (!result) return "Ready";
  if (!result.ok) return "Scenario failed";
  const checks = checkSummary(result);
  return checks.total ? "Scenario passed" : "Scenario ran";
}

function resultCallout() {
  const result = state.result;
  if (!result || result.ok) return null;
  const firstError = (result.errors || [])[0];
  if (firstError) {
    return {
      title: `Action ${Number(firstError.index) + 1} failed`,
      detail: firstError.error || "The simulator could not run this action.",
      actionIndex: firstError.index,
    };
  }

  const firstFailedExpectation = (result.expectations || []).find((item) => !item.passed);
  if (!firstFailedExpectation) return null;
  return {
    title: expectationTitle(firstFailedExpectation),
    detail: expectationDetail(firstFailedExpectation),
    actionIndex: firstFailedExpectation.index,
  };
}

function renderResultCallout() {
  const callout = resultCallout();
  if (!callout) {
    els.resultCallout.hidden = true;
    els.resultCallout.innerHTML = "";
    return;
  }

  els.resultCallout.hidden = false;
  els.resultCallout.innerHTML = `
    <div>
      <strong>${escapeHtml(callout.title)}</strong>
      <span>${escapeHtml(callout.detail)}</span>
    </div>
    <button type="button" data-result-callout-action="${Number(callout.actionIndex)}">Inspect</button>
  `;
}

function renderSummary() {
  const entry = selectedTimelineEntry();
  const snapshot = selectedSnapshot();
  const lights = selectedLightSnapshot();
  const checks = checkSummary();
  els.summaryResult.textContent = resultLabel();
  els.summaryTime.textContent = entry ? `${entry.at_seconds.toFixed(0)} s` : "0 s";
  els.summaryActions.textContent = String(state.actions.length);
  els.summaryOccupied.textContent = String(countOccupied(snapshot));
  els.summaryLights.textContent = String(countLightsOn(lights));
  els.summaryChecks.textContent = `${checks.passed} / ${checks.total}`;
  els.timelineCurrent.textContent = entry ? `${entry.at_seconds.toFixed(0)} s - ${entry.label}` : "Current snapshot";
  renderResultCallout();
}

function validationActionsMarkup() {
  return `
    <div class="validation-actions">
      <button type="button" class="command-chip check" data-validation-action="expect_occupied">expect occupied</button>
      <button type="button" class="command-chip check" data-validation-action="expect_vacant">expect vacant</button>
      <button type="button" class="command-chip check" data-validation-action="expect_light_on">expect light on</button>
      <button type="button" class="command-chip check" data-validation-action="expect_light_off">expect light off</button>
    </div>
  `;
}

function expectationSubject(item) {
  return `${roomName(item.room_id)} ${item.kind === "light" ? "light" : "occupancy"}`;
}

function expectationDescription(item) {
  return `${item.expected_state} · got ${item.actual_state} · ${Number(item.at_seconds).toFixed(0)} s`;
}

function expectationTitle(item) {
  return `Expected ${expectationSubject(item)} to be ${item.expected_state}`;
}

function expectationDetail(item) {
  if (item.kind === "light") {
    return `Got light ${item.actual_state}`;
  }
  return `Got ${item.actual_state}${item.expected_sealed === null ? "" : `, sealed ${item.actual_sealed}`}`;
}

function renderValidation() {
  const result = state.result;
  const checks = checkSummary(result);
  els.validationSummary.textContent = `${checks.passed} / ${checks.total}`;

  if (!result) {
    els.validationPanel.innerHTML = `
      <div class="validation-empty">
        <strong>No run yet</strong>
        ${validationActionsMarkup()}
      </div>
    `;
    return;
  }

  if (!checks.total) {
    els.validationPanel.innerHTML = `
      <div class="validation-empty warn">
        <strong>No checks</strong>
        ${validationActionsMarkup()}
      </div>
    `;
    return;
  }

  els.validationPanel.innerHTML = (result.expectations || [])
    .map(
      (item, index) => `
        <button type="button" class="validation-row ${item.passed ? "good" : "fail"}" data-validation-index="${index}">
          <span class="validation-state">${item.passed ? "Pass" : "Fail"}</span>
          <span>
            <strong>${escapeHtml(expectationSubject(item))}</strong>
            <span>${escapeHtml(expectationDescription(item))}</span>
          </span>
        </button>
      `,
    )
    .join("");
}

function renderCommandContext(snapshot = {}) {
  const roomId = selectedRoomId();
  const room = state.topology.rooms.find((item) => item.id === roomId);
  const aliases = (room?.aliases || []).slice(0, 5);
  els.commandContext.dataset.selectedRoom = roomId;
  els.commandContext.innerHTML = `
    ${aliases.length ? `
      <div class="command-context-aliases">
        <span>Also accepts</span>
        <div>
          ${aliases.map((alias) => `<button type="button" class="alias-pill" data-command-alias="${escapeHtml(alias)}">${escapeHtml(alias)}</button>`).join("")}
        </div>
      </div>
    ` : '<div class="command-context-empty">No aliases for this room.</div>'}
  `;
}

function selectedStatusItem(label, value, tone = "") {
  return `
    <span class="selected-status-item ${escapeHtml(tone)}">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </span>
  `;
}

function renderSelectedRoomStatus(snapshot = {}) {
  if (!els.selectedRoomStatus) return;
  const roomId = selectedRoomId();
  const room = state.topology.rooms.find((item) => item.id === roomId);
  const item = snapshot[roomId] || {};
  const entry = selectedTimelineEntry();
  const lightState = selectedLightSnapshot()[roomId] || "off";
  const door = selectedDoor();
  const confidence = Math.round((item.confidence || 0) * 100);
  const viewingLatest = isViewingLatestTimeline();
  const timelineLabel = entry
    ? `${entry.at_seconds.toFixed(0)} s`
    : "0 s";
  const occupied = item.state === "occupied";
  const lightOn = lightState === "on";
  const motionOn = Boolean(item.motion_active);
  const presenceOn = Boolean(item.presence_active);
  const zoneOn = Boolean(item.spatial_presence_active);

  els.selectedRoomStatus.innerHTML = `
    <div class="selected-status-heading">
      <div>
        <strong>${escapeHtml(roomPrimaryAlias(room))}</strong>
        <span>${escapeHtml(door ? doorLabelForRoom(door, roomId) : "No connected door")}</span>
      </div>
      <div class="selected-status-actions">
        <span class="selected-status-mode ${viewingLatest ? "latest" : "past"}">
          ${viewingLatest ? "Latest" : "Past"} · ${escapeHtml(timelineLabel)}
        </span>
        ${viewingLatest ? "" : '<button type="button" data-selected-status-action="latest">Latest</button>'}
        <span class="selected-status-confidence">${confidence}%</span>
      </div>
    </div>
    <div class="selected-status-grid">
      ${selectedStatusItem("Occupancy", item.state || "vacant", occupied ? "good" : "")}
      ${selectedStatusItem("Light", lightOn ? "on" : "off", lightOn ? "light" : "")}
      ${selectedStatusItem("Motion", motionOn ? "on" : "off", motionOn ? "motion" : "")}
      ${selectedStatusItem("mmWave room", presenceOn ? "in room" : "clear", presenceOn ? "presence" : "")}
      ${selectedStatusItem("mmWave zone", zoneOn ? "in zone" : "clear", zoneOn ? "presence" : "")}
      ${selectedStatusItem("Door", item.sealed ? "closed" : "open", item.sealed ? "warn" : "")}
    </div>
  `;
}

function renderEditTargetHint() {
  if (!els.editTargetHint) return;
  const latestStep = state.actions.length || 0;
  const selectedAction = state.selectedActionIndex;
  const viewingLatest = isViewingLatestTimeline();

  if (!state.actions.length) {
    els.editTargetHint.className = "edit-target-hint";
    els.editTargetHint.textContent = "New states start this scenario.";
    renderCommandEntryMode();
    return;
  }

  if (state.insertAfterActionIndex !== null) {
    els.editTargetHint.className = "edit-target-hint insert";
    els.editTargetHint.innerHTML = `
      <span>Next state inserts after step ${state.insertAfterActionIndex + 1}.</span>
      <button type="button" data-edit-target-action="cancel">Cancel insert</button>
    `;
    renderCommandEntryMode();
    return;
  }

  if (state.replaceActionIndex !== null) {
    els.editTargetHint.className = "edit-target-hint replace";
    els.editTargetHint.innerHTML = `
      <span>Next state replaces step ${state.replaceActionIndex + 1}.</span>
      <button type="button" data-edit-target-action="cancel">Cancel replace</button>
    `;
    renderCommandEntryMode();
    return;
  }

  if (viewingLatest) {
    els.editTargetHint.className = "edit-target-hint";
    els.editTargetHint.textContent = `New states append after step ${latestStep}.`;
    renderCommandEntryMode();
    return;
  }

  const inspectedStep = selectedAction === null ? "an earlier state" : `step ${selectedAction + 1}`;
  els.editTargetHint.className = "edit-target-hint past";
  els.editTargetHint.innerHTML = `
    <span>Inspecting ${escapeHtml(inspectedStep)}; new states still append after step ${latestStep}.</span>
  `;
  renderCommandEntryMode();
}

function renderTopology(snapshot = {}) {
  const selectedId = selectedRoomId();
  const selectedDoorId = els.doorSelect.value;
  const doorPairs = new Set(
    state.topology.doors.map((door) => [door.room1_id, door.room2_id].sort().join("__")),
  );
  const links = [];
  const seenLinks = new Set();

  for (const room of state.topology.rooms) {
    for (const connectedId of room.connected_rooms || []) {
      const key = [room.id, connectedId].sort().join("__");
      if (seenLinks.has(key)) continue;
      seenLinks.add(key);
      const a = roomLayout[room.id];
      const b = roomLayout[connectedId];
      if (!a || !b) continue;
      const door = state.topology.doors.find((item) => item.id === key);
      links.push({
        key,
        sensor: doorPairs.has(key),
        selected: door?.id === selectedDoorId,
        x1: a.x + a.w / 2,
        y1: a.y + a.h / 2,
        x2: b.x + b.w / 2,
        y2: b.y + b.h / 2,
      });
    }
  }

  const linkMarkup = links
    .map(
      (link) => `
        <line
          class="map-link ${link.sensor ? "sensor" : ""} ${link.selected ? "selected" : ""}"
          x1="${link.x1}" y1="${link.y1}" x2="${link.x2}" y2="${link.y2}"
        />
      `,
    )
    .join("");

  const roomMarkup = state.topology.rooms
    .map((room) => {
      const layout = roomLayout[room.id] || { x: 20, y: 20, w: 150, h: 76 };
      const item = snapshot[room.id] || {};
      const occupied = item.state === "occupied";
      const checking = item.checking_active;
      const confidence = Math.round((item.confidence || 0) * 100);
      const stateLabel = `${item.state || "vacant"} - ${confidence}%`;
      return `
        <g class="map-room ${occupied ? "occupied" : ""} ${checking ? "checking" : ""} ${room.id === selectedId ? "selected" : ""}" data-room-id="${escapeHtml(room.id)}">
          <rect x="${layout.x}" y="${layout.y}" width="${layout.w}" height="${layout.h}"></rect>
          <text x="${layout.x + 12}" y="${layout.y + 28}">${escapeHtml(room.name)}</text>
          <text class="room-state-label" x="${layout.x + 12}" y="${layout.y + 51}">${escapeHtml(stateLabel)}</text>
        </g>
      `;
    })
    .join("");

  els.topologyMap.innerHTML = `
    <svg viewBox="0 0 820 520" role="img" aria-label="Anonymized simulator topology">
      ${linkMarkup}
      ${roomMarkup}
    </svg>
  `;

  els.topologyMap.querySelectorAll("[data-room-id]").forEach((node) => {
    node.addEventListener("click", () => {
      selectRoom(node.dataset.roomId);
      renderSelectedState();
    });
  });
}

function renderInspector(snapshot = {}) {
  const roomId = selectedRoomId();
  const room = state.topology.rooms.find((item) => item.id === roomId);
  const item = snapshot[roomId] || {};
  const lightState = selectedLightSnapshot()[roomId] || "off";
  const confidence = Math.round((item.confidence || 0) * 100);
  const sensors = item.contributing_sensors || [];
  const deltas = roomDeltas(roomId);

  els.stateInspector.innerHTML = `
    <div class="inspector-title">
      <div>
        <strong>${escapeHtml(room?.name || "Room")}</strong>
        <div class="meta">${escapeHtml(roomProfile(room))}</div>
      </div>
      <span class="pill ${item.state === "occupied" ? "good" : ""}">${escapeHtml(item.state || "vacant")}</span>
    </div>
    <div class="fact-grid">
      <div class="fact"><span>Sealed</span><strong>${item.sealed ? "Yes" : "No"}</strong></div>
      <div class="fact"><span>Light</span><strong>${lightState === "on" ? "On" : "Off"}</strong></div>
      <div class="fact"><span>Confidence</span><strong>${confidence} %</strong></div>
      <div class="fact"><span>Checking</span><strong>${item.checking_active ? "Active" : "Idle"}</strong></div>
      <div class="fact"><span>Post-close hold</span><strong>${item.post_close_hold_active ? "Active" : "Idle"}</strong></div>
    </div>
    <div>
      <div class="meta">Contributing sensors</div>
      <div class="pill-row">
        ${
          sensors.length
            ? sensors.map((sensor) => `<span class="pill">${escapeHtml(sensor)}</span>`).join("")
            : '<span class="pill">None</span>'
        }
      </div>
    </div>
    <div>
      <div class="meta">Changed at this step</div>
      <div class="pill-row">
        ${
          deltas.length
            ? deltas.map((delta) => `<span class="pill warn">${escapeHtml(delta)}</span>`).join("")
            : '<span class="pill">No room-level change</span>'
        }
      </div>
    </div>
  `;
}

function renderRoomOutcomes(snapshot = {}) {
  const lights = selectedLightSnapshot();
  const selectedId = selectedRoomId();
  if (!els.roomOutcomes) return;

  if (!state.topology.rooms.length) {
    els.roomOutcomes.innerHTML = '<div class="room-outcome-empty">No rooms loaded.</div>';
    return;
  }

  els.roomOutcomes.innerHTML = state.topology.rooms
    .map((room) => {
      const item = snapshot[room.id] || {};
      const stateLabel = item.state || "vacant";
      const occupied = stateLabel === "occupied";
      const lightOn = (lights[room.id] || "off") === "on";
      const confidence = Math.round((item.confidence || 0) * 100);
      const changed = roomDeltasAt(room.id, state.selectedTimelineIndex).length > 0;
      return `
        <button
          type="button"
          class="room-outcome ${occupied ? "occupied" : ""} ${lightOn ? "light-on" : ""} ${item.checking_active ? "checking" : ""} ${room.id === selectedId ? "selected" : ""}"
          data-outcome-room="${escapeHtml(room.id)}"
        >
          <span class="room-outcome-name">${escapeHtml(roomPrimaryAlias(room))}</span>
          <span class="room-outcome-state">${escapeHtml(stateLabel)} · ${confidence}%</span>
          <span class="room-outcome-pills">
            <span>${lightOn ? "light on" : "light off"}</span>
            <span>${item.sealed ? "sealed" : "open"}</span>
            ${item.checking_active ? "<span>checking</span>" : ""}
            ${changed ? "<span>changed</span>" : ""}
          </span>
        </button>
      `;
    })
    .join("");
}

function finalRoomSnapshot() {
  return state.result?.final || selectedSnapshot();
}

function finalLightSnapshot() {
  return state.result?.final_lights || selectedLightSnapshot();
}

function outcomeCheckActions(roomIds) {
  const rooms = finalRoomSnapshot();
  const lights = finalLightSnapshot();
  return roomIds.flatMap((roomId) => [
    {
      type: "expect_room",
      room_id: roomId,
      state: rooms[roomId]?.state || "vacant",
      source: "outcome",
    },
    {
      type: "expect_light",
      room_id: roomId,
      state: lights[roomId] || "off",
      source: "outcome",
    },
  ]);
}

function isExpectationAction(action) {
  return action?.type === "expect_room" || action?.type === "expect_light";
}

function isManagedOutcomeCheck(action, roomIds) {
  return isExpectationAction(action) && action.source === "outcome" && roomIds.includes(action.room_id);
}

function appendOutcomeChecks(roomIds) {
  if (!state.result) {
    setCommandFeedback("Run a scenario before adding outcome checks.", "fail");
    return;
  }

  try {
    const existingActions = parseActions();
    const actions = outcomeCheckActions(roomIds);
    const preservedActions = existingActions.filter((action) => !isManagedOutcomeCheck(action, roomIds));
    const removedCount = existingActions.length - preservedActions.length;
    setActions([...preservedActions, ...actions]);
    setCommandFeedback(
      `${removedCount ? "Updated" : "Added"} ${actions.length} final-state check${actions.length === 1 ? "" : "s"}.`,
      "ok",
    );
    runScenario();
  } catch (err) {
    setCommandFeedback(err.message, "fail");
    setStatus(err.message, "fail");
  }
}

function clearExpectationChecks() {
  try {
    const existingActions = parseActions();
    const nextActions = existingActions.filter((action) => !isExpectationAction(action));
    const removedCount = existingActions.length - nextActions.length;
    setActions(nextActions);
    setCommandFeedback(
      removedCount ? `Removed ${removedCount} check${removedCount === 1 ? "" : "s"}.` : "No checks to remove.",
      removedCount ? "ok" : "",
    );
    runScenario();
  } catch (err) {
    setCommandFeedback(err.message, "fail");
    setStatus(err.message, "fail");
  }
}

function traceRowsForRoom(roomId) {
  const entries = state.result?.timeline || [];
  if (!entries.length) return [];

  return entries
    .map((entry, index) => {
      const room = entry.rooms?.[roomId] || {};
      const light = entry.lights?.[roomId] || "off";
      const actionIndex = actionIndexForTimelineIndex(index);
      const action = actionIndex === null ? null : state.actions[actionIndex];
      const kind = action ? actionKind(action) : { label: "start", tone: "", category: "start" };
      const roomDeltas = roomDeltasAt(roomId, index);
      const lightDeltas = lightDeltasAt(roomId, index);
      const changes = index === 0
        ? [`state ${room.state || "vacant"}`, `light ${light}`]
        : [...roomDeltas, ...lightDeltas];
      return {
        entry,
        index,
        changes,
        room,
        light,
        actionIndex,
        action,
        kind,
      };
    })
    .filter((row) => row.index === 0 || row.changes.length > 0);
}

function renderRoomTrace() {
  if (!els.roomTrace) return;
  const roomId = selectedRoomId();
  const room = state.topology.rooms.find((item) => item.id === roomId);
  const rows = traceRowsForRoom(roomId);

  if (!state.result) {
    els.roomTrace.innerHTML = '<div class="room-trace-empty">Run a scenario to inspect this room trace.</div>';
    return;
  }

  if (!rows.length) {
    els.roomTrace.innerHTML = `<div class="room-trace-empty">No trace entries for ${escapeHtml(room?.name || "this room")}.</div>`;
    return;
  }

  els.roomTrace.innerHTML = rows
    .map(({ entry, index, changes, room: item, light, actionIndex, action, kind }) => {
      const selected = index === state.selectedTimelineIndex;
      const occupied = item.state === "occupied";
      const actionTitle = action ? actionLabel(action) : entry.label;
      const actionBadge = actionIndex === null ? "start" : `#${actionIndex + 1} ${kind.label}`;
      return `
        <button type="button" class="room-trace-row ${selected ? "selected" : ""} ${occupied ? "occupied" : ""}" data-room-trace-index="${index}" data-action-index="${actionIndex ?? ""}">
          <span class="room-trace-time">${entry.at_seconds.toFixed(0)} s</span>
          <span class="room-trace-main">
            <strong>${escapeHtml(actionTitle)}</strong>
            <span>${escapeHtml(changes.join(", "))}</span>
          </span>
          <span class="room-trace-kind ${escapeHtml(kind.tone)}">${escapeHtml(actionBadge)}</span>
          <span class="room-trace-state">${escapeHtml(item.state || "vacant")} · light ${escapeHtml(light)}</span>
        </button>
      `;
    })
    .join("");
}

function renderSelectedState() {
  const snapshot = selectedSnapshot();
  renderSummary();
  renderValidation();
  renderSelectedRoomStatus(snapshot);
  renderEditTargetHint();
  renderCommandContext(snapshot);
  renderQuickRooms();
  renderQuickPhrases(snapshot);
  renderScenarioStrip();
  renderTopology(snapshot);
  renderInspector(snapshot);
  renderRoomOutcomes(snapshot);
  renderRoomTrace();
  renderTimeline();
  renderActionList();
}

function actionLabel(action) {
  switch (action.type) {
    case "add_person":
      return `Add ${action.name || action.person_id || "person"}`;
    case "enter_room":
      return `${action.person_id || "person"} enters ${roomName(action.room_id)} with motion/mmWave`;
    case "clear_room":
      return `Clear ${roomName(action.room_id)}`;
    case "set_pir":
      return `Motion ${action.active === false ? "off" : "on"} in ${roomName(action.room_id)}`;
    case "clear_pir":
      return `Motion off in ${roomName(action.room_id)}`;
    case "set_mmwave":
      return `mmWave ${action.active === false ? "off" : "on"} in ${roomName(action.room_id)}`;
    case "spatial_targets":
      return `Set ${roomName(action.room_id)} ${action.source === "command_zone" ? "zone " : ""}mmWave targets to ${action.count}`;
    case "open_door":
      return `Open ${roomName(action.room1_id)} <-> ${roomName(action.room2_id)}`;
    case "close_door":
      return `Close ${roomName(action.room1_id)} <-> ${roomName(action.room2_id)}`;
    case "door_snapshot":
      return `Restore door snapshot ${action.open ? "open" : "closed"} for ${roomName(action.room1_id)} <-> ${roomName(action.room2_id)}`;
    case "door_unavailable":
      return `Set door unavailable for ${roomName(action.room1_id)} <-> ${roomName(action.room2_id)}`;
    case "override_room":
      return `Override ${roomName(action.room_id)} to ${action.state}`;
    case "set_light":
      return `Light ${action.active === false ? "off" : "on"} in ${roomName(action.room_id)}`;
    case "wait":
      return `Wait ${action.seconds || 0} seconds`;
    case "recalculate":
      return `Recalculate all rooms (${action.reason || "scenario refresh"})`;
    case "expect_room":
      return `Expect ${roomName(action.room_id)} to be ${action.state}`;
    case "expect_light":
      return `Expect ${roomName(action.room_id)} light to be ${action.state}`;
    case "note":
      return action.label || "Scenario note";
    default:
      return action.type || "Unknown action";
  }
}

function actionKind(action) {
  switch (action.type) {
    case "add_person":
    case "enter_room":
    case "clear_room":
      return { label: "person", tone: "", category: "person" };
    case "set_pir":
    case "clear_pir":
      return { label: "motion", tone: "motion", category: "motion" };
    case "set_mmwave":
    case "spatial_targets":
      return { label: "mmWave", tone: "presence", category: "mmwave" };
    case "open_door":
    case "close_door":
    case "door_snapshot":
    case "door_unavailable":
      return { label: "door", tone: "door", category: "door" };
    case "override_room":
      return { label: "override", tone: "override", category: "override" };
    case "set_light":
      return { label: "light", tone: "light", category: "light" };
    case "wait":
      return { label: "wait", tone: "wait", category: "wait" };
    case "recalculate":
      return { label: "logic", tone: "", category: "logic" };
    case "expect_room":
    case "expect_light":
      return { label: "check", tone: "check", category: "check" };
    case "note":
      if (String(action.label || "").toLowerCase().startsWith("light ")) {
        return { label: "light", tone: "light", category: "light" };
      }
      return { label: "note", tone: "", category: "note" };
    default:
      return { label: action.type || "event", tone: "", category: "event" };
  }
}

const RECORDED_FILTERS = [
  ["all", "All"],
  ["failure", "Failures"],
  ["person", "People"],
  ["light", "Lights"],
  ["door", "Doors"],
  ["motion", "Motion"],
  ["mmwave", "mmWave"],
  ["wait", "Waits"],
  ["check", "Checks"],
];

function failedActionIndexes(result = state.result) {
  return new Set([
    ...(result?.expectations || [])
      .filter((item) => !item.passed)
      .map((item) => item.index),
    ...(result?.errors || []).map((item) => item.index),
  ]);
}

function actionMatchesRecordedFilter(action, index, filter = state.recordedFilter) {
  if (filter === "all") return true;
  if (filter === "failure") return failedActionIndexes().has(index);
  return actionKind(action).category === filter;
}

function timelineIndexForAction(actionIndex) {
  const mapping = state.result?.action_timeline || [];
  const match = mapping.find((item) => item.index === actionIndex);
  if (match) return match.end_timeline_index;
  return actionIndex + 1;
}

function recordedFilterLabel(value = state.recordedFilter) {
  return RECORDED_FILTERS.find(([id]) => id === value)?.[1] || "Events";
}

function renderRecordedFilters() {
  if (!els.recordedFilters) return;
  els.recordedFilters.innerHTML = RECORDED_FILTERS.map(([id, label]) => {
    const count = id === "all"
      ? state.actions.length
      : state.actions.filter((action, index) => actionMatchesRecordedFilter(action, index, id)).length;
    return `
      <button type="button" class="${state.recordedFilter === id ? "active" : ""}" data-recorded-filter="${escapeHtml(id)}">
        ${escapeHtml(label)} <span>${count}</span>
      </button>
    `;
  }).join("");
}

function actionRowMarkup(action, index, failedExpectationIndexes, errorIndexes) {
  const selected = state.selectedActionIndex === index;
  const kind = actionKind(action);
  const tone = errorIndexes.has(index)
    ? "fail"
    : failedExpectationIndexes.has(index)
      ? "fail"
      : action.type === "expect_room"
        ? "good"
        : "";
  return `
    <div class="action-row ${tone} ${selected ? "selected" : ""}" data-action-index="${index}" data-action-category="${escapeHtml(kind.category)}" tabindex="0">
      <div class="action-index">${index + 1}</div>
      <div>
        <div class="action-title">
          <span class="action-kind ${escapeHtml(kind.tone)}">${escapeHtml(kind.label)}</span>
          <span>${escapeHtml(actionLabel(action))}</span>
        </div>
        ${selected ? actionImpactMarkup(index) : ""}
      </div>
      <div class="action-controls">
        <button class="action-control" data-move-action="${index}" data-direction="-1" title="Move action up" ${index === 0 ? "disabled" : ""}>Up</button>
        <button class="action-control" data-move-action="${index}" data-direction="1" title="Move action down" ${index === state.actions.length - 1 ? "disabled" : ""}>Down</button>
        <button class="action-control" data-duplicate-action="${index}" title="Duplicate action">Duplicate</button>
        <button class="action-control" data-remove-action="${index}" title="Remove action">Remove</button>
      </div>
    </div>
  `;
}

function renderScenarioStrip() {
  if (!els.scenarioStrip) return;

  if (!state.actions.length) {
    els.scenarioStrip.innerHTML = '<div class="scenario-strip-empty">No steps yet.</div>';
    renderScenarioStepActions();
    return;
  }

  const failedExpectationIndexes = failedActionIndexes({
    expectations: state.result?.expectations || [],
    errors: [],
  });
  const errorIndexes = new Set((state.result?.errors || []).map((item) => item.index));
  const visibleActions = state.actions.length > 8
    ? state.actions.slice(-8).map((action, offset) => ({ action, index: state.actions.length - 8 + offset }))
    : state.actions.map((action, index) => ({ action, index }));
  const hiddenCount = Math.max(0, state.actions.length - visibleActions.length);

  els.scenarioStrip.innerHTML = `
    ${hiddenCount ? `<span class="scenario-strip-more">${hiddenCount} earlier</span>` : ""}
    ${visibleActions
      .map(({ action, index }) => {
        const kind = actionKind(action);
        const failed = errorIndexes.has(index) || failedExpectationIndexes.has(index);
        const selected = state.selectedActionIndex === index;
        return `
          <button
            type="button"
            class="scenario-step ${escapeHtml(kind.tone)} ${failed ? "fail" : ""} ${selected ? "selected" : ""}"
            data-scenario-step="${index}"
            title="${escapeHtml(actionLabel(action))}"
          >
            <span class="scenario-step-index">${index + 1}</span>
            <span class="scenario-step-kind">${escapeHtml(kind.label)}</span>
            <span class="scenario-step-label">${escapeHtml(actionLabel(action))}</span>
          </button>
        `;
      })
      .join("")}
  `;
  renderScenarioStepActions();
}

function renderScenarioStepActions() {
  if (!els.scenarioStepActions) return;
  const index = state.selectedActionIndex;

  if (index === null || index < 0 || index >= state.actions.length) {
    els.scenarioStepActions.hidden = true;
    els.scenarioStepActions.innerHTML = "";
    return;
  }

  const action = state.actions[index];
  const isInsertTarget = state.insertAfterActionIndex === index;
  const isReplaceTarget = state.replaceActionIndex === index;
  els.scenarioStepActions.hidden = false;
  els.scenarioStepActions.innerHTML = `
    <div class="step-action-summary">
      <span>Step ${index + 1}</span>
      <strong>${escapeHtml(actionLabel(action))}</strong>
    </div>
    <div class="step-action-buttons">
      <button type="button" class="${isInsertTarget ? "active" : ""}" data-edit-target-action="insert">
        ${isInsertTarget ? "Inserting after" : "Insert after"}
      </button>
      <button type="button" class="${isReplaceTarget ? "active" : ""}" data-edit-target-action="replace">
        ${isReplaceTarget ? "Replacing" : "Replace"}
      </button>
      <button type="button" class="danger" data-edit-target-action="remove">Remove</button>
    </div>
  `;
}

function roomDeltasAt(roomId, timelineIndex) {
  const entries = state.result?.timeline || [];
  const entry = entries[timelineIndex];
  const previousEntry = entries[timelineIndex - 1];
  if (!entry || !previousEntry) return [];
  const current = entry.rooms[roomId] || {};
  const previous = previousEntry.rooms[roomId] || {};
  const deltas = [];
  if (current.state !== previous.state) {
    deltas.push(`state ${previous.state || "unknown"} -> ${current.state || "unknown"}`);
  }
  if (current.sealed !== previous.sealed) {
    deltas.push(`sealed ${previous.sealed ? "yes" : "no"} -> ${current.sealed ? "yes" : "no"}`);
  }
  if (current.checking_active !== previous.checking_active) {
    deltas.push(`checking ${previous.checking_active ? "active" : "idle"} -> ${current.checking_active ? "active" : "idle"}`);
  }
  if (current.post_close_hold_active !== previous.post_close_hold_active) {
    deltas.push(`post-close ${previous.post_close_hold_active ? "active" : "idle"} -> ${current.post_close_hold_active ? "active" : "idle"}`);
  }
  const confidenceDelta = Math.round(((current.confidence || 0) - (previous.confidence || 0)) * 100);
  if (confidenceDelta !== 0) {
    deltas.push(`confidence ${confidenceDelta > 0 ? "+" : ""}${confidenceDelta}%`);
  }
  return deltas;
}

function lightDeltasAt(roomId, timelineIndex) {
  const entries = state.result?.timeline || [];
  const entry = entries[timelineIndex];
  const previousEntry = entries[timelineIndex - 1];
  if (!entry || !previousEntry) return [];
  const current = entry.lights?.[roomId] || "off";
  const previous = previousEntry.lights?.[roomId] || "off";
  return current !== previous ? [`light ${previous} -> ${current}`] : [];
}

function actionImpactMarkup(actionIndex) {
  const timelineIndex = timelineIndexForAction(actionIndex);
  const entries = state.result?.timeline || [];
  const entry = entries[timelineIndex];
  const previousEntry = entries[timelineIndex - 1];
  const expectation = (state.result?.expectations || []).find((item) => item.index === actionIndex);
  const changed = changedRoomIds(entry, previousEntry);
  const changedLights = changedLightRoomIds(entry, previousEntry);
  const rows = [];

  if (expectation) {
    rows.push(`${expectation.passed ? "Check passed" : "Check failed"}: expected ${expectationSubject(expectation)} ${expectation.expected_state}, got ${expectation.actual_state}`);
  }

  for (const roomId of changed) {
    const deltas = roomDeltasAt(roomId, timelineIndex);
    rows.push(`${roomName(roomId)}: ${deltas.length ? deltas.join(", ") : "changed"}`);
  }

  for (const roomId of changedLights) {
    const deltas = lightDeltasAt(roomId, timelineIndex);
    rows.push(`${roomName(roomId)}: ${deltas.join(", ")}`);
  }

  if (!rows.length) {
    rows.push("No room state change");
  }

  return `
    <div class="action-impact">
      ${rows.map((row) => `<span>${escapeHtml(row)}</span>`).join("")}
    </div>
  `;
}

function renderActionList() {
  const failedExpectationIndexes = failedActionIndexes({
    expectations: state.result?.expectations || [],
    errors: [],
  });
  const errorIndexes = new Set((state.result?.errors || []).map((item) => item.index));
  renderRecordedFilters();

  if (!state.actions.length) {
    els.recordedEvents.innerHTML = '<div class="timeline-row">No recorded events yet.</div>';
    els.actionList.innerHTML = '<div class="timeline-row">No recorded events yet.</div>';
    return;
  }

  const detailMarkup = state.actions
    .map((action, index) => actionRowMarkup(action, index, failedExpectationIndexes, errorIndexes))
    .join("");
  const recordedMarkup = state.actions
    .map((action, index) => ({ action, index }))
    .filter(({ action, index }) => actionMatchesRecordedFilter(action, index))
    .map(({ action, index }) => actionRowMarkup(action, index, failedExpectationIndexes, errorIndexes))
    .join("");

  els.actionList.innerHTML = detailMarkup;
  const emptyLabel = state.recordedFilter === "failure"
    ? "failed events"
    : `${recordedFilterLabel().toLowerCase()} events`;
  els.recordedEvents.innerHTML = recordedMarkup || `<div class="timeline-row">No ${escapeHtml(emptyLabel)} in this scenario.</div>`;
  wireActionList(els.actionList);
  wireActionList(els.recordedEvents);
}

function wireActionList(container) {
  container.querySelectorAll("[data-move-action]").forEach((node) => {
    node.addEventListener("click", (event) => {
      event.stopPropagation();
      const index = Number(node.dataset.moveAction || -1);
      const direction = Number(node.dataset.direction || 0);
      moveAction(index, direction);
    });
  });

  container.querySelectorAll("[data-duplicate-action]").forEach((node) => {
    node.addEventListener("click", (event) => {
      event.stopPropagation();
      const index = Number(node.dataset.duplicateAction || -1);
      duplicateAction(index);
    });
  });

  container.querySelectorAll("[data-remove-action]").forEach((node) => {
    node.addEventListener("click", (event) => {
      event.stopPropagation();
      const index = Number(node.dataset.removeAction || -1);
      removeAction(index);
    });
  });

  container.querySelectorAll("[data-action-index]").forEach((node) => {
    node.addEventListener("click", () => {
      const index = Number(node.dataset.actionIndex || 0);
      focusAction(index);
    });
    node.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      const index = Number(node.dataset.actionIndex || 0);
      focusAction(index);
    });
  });
}

function handleActionContainerClick(event) {
  if (event.target.closest(".action-control")) return;
  const row = event.target.closest("[data-action-index]");
  if (!row) return;
  focusAction(Number(row.dataset.actionIndex || 0));
}

function moveAction(index, direction) {
  try {
    const actions = parseActions();
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || index >= actions.length || targetIndex >= actions.length) {
      return;
    }
    const nextActions = [...actions];
    const [item] = nextActions.splice(index, 1);
    nextActions.splice(targetIndex, 0, item);
    setActions(nextActions);
    runScenario();
  } catch (err) {
    setStatus(err.message, "fail");
  }
}

function duplicateAction(index) {
  try {
    const actions = parseActions();
    if (index < 0 || index >= actions.length) return;
    const nextActions = [...actions];
    nextActions.splice(index + 1, 0, structuredClone(actions[index]));
    setActions(nextActions);
    runScenario();
  } catch (err) {
    setStatus(err.message, "fail");
  }
}

function removeAction(index) {
  try {
    const actions = parseActions();
    if (index < 0 || index >= actions.length) return;
    const nextFocusIndex = actions.length > 1 ? Math.min(index, actions.length - 2) : null;
    setActions(actions.filter((_, itemIndex) => itemIndex !== index));
    clearEditTarget();
    setCommandFeedback(`Removed step ${index + 1}.`, "ok");
    runScenario({ focusActionIndex: nextFocusIndex });
  } catch (err) {
    setStatus(err.message, "fail");
  }
}

function focusActionRoom(index) {
  const expectation = (state.result?.expectations || []).find((item) => item.index === index);
  if (expectation) {
    selectRoom(expectation.room_id);
    return true;
  }

  const action = state.actions[index];
  const actionRoomId = action?.room_id || action?.room1_id;
  if (actionRoomId) {
    selectRoom(actionRoomId);
    if (action?.room1_id && action?.room2_id) {
      const doorId = [action.room1_id, action.room2_id].sort().join("__");
      if (state.topology.doors.some((door) => door.id === doorId)) {
        els.doorSelect.value = doorId;
      }
    }
  }
  return false;
}

function focusAction(index) {
  state.selectedActionIndex = index;
  focusActionRoom(index);
  const timeline = state.result?.timeline || [];
  if (!timeline.length) return;
  const bounded = Math.max(0, Math.min(timelineIndexForAction(index), timeline.length - 1));
  state.selectedTimelineIndex = bounded;
  renderSelectedState();
}

function performEditTargetAction(action) {
  if (action === "insert" && state.selectedActionIndex !== null) {
    state.replaceActionIndex = null;
    state.insertAfterActionIndex = state.selectedActionIndex;
    renderSelectedState();
    return;
  }
  if (action === "replace" && state.selectedActionIndex !== null) {
    state.insertAfterActionIndex = null;
    state.replaceActionIndex = state.selectedActionIndex;
    renderSelectedState();
    return;
  }
  if (action === "cancel") {
    clearEditTarget();
    renderSelectedState();
    return;
  }
  if (action === "remove" && state.selectedActionIndex !== null) {
    removeAction(state.selectedActionIndex);
  }
}

function changedRooms(entry, previousEntry) {
  return changedRoomIds(entry, previousEntry).map((roomId) => roomName(roomId));
}

function changedRoomIds(entry, previousEntry) {
  if (!entry || !previousEntry) return [];
  return Object.entries(entry.rooms)
    .filter(([roomId, room]) => {
      const previous = previousEntry.rooms[roomId];
      return (
        !previous ||
        previous.state !== room.state ||
        previous.sealed !== room.sealed ||
        previous.checking_active !== room.checking_active ||
        previous.post_close_hold_active !== room.post_close_hold_active
      );
    })
    .map(([roomId]) => roomId);
}

function changedLightRoomIds(entry, previousEntry) {
  if (!entry || !previousEntry) return [];
  const roomIds = new Set([
    ...Object.keys(entry.lights || {}),
    ...Object.keys(previousEntry.lights || {}),
  ]);
  return [...roomIds].filter((roomId) => {
    const current = entry.lights?.[roomId] || "off";
    const previous = previousEntry.lights?.[roomId] || "off";
    return current !== previous;
  });
}

function roomDeltas(roomId) {
  return roomDeltasAt(roomId, state.selectedTimelineIndex);
}

function renderTimeline() {
  const entries = state.result?.timeline || [];
  els.timelineRange.max = String(Math.max(0, entries.length - 1));
  els.timelineRange.value = String(Math.max(0, Math.min(state.selectedTimelineIndex, entries.length - 1)));
  els.timelineRange.disabled = entries.length === 0;
  els.timelineFirst.disabled = entries.length === 0 || state.selectedTimelineIndex === 0;
  els.timelinePrev.disabled = entries.length === 0 || state.selectedTimelineIndex === 0;
  els.timelineNext.disabled = entries.length === 0 || state.selectedTimelineIndex >= entries.length - 1;
  els.timelineLatest.disabled = entries.length === 0 || state.selectedTimelineIndex >= entries.length - 1;

  if (!entries.length) {
    els.timeline.innerHTML = '<div class="timeline-row">Run a scenario to inspect the timeline.</div>';
    return;
  }

  els.timeline.innerHTML = entries
    .map((entry, index) => {
      const changed = changedRooms(entry, entries[index - 1]);
      const occupied = Object.entries(entry.rooms)
        .filter(([, room]) => room.state === "occupied")
        .map(([roomId]) => roomName(roomId));
      const lightsOn = Object.entries(entry.lights || {})
        .filter(([, value]) => value === "on")
        .map(([roomId]) => roomName(roomId));
      return `
        <div class="timeline-row ${index === state.selectedTimelineIndex ? "selected" : ""}" data-timeline-index="${index}">
          <strong>${entry.at_seconds.toFixed(0)} s</strong>${escapeHtml(entry.label)}
          <div class="meta">
            ${occupied.length ? `Occupied: ${escapeHtml(occupied.join(", "))}` : "No occupied rooms"}
            ${lightsOn.length ? ` · Lights: ${escapeHtml(lightsOn.join(", "))}` : ""}
            ${changed.length ? ` · Changed: ${escapeHtml(changed.join(", "))}` : ""}
          </div>
        </div>
      `;
    })
    .join("");

  els.timeline.querySelectorAll("[data-timeline-index]").forEach((node) => {
    node.addEventListener("click", () => {
      state.selectedTimelineIndex = Number(node.dataset.timelineIndex || 0);
      state.selectedActionIndex = actionIndexForTimelineIndex(state.selectedTimelineIndex);
      renderSelectedState();
    });
  });
}

function selectTimelineAt(seconds) {
  const entries = state.result?.timeline || [];
  if (!entries.length) return;
  let bestIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  entries.forEach((entry, index) => {
    const distance = Math.abs(entry.at_seconds - seconds);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });
  state.selectedTimelineIndex = bestIndex;
  state.selectedActionIndex = actionIndexForTimelineIndex(state.selectedTimelineIndex);
  renderSelectedState();
}

function setTimelineIndex(index) {
  const entries = state.result?.timeline || [];
  if (!entries.length) return;
  state.selectedTimelineIndex = Math.max(0, Math.min(index, entries.length - 1));
  state.selectedActionIndex = actionIndexForTimelineIndex(state.selectedTimelineIndex);
  renderSelectedState();
}

function renderTransitions() {
  const transitions = state.result?.transitions || [];
  const expectations = state.result?.expectations || [];
  const rows = [
    ...transitions.map((item) => ({
      time: item.time,
      tone: item.state === "occupied" ? "good" : "",
      text: `${roomName(item.room_id)} -> ${item.state} (${item.reason || "state change"})`,
    })),
    ...expectations.map((item) => ({
      time: item.at_seconds,
      tone: item.passed ? "good" : "fail",
      text: `Expect ${expectationSubject(item)} ${item.expected_state}: ${item.passed ? "passed" : `failed, got ${item.actual_state}`}`,
    })),
  ].sort((a, b) => a.time - b.time);

  els.transitions.innerHTML = rows.length
    ? rows
        .map(
          (row) => `
            <div class="timeline-row ${row.tone}">
              <strong>${row.time.toFixed(0)} s</strong>${escapeHtml(row.text)}
            </div>
          `,
        )
        .join("")
    : '<div class="timeline-row">No transitions yet.</div>';
}

function renderDiagnostics() {
  if (!state.result) {
    els.diagnostics.innerHTML = '<div class="diagnostic-row">Run a scenario to see diagnostics.</div>';
    return;
  }

  const errors = state.result.errors || [];
  const expectations = state.result.expectations || [];
  const failedExpectations = expectations.filter((item) => !item.passed);
  const passedExpectations = expectations.filter((item) => item.passed);
  const rows = [
    ...errors.map((item) => ({
      kind: "error",
      tone: "fail",
      time: null,
      actionIndex: item.index,
      roomId: item.action?.room_id || item.action?.room1_id,
      title: `Action ${item.index + 1} failed`,
      detail: item.error,
    })),
    ...failedExpectations.map((item) => ({
      kind: "expectation",
      tone: "fail",
      time: item.at_seconds,
      actionIndex: item.index,
      roomId: item.room_id,
      title: expectationTitle(item),
      detail: expectationDetail(item),
    })),
    ...passedExpectations.map((item) => ({
      kind: "expectation",
      tone: "good",
      time: item.at_seconds,
      actionIndex: item.index,
      roomId: item.room_id,
      title: `Check passed for ${expectationSubject(item)}`,
      detail: expectationDetail(item),
    })),
  ];

  if (!rows.length) {
    els.diagnostics.innerHTML =
      '<div class="diagnostic-row good"><strong>No checks configured</strong><div class="meta">Add expectation actions to turn this scenario into a regression test.</div></div>';
    return;
  }

  els.diagnostics.innerHTML = rows
    .map(
      (row, index) => `
        <div class="diagnostic-row ${row.tone}" data-diagnostic-index="${index}" data-time="${row.time ?? ""}" data-room-id="${escapeHtml(row.roomId || "")}" data-action-index="${row.actionIndex ?? ""}">
          <div class="diagnostic-body">
            <div>
              <strong>${escapeHtml(row.title)}</strong>
              <div>${escapeHtml(row.detail)}</div>
              <div class="meta">
                ${row.time === null ? "" : `${Number(row.time).toFixed(0)} s · `}
                action ${Number(row.actionIndex) + 1}
              </div>
            </div>
            <button data-jump-diagnostic="${index}">Inspect</button>
          </div>
        </div>
      `,
    )
    .join("");

  els.diagnostics.querySelectorAll("[data-jump-diagnostic]").forEach((node) => {
    node.addEventListener("click", (event) => {
      event.stopPropagation();
      focusDiagnostic(node.closest("[data-diagnostic-index]"));
    });
  });
  els.diagnostics.querySelectorAll("[data-diagnostic-index]").forEach((node) => {
    node.addEventListener("click", () => focusDiagnostic(node));
  });
}

function focusDiagnostic(node) {
  if (!node) return;
  const roomId = node.dataset.roomId;
  if (roomId) {
    selectRoom(roomId);
  }
  const time = Number(node.dataset.time);
  if (Number.isFinite(time)) {
    selectTimelineAt(time);
  } else {
    const actionIndex = Number(node.dataset.actionIndex);
    if (Number.isFinite(actionIndex)) focusAction(actionIndex);
  }
  els.diagnostics.querySelectorAll(".diagnostic-row.selected").forEach((row) => {
    row.classList.remove("selected");
  });
  node.classList.add("selected");
}

function focusExpectation(index) {
  const expectation = (state.result?.expectations || [])[index];
  if (!expectation) return;
  focusAction(expectation.index);
}

function firstFailureIndex(result) {
  const firstFailedExpectation = (result?.expectations || []).find((item) => !item.passed);
  if (firstFailedExpectation) {
    const entries = result.timeline || [];
    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;
    entries.forEach((entry, index) => {
      const distance = Math.abs(entry.at_seconds - firstFailedExpectation.at_seconds);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });
    return bestIndex;
  }
  if ((result?.errors || []).length > 0) {
    return Math.max(0, (result?.timeline?.length || 1) - 1);
  }
  return null;
}

function focusFirstFailureRoom(result) {
  const firstFailedExpectation = (result?.expectations || []).find((item) => !item.passed);
  const firstError = (result?.errors || []).find((item) => item.action?.room_id || item.action?.room1_id);
  const roomId = firstFailedExpectation?.room_id || firstError?.action?.room_id || firstError?.action?.room1_id;
  if (!roomId) return;
  selectRoom(roomId);
}

function renderResult(result, options = {}) {
  state.result = result;
  const focusActionIndex = Number.isInteger(options.focusActionIndex)
    ? Math.max(0, Math.min(options.focusActionIndex, state.actions.length - 1))
    : null;

  if (focusActionIndex !== null && state.actions.length) {
    state.selectedActionIndex = focusActionIndex;
    const timeline = result?.timeline || [];
    state.selectedTimelineIndex = Math.max(0, Math.min(timelineIndexForAction(focusActionIndex), timeline.length - 1));
    focusActionRoom(focusActionIndex);
  } else {
    const failureIndex = firstFailureIndex(result);
    state.selectedTimelineIndex =
      failureIndex ?? Math.max(0, (result?.timeline?.length || 1) - 1);
    state.selectedActionIndex = actionIndexForTimelineIndex(state.selectedTimelineIndex);
    focusFirstFailureRoom(result);
  }
  renderSelectedState();
  renderTransitions();
  renderDiagnostics();
  renderActionList();
  els.rawResult.textContent = JSON.stringify(result || {}, null, 2);
}

async function runScenario(options = {}) {
  let actions;
  try {
    actions = parseActions();
  } catch (err) {
    setStatus(err.message, "fail");
    return;
  }

  setStatus("Running");
  els.run.disabled = true;
  try {
    const response = await fetch("/api/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actions }),
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || "Simulation failed.");
    }
    renderResult(payload, options);
    setStatus(resultStatusText(payload), payload.ok ? "ok" : "fail");
  } catch (err) {
    setStatus(err.message, "fail");
  } finally {
    els.run.disabled = false;
  }
}

async function boot() {
  setStatus("Loading");
  loadSavedScenarios();
  const response = await fetch("/api/presets");
  const payload = await response.json();
  state.presets = payload.presets || {};
  state.topology = payload.topology || { rooms: [], doors: [] };
  renderOptions();
  renderSavedScenarioOptions();
  renderSelectedState();
  renderActionList();
  renderTransitions();
  renderDiagnostics();
  const workspace = readStoredJson(WORKSPACE_KEY, null);
  if (workspace?.actions?.length) {
    state.scenarioName = workspace.name || "Restored scenario";
    els.scenarioName.value = state.scenarioName;
    state.selectedPreset = workspace.preset || els.presetSelect.value;
    if (state.selectedPreset) {
      els.presetSelect.value = state.selectedPreset;
    }
    selectRoom(workspace.selectedRoomId || els.roomSelect.value, workspace.selectedDoorId);
    setActions(workspace.actions);
    runScenario();
  } else {
    loadSelectedPreset();
  }
}

els.presetSelect.addEventListener("change", () => {
  state.selectedPreset = els.presetSelect.value;
});

els.roomSelect.addEventListener("change", () => {
  selectRoom(els.roomSelect.value);
  updateCommandPreview();
  renderSelectedState();
});

els.doorSelect.addEventListener("change", () => {
  updateCommandPreview();
  renderSelectedState();
});

els.timelineRange.addEventListener("input", () => {
  setTimelineIndex(Number(els.timelineRange.value || 0));
});

els.timelineFirst.addEventListener("click", () => setTimelineIndex(0));
els.timelinePrev.addEventListener("click", () => setTimelineIndex(state.selectedTimelineIndex - 1));
els.timelineNext.addEventListener("click", () => setTimelineIndex(state.selectedTimelineIndex + 1));
els.timelineLatest.addEventListener("click", () => setTimelineIndex((state.result?.timeline || []).length - 1));

els.loadPreset.addEventListener("click", loadSelectedPreset);
els.reset.addEventListener("click", resetScenario);
els.copy.addEventListener("click", async () => {
  await navigator.clipboard.writeText(els.actionsEditor.value);
  setStatus("Copied", "ok");
});
els.scenarioName.addEventListener("input", () => {
  syncScenarioNameFromInput();
  saveWorkspace();
});
els.saveScenario.addEventListener("click", saveScenario);
els.loadScenario.addEventListener("click", loadSavedScenario);
els.deleteScenario.addEventListener("click", deleteSavedScenario);
els.run.addEventListener("click", runScenario);
els.resultCallout.addEventListener("click", (event) => {
  const button = event.target.closest("[data-result-callout-action]");
  if (!button) return;
  focusAction(Number(button.dataset.resultCalloutAction || 0));
});
els.commandAdd.addEventListener("click", () => appendCommandInput());
els.commandUndo.addEventListener("click", undoLastAction);
els.commandClear.addEventListener("click", resetScenario);
els.editTargetHint.addEventListener("click", (event) => {
  const button = event.target.closest("[data-edit-target-action]");
  if (!button) return;
  performEditTargetAction(button.dataset.editTargetAction);
});
els.scenarioStepActions.addEventListener("click", (event) => {
  const button = event.target.closest("[data-edit-target-action]");
  if (!button) return;
  performEditTargetAction(button.dataset.editTargetAction);
});
els.situationStarters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-situation-preset]");
  if (!button) return;
  loadPreset(button.dataset.situationPreset);
});
els.recordedFilters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-recorded-filter]");
  if (!button) return;
  state.recordedFilter = button.dataset.recordedFilter || "all";
  renderActionList();
});
els.roomOutcomes.addEventListener("click", (event) => {
  const button = event.target.closest("[data-outcome-room]");
  if (!button) return;
  selectRoom(button.dataset.outcomeRoom);
  renderSelectedState();
});
els.roomTrace.addEventListener("click", (event) => {
  const button = event.target.closest("[data-room-trace-index]");
  if (!button) return;
  setTimelineIndex(Number(button.dataset.roomTraceIndex || 0));
});
els.selectedRoomStatus.addEventListener("click", (event) => {
  const button = event.target.closest("[data-selected-status-action]");
  if (!button) return;
  if (button.dataset.selectedStatusAction === "latest") {
    setTimelineIndex(latestTimelineIndex());
  }
});
els.pinSelectedOutcome.addEventListener("click", () => {
  appendOutcomeChecks([selectedRoomId()]);
});
els.pinAllOutcomes.addEventListener("click", () => {
  appendOutcomeChecks(state.topology.rooms.map((room) => room.id));
});
els.clearChecks.addEventListener("click", clearExpectationChecks);
els.commandPreview.addEventListener("click", (event) => {
  const suggestionButton = event.target.closest("[data-command-suggestion]");
  if (!suggestionButton) return;
  applyCommandSuggestion(suggestionButton.dataset.commandSuggestion);
});
els.scenarioStrip.addEventListener("click", (event) => {
  const button = event.target.closest("[data-scenario-step]");
  if (!button) return;
  focusAction(Number(button.dataset.scenarioStep || 0));
});
els.commandContext.addEventListener("click", (event) => {
  const aliasButton = event.target.closest("[data-command-alias]");
  if (!aliasButton) return;
  applyCommandAlias(aliasButton.dataset.commandAlias);
});
els.quickRooms.addEventListener("click", (event) => {
  const roomButton = event.target.closest("[data-quick-room]");
  if (!roomButton) return;
  applyRoomTarget(roomButton.dataset.quickRoom);
});
els.quickPhrases.addEventListener("click", (event) => {
  const phraseButton = event.target.closest("[data-quick-phrase]");
  if (!phraseButton) return;
  appendCommandInput(phraseButton.dataset.quickPhrase);
});
els.validationPanel.addEventListener("click", (event) => {
  const actionButton = event.target.closest("[data-validation-action]");
  if (actionButton) {
    appendAction(roomActionForRoom(actionButton.dataset.validationAction, selectedRoomId()));
    return;
  }

  const validationRow = event.target.closest("[data-validation-index]");
  if (!validationRow) return;
  focusExpectation(Number(validationRow.dataset.validationIndex || 0));
});
els.commandInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    if (!els.commandAdd.disabled) {
      appendCommandInput();
    }
  }
});
els.commandInput.addEventListener("input", updateCommandPreview);
els.actionsEditor.addEventListener("input", () => {
  try {
    parseActions();
    setStatus("Edited");
  } catch {
    setStatus("JSON needs attention", "fail");
  }
});
els.recordedEvents.addEventListener("click", handleActionContainerClick);
els.actionList.addEventListener("click", handleActionContainerClick);
els.wait.addEventListener("click", () => {
  appendAction({ type: "wait", seconds: Number(els.waitInput.value || 0) });
});
els.undo.addEventListener("click", undoLastAction);

document.querySelectorAll("[data-room-action]").forEach((button) => {
  button.addEventListener("click", () => appendAction(roomAction(button.dataset.roomAction)));
});

document.querySelectorAll("[data-door-action]").forEach((button) => {
  button.addEventListener("click", () => appendAction(doorAction(button.dataset.doorAction)));
});

document.querySelectorAll("[data-wait]").forEach((button) => {
  button.addEventListener("click", () => {
    appendAction({ type: "wait", seconds: Number(button.dataset.wait || 0) });
  });
});

document.querySelectorAll("[data-command-example]").forEach((button) => {
  button.addEventListener("click", () => appendCommandExample(button.dataset.commandExample));
});

document.addEventListener("keydown", (event) => {
  const target = event.target;
  const tagName = target?.tagName?.toLowerCase();
  if (tagName === "input" || tagName === "select" || tagName === "textarea") {
    return;
  }
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    setTimelineIndex(state.selectedTimelineIndex - 1);
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    setTimelineIndex(state.selectedTimelineIndex + 1);
  } else if (event.key === "Home") {
    event.preventDefault();
    setTimelineIndex(0);
  } else if (event.key === "End") {
    event.preventDefault();
    setTimelineIndex((state.result?.timeline || []).length - 1);
  }
});

boot().catch((err) => {
  setStatus(err.message, "fail");
});
