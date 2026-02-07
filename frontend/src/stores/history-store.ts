/**
 * History store for undo/redo functionality
 */

import { signal, computed } from "@preact/signals-core";

export interface HistoryAction {
  type: string;
  description: string;
  undo: () => void | Promise<void>;
  redo: () => void | Promise<void>;
}

const MAX_HISTORY_SIZE = 100;

const undoStack = signal<HistoryAction[]>([]);
const redoStack = signal<HistoryAction[]>([]);
const _executing = signal(false);

export const canUndo = computed(() => undoStack.value.length > 0 && !_executing.value);
export const canRedo = computed(() => redoStack.value.length > 0 && !_executing.value);

export function pushAction(action: HistoryAction): void {
  undoStack.value = [...undoStack.value.slice(-MAX_HISTORY_SIZE + 1), action];
  redoStack.value = []; // Clear redo stack on new action
}

export async function undo(): Promise<void> {
  const stack = undoStack.value;
  if (stack.length === 0 || _executing.value) return;

  const action = stack[stack.length - 1];
  _executing.value = true;
  try {
    await action.undo();
  } finally {
    _executing.value = false;
  }

  undoStack.value = stack.slice(0, -1);
  redoStack.value = [...redoStack.value, action];
}

export async function redo(): Promise<void> {
  const stack = redoStack.value;
  if (stack.length === 0 || _executing.value) return;

  const action = stack[stack.length - 1];
  _executing.value = true;
  try {
    await action.redo();
  } finally {
    _executing.value = false;
  }

  redoStack.value = stack.slice(0, -1);
  undoStack.value = [...undoStack.value, action];
}

export function clearHistory(): void {
  undoStack.value = [];
  redoStack.value = [];
}
