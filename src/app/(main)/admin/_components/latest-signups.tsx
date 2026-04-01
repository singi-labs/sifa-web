'use client';

import Image from 'next/image';

interface ProfileCompletion {
  hasHeadline: boolean;
  hasAbout: boolean;
  positionCount: number;
  educationCount: number;
  skillCount: number;
  certificationCount: number;
}

export interface SignupUser {
  did: string;
  handle: string;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string;
  hasImported: boolean;
  profileCompletion: ProfileCompletion;
}

type FilterValue = 'all' | 'no-import' | 'gt50' | 'complete';

interface LatestSignupsProps {
  users: SignupUser[];
  filter: FilterValue;
  onFilterChange: (filter: FilterValue) => void;
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function completionPercent(c: ProfileCompletion): number {
  // 6 signals, each worth equal weight
  let filled = 0;
  if (c.hasHeadline) filled++;
  if (c.hasAbout) filled++;
  if (c.positionCount > 0) filled++;
  if (c.educationCount > 0) filled++;
  if (c.skillCount > 0) filled++;
  if (c.certificationCount > 0) filled++;
  return Math.round((filled / 6) * 100);
}

function completionColor(pct: number): string {
  if (pct >= 80) return 'bg-green-500';
  if (pct >= 50) return 'bg-yellow-500';
  return 'bg-red-400';
}

function CompletionBar({ completion }: { completion: ProfileCompletion }) {
  const pct = completionPercent(completion);
  const parts: string[] = [];
  if (completion.hasHeadline) parts.push('Headline');
  if (completion.hasAbout) parts.push('About');
  if (completion.positionCount > 0) parts.push(`${completion.positionCount} pos`);
  if (completion.educationCount > 0) parts.push(`${completion.educationCount} edu`);
  if (completion.skillCount > 0) parts.push(`${completion.skillCount} skills`);
  if (completion.certificationCount > 0) parts.push(`${completion.certificationCount} certs`);

  return (
    <div
      className="flex items-center gap-2"
      title={parts.length > 0 ? parts.join(', ') : 'Empty profile'}
    >
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${completionColor(pct)}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-muted-foreground">{pct}%</span>
    </div>
  );
}

const FILTERS: { label: string; value: FilterValue }[] = [
  { label: 'All', value: 'all' },
  { label: 'No import', value: 'no-import' },
  { label: '>50%', value: 'gt50' },
  { label: '100%', value: 'complete' },
];

export function LatestSignups({
  users,
  filter,
  onFilterChange,
  total,
  page,
  pageSize,
  onPageChange,
}: LatestSignupsProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Latest Signups ({total})</h2>
        <div className="flex gap-1" role="group" aria-label="Filter signups">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => onFilterChange(f.value)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                filter === f.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div className="divide-y divide-border">
        {users.map((user) => (
          <div key={user.did} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt=""
                width={36}
                height={36}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-muted" />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium">{user.displayName || user.handle}</p>
                {!user.hasImported && (
                  <span className="shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                    No import
                  </span>
                )}
              </div>
              <p className="truncate text-xs text-muted-foreground">@{user.handle}</p>
            </div>
            <CompletionBar completion={user.profileCompletion} />
            <span className="shrink-0 text-xs text-muted-foreground">
              {timeAgo(user.createdAt)}
            </span>
            <div className="flex shrink-0 gap-2">
              <a
                href={`https://bsky.app/profile/${user.handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Bsky
              </a>
              <a
                href={`/p/${user.handle}`}
                className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Sifa
              </a>
            </div>
          </div>
        ))}
        {users.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No users match this filter.
          </p>
        )}
      </div>
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => onPageChange(page - 1)}
              className="rounded-md px-3 py-1 text-xs font-medium transition-colors bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:pointer-events-none"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => onPageChange(page + 1)}
              className="rounded-md px-3 py-1 text-xs font-medium transition-colors bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:pointer-events-none"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
