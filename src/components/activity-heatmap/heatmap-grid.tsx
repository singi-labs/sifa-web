'use client';

import { cloneElement, useEffect, useMemo, useRef, useState } from 'react';
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

const BLOCK_MARGIN = 3;
const BLOCK_RADIUS = 2;
const WEEKDAY_LABEL_WIDTH = 40; // approx space for Mon/Wed/Fri labels

/** Format a Date as YYYY-MM-DD in local timezone (not UTC). */
function toLocalDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Build a complete date range, filling gaps with zero-activity entries. */
function buildActivities(days: HeatmapDayData[]): {
  activities: Activity[];
  dayMap: Map<string, HeatmapDayData>;
  weekCount: number;
} {
  const dayMap = new Map<string, HeatmapDayData>();
  for (const d of days) {
    dayMap.set(d.date, d);
  }

  const today = new Date();
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  // Derive start from the earliest date in the data (or fall back to 6 months)
  const start = new Date(end);
  if (days.length > 0) {
    const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
    const earliest = new Date(sorted[0]!.date + 'T00:00:00');
    if (!isNaN(earliest.getTime())) {
      start.setTime(earliest.getTime());
    } else {
      start.setMonth(start.getMonth() - 6);
    }
  } else {
    start.setMonth(start.getMonth() - 6);
  }

  // Roll back to the previous Monday so the first column is full (weekStart=1).
  const dow = start.getDay(); // 0=Sun, 1=Mon...
  const backToMon = dow === 0 ? 6 : dow - 1;
  if (backToMon > 0) {
    start.setDate(start.getDate() - backToMon);
  }

  const activities: Activity[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    // Use local date string, NOT toISOString() which converts to UTC
    // and can shift the date by -1 day for timezones ahead of UTC
    const dateStr = toLocalDateStr(cursor);
    const existing = dayMap.get(dateStr);
    activities.push({
      date: dateStr,
      count: existing?.total ?? 0,
      level: existing?.level ?? 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  const totalDays = activities.length;
  const weekCount = Math.ceil(totalDays / 7);

  return { activities, dayMap, weekCount };
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

/** Compute blockSize so the grid fills availableWidth. */
function computeBlockSize(availableWidth: number, weekCount: number): number {
  // Total width = weekdayLabels + weekCount * (blockSize + margin) - margin
  // Solve for blockSize: (availableWidth - labelWidth + margin) / weekCount - margin
  const gridWidth = availableWidth - WEEKDAY_LABEL_WIDTH;
  const size = Math.floor((gridWidth + BLOCK_MARGIN) / weekCount - BLOCK_MARGIN);
  return Math.max(8, Math.min(size, 20)); // clamp between 8 and 20px
}

export function HeatmapGrid({ days, onSelectDate, selectedDate }: HeatmapGridProps) {
  const { activities, dayMap, weekCount } = useMemo(() => buildActivities(days), [days]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [blockSize, setBlockSize] = useState(13);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const width = el.clientWidth;
      if (width > 0) {
        setBlockSize(computeBlockSize(width, weekCount));
      }
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [weekCount]);

  const renderBlock = (block: BlockElement, activity: Activity) => {
    const dayData = dayMap.get(activity.date);
    const cellStyle = dayData
      ? getCellStyle(dayData.dominantApp, dayData.level, dayData.secondaryApp)
      : { fill: 'var(--heatmap-empty)' };

    const isSelected = selectedDate === activity.date;
    const titleText = buildTooltipText(dayData, activity.date);

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
      ref={containerRef}
      data-testid="heatmap-grid"
      className="w-full overflow-hidden [&_svg]:h-auto"
    >
      <ActivityCalendar
        data={activities}
        blockSize={blockSize}
        blockMargin={BLOCK_MARGIN}
        blockRadius={BLOCK_RADIUS}
        hideColorLegend
        hideTotalCount
        renderBlock={renderBlock}
        showWeekdayLabels={['mon', 'wed', 'fri']}
        weekStart={1}
      />
    </div>
  );
}
