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

/** Build a complete date range for the last ~6 months, filling gaps with zero-activity entries. */
function buildActivities(days: HeatmapDayData[]): {
  activities: Activity[];
  dayMap: Map<string, HeatmapDayData>;
} {
  const dayMap = new Map<string, HeatmapDayData>();
  for (const d of days) {
    dayMap.set(d.date, d);
  }

  // Determine range based on data span, ending today
  const today = new Date();
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const start = new Date(end);
  start.setMonth(start.getMonth() - 6);
  // Roll back start to the previous Monday so the first column is always full
  const dayOfWeek = start.getDay(); // 0=Sun, 1=Mon, ...
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  start.setDate(start.getDate() - daysToMonday);

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
      : { fill: 'var(--heatmap-empty)' };

    const isSelected = selectedDate === activity.date;

    // Build tooltip text
    const total = dayData?.total ?? 0;
    const tooltipLines: string[] = [];
    if (total > 0 && dayData) {
      for (const app of dayData.apps) {
        const meta = getAppMeta(app.appId);
        tooltipLines.push(`${app.count} ${meta.name}`);
      }
      tooltipLines.push(`${total} total`);
    } else {
      tooltipLines.push('No activity');
    }
    const dateLabel = new Date(activity.date + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    const titleText = `${dateLabel}\n${tooltipLines.join('\n')}`;

    return cloneElement(block, {
      style: {
        ...style,
        ...(isSelected ? { outline: '2px solid var(--ring)', outlineOffset: '1px' } : {}),
        cursor: onSelectDate ? 'pointer' : undefined,
      },
      onClick: onSelectDate ? () => onSelectDate(activity.date) : undefined,
      children: <title>{titleText}</title>,
    });
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
        weekStart={1}
      />
    </div>
  );
}
