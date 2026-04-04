'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle, Eye, EyeSlash, ArrowsClockwise } from '@phosphor-icons/react';
import { Popover } from '@base-ui/react/popover';
import { toast } from 'sonner';
import { EditableSection, EditableEntry, PUBLICATION_FIELDS } from '@/components/profile-editor';
import {
  publicationToValues,
  valuesToPublication,
} from '@/components/profile-editor/section-converters';
import { formatTimelineDate } from './timeline';
import { sortByDateDesc, singleDateExtractor } from '@/lib/sort-by-date';
import { OrcidIcon } from '@/lib/orcid-icon';
import {
  hideOrcidPublication,
  unhideOrcidPublication,
  hideStandardPublication,
  unhideStandardPublication,
  hideSifaPublication,
  unhideSifaPublication,
  refreshOrcidPublications,
} from '@/lib/profile-api';
import type { ProfilePublication } from '@/lib/types';

const SHOW_LIMIT = 5;

interface PublicationsSectionProps {
  publications: ProfilePublication[];
  isOwnProfile?: boolean;
  hasVerifiedOrcid?: boolean;
  hasOrcidAccount?: boolean;
}

export function PublicationsSection({
  publications,
  isOwnProfile,
  hasVerifiedOrcid,
  hasOrcidAccount,
}: PublicationsSectionProps) {
  const t = useTranslations('sections');
  const [refreshing, setRefreshing] = useState(false);
  const [localPubs, setLocalPubs] = useState(publications);
  const [showAll, setShowAll] = useState(false);

  // Filter publications based on ownership:
  // - Non-owners don't see hidden items or unverified ORCID items
  // - Owners see everything (with verification hint for unverified)
  const visiblePubs = isOwnProfile
    ? localPubs
    : localPubs.filter((p) => !p.hidden && !p.pendingVerification);

  // Only Sifa-native items go through EditableSection (with edit/delete controls)
  const sifaPubs = visiblePubs.filter((p) => !p.source || p.source === 'sifa');
  // External items rendered separately as read-only
  const externalPubs = visiblePubs.filter((p) => p.source === 'orcid' || p.source === 'standard');

  // Combined sorted list for the "Show X more" limit
  const allSortedPubs = sortByDateDesc(visiblePubs, singleDateExtractor);
  const displayedPubs = showAll ? allSortedPubs : allSortedPubs.slice(0, SHOW_LIMIT);
  const displayedRkeys = new Set(displayedPubs.map((p) => p.rkey));
  const hiddenCount = allSortedPubs.length - displayedPubs.length;

  // External pubs within the display limit
  const displayedExternalPubs = displayedPubs.filter(
    (p) => p.source === 'orcid' || p.source === 'standard',
  );

  if (!visiblePubs.length && !isOwnProfile) return null;

  async function handleRefresh() {
    setRefreshing(true);
    try {
      const result = await refreshOrcidPublications();
      if (!result.success) {
        toast.error(result.error ?? 'Failed to refresh ORCID publications');
        return;
      }
      const added = result.added ?? 0;
      const removed = result.removed ?? 0;
      if (added === 0 && removed === 0) {
        toast.info('No changes found on ORCID');
      } else {
        const parts: string[] = [];
        if (added > 0) parts.push(`${added} publication${added === 1 ? '' : 's'} synced`);
        if (removed > 0) parts.push(`${removed} removed`);
        toast.success(parts.join(', '));
        // Reload after a short delay so the toast is visible
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch {
      toast.error('Failed to connect to ORCID. Please try again.');
    } finally {
      setRefreshing(false);
    }
  }

  async function handleToggleHide(pub: ProfilePublication, currentlyHidden: boolean) {
    if (pub.source === 'orcid' && pub.orcidPutCode !== undefined) {
      if (currentlyHidden) await unhideOrcidPublication(pub.orcidPutCode);
      else await hideOrcidPublication(pub.orcidPutCode);
    } else if (pub.source === 'standard') {
      if (currentlyHidden) await unhideStandardPublication(pub.rkey);
      else await hideStandardPublication(pub.rkey);
    } else {
      // sifa-native
      if (currentlyHidden) await unhideSifaPublication(pub.rkey);
      else await hideSifaPublication(pub.rkey);
    }
    setLocalPubs((prev) =>
      prev.map((p) => (p.rkey === pub.rkey ? { ...p, hidden: !currentlyHidden } : p)),
    );
  }

  return (
    <section className="mt-8" aria-label={t('publications')}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {t('publications')}
          {visiblePubs.length > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {visiblePubs.filter((p) => !p.hidden).length}
            </span>
          )}
        </h2>
        {isOwnProfile && hasOrcidAccount && (
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            <ArrowsClockwise
              size={14}
              className={refreshing ? 'animate-spin' : ''}
              aria-hidden="true"
            />
            Refresh from ORCID
          </button>
        )}
      </div>

      {/* Verification hint for owner when ORCID items are pending */}
      {isOwnProfile && externalPubs.some((p) => p.pendingVerification) && (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          <p className="font-medium">Your ORCID publications are only visible to you</p>
          <p className="mt-1 text-amber-700 dark:text-amber-300">
            Verify your ORCID account to make them visible on your public profile. Go to your ORCID
            researcher-urls and add your Sifa profile URL, then tap &quot;Check now&quot; on your
            ORCID link above.
          </p>
        </div>
      )}

      {/* Sifa-native publications: editable via EditableSection */}
      {(sifaPubs.length > 0 || isOwnProfile) && (
        <EditableSection<ProfilePublication>
          sectionTitle={t('publications')}
          profileKey="publications"
          isOwnProfile={isOwnProfile}
          fields={PUBLICATION_FIELDS}
          toValues={publicationToValues}
          fromValues={
            valuesToPublication as unknown as (
              v: Record<string, string | boolean>,
            ) => Omit<ProfilePublication, 'rkey'>
          }
          collection="id.sifa.profile.publication"
          sortItems={(items) =>
            sortByDateDesc(
              items.filter((p) => !p.source || p.source === 'sifa'),
              singleDateExtractor,
            )
          }
          renderEntry={(pub, controls) => {
            // Skip non-sifa items that leak through from the profile store
            if (pub.source && pub.source !== 'sifa') return null;
            // Apply show limit
            if (!showAll && !displayedRkeys.has(pub.rkey)) return null;
            return (
              <EditableEntry
                key={pub.rkey}
                isOwnProfile={isOwnProfile}
                onEdit={controls?.onEdit ?? (() => {})}
                onDelete={controls?.onDelete ?? (() => {})}
                entryLabel={pub.title}
              >
                <PublicationCard
                  pub={pub}
                  isOwnProfile={isOwnProfile}
                  onToggleHide={handleToggleHide}
                />
              </EditableEntry>
            );
          }}
        />
      )}

      {/* ORCID + Standard publications: read-only */}
      {displayedExternalPubs.length > 0 && (
        <div className="space-y-3">
          {displayedExternalPubs.map((pub) => (
            <div key={pub.rkey} className={pub.hidden ? 'opacity-50' : undefined}>
              <PublicationCard
                pub={pub}
                isOwnProfile={isOwnProfile}
                onToggleHide={handleToggleHide}
              />
            </div>
          ))}
        </div>
      )}

      {/* Show more */}
      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="mt-3 text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          Show {hiddenCount} more
        </button>
      )}
    </section>
  );
}

