'use client';

import { useCallback, useEffect, useState } from 'react';
import { DailySignupsChart } from './_components/daily-signups-chart';
import { CumulativeUsersChart } from './_components/cumulative-users-chart';
import { LatestSignups } from './_components/latest-signups';
import { DauChart } from './_components/dau-chart';
import { MauChart } from './_components/mau-chart';
import { LinkedinImportsChart } from './_components/linkedin-imports-chart';

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

interface DauEntry {
  date: string;
  count: number;
}

interface MauEntry {
  month: string;
  count: number;
}

interface ActiveUsersResponse {
  daily: DauEntry[];
  monthly: MauEntry[];
}

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

interface ImportsResponse {
  daily: ImportEntry[];
  summary: ImportSummary;
}

interface SignupUser {
  did: string;
  handle: string;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string;
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
  const [latestUsers, setLatestUsers] = useState<SignupUser[]>([]);
  const [latestLoading, setLatestLoading] = useState(true);
  const [activeUsers, setActiveUsers] = useState<ActiveUsersResponse | null>(null);
  const [activeLoading, setActiveLoading] = useState(true);
  const [imports, setImports] = useState<ImportsResponse | null>(null);
  const [importsLoading, setImportsLoading] = useState(true);

  const fetchStats = useCallback(async (daysParam: string) => {
    setLoading(true);
    try {
      const url = `${API_URL}/api/admin/stats/signups?days=${daysParam}`;
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

  const fetchActiveUsers = useCallback(async (daysParam: string) => {
    setActiveLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/stats/active-users?days=${daysParam}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const json: ActiveUsersResponse = await res.json();
      setActiveUsers(json);
    } catch (err) {
      console.error('Failed to fetch active users:', err);
    } finally {
      setActiveLoading(false);
    }
  }, []);

  const fetchImports = useCallback(async (daysParam: string) => {
    setImportsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/stats/linkedin-imports?days=${daysParam}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const json: ImportsResponse = await res.json();
      setImports(json);
    } catch (err) {
      console.error('Failed to fetch LinkedIn imports:', err);
    } finally {
      setImportsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStats(days);
    void fetchActiveUsers(days);
    void fetchImports(days);
  }, [days, fetchStats, fetchActiveUsers, fetchImports]);

  useEffect(() => {
    async function fetchLatest() {
      setLatestLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/admin/stats/latest-signups`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const json = await res.json();
        setLatestUsers(json.users);
      } catch (err) {
        console.error('Failed to fetch latest signups:', err);
      } finally {
        setLatestLoading(false);
      }
    }
    void fetchLatest();
  }, []);

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

      {/* Active Users */}
      <h2 className="mt-10 text-xl font-semibold">Active Users</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Tracking since deployment. Users with no activity show as zero.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {activeLoading ? (
          <>
            <div className="h-80 animate-pulse rounded-lg bg-muted" />
            <div className="h-80 animate-pulse rounded-lg bg-muted" />
          </>
        ) : activeUsers ? (
          <>
            <DauChart data={activeUsers.daily} />
            <MauChart data={activeUsers.monthly} />
          </>
        ) : (
          <p className="text-muted-foreground">Failed to load active user stats.</p>
        )}
      </div>

      {/* LinkedIn Imports */}
      <h2 className="mt-10 text-xl font-semibold">LinkedIn Imports</h2>
      <div className="mt-4">
        {importsLoading ? (
          <div className="h-96 animate-pulse rounded-lg bg-muted" />
        ) : imports ? (
          <LinkedinImportsChart data={imports.daily} summary={imports.summary} />
        ) : (
          <p className="text-muted-foreground">Failed to load import stats.</p>
        )}
      </div>

      {/* Latest signups */}
      <div className="mt-8">
        {latestLoading ? (
          <div className="h-96 animate-pulse rounded-lg bg-muted" />
        ) : latestUsers.length > 0 ? (
          <LatestSignups users={latestUsers} />
        ) : null}
      </div>
    </div>
  );
}
