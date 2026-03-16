'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatDateShort } from './format-date';

interface SignupEntry {
  date: string;
  count: number;
  cumulative: number;
}

interface DailySignupsChartProps {
  data: SignupEntry[];
}

export function DailySignupsChart({ data }: DailySignupsChartProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h2 className="mb-4 text-lg font-semibold">Daily Signups</h2>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDateShort}
              className="text-xs"
              tick={{ fill: 'var(--color-muted-foreground)' }}
            />
            <YAxis
              allowDecimals={false}
              className="text-xs"
              tick={{ fill: 'var(--color-muted-foreground)' }}
            />
            <Tooltip
              labelFormatter={formatDateShort}
              contentStyle={{
                backgroundColor: 'var(--color-card)',
                borderColor: 'var(--color-border)',
                borderRadius: '0.5rem',
              }}
            />
            <Bar dataKey="count" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
