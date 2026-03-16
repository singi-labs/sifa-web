'use client';

import { useTranslations } from 'next-intl';
import { EditableSection, EditableEntry, CERTIFICATION_FIELDS } from '@/components/profile-editor';
import {
  certificationToValues,
  valuesToCertification,
} from '@/components/profile-editor/section-converters';
import { formatTimelineDate } from './timeline';
import { sortByDateDesc, certDateExtractor } from '@/lib/sort-by-date';
import type { ProfileCertification } from '@/lib/types';

interface CredentialsSectionProps {
  certifications: ProfileCertification[];
  isOwnProfile?: boolean;
}

export function CredentialsSection({ certifications, isOwnProfile }: CredentialsSectionProps) {
  const t = useTranslations('sections');

  if (!certifications.length && !isOwnProfile) return null;

  return (
    <section className="mt-8" aria-label={t('credentials')}>
      <h2 className="mb-4 text-xl font-semibold">{t('credentials')}</h2>
      <EditableSection<ProfileCertification>
        sectionTitle={t('credentials')}
        profileKey="certifications"
        isOwnProfile={isOwnProfile}
        fields={CERTIFICATION_FIELDS}
        toValues={certificationToValues}
        fromValues={
          valuesToCertification as (
            v: Record<string, string | boolean>,
          ) => Omit<ProfileCertification, 'rkey'>
        }
        collection="id.sifa.profile.certification"
        sortItems={(items) => sortByDateDesc(items, certDateExtractor)}
        renderEntry={(cert, controls) => (
          <EditableEntry
            key={cert.rkey}
            isOwnProfile={isOwnProfile}
            onEdit={controls?.onEdit ?? (() => {})}
            onDelete={controls?.onDelete ?? (() => {})}
            entryLabel={cert.name}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium">
                  {cert.credentialUrl ? (
                    <a
                      href={cert.credentialUrl}
                      className="underline-offset-4 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {cert.name}
                    </a>
                  ) : (
                    cert.name
                  )}
                </p>
                <p className="text-sm text-muted-foreground">{cert.issuingOrg}</p>
              </div>
              {cert.issueDate && (
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatTimelineDate(cert.issueDate)}
                </span>
              )}
            </div>
          </EditableEntry>
        )}
      />
    </section>
  );
}
