'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';
import { CHART_COLORS } from './chart-colors';

interface DonutChartProps {
  data: { name: string; value: number }[];
  className?: string;
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

function CustomTooltip({
  active,
  payload,
  total,
}: {
  active?: boolean;
  payload?: { name: string; value: number }[];
  total: number;
}) {
  if (!active || !payload?.[0]) return null;
  const { name, value } = payload[0];
  const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
  return (
    <div className="rounded-md border border-border bg-secondary px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-foreground">{name}</p>
      <p className="text-muted-foreground">
        {value} ({pct}%)
      </p>
    </div>
  );
}

export function DonutChart({ data, className }: DonutChartProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!data.length) return null;

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const palette = resolvedTheme === 'dark' ? CHART_COLORS.dark : CHART_COLORS.light;

  if (!mounted) {
    return <div className={cn('min-h-[250px]', className)} />;
  }

  return (
    <div className={cn('min-h-[250px]', className)}>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="55%"
            outerRadius="80%"
            isAnimationActive={!reducedMotion}
          >
            {data.map((entry, i) => (
              <Cell key={entry.name} fill={palette[i % palette.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip total={total} />} />
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-foreground text-2xl font-semibold"
          >
            {total.toLocaleString()}
          </text>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
