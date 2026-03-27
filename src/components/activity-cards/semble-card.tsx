'use client';

import { Path, CheckCircle, Footprints } from '@phosphor-icons/react';
import { getAppMeta, getAppStripeColor, resolveCardUrl } from '@/lib/atproto-apps';
import type { ActivityCardProps } from './types';
import { CardLink } from './card-link';
import { ActivityTooltip } from '../activity-tooltip';
import { AppPill } from '../app-pill';

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

type RecordType = 'trail' | 'completion' | 'walk';

function detectRecordType(collection: string): RecordType {
  if (collection.endsWith('.completion')) return 'completion';
  if (collection.endsWith('.walk')) return 'walk';
  return 'trail';
}

export function SembleCard({ record, collection, authorHandle, compact }: ActivityCardProps) {
  const appMeta = getAppMeta('semble');
  const stripeColor = getAppStripeColor('semble');
  const recordType = detectRecordType(collection);
  const createdAt = typeof record.createdAt === 'string' ? record.createdAt : null;
  const timestamp = createdAt ? formatRelativeTime(createdAt) : '';
  const cardUrl = resolveCardUrl('semble', { handle: authorHandle });

  // Trail records have rich data
  const title = typeof record.title === 'string' ? record.title : null;
  const description = typeof record.description === 'string' ? record.description : null;
  const stops = Array.isArray(record.stops) ? record.stops : [];
  const accentColor = typeof record.accentColor === 'string' ? record.accentColor : null;

  // Walk records have visited stops
  const visitedStops = Array.isArray(record.visitedStops) ? record.visitedStops : [];

  const IconComponent =
    recordType === 'completion' ? CheckCircle : recordType === 'walk' ? Footprints : Path;

  const actionLabel =
    recordType === 'completion'
      ? 'Completed a trail'
      : recordType === 'walk'
        ? 'Explored a trail'
        : (title ?? 'Created a trail');

  if (compact) {
    return (
      <CardLink href={cardUrl} label="View on Semble">
        <div
          className="flex items-center gap-3 rounded-md border-l-4 px-3 py-2 transition-colors hover:bg-muted/50"
          style={{ borderLeftColor: accentColor ?? stripeColor }}
          data-testid="activity-card-compact"
        >
          <IconComponent
            className="h-5 w-5 shrink-0 text-muted-foreground"
            weight="regular"
            aria-hidden="true"
          />
          <span className="min-w-0 flex-1 truncate text-sm">{actionLabel}</span>
          {timestamp && <span className="shrink-0 text-xs text-muted-foreground">{timestamp}</span>}
        </div>
      </CardLink>
    );
  }

  return (
    <CardLink href={cardUrl} label="View on Semble">
      <div
        className="flex overflow-hidden rounded-lg border-l-4 bg-card transition-colors hover:bg-muted/50"
        style={{ borderLeftColor: accentColor ?? stripeColor }}
        data-testid="activity-card-full"
      >
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-start gap-3">
            <IconComponent
              className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
              weight="regular"
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              {recordType === 'trail' && (
                <>
                  {title && <p className="text-sm font-medium">{title}</p>}
                  {description && description !== title && (
                    <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
                  )}
                  {stops.length > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {stops.length} {stops.length === 1 ? 'stop' : 'stops'}
                    </p>
                  )}
                </>
              )}
              {recordType === 'completion' && <p className="text-sm">Completed a trail</p>}
              {recordType === 'walk' && (
                <p className="text-sm">
                  Explored a trail
                  {visitedStops.length > 0 && (
                    <span className="text-muted-foreground">
                      {' '}
                      &middot; {visitedStops.length} {visitedStops.length === 1 ? 'stop' : 'stops'}{' '}
                      visited
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-border pt-2 text-xs text-muted-foreground">
            <ActivityTooltip
              appName={appMeta.name}
              tooltipDescription={appMeta.tooltipDescription}
              tooltipNetworkNote={appMeta.tooltipNetworkNote}
              appUrl={appMeta.appUrl}
            >
              <AppPill appId="semble" name={appMeta.name} />
            </ActivityTooltip>
            {timestamp && (
              <>
                <span aria-hidden="true">&middot;</span>
                <span>{timestamp}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </CardLink>
  );
}
