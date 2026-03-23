'use client';

import { useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';
import { ResponsiveContainer, Tooltip, Treemap } from 'recharts';
import { cn } from '@/lib/utils';
import { CHART_COLORS } from './chart-colors';

interface TreemapChartProps {
  data: { name: string; value: number }[];
  className?: string;
}

interface CustomContentProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  value?: number;
  index?: number;
  colors: readonly string[];
}

function CustomContent({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  name,
  value,
  index = 0,
  colors,
}: CustomContentProps) {
  if (width < 4 || height < 4) return null;
  const fill = colors[index % colors.length];
  const showLabel = width > 50 && height > 30;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        stroke="#fff"
        strokeWidth={2}
        rx={2}
      />
      {showLabel && (
        <>
          <text
            x={x + width / 2}
            y={y + height / 2 - 6}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-white text-xs font-medium"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
          >
            {name && name.length > 12 ? `${name.slice(0, 12)}...` : name}
          </text>
          <text
            x={x + width / 2}
            y={y + height / 2 + 10}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-white text-xs opacity-80"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
          >
            {value}
          </text>
        </>
      )}
    </g>
  );
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

export function TreemapChart({ data, className }: TreemapChartProps) {
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!data.length) return null;

  const colors = resolvedTheme === 'dark' ? CHART_COLORS.dark : CHART_COLORS.light;

  if (!mounted) {
    return <div className={cn('min-h-[300px]', className)} />;
  }

  return (
    <div className={cn('min-h-[300px]', className)}>
      <ResponsiveContainer width="100%" height={300}>
        <Treemap
          data={data}
          dataKey="value"
          nameKey="name"
          content={<CustomContent colors={colors} />}
        >
          <Tooltip content={<CustomTooltip />} />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}
