'use client';

import { useState, useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { cn } from '@/lib/utils';
import { CHART_COLORS, OTHER_COLOR } from '@/components/charts/chart-colors';

export interface DailyChartGroup {
  id: string;
  label: string;
}

export interface DailyChartProps {
  data: Record<string, number | string>[];
  groups: DailyChartGroup[];
  className?: string;
}

function formatYAxis(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

function formatDate(dateStr: string): string {
  // dateStr is expected as YYYY-MM-DD; return MM-DD for compactness
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[1]}-${parts[2]}`;
  }
  return dateStr;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const total = payload.reduce((sum, entry) => sum + (entry.value ?? 0), 0);

  return (
    <div className="rounded-md border border-border bg-secondary px-3 py-2 text-sm shadow-md">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: {entry.value.toLocaleString()}
        </p>
      ))}
      {payload.length > 1 && (
        <p className="mt-1 border-t border-border pt-1 font-medium text-foreground">
          Total: {total.toLocaleString()}
        </p>
      )}
    </div>
  );
}

export function DailyChart({ data, groups, className }: DailyChartProps) {
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const [hiddenGroups, setHiddenGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (groupId: string) => {
    setHiddenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  if (!mounted || !data.length) {
    return <div className={cn('min-h-[300px]', className)} />;
  }

  const isDark = resolvedTheme === 'dark';
  const palette = isDark ? CHART_COLORS.dark : CHART_COLORS.light;
  const otherColor = isDark ? OTHER_COLOR.dark : OTHER_COLOR.light;

  const getColor = (groupId: string, index: number): string => {
    if (groupId === 'other') return otherColor;
    return palette[index % palette.length] ?? otherColor;
  };

  return (
    <div className={cn('min-h-[300px]', className)}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 10 }}>
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            interval="preserveStartEnd"
            tick={{ fontSize: 12, fill: 'currentColor' }}
            className="text-muted-foreground"
          />
          <YAxis
            tickFormatter={formatYAxis}
            tick={{ fontSize: 12, fill: 'currentColor' }}
            className="text-muted-foreground"
          />
          <Tooltip
            content={<CustomTooltip />}
            labelFormatter={(label) => formatDate(String(label))}
          />
          <Legend
            onClick={(e) => {
              if (e.dataKey) toggleGroup(String(e.dataKey));
            }}
            formatter={(value, entry) => (
              <span
                className="cursor-pointer select-none text-sm"
                style={{
                  color: hiddenGroups.has(String(entry.dataKey))
                    ? 'var(--muted-foreground)'
                    : 'currentColor',
                  textDecoration: hiddenGroups.has(String(entry.dataKey)) ? 'line-through' : 'none',
                }}
              >
                {value}
              </span>
            )}
          />
          {groups.map((group, index) => {
            const color = getColor(group.id, index);
            const isHidden = hiddenGroups.has(group.id);
            return (
              <Bar
                key={group.id}
                dataKey={group.id}
                name={group.label}
                stackId="1"
                fill={color}
                opacity={isHidden ? 0 : 1}
              />
            );
          })}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
