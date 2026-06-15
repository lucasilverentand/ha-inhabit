export function getDirectToolbarActionLimit(
  toolbarWidth: number,
  actionCount: number,
): number {
  if (toolbarWidth === 0 || toolbarWidth >= 900) return actionCount;
  if (toolbarWidth >= 620) return actionCount;
  if (toolbarWidth >= 520) return Math.min(actionCount, 5);
  if (toolbarWidth >= 440) return Math.min(actionCount, 4);
  if (toolbarWidth >= 360) return Math.min(actionCount, 3);
  if (toolbarWidth >= 300) return Math.min(actionCount, 2);
  return Math.min(actionCount, 1);
}
