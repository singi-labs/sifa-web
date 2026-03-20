'use client';

import {
  ChatText,
  Code,
  Camera,
  Article,
  Calendar,
  Link as LinkIcon,
  Globe,
  Clipboard,
  type Icon,
} from '@phosphor-icons/react';
import { getAppMeta } from '@/lib/atproto-apps';
import type { ActivityCardProps } from './types';

/** Map collection NSID prefixes to app IDs in atproto-apps registry */
const COLLECTION_TO_APP: Record<string, string> = {
  'app.bsky.': 'bluesky',
  'com.whtwnd.': 'whitewind',
  'events.smokesignal.': 'smokesignal',
  'com.smokesignal.': 'smokesignal',
  'xyz.smokesignal.': 'smokesignal',
  'fyi.unravel.frontpage.': 'frontpage',
  'blue.flashes.': 'flashes',
  'com.picosky.': 'picosky',
  'link.tangled.': 'tangled',
  'app.linkat.': 'linkat',
  'com.pastesphere.': 'pastesphere',
  'id.sifa.': 'sifa',
  'forum.barazo.': 'barazo',
};

/** Map app categories to Phosphor icons */
const CATEGORY_ICONS: Record<string, Icon> = {
  posts: ChatText,
  code: Code,
  photos: Camera,
  articles: Article,
  events: Calendar,
  links: LinkIcon,
  pages: Globe,
  pastes: Clipboard,
};

/** Collection keyword to category mapping */
const COLLECTION_CATEGORY: Record<string, string> = {
  post: 'posts',
  feed: 'posts',
  chat: 'posts',
  repo: 'code',
  image: 'photos',
  photo: 'photos',
  gallery: 'photos',
  blog: 'articles',
  article: 'articles',
  entry: 'articles',
  event: 'events',
  calendar: 'events',
  link: 'links',
  bookmark: 'links',
  page: 'pages',
  site: 'pages',
  paste: 'pastes',
  snippet: 'pastes',
};

/** Accent stripe colors per app */
const STRIPE_COLORS: Record<string, string> = {
  bluesky: '#0285c7',
  tangled: '#059669',
  smokesignal: '#ea580c',
  flashes: '#db2777',
  whitewind: '#475569',
  frontpage: '#7c3aed',
  picosky: '#db2777',
  linkat: '#059669',
  pastesphere: '#d97706',
};
const DEFAULT_STRIPE = '#6b7280';

function resolveAppId(collection: string): string {
  for (const [prefix, appId] of Object.entries(COLLECTION_TO_APP)) {
    if (collection.startsWith(prefix)) {
      return appId;
    }
  }
  // Fall back to first segment as app id
  const parts = collection.split('.');
  return parts.length >= 2 ? `${parts[0]}.${parts[1]}` : collection;
}

function resolveCategory(collection: string): string {
  const lower = collection.toLowerCase();
  for (const [keyword, category] of Object.entries(COLLECTION_CATEGORY)) {
    if (lower.includes(keyword)) {
      return category;
    }
  }
  return 'posts';
}

function extractContentText(record: Record<string, unknown>): string | null {
  const fields = ['text', 'title', 'name', 'description', 'content'];
  for (const field of fields) {
    const value = record[field];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }
  return null;
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

export function GenericActivityCard({
  record,
  collection,
  showAuthor,
  compact,
  authorHandle,
  authorAvatar,
}: ActivityCardProps) {
  const appId = resolveAppId(collection);
  const appMeta = getAppMeta(appId);
  const category = resolveCategory(collection);
  const IconComponent = CATEGORY_ICONS[category] ?? ChatText;
  const stripeColor = STRIPE_COLORS[appId] ?? DEFAULT_STRIPE;
  const contentText = extractContentText(record);
  const displayText = contentText ?? `Activity on ${appMeta.name}`;
  const createdAt = typeof record.createdAt === 'string' ? record.createdAt : null;
  const timestamp = createdAt ? formatRelativeTime(createdAt) : '';

  if (compact) {
    return (
      <div
        className="flex items-center gap-3 rounded-md border-l-4 px-3 py-2 transition-colors hover:bg-muted/50"
        style={{ borderLeftColor: stripeColor }}
        data-testid="activity-card-compact"
      >
        <IconComponent
          className="h-5 w-5 shrink-0 text-muted-foreground"
          weight="regular"
          aria-hidden="true"
        />
        {showAuthor && authorAvatar && (
          <img
            src={authorAvatar}
            alt={authorHandle ? `${authorHandle}'s avatar` : 'Author avatar'}
            className="h-6 w-6 shrink-0 rounded-full"
          />
        )}
        {showAuthor && !authorAvatar && authorHandle && (
          <span className="shrink-0 text-xs text-muted-foreground">@{authorHandle}</span>
        )}
        <span className="min-w-0 flex-1 truncate text-sm">{displayText}</span>
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
          <IconComponent
            className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
            weight="regular"
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1">
            {showAuthor && (authorHandle || authorAvatar) && (
              <div className="mb-1 flex items-center gap-2">
                {authorAvatar && (
                  <img
                    src={authorAvatar}
                    alt={authorHandle ? `${authorHandle}'s avatar` : 'Author avatar'}
                    className="h-5 w-5 rounded-full"
                  />
                )}
                {authorHandle && (
                  <span className="text-xs font-medium text-muted-foreground">@{authorHandle}</span>
                )}
              </div>
            )}
            <p className="text-sm leading-relaxed">{displayText}</p>
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
        </div>
      </div>
    </div>
  );
}
