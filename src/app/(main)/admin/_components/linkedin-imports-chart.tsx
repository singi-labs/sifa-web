'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { formatDateShort } from './format-date';

interface ImportEntry {
  date: string;
  successCount: number;
  failureCount: number;
  totalItems: number;
}

interface ImportSummary {
  totalImports: number;
  totalSuccess: number;
  totalItems: number;
  successRate: number;
}

interface LinkedinImportsChartProps {
  data: ImportEntry[];
  summary: ImportSummary;
}

export function LinkedinImportsChart({ data, summary }: LinkedinImportsChartProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h2 className="mb-4 text-lg font-semibold">LinkedIn Imports</h2>
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
            <Legend />
            <Bar
              dataKey="successCount"
              name="Success"
              stackId="imports"
              fill="var(--chart-2)"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="failureCount"
              name="Failed"
              stackId="imports"
              fill="var(--color-destructive)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold tabular-nums">{summary.totalImports}</p>
          <p className="text-xs text-muted-foreground">Total imports</p>
        </div>
        <div>
          <p className="text-2xl font-bold tabular-nums">{summary.successRate}%</p>
          <p className="text-xs text-muted-foreground">Success rate</p>
        </div>
        <div>
          <p className="text-2xl font-bold tabular-nums">{summary.totalItems.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Items imported</p>
        </div>
      </div>
    </div>
  );
}
