'use client';

import { GitBranch, Code } from '@phosphor-icons/react';
import { getAppStripeColor, resolveCardUrl } from '@/lib/atproto-apps';
import type { ActivityCardProps } from './types';
import { CardLink } from './card-link';
import { AppPill } from '../app-pill';

const TANGLED_STRIPE = getAppStripeColor('tangled');
/** Language badge styling — uses fallback app color tokens */
const LANGUAGE_BADGE_CLASS =
  'bg-[var(--app-fallback-badge-bg)] text-[var(--app-fallback-badge-text)]';

/**
 * Derive a human-readable type label from the collection NSID.
 * e.g. "sh.tangled.graph.repo" -> "Repository"
 */
function deriveTypeLabel(collection: string): string {
  const lastSegment = collection.split('.').pop() ?? '';
  const labels: Record<string, string> = {
    repo: 'Repository',
    commit: 'Commit',
    issue: 'Issue',
    pr: 'Pull Request',
    pullrequest: 'Pull Request',
    star: 'Star',
    fork: 'Fork',
    release: 'Release',
    tag: 'Tag',
  };
  return (
    labels[lastSegment.toLowerCase()] ?? lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1)
  );
}

/**
 * Try to extract meaningful display text from a Tangled record.
 * Prioritises name > title > text > message > description.
 */
function extractText(record: Record<string, unknown>): {
  title: string | null;
  subtitle: string | null;
} {
  const name = typeof record.name === 'string' && record.name.trim() ? record.name.trim() : null;
  const description =
    typeof record.description === 'string' && record.description.trim()
      ? record.description.trim()
      : null;

  if (name) return { title: name, subtitle: description };

  // Fallback fields
  const fallbackFields = ['title', 'text', 'message'];
  for (const field of fallbackFields) {
    const value = record[field];
    if (typeof value === 'string' && value.trim()) {
      return { title: value.trim(), subtitle: description };
    }
  }

  return { title: null, subtitle: description };
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

export function TangledCard({ record, collection, compact, authorHandle }: ActivityCardProps) {
  const { title, subtitle } = extractText(record);
  const typeLabel = deriveTypeLabel(collection);
  const language =
    typeof record.language === 'string' && record.language.trim() ? record.language.trim() : null;
  const createdAt = typeof record.createdAt === 'string' ? record.createdAt : null;
  const timestamp = createdAt ? formatRelativeTime(createdAt) : '';
  const displayTitle = title ?? `Activity on Tangled`;

  // Per-item link for repos: https://tangled.sh/{handle}/{repoName}
  // Falls back to profile URL via resolveCardUrl
  const repoName =
    typeof record.name === 'string' && record.name.trim() ? record.name.trim() : null;
  const tangledItemUrl =
    repoName && authorHandle ? `https://tangled.sh/${authorHandle}/${repoName}` : null;
  const cardUrl = tangledItemUrl ?? resolveCardUrl('tangled', { handle: authorHandle });

  if (compact) {
    return (
      <CardLink href={cardUrl} label="View on Tangled">
        <div
          className="flex items-center gap-3 rounded-md border-l-4 px-3 py-2 transition-colors hover:bg-muted/50"
          style={{ borderLeftColor: TANGLED_STRIPE }}
          data-testid="tangled-card-compact"
        >
          <Code
            className="h-5 w-5 shrink-0 text-muted-foreground"
            weight="regular"
            aria-hidden="true"
          />
          <span className="min-w-0 flex-1 truncate text-sm">{displayTitle}</span>
          {language && (
            <span
              className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ${LANGUAGE_BADGE_CLASS}`}
              data-testid="tangled-language-badge"
            >
              {language}
            </span>
          )}
          {timestamp && <span className="shrink-0 text-xs text-muted-foreground">{timestamp}</span>}
        </div>
      </CardLink>
    );
  }

  return (
    <CardLink href={cardUrl} label="View on Tangled">
      <div
        className="flex overflow-hidden rounded-lg border-l-4 bg-card transition-colors hover:bg-muted/50"
        style={{ borderLeftColor: TANGLED_STRIPE }}
        data-testid="tangled-card-full"
      >
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-start gap-3">
            <GitBranch
              className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
              weight="regular"
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm" data-testid="tangled-title">
                  {displayTitle}
                </span>
                {language && (
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${LANGUAGE_BADGE_CLASS}`}
                    data-testid="tangled-language-badge"
                  >
                    {language}
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="mt-1 text-sm text-muted-foreground" data-testid="tangled-description">
                  {subtitle}
                </p>
              )}
              <span
                className="mt-1 inline-block text-xs text-muted-foreground/70"
                data-testid="tangled-type-label"
              >
                {typeLabel}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-border pt-2 text-xs text-muted-foreground">
            <AppPill appId="tangled" name="Tangled" />
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
