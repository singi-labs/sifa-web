'use client';

import { cloneElement, useMemo } from 'react';
import ActivityCalendar from 'react-activity-calendar';
import type { Activity, BlockElement } from 'react-activity-calendar';
import type { HeatmapDayData } from './heatmap-colors';
import { getCellStyle } from './heatmap-colors';
import { getAppMeta } from '@/lib/atproto-apps';

interface HeatmapGridProps {
  days: HeatmapDayData[];
  onSelectDate: ((date: string) => void) | undefined;
  selectedDate: string | null;
}

/** Build a complete date range, filling gaps with zero-activity entries. */
function buildActivities(days: HeatmapDayData[]): {
  activities: Activity[];
  dayMap: Map<string, HeatmapDayData>;
} {
  const dayMap = new Map<string, HeatmapDayData>();
  for (const d of days) {
    dayMap.set(d.date, d);
  }

  const today = new Date();
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const start = new Date(end);
  start.setMonth(start.getMonth() - 6);
  // Roll back to previous Monday so the first column is always full (weekStart=1)
  const dow = start.getDay(); // 0=Sun, 1=Mon...
  const backToMon = dow === 0 ? 6 : dow - 1;
  if (backToMon > 0) {
    start.setDate(start.getDate() - backToMon);
  }

  const activities: Activity[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const dateStr = cursor.toISOString().slice(0, 10);
    const existing = dayMap.get(dateStr);
    activities.push({
      date: dateStr,
      count: existing?.total ?? 0,
      level: existing?.level ?? 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return { activities, dayMap };
}

function buildTooltipText(dayData: HeatmapDayData | undefined, dateStr: string): string {
  const dateLabel = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  if (!dayData || dayData.total === 0) {
    return `${dateLabel}\nNo activity`;
  }
  const lines = dayData.apps.map((app) => {
    const meta = getAppMeta(app.appId);
    return `${app.count} ${meta.name}`;
  });
  lines.push(`${dayData.total} total`);
  return `${dateLabel}\n${lines.join('\n')}`;
}

export function HeatmapGrid({ days, onSelectDate, selectedDate }: HeatmapGridProps) {
  const { activities, dayMap } = useMemo(() => buildActivities(days), [days]);

  const renderBlock = (block: BlockElement, activity: Activity) => {
    const dayData = dayMap.get(activity.date);
    const cellStyle = dayData
      ? getCellStyle(dayData.dominantApp, dayData.level, dayData.secondaryApp)
      : { fill: 'var(--heatmap-empty)' };

    const isSelected = selectedDate === activity.date;
    const titleText = buildTooltipText(dayData, activity.date);

    // Override the fill ATTRIBUTE (not just style) — the library sets fill as
    // an SVG attribute on <rect> which takes precedence over style.fill
    const fillValue = cellStyle.fill as string;

    return cloneElement(block, {
      fill: fillValue,
      opacity: cellStyle.opacity,
      style: {
        ...(isSelected ? { outline: '2px solid var(--ring)', outlineOffset: '1px' } : {}),
        cursor: onSelectDate ? 'pointer' : undefined,
      },
      onClick: onSelectDate ? () => onSelectDate(activity.date) : undefined,
      children: <title>{titleText}</title>,
    });
  };

  return (
    <div
      data-testid="heatmap-grid"
      className="w-full [&_div]:!overflow-visible [&_svg]:!w-full [&_svg]:h-auto [&_svg]:max-w-none"
    >
      <ActivityCalendar
        data={activities}
        blockSize={13}
        blockMargin={3}
        blockRadius={2}
        hideColorLegend
        hideTotalCount
        renderBlock={renderBlock}
        showWeekdayLabels={['mon', 'wed', 'fri']}
        weekStart={1}
      />
    </div>
  );
}
