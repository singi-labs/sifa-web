'use client';

import { Bookmark } from '@phosphor-icons/react';
import { getAppMeta, getAppStripeColor } from '@/lib/atproto-apps';
import type { ActivityCardProps } from './types';

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) return '';
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function KipClipCard({ record, compact, authorHandle }: ActivityCardProps) {
  const appMeta = getAppMeta('kipclip');
  const stripeColor = getAppStripeColor('kipclip');

  const subject = typeof record.subject === 'string' ? record.subject : null;
  const tags = Array.isArray(record.tags) ? (record.tags as string[]) : [];
  const createdAt = typeof record.createdAt === 'string' ? record.createdAt : null;
  const timestamp = createdAt ? formatRelativeTime(createdAt) : '';

  const domain = subject ? extractDomain(subject) : null;

  if (compact) {
    return (
      <div
        className="flex items-center gap-3 rounded-md border-l-4 px-3 py-2 transition-colors hover:bg-muted/50"
        style={{ borderLeftColor: stripeColor }}
        data-testid="activity-card-compact"
      >
        <Bookmark
          className="h-5 w-5 shrink-0 text-muted-foreground"
          weight="regular"
          aria-hidden="true"
        />
        {subject ? (
          <a
            href={subject}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-0 flex-1 truncate text-sm text-primary underline-offset-4 hover:underline"
          >
            {domain}
          </a>
        ) : (
          <span className="min-w-0 flex-1 truncate text-sm">Bookmark</span>
        )}
        {timestamp && <span className="shrink-0 text-xs text-muted-foreground">{timestamp}</span>}
      </div>
    );
  }

  return (
    <div
      className="flex overflow-hidden rounded-lg border-l-4 bg-card transition-colors hover:bg-muted/50"
      style={{ borderLeftColor: stripeColor }}
      data-testid="activity-card-full"
    >
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start gap-3">
          <Bookmark
            className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
            weight="regular"
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1">
            {subject ? (
              <>
                <a
                  href={subject}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  {domain}
                </a>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{subject}</p>
              </>
            ) : (
              <p className="text-sm">Bookmark</p>
            )}
            {tags.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-border pt-2 text-xs text-muted-foreground">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${appMeta.className}`}
          >
            {appMeta.name}
          </span>
          {timestamp && (
            <>
              <span aria-hidden="true">&middot;</span>
              <span>{timestamp}</span>
            </>
          )}
          {authorHandle && (
            <>
              <span aria-hidden="true">&middot;</span>
              <a
                href={`https://kipclip.com/${authorHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                View on KipClip
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
