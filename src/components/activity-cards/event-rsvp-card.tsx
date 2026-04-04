'use client';

import { useTranslations } from 'next-intl';
import { Calendar, MapPin, CheckCircle, Star } from '@phosphor-icons/react';
import { getAppMeta } from '@/lib/atproto-apps';
import type { ActivityCardProps } from './types';
import { CardLink } from './card-link';
import { AppPill, getAppPillStyle } from '../app-pill';

const STRIPE_COLOR = '#ea580c';

interface EventMeta {
  name?: string;
  startsAt?: string;
  endsAt?: string;
  mode?: string;
  locationName?: string;
  locationLocality?: string;
  locationCountry?: string;
}

interface RsvpRecord {
  $type?: string;
  status?: string;
  subject?: { uri?: string };
  createdAt?: string;
  eventMeta?: EventMeta;
}

const RSVP_LABELS: Record<string, string> = {
  '#going': 'Going',
  '#interested': 'Interested',
  '#notgoing': 'Not going',
};

const MODE_LABELS: Record<string, string> = {
  '#inperson': 'In-person',
  '#virtual': 'Virtual',
  '#hybrid': 'Hybrid',
};

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

function parseRsvpStatus(status: string | undefined): {
  label: string;
  isGoing: boolean;
} {
  if (!status) return { label: 'RSVP', isGoing: false };
  // Status may be full NSID like "community.lexicon.calendar.rsvp#going" or just "#going"
  const hashIndex = status.lastIndexOf('#');
  const suffix = hashIndex >= 0 ? status.slice(hashIndex) : '';
  const label = RSVP_LABELS[suffix] ?? 'RSVP';
  return { label, isGoing: suffix === '#going' };
}

function parseModeLabel(mode: string | undefined): string | null {
  if (!mode) return null;
  const hashIndex = mode.lastIndexOf('#');
  const suffix = hashIndex >= 0 ? mode.slice(hashIndex) : '';
  return MODE_LABELS[suffix] ?? null;
}

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function formatEventDateRange(startsAt?: string, endsAt?: string): string | null {
  if (!startsAt) return null;
  const start = new Date(startsAt);
  if (isNaN(start.getTime())) return null;

  const startMonth = MONTH_NAMES[start.getMonth()];
  const startDay = start.getDate();

  if (!endsAt) return `${startMonth} ${startDay}`;

  const end = new Date(endsAt);
  if (isNaN(end.getTime())) return `${startMonth} ${startDay}`;

  const endMonth = MONTH_NAMES[end.getMonth()];
  const endDay = end.getDate();

  if (startMonth === endMonth) {
    return startDay === endDay
      ? `${startMonth} ${startDay}`
      : `${startMonth} ${startDay}-${endDay}`;
  }
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
}

function formatLocation(meta: EventMeta): string | null {
  const parts = [meta.locationName, meta.locationLocality, meta.locationCountry].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : null;
}

function buildSmokesignalUrl(subjectUri: string | undefined): string | null {
  if (!subjectUri) return null;
  // at://did:plc:xxx/community.lexicon.calendar.event/rkey -> https://smokesignal.events/did:plc:xxx/rkey
  const match = subjectUri.match(/^at:\/\/(did:[^/]+)\/[^/]+\/(.+)$/);
  if (!match) return null;
  return `https://smokesignal.events/${match[1]}/${match[2]}`;
}

export function EventRsvpCard({ record: rawRecord, compact }: ActivityCardProps) {
  const t = useTranslations('activityIndicators');
  const record = rawRecord as unknown as RsvpRecord;
  const meta = record.eventMeta;
  const eventName = meta?.name ?? 'Event';
  const { label: rsvpLabel, isGoing } = parseRsvpStatus(record.status);
  const RsvpIcon = isGoing ? CheckCircle : Star;
  const modeLabel = parseModeLabel(meta?.mode);
  const dateRange = formatEventDateRange(meta?.startsAt, meta?.endsAt);
  const location = meta ? formatLocation(meta) : null;
  const createdAt = record.createdAt ?? null;
  const timestamp = createdAt ? formatRelativeTime(createdAt) : '';
  const appMeta = getAppMeta('smokesignal');
  const smokesignalUrl = buildSmokesignalUrl(record.subject?.uri);

  if (compact) {
    return (
      <CardLink href={smokesignalUrl} label={t('viewOnApp', { app: 'Smoke Signal' })}>
        <div
          className="flex items-center gap-3 rounded-md border-l-4 px-3 py-2 transition-colors hover:bg-muted/50"
          style={{ borderLeftColor: STRIPE_COLOR }}
          data-testid="event-rsvp-card-compact"
        >
          <Calendar
            className="h-5 w-5 shrink-0 text-muted-foreground"
            weight="regular"
            aria-hidden="true"
          />
          <span className="min-w-0 flex-1 truncate text-sm">
            {rsvpLabel}: {eventName}
          </span>
          {timestamp && <span className="shrink-0 text-xs text-muted-foreground">{timestamp}</span>}
        </div>
      </CardLink>
    );
  }

  return (
    <CardLink href={smokesignalUrl} label={t('viewOnApp', { app: 'Smoke Signal' })}>
      <div
        className="flex overflow-hidden rounded-lg border-l-4 bg-card transition-colors hover:bg-muted/50"
        style={{ borderLeftColor: STRIPE_COLOR }}
        data-testid="event-rsvp-card-full"
      >
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-start gap-3">
            <Calendar
              className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
              weight="regular"
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span
                  className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium"
                  style={getAppPillStyle('smokesignal')}
                  data-testid="event-rsvp-status-badge"
                >
                  <RsvpIcon className="h-3.5 w-3.5" weight="bold" aria-hidden="true" />
                  {rsvpLabel}
                </span>
                {modeLabel && (
                  <span
                    className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800/40 dark:text-gray-300"
                    data-testid="event-rsvp-mode-badge"
                  >
                    {modeLabel}
                  </span>
                )}
              </div>

              <p className="text-sm font-semibold leading-relaxed" data-testid="event-rsvp-name">
                {eventName}
              </p>

              {dateRange && (
                <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 shrink-0" weight="regular" aria-hidden="true" />
                  <span data-testid="event-rsvp-date">{dateRange}</span>
                </div>
              )}

              {location && (
                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0" weight="regular" aria-hidden="true" />
                  <span data-testid="event-rsvp-location">{location}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-border pt-2 text-xs text-muted-foreground">
            <AppPill appId="smokesignal" name={appMeta.name} />
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
