'use client';

import { Butterfly } from '@phosphor-icons/react';
import { getAppMeta } from '@/lib/atproto-apps';
import type { ActivityCardProps } from './types';

const STRIPE_COLOR = '#0285c7';

interface Facet {
  index: { byteStart: number; byteEnd: number };
  features: Array<{ $type: string; uri?: string; did?: string; tag?: string }>;
}

interface BlueskyRecord {
  text?: string;
  createdAt?: string;
  facets?: Facet[];
  embed?: {
    $type?: string;
    images?: Array<{
      alt?: string;
      thumb?: string;
      image?: { ref?: { $link?: string }; mimeType?: string };
    }>;
  };
  reply?: { root: { uri: string }; parent: { uri: string } };
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

function buildBlueskyUrl(authorHandle: string | undefined, rkey: string): string {
  const handle = authorHandle ?? 'unknown';
  return `https://bsky.app/profile/${handle}/post/${rkey}`;
}

/**
 * Render post text with facet annotations (links and mentions).
 * Bluesky facets use byte offsets, so we convert text to a Uint8Array for slicing.
 */
function renderRichText(text: string, facets: Facet[]): React.ReactNode[] {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const bytes = encoder.encode(text);

  // Sort facets by byteStart
  const sorted = [...facets].sort((a, b) => a.index.byteStart - b.index.byteStart);

  const nodes: React.ReactNode[] = [];
  let cursor = 0;

  for (const facet of sorted) {
    const { byteStart, byteEnd } = facet.index;
    if (byteStart < cursor) continue; // overlapping facet, skip

    // Text before this facet
    if (byteStart > cursor) {
      nodes.push(decoder.decode(bytes.slice(cursor, byteStart)));
    }

    const facetText = decoder.decode(bytes.slice(byteStart, byteEnd));

    const linkFeature = facet.features.find((f) => f.$type === 'app.bsky.richtext.facet#link');
    const mentionFeature = facet.features.find(
      (f) => f.$type === 'app.bsky.richtext.facet#mention',
    );

    if (linkFeature?.uri) {
      nodes.push(
        <a
          key={`facet-${byteStart}`}
          href={linkFeature.uri}
          className="text-sky-600 underline hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300"
          target="_blank"
          rel="noopener noreferrer"
        >
          {facetText}
        </a>,
      );
    } else if (mentionFeature) {
      nodes.push(
        <span key={`facet-${byteStart}`} className="font-semibold">
          {facetText}
        </span>,
      );
    } else {
      nodes.push(facetText);
    }

    cursor = byteEnd;
  }

  // Remaining text after last facet
  if (cursor < bytes.length) {
    nodes.push(decoder.decode(bytes.slice(cursor)));
  }

  return nodes;
}

export function BlueskyPostCard({
  record: rawRecord,
  rkey,
  authorHandle,
  compact,
}: ActivityCardProps) {
  const record = rawRecord as unknown as BlueskyRecord;
  const text = record.text ?? '';
  const createdAt = record.createdAt ?? null;
  const timestamp = createdAt ? formatRelativeTime(createdAt) : '';
  const appMeta = getAppMeta('bluesky');
  const postUrl = buildBlueskyUrl(authorHandle, rkey);
  const isReply = Boolean(record.reply);
  const facets = record.facets ?? [];
  const firstImage = record.embed?.images?.[0];
  // Only use thumb URL strings, skip blob refs
  const thumbUrl = firstImage && typeof firstImage.thumb === 'string' ? firstImage.thumb : null;

  if (compact) {
    const truncated = text.length > 100 ? `${text.slice(0, 100)}...` : text;
    return (
      <div
        className="flex items-center gap-3 rounded-md border-l-4 px-3 py-2 transition-colors hover:bg-muted/50"
        style={{ borderLeftColor: STRIPE_COLOR }}
        data-testid="bluesky-card-compact"
      >
        <Butterfly className="h-5 w-5 shrink-0 text-sky-500" weight="regular" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate text-sm">{truncated}</span>
        {timestamp && <span className="shrink-0 text-xs text-muted-foreground">{timestamp}</span>}
      </div>
    );
  }

  return (
    <div
      className="flex overflow-hidden rounded-lg border-l-4 bg-card transition-colors hover:bg-muted/50"
      style={{ borderLeftColor: STRIPE_COLOR }}
      data-testid="bluesky-card-full"
    >
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start gap-3">
          <Butterfly
            className="mt-0.5 h-5 w-5 shrink-0 text-sky-500"
            weight="regular"
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1">
            {isReply && (
              <span
                className="mb-1 inline-block rounded bg-sky-100 px-1.5 py-0.5 text-xs font-medium text-sky-700 dark:bg-sky-900/40 dark:text-sky-300"
                data-testid="bluesky-reply-label"
              >
                Reply
              </span>
            )}
            <p className="text-sm leading-relaxed">
              {facets.length > 0 ? renderRichText(text, facets) : text}
            </p>
            {thumbUrl && (
              <img
                src={thumbUrl}
                alt={firstImage?.alt ?? 'Embedded image'}
                className="mt-2 max-w-[200px] rounded"
              />
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
          <span aria-hidden="true">&middot;</span>
          <a
            href={postUrl}
            className="text-sky-600 hover:underline dark:text-sky-400"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Bluesky
          </a>
        </div>
      </div>
    </div>
  );
}
