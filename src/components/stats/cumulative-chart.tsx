'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';
import { Area, AreaChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { cn } from '@/lib/utils';
import { CHART_COLORS, OTHER_COLOR } from '@/components/charts/chart-colors';

export interface CumulativeChartGroup {
  id: string;
  label: string;
}

export interface CumulativeChartProps {
  data: Record<string, number | string>[];
  groups: CumulativeChartGroup[];
  className?: string;
}

function formatYAxis(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
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

export function CumulativeChart({ data, groups, className }: CumulativeChartProps) {
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

  const visibleGroups = groups.filter((g) => !hiddenGroups.has(g.id));

  const maxVisible = useMemo(() => {
    if (visibleGroups.length === 0) return 1;
    let max = 0;
    for (const point of data) {
      const sum = visibleGroups.reduce((acc, g) => acc + (Number(point[g.id]) || 0), 0);
      if (sum > max) max = sum;
    }
    return Math.ceil(max * 1.1);
  }, [data, visibleGroups]);

  if (!mounted || !data.length) {
    return <div className={cn('min-h-[320px]', className)} />;
  }

  const isDark = resolvedTheme === 'dark';
  const palette = isDark ? CHART_COLORS.dark : CHART_COLORS.light;
  const otherColor = isDark ? OTHER_COLOR.dark : OTHER_COLOR.light;

  const getColor = (groupId: string, index: number): string => {
    if (groupId === 'other') return otherColor;
    return palette[index % palette.length] ?? otherColor;
  };

  return (
    <div className={cn('min-h-[320px]', className)}>
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 20 }}>
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: 'currentColor' }}
            className="text-muted-foreground"
          />
          <YAxis
            tickFormatter={formatYAxis}
            tick={{ fontSize: 12, fill: 'currentColor' }}
            className="text-muted-foreground"
            domain={[0, maxVisible]}
            label={{
              value: 'Identities',
              angle: -90,
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: 'currentColor', fontSize: 12 },
            }}
          />
          <Tooltip content={<CustomTooltip />} />
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
              <Area
                key={group.id}
                type="monotone"
                dataKey={group.id}
                name={group.label}
                stackId="1"
                stroke={color}
                fill={color}
                fillOpacity={isHidden ? 0 : 0.6}
                strokeOpacity={isHidden ? 0 : 1}
                hide={false}
              />
            );
          })}
          {/* Render hidden groups with zero opacity so stack integrity is maintained */}
          {visibleGroups.length !== groups.length &&
            groups
              .filter((g) => hiddenGroups.has(g.id))
              .map((group, index) => {
                const color = getColor(group.id, index);
                return (
                  <Area
                    key={`hidden-${group.id}`}
                    type="monotone"
                    dataKey={group.id}
                    name={group.label}
                    stackId="hidden"
                    stroke={color}
                    fill={color}
                    fillOpacity={0}
                    strokeOpacity={0}
                    legendType="none"
                  />
                );
              })}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
