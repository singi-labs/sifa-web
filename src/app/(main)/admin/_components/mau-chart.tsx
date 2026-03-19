'use client';

import type { ReactNode } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface MauEntry {
  month: string;
  count: number;
}

interface MauChartProps {
  data: MauEntry[];
}

function formatMonth(value: ReactNode): string {
  if (typeof value !== 'string') return String(value ?? '');
  const [year, month] = value.split('-');
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

export function MauChart({ data }: MauChartProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h2 className="mb-4 text-lg font-semibold">Monthly Active Users</h2>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="month"
              tickFormatter={formatMonth}
              className="text-xs"
              tick={{ fill: 'var(--color-muted-foreground)' }}
            />
            <YAxis
              allowDecimals={false}
              className="text-xs"
              tick={{ fill: 'var(--color-muted-foreground)' }}
            />
            <Tooltip
              labelFormatter={formatMonth}
              contentStyle={{
                backgroundColor: 'var(--color-card)',
                borderColor: 'var(--color-border)',
                borderRadius: '0.5rem',
              }}
            />
            <Bar dataKey="count" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