function PublicationCard({
  pub,
  isOwnProfile,
  onToggleHide,
}: {
  pub: ProfilePublication;
  isOwnProfile?: boolean;
  onToggleHide: (pub: ProfilePublication, hidden: boolean) => void;
}) {
  const isOrcid = pub.source === 'orcid';

  return (
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {/* Source icon */}
          {isOrcid && <OrcidIcon size={14} className="shrink-0 text-muted-foreground" />}

          {/* Verification checkmark */}
          {(pub.verified || pub.orcidCorroborated) && (
            <VerificationCheckmark verifiedVia={pub.verifiedVia} />
          )}

          {/* Title */}
          <p className="font-medium">
            {pub.url ? (
              <a
                href={pub.url}
                className="underline-offset-4 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {pub.title}
              </a>
            ) : (
              pub.title
            )}
          </p>
        </div>

        {/* Publisher + type badge */}
        <div className="flex items-center gap-2">
          {pub.publisher && <p className="text-sm text-muted-foreground">{pub.publisher}</p>}
          {pub.typeLabel && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {pub.typeLabel}
            </span>
          )}
        </div>

        {/* DOI */}
        {pub.doi && (
          <a
            href={`https://doi.org/${pub.doi}`}
            className="text-xs text-muted-foreground underline-offset-4 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            doi.org/{pub.doi}
          </a>
        )}

        {/* Contributors */}
        {pub.contributors && pub.contributors.length > 0 && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {pub.contributors.map((c, i) => (
              <span key={c.orcidId ?? c.name}>
                {i > 0 && ', '}
                {c.handle ? (
                  <a href={`/p/${c.handle}`} className="underline-offset-4 hover:underline">
                    {c.name}
                  </a>
                ) : (
                  c.name
                )}
              </span>
            ))}
          </p>
        )}

        {/* Hidden label + Edit on ORCID link (ORCID pubs) */}
        {isOwnProfile && isOrcid && (
          <div className="mt-1 flex items-center gap-2">
            {pub.hidden && <span className="text-xs text-muted-foreground">Hidden</span>}
            <a
              href="https://orcid.org/my-orcid"
              className="text-xs text-muted-foreground underline-offset-4 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Edit on ORCID
            </a>
          </div>
        )}

        {/* Hidden label (standard and sifa-native pubs) */}
        {isOwnProfile && !isOrcid && pub.hidden && (
          <p className="mt-1 text-xs text-muted-foreground">Hidden</p>
        )}
      </div>

      {/* Right side: date + hide toggle */}
      <div className="flex shrink-0 items-center gap-2">
        {pub.date && (
          <span className="text-xs text-muted-foreground">{formatTimelineDate(pub.date)}</span>
        )}
        {isOwnProfile && (!isOrcid || pub.orcidPutCode !== undefined) && (
          <button
            type="button"
            onClick={() => onToggleHide(pub, !!pub.hidden)}
            className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={pub.hidden ? 'Show publication' : 'Hide publication'}
          >
            {pub.hidden ? <Eye size={14} /> : <EyeSlash size={14} />}
          </button>
        )}
      </div>
    </div>
  );
}

function VerificationCheckmark({ verifiedVia }: { verifiedVia?: string }) {
  const t = useTranslations('sections');

  const methodKey =
    verifiedVia === 'orcid-researcher-url' ? 'verifiedViaOrcid' : 'verifiedViaRelMe';

  return (
    <Popover.Root>
      <Popover.Trigger
        className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors hover:opacity-80"
        aria-label={t('verificationMethods')}
      >
        <CheckCircle
          size={14}
          weight="fill"
          className="text-green-600 dark:text-green-400"
          aria-hidden="true"
        />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={8}>
          <Popover.Popup className="z-[60] w-64 rounded-lg border border-border bg-popover p-3 text-sm text-popover-foreground shadow-md">
            <Popover.Arrow className="fill-popover stroke-border" />
            <p className="mb-1 font-medium">{t('verificationMethods')}</p>
            <p className="text-xs text-muted-foreground">{t(methodKey)}</p>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
