'use client';

import {
  Star,
  FilmStrip,
  Television,
  BookOpen,
  GameController,
  MusicNote,
} from '@phosphor-icons/react';
import { getAppMeta, getAppStripeColor, resolveCardUrl } from '@/lib/atproto-apps';
import type { ActivityCardProps } from './types';
import { CardLink } from './card-link';
import { AppPill } from '../app-pill';

const MEDIA_TYPE_LABELS: Record<string, string> = {
  movie: 'Movie',
  tv_show: 'TV Show',
  book: 'Book',
  video_game: 'Game',
  music: 'Music',
  album: 'Album',
};

const MEDIA_TYPE_ICONS: Record<string, typeof FilmStrip> = {
  movie: FilmStrip,
  tv_show: Television,
  book: BookOpen,
  video_game: GameController,
  music: MusicNote,
  album: MusicNote,
};

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

function renderStars(rating: number): React.ReactNode {
  // Rating is 1-10, display as X/10
  const filled = Math.round(rating / 2);
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 10`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < filled ? 'text-amber-500' : 'text-muted-foreground/30'}`}
          weight={i < filled ? 'fill' : 'regular'}
          aria-hidden="true"
        />
      ))}
      <span className="ml-1 text-xs text-muted-foreground">{rating}/10</span>
    </span>
  );
}

function resolveCollectionType(collection: string): 'review' | 'post' | 'note' | 'other' {
  if (collection.endsWith('.review')) return 'review';
  if (collection.endsWith('.post')) return 'post';
  if (collection.endsWith('.note')) return 'note';
  return 'other';
}

export function PopfeedCard({
  record,
  collection,
  uri: _uri,
  rkey,
  authorDid,
  authorHandle,
  compact,
}: ActivityCardProps) {
  const appMeta = getAppMeta('popfeed');
  const stripeColor = getAppStripeColor('popfeed');
  const collectionType = resolveCollectionType(collection);

  const title = typeof record.title === 'string' ? record.title : null;
  const text = typeof record.text === 'string' ? record.text : null;
  const name = typeof record.name === 'string' ? record.name : null;
  const rating = typeof record.rating === 'number' ? record.rating : null;
  const creativeWorkType =
    typeof record.creativeWorkType === 'string' ? record.creativeWorkType : null;
  const posterUrl = typeof record.posterUrl === 'string' ? record.posterUrl : null;
  const mainCredit = typeof record.mainCredit === 'string' ? record.mainCredit : null;
  const isRevisit = record.isRevisit === true;
  const createdAt = typeof record.createdAt === 'string' ? record.createdAt : null;
  const timestamp = createdAt ? formatRelativeTime(createdAt) : '';

  const displayTitle = title ?? name ?? 'Activity on Popfeed';
  const mediaLabel = creativeWorkType
    ? (MEDIA_TYPE_LABELS[creativeWorkType] ?? creativeWorkType)
    : null;
  const IconComponent = (creativeWorkType ? MEDIA_TYPE_ICONS[creativeWorkType] : null) ?? FilmStrip;

  const cardUrl = resolveCardUrl('popfeed', { handle: authorHandle, did: authorDid, rkey });

  const actionLabel =
    collectionType === 'review'
      ? `Reviewed${mediaLabel ? ` a ${mediaLabel.toLowerCase()}` : ''}`
      : collectionType === 'note'
        ? `Noted on${mediaLabel ? ` a ${mediaLabel.toLowerCase()}` : ''}`
        : `Posted about${mediaLabel ? ` a ${mediaLabel.toLowerCase()}` : ''}`;

  if (compact) {
    const compactText =
      collectionType === 'review' && rating !== null
        ? `${displayTitle} (${rating}/10)`
        : displayTitle;
    return (
      <CardLink href={cardUrl} label="View on Popfeed">
        <div
          className="flex items-center gap-3 rounded-md border-l-4 px-3 py-2 transition-colors hover:bg-muted/50"
          style={{ borderLeftColor: stripeColor }}
          data-testid="popfeed-card-compact"
        >
          <IconComponent
            className="h-5 w-5 shrink-0 text-muted-foreground"
            weight="regular"
            aria-hidden="true"
          />
          <span className="min-w-0 flex-1 truncate text-sm">{compactText}</span>
          {timestamp && <span className="shrink-0 text-xs text-muted-foreground">{timestamp}</span>}
        </div>
      </CardLink>
    );
  }

  return (
    <CardLink href={cardUrl} label="View on Popfeed">
      <div
        className="flex overflow-hidden rounded-lg border-l-4 bg-card transition-colors hover:bg-muted/50"
        style={{ borderLeftColor: stripeColor }}
        data-testid="popfeed-card-full"
      >
        {posterUrl && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={posterUrl}
            alt={`${displayTitle} poster`}
            className="hidden h-auto w-20 object-cover sm:block"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-start gap-3">
            <IconComponent
              className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
              weight="regular"
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">
                {actionLabel}
                {isRevisit && (
                  <span className="ml-1.5 rounded bg-muted px-1.5 py-0.5 text-xs">Revisit</span>
                )}
              </p>
              <p className="mt-0.5 text-sm font-medium">{displayTitle}</p>
              {mainCredit && <p className="text-xs text-muted-foreground">{mainCredit}</p>}
              {rating !== null && <div className="mt-1">{renderStars(rating)}</div>}
              {text && collectionType === 'review' && (
                <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                  {text}
                </p>
              )}
              {text && (collectionType === 'post' || collectionType === 'note') && (
                <p className="mt-1 text-sm leading-relaxed">{text}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-border pt-2 text-xs text-muted-foreground">
            <AppPill appId="popfeed" name={appMeta.name} />
            {mediaLabel && (
              <>
                <span aria-hidden="true">&middot;</span>
                <span>{mediaLabel}</span>
              </>
            )}
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
