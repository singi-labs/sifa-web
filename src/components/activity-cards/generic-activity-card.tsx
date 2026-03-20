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
import { getAppMeta, getAppStripeColor, buildBlobUrl } from '@/lib/atproto-apps';
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
  'community.lexicon.': 'smokesignal',
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

/**
 * Try to extract an image blob reference from an ATproto record.
 * Records across apps store images in various shapes — this handles
 * the most common patterns defensively.
 */
function extractImageBlob(
  record: Record<string, unknown>,
): { cid: string; mimeType?: string } | null {
  // Helper: check if a value looks like a blob ref and extract CID
  function extractFromBlobRef(val: unknown): { cid: string; mimeType?: string } | null {
    if (val == null || typeof val !== 'object') return null;
    const obj = val as Record<string, unknown>;

    // Standard blob shape: { ref: { $link: "cid" }, mimeType: "..." }
    const ref = obj.ref as Record<string, unknown> | undefined;
    if (ref && typeof ref === 'object' && typeof ref.$link === 'string') {
      return {
        cid: ref.$link,
        mimeType: typeof obj.mimeType === 'string' ? obj.mimeType : undefined,
      };
    }

    // Legacy/alt shape: { cid: "...", mimeType: "..." }
    if (typeof obj.cid === 'string') {
      return {
        cid: obj.cid,
        mimeType: typeof obj.mimeType === 'string' ? obj.mimeType : undefined,
      };
    }

    return null;
  }

  // Pattern 1: record.image (e.g. Flashes)
  const fromImage = extractFromBlobRef(record.image);
  if (fromImage) return fromImage;

  // Pattern 2: record.thumbnail
  const fromThumb = extractFromBlobRef(record.thumbnail);
  if (fromThumb) return fromThumb;

  // Pattern 3: record.images[0].image (e.g. Bluesky embed images)
  if (Array.isArray(record.images) && record.images.length > 0) {
    const first = record.images[0] as Record<string, unknown> | undefined;
    if (first && typeof first === 'object') {
      const fromFirst = extractFromBlobRef(first.image ?? first);
      if (fromFirst) return fromFirst;
    }
  }

  // Pattern 4: record.embed.images[0].image
  if (record.embed != null && typeof record.embed === 'object') {
    const embed = record.embed as Record<string, unknown>;
    if (Array.isArray(embed.images) && embed.images.length > 0) {
      const first = embed.images[0] as Record<string, unknown> | undefined;
      if (first && typeof first === 'object') {
        const fromFirst = extractFromBlobRef(first.image ?? first);
        if (fromFirst) return fromFirst;
      }
    }
    // Also check embed.thumbnail
    const fromEmbedThumb = extractFromBlobRef(embed.thumbnail);
    if (fromEmbedThumb) return fromEmbedThumb;
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
  authorDid,
  authorHandle,
  authorAvatar,
}: ActivityCardProps) {
  const appId = resolveAppId(collection);
  const appMeta = getAppMeta(appId);
  const category = resolveCategory(collection);
  const IconComponent = CATEGORY_ICONS[category] ?? ChatText;
  const stripeColor = getAppStripeColor(appId);
  const contentText = extractContentText(record);
  const displayText = contentText ?? `Activity on ${appMeta.name}`;
  const createdAt = typeof record.createdAt === 'string' ? record.createdAt : null;
  const timestamp = createdAt ? formatRelativeTime(createdAt) : '';
  const imageBlob = extractImageBlob(record);

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
          /* eslint-disable-next-line @next/next/no-img-element */
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
                  /* eslint-disable-next-line @next/next/no-img-element */
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
            {imageBlob && (
              <div className="mt-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={buildBlobUrl(authorDid, imageBlob.cid)}
                  alt=""
                  className="max-h-48 rounded-md object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
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
        </div>
      </div>
    </div>
  );
}
