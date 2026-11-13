/**
 * % change between two counts/sums; null when there is no baseline yet
 * (rendered as an em dash by the stat cards).
 */
export function growthPercent(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 100);
}
