/**
 * History store for undo/redo functionality
 */

import { signal, computed } from "@preact/signals-core";

export interface HistoryAction {
  type: string;
  description: string;
  undo: () => void;
  redo: () => void;
}

const MAX_HISTORY_SIZE = 100;

const undoStack = signal<HistoryAction[]>([]);
const redoStack = signal<HistoryAction[]>([]);

export const canUndo = computed(() => undoStack.value.length > 0);
export const canRedo = computed(() => redoStack.value.length > 0);

export function pushAction(action: HistoryAction): void {
  undoStack.value = [...undoStack.value.slice(-MAX_HISTORY_SIZE + 1), action];
  redoStack.value = []; // Clear redo stack on new action
}

export function undo(): void {
  const stack = undoStack.value;
  if (stack.length === 0) return;

  const action = stack[stack.length - 1];
  action.undo();

  undoStack.value = stack.slice(0, -1);
  redoStack.value = [...redoStack.value, action];
}

export function redo(): void {
  const stack = redoStack.value;
  if (stack.length === 0) return;

  const action = stack[stack.length - 1];
  action.redo();

  redoStack.value = stack.slice(0, -1);
  undoStack.value = [...undoStack.value, action];
}

export function clearHistory(): void {
  undoStack.value = [];
  redoStack.value = [];
}
