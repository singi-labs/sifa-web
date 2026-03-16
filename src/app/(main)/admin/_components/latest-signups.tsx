'use client';

import Image from 'next/image';

interface SignupUser {
  did: string;
  handle: string;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

interface LatestSignupsProps {
  users: SignupUser[];
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

export function LatestSignups({ users }: LatestSignupsProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h2 className="mb-4 text-lg font-semibold">Latest Signups</h2>
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
              <p className="truncate text-sm font-medium">{user.displayName || user.handle}</p>
              <p className="truncate text-xs text-muted-foreground">@{user.handle}</p>
            </div>
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
      </div>
    </div>
  );
}
