'use client';

import { useCallback, useEffect, useState } from 'react';
import { DailySignupsChart } from './_components/daily-signups-chart';
import { CumulativeUsersChart } from './_components/cumulative-users-chart';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3100';

interface SignupEntry {
  date: string;
  count: number;
  cumulative: number;
}

interface StatsResponse {
  totalUsers: number;
  signups: SignupEntry[];
}

const TIME_RANGES = [
  { label: '7d', value: '7' },
  { label: '30d', value: '30' },
  { label: '90d', value: '90' },
  { label: 'All', value: '0' },
] as const;

export default function AdminPage() {
  const [days, setDays] = useState('30');
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async (daysParam: string) => {
    setLoading(true);
    try {
      const url = `${API_URL}/api/admin/stats/signups${daysParam !== '0' ? `?days=${daysParam}` : ''}`;
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) {
        throw new Error(`Failed to fetch stats: ${res.status}`);
      }
      const json: StatsResponse = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStats(days);
  }, [days, fetchStats]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">Admin</h1>

      {/* Total users */}
      <div className="mt-6">
        {loading && !data ? (
          <div className="h-16 w-48 animate-pulse rounded-lg bg-muted" />
        ) : (
          <div>
            <p className="text-5xl font-bold tabular-nums">
              {data?.totalUsers.toLocaleString() ?? '--'}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Total users</p>
          </div>
        )}
      </div>

      {/* Time range toggle */}
      <div className="mt-6 flex gap-2" role="group" aria-label="Time range">
        {TIME_RANGES.map((range) => (
          <button
            key={range.value}
            type="button"
            onClick={() => setDays(range.value)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              days === range.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Charts */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {loading ? (
          <>
            <div className="h-80 animate-pulse rounded-lg bg-muted" />
            <div className="h-80 animate-pulse rounded-lg bg-muted" />
          </>
        ) : data ? (
          <>
            <DailySignupsChart data={data.signups} />
            <CumulativeUsersChart data={data.signups} />
          </>
        ) : (
          <p className="text-muted-foreground">Failed to load stats.</p>
        )}
      </div>
    </div>
  );
}
