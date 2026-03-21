export interface HeatmapDayData {
  date: string;
  total: number;
  apps: { appId: string; count: number }[];
  dominantApp: string | null;
  level: 0 | 1 | 2 | 3 | 4;
  secondaryApp: string | null;
}

export function getDominantApp(apps: { appId: string; count: number }[]): string | null {
  if (apps.length === 0) return null;
  const sorted = [...apps].sort((a, b) => b.count - a.count || a.appId.localeCompare(b.appId));
  return sorted[0]!.appId;
}

export function getSecondaryApp(apps: { appId: string; count: number }[]): string | null {
  if (apps.length < 2) return null;
  const sorted = [...apps].sort((a, b) => b.count - a.count || a.appId.localeCompare(b.appId));
  return sorted[1]!.appId;
}

export function countToLevel(
  count: number,
  thresholds: [number, number, number, number],
): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;
  if (count <= thresholds[0]) return 1;
  if (count <= thresholds[1]) return 2;
  if (count <= thresholds[2]) return 3;
  return 4;
}

const LEVEL_OPACITY: Record<number, number> = {
  1: 0.3,
  2: 0.55,
  3: 0.8,
  4: 1.0,
};

export function getCellStyle(
  dominantApp: string | null,
  level: 0 | 1 | 2 | 3 | 4,
  _secondaryApp: string | null,
): React.CSSProperties {
  if (level === 0 || !dominantApp) {
    return { fill: 'var(--heatmap-empty)' };
  }

  const opacity = LEVEL_OPACITY[level] ?? 1;

  return {
    fill: `var(--app-${dominantApp}-stripe)`,
    opacity,
  };
}

export function transformHeatmapData(
  days: { date: string; total: number; apps: { appId: string; count: number }[] }[],
  thresholds: [number, number, number, number],
): HeatmapDayData[] {
  return days.map((day) => ({
    date: day.date,
    total: day.total,
    apps: day.apps,
    dominantApp: getDominantApp(day.apps),
    level: countToLevel(day.total, thresholds),
    secondaryApp: getSecondaryApp(day.apps),
  }));
}
