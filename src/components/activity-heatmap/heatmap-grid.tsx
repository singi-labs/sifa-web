'use client';

import { cloneElement, useMemo } from 'react';
import ActivityCalendar from 'react-activity-calendar';
import type { Activity, BlockElement } from 'react-activity-calendar';
import type { HeatmapDayData } from './heatmap-colors';
import { getCellStyle } from './heatmap-colors';
import { HeatmapTooltip } from './heatmap-tooltip';

interface HeatmapGridProps {
  days: HeatmapDayData[];
  onSelectDate: ((date: string) => void) | undefined;
  selectedDate: string | null;
}

/** Build a complete date range for the last ~6 months, filling gaps with zero-activity entries. */
function buildActivities(days: HeatmapDayData[]): {
  activities: Activity[];
  dayMap: Map<string, HeatmapDayData>;
} {
  const dayMap = new Map<string, HeatmapDayData>();
  for (const d of days) {
    dayMap.set(d.date, d);
  }

  // Determine range: 6 months back from today (or last date in data)
  const today = new Date();
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const start = new Date(end);
  start.setMonth(start.getMonth() - 6);

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

export function HeatmapGrid({ days, onSelectDate, selectedDate }: HeatmapGridProps) {
  const { activities, dayMap } = useMemo(() => buildActivities(days), [days]);

  const renderBlock = (block: BlockElement, activity: Activity) => {
    const dayData = dayMap.get(activity.date);
    const style = dayData
      ? getCellStyle(dayData.dominantApp, dayData.level, dayData.secondaryApp)
      : { backgroundColor: 'var(--heatmap-empty)' };

    const isSelected = selectedDate === activity.date;

    const styledBlock = cloneElement(block, {
      style: {
        ...style,
        ...(isSelected ? { outline: '2px solid var(--ring)', outlineOffset: '1px' } : {}),
        cursor: onSelectDate ? 'pointer' : undefined,
      },
      onClick: onSelectDate ? () => onSelectDate(activity.date) : undefined,
    });

    const total = dayData?.total ?? 0;
    const apps = dayData?.apps ?? [];

    return (
      <g key={activity.date}>
        <title>{''}</title>
        {styledBlock}
        {/* Tooltip rendered via CSS :hover on the parent g */}
        <foreignObject
          x={0}
          y={0}
          width={1}
          height={1}
          overflow="visible"
          className="pointer-events-none opacity-0 transition-opacity [g:hover>&]:opacity-100"
        >
          <HeatmapTooltip date={activity.date} total={total} apps={apps} />
        </foreignObject>
      </g>
    );
  };

  return (
    <div data-testid="heatmap-grid">
      <ActivityCalendar
        data={activities}
        blockSize={13}
        blockMargin={3}
        blockRadius={2}
        hideColorLegend
        hideTotalCount
        renderBlock={renderBlock}
        showWeekdayLabels={['mon', 'wed', 'fri']}
      />
    </div>
  );
}
