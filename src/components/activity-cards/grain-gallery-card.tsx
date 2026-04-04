'use client';

import { useTranslations } from 'next-intl';
import { Images, MapPin } from '@phosphor-icons/react';
import { getAppMeta, getAppStripeColor, buildBlobUrl, resolveCardUrl } from '@/lib/atproto-apps';
import type { ActivityCardProps } from './types';
import { CardLink } from './card-link';
import { AppPill } from '../app-pill';

interface GalleryMeta {
  coverPhotoCid?: string | null;
  photoCount?: number;
}

interface GrainGalleryRecord {
  $type?: string;
  title?: string;
  description?: string;
  address?: { region?: string; country?: string; locality?: string; name?: string };
  location?: { name?: string };
  createdAt?: string;
  galleryMeta?: GalleryMeta;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  const now = Date.now();
  const diffMs = now - date.getTime();
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

  const years = Math.floor(months / 12);
  return `${years}y ago`;
}

function formatLocation(record: GrainGalleryRecord): string | null {
  if (record.location?.name) return record.location.name;
  if (!record.address) return null;
  const parts = [record.address.locality, record.address.region, record.address.country].filter(
    Boolean,
  );
  return parts.length > 0 ? parts.join(', ') : null;
}

export function GrainGalleryCard({
  record: rawRecord,
  uri,
  rkey,
  compact,
  authorDid,
  authorHandle,
}: ActivityCardProps) {
  const t = useTranslations('activityIndicators');
  const record = rawRecord as unknown as GrainGalleryRecord;
  const appMeta = getAppMeta('grain');
  const stripeColor = getAppStripeColor('grain');
  const title = record.title ?? 'Photo gallery';
  const description = record.description ?? null;
  const location = formatLocation(record);
  const createdAt = record.createdAt ?? null;
  const timestamp = createdAt ? formatRelativeTime(createdAt) : '';
  const did = authorDid || uri.split('/')[2] || '';
  const cardUrl = resolveCardUrl('grain', { handle: authorHandle, did, rkey });

  const meta = record.galleryMeta;
  const coverCid = meta?.coverPhotoCid ?? null;
  const photoCount = meta?.photoCount ?? 0;

  if (compact) {
    return (
      <CardLink href={cardUrl} label={t('viewOnApp', { app: 'Grain' })}>
        <div
          className="flex items-center gap-3 rounded-md border-l-4 px-3 py-2 transition-colors hover:bg-muted/50"
          style={{ borderLeftColor: stripeColor }}
          data-testid="grain-gallery-card-compact"
        >
          <Images
            className="h-5 w-5 shrink-0 text-muted-foreground"
            weight="regular"
            aria-hidden="true"
          />
          <span className="min-w-0 flex-1 truncate text-sm">
            {title}
            {photoCount > 0 && (
              <span className="ml-1 text-muted-foreground">({photoCount} photos)</span>
            )}
          </span>
          {timestamp && <span className="shrink-0 text-xs text-muted-foreground">{timestamp}</span>}
        </div>
      </CardLink>
    );
  }

  return (
    <CardLink href={cardUrl} label={t('viewOnApp', { app: 'Grain' })}>
      <div
        className="flex overflow-hidden rounded-lg border-l-4 bg-card transition-colors hover:bg-muted/50"
        style={{ borderLeftColor: stripeColor }}
        data-testid="grain-gallery-card-full"
      >
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-start gap-3">
            <Images
              className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
              weight="regular"
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-relaxed">{title}</p>

              {description && (
                <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              )}

              {location && (
                <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0" weight="regular" aria-hidden="true" />
                  <span>{location}</span>
                </div>
              )}

              {coverCid && (
                <div className="mt-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={buildBlobUrl(did, coverCid)}
                    alt={title}
                    className="max-h-48 rounded-md object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {photoCount > 1 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  View all {photoCount} photos on Grain
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-border pt-2 text-xs text-muted-foreground">
            <AppPill appId="grain" name={appMeta.name} />
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
