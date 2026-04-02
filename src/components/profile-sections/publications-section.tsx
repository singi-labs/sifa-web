'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle, Eye, EyeSlash, ArrowsClockwise } from '@phosphor-icons/react';
import { Popover } from '@base-ui/react/popover';
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
  refreshOrcidPublications,
} from '@/lib/profile-api';
import type { ProfilePublication } from '@/lib/types';

interface PublicationsSectionProps {
  publications: ProfilePublication[];
  isOwnProfile?: boolean;
  hasVerifiedOrcid?: boolean;
}

export function PublicationsSection({
  publications,
  isOwnProfile,
  hasVerifiedOrcid,
}: PublicationsSectionProps) {
  const t = useTranslations('sections');
  const [refreshing, setRefreshing] = useState(false);
  const [localPubs, setLocalPubs] = useState(publications);

  // Separate Sifa-editable publications from external sources
  const sifaPubs = localPubs.filter((p) => !p.source || p.source === 'sifa');
  const externalPubs = localPubs.filter((p) => p.source === 'orcid' || p.source === 'standard');

  // For the display list, merge and sort all together
  const allPubs = [...localPubs].sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    return dateB - dateA;
  });

  if (!allPubs.length && !isOwnProfile) return null;

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await refreshOrcidPublications();
      // Reload page to get fresh data
      window.location.reload();
    } finally {
      setRefreshing(false);
    }
  }

  async function handleToggleHide(putCode: number, currentlyHidden: boolean) {
    if (currentlyHidden) {
      await unhideOrcidPublication(putCode);
    } else {
      await hideOrcidPublication(putCode);
    }
    // Update local state
    setLocalPubs((prev) =>
      prev.map((p) => (p.orcidPutCode === putCode ? { ...p, hidden: !currentlyHidden } : p)),
    );
  }

  return (
    <section className="mt-8" aria-label={t('publications')}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {t('publications')}
          {allPubs.length > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {allPubs.filter((p) => !p.hidden).length}
            </span>
          )}
        </h2>
        {isOwnProfile && hasVerifiedOrcid && (
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

      {/* Sifa-native publications: editable */}
      <EditableSection<ProfilePublication>
        maxVisible={sifaPubs.length + externalPubs.length > 20 ? 5 : undefined}
        sectionTitle={t('publications')}
        profileKey="publications"
        isOwnProfile={isOwnProfile}
        fields={PUBLICATION_FIELDS}
        toValues={publicationToValues}
        fromValues={
          valuesToPublication as (
            v: Record<string, string | boolean>,
          ) => Omit<ProfilePublication, 'rkey'>
        }
        collection="id.sifa.profile.publication"
        sortItems={(items) => sortByDateDesc(items, singleDateExtractor)}
        renderEntry={(pub, controls) => (
          <EditableEntry
            key={pub.rkey ?? `sifa-${pub.title}`}
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
        )}
      />

      {/* ORCID + Standard publications: read-only */}
      {externalPubs.length > 0 && (
        <div className="mt-2 space-y-3">
          {externalPubs
            .filter((p) => isOwnProfile || !p.hidden)
            .map((pub) => (
              <div
                key={pub.orcidPutCode ?? `ext-${pub.title}`}
                className={pub.hidden ? 'opacity-50' : ''}
              >
                <PublicationCard
                  pub={pub}
                  isOwnProfile={isOwnProfile}
                  onToggleHide={handleToggleHide}
                />
              </div>
            ))}
        </div>
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
  onToggleHide: (putCode: number, hidden: boolean) => void;
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

        {/* Hidden label + Edit on ORCID link */}
        {isOwnProfile && isOrcid && (
          <div className="mt-1 flex items-center gap-2">
            {pub.hidden && <span className="text-xs text-muted-foreground">Hidden</span>}
            <a
              href={`https://orcid.org/my-orcid`}
              className="text-xs text-muted-foreground underline-offset-4 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Edit on ORCID
            </a>
          </div>
        )}
      </div>

      {/* Right side: date + hide toggle */}
      <div className="flex shrink-0 items-center gap-2">
        {pub.date && (
          <span className="text-xs text-muted-foreground">{formatTimelineDate(pub.date)}</span>
        )}
        {isOwnProfile && isOrcid && pub.orcidPutCode !== undefined && (
          <button
            type="button"
            onClick={() => onToggleHide(pub.orcidPutCode ?? 0, !!pub.hidden)}
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
