'use client';

import { useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { cn } from '@/lib/utils';
import { CHART_COLORS } from './chart-colors';

interface AreaTimelineProps {
  data: { timestamp: string; posts: number; replies: number; reposts: number }[];
  className?: string;
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
  return (
    <div className="rounded-md border border-border bg-secondary px-3 py-2 text-sm shadow-md">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}

export function AreaTimeline({ data, className }: AreaTimelineProps) {
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!data.length) return null;

  const isDark = resolvedTheme === 'dark';
  const colors = isDark ? CHART_COLORS.dark : CHART_COLORS.light;
  const [postsColor, repliesColor, repostsColor] = [colors[0], colors[1], colors[4]];

  if (!mounted) {
    return <div className={cn('min-h-[280px]', className)} />;
  }

  return (
    <div className={cn('min-h-[280px]', className)}>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
          <XAxis
            dataKey="timestamp"
            tick={{ fontSize: 12, fill: 'currentColor' }}
            className="text-muted-foreground"
          />
          <YAxis tick={{ fontSize: 12, fill: 'currentColor' }} className="text-muted-foreground" />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="posts"
            stackId="1"
            stroke={postsColor}
            fill={postsColor}
            fillOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="replies"
            stackId="1"
            stroke={repliesColor}
            fill={repliesColor}
            fillOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="reposts"
            stackId="1"
            stroke={repostsColor}
            fill={repostsColor}
            fillOpacity={0.6}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
