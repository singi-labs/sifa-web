'use client';

import { useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { cn } from '@/lib/utils';
import { CHART_COLORS, OTHER_COLOR } from './chart-colors';

interface HorizontalBarChartProps {
  data: { name: string; value: number }[];
  maxItems?: number;
  className?: string;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: { name: string; value: number } }[];
}) {
  if (!active || !payload?.[0]) return null;
  const { name, value } = payload[0].payload;
  return (
    <div className="rounded-md border border-border bg-secondary px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-foreground">{name}</p>
      <p className="text-muted-foreground">{value}</p>
    </div>
  );
}

export function HorizontalBarChart({
  data,
  maxItems = 15,
  className,
}: HorizontalBarChartProps) {
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!data.length) return null;

  const isDark = resolvedTheme === 'dark';
  const barColor = isDark ? CHART_COLORS.dark[0] : CHART_COLORS.light[0];
  const otherColor = isDark ? OTHER_COLOR.dark : OTHER_COLOR.light;

  let displayData: { name: string; value: number; isOther?: boolean }[];
  if (data.length > maxItems) {
    const top = data.slice(0, maxItems);
    const rest = data.slice(maxItems);
    const othersTotal = rest.reduce((sum, d) => sum + d.value, 0);
    displayData = [
      ...top.map((d) => ({ ...d, isOther: false })),
      { name: `${rest.length} others`, value: othersTotal, isOther: true },
    ];
  } else {
    displayData = data.map((d) => ({ ...d, isOther: false }));
  }

  const chartHeight = Math.max(300, displayData.length * 32);

  if (!mounted) {
    return <div className={cn('min-h-[300px]', className)} />;
  }

  return (
    <div className={cn('max-h-[400px] min-h-[300px] overflow-y-auto', className)}>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart layout="vertical" data={displayData} margin={{ left: 10, right: 20 }}>
          <YAxis
            type="category"
            dataKey="name"
            width={120}
            tick={{ fontSize: 12, fill: 'currentColor' }}
            className="text-muted-foreground"
          />
          <XAxis type="number" tick={{ fontSize: 12, fill: 'currentColor' }} className="text-muted-foreground" />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {displayData.map((entry) => (
              <Cell
                key={entry.name}
                fill={entry.isOther ? otherColor : barColor}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
