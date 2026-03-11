'use client';

import { useTranslations } from 'next-intl';
import { EditableSection, EditableEntry, LANGUAGE_FIELDS } from '@/components/profile-editor';
import { languageToValues, valuesToLanguage } from '@/components/profile-editor/section-converters';
import type { ProfileLanguage } from '@/lib/types';

const PROFICIENCY_LABELS: Record<string, string> = {
  elementary: 'Elementary',
  limited_working: 'Limited working',
  professional_working: 'Professional working',
  full_professional: 'Full professional',
  native: 'Native or bilingual',
};

interface LanguagesSectionProps {
  languages: ProfileLanguage[];
  isOwnProfile?: boolean;
}

export function LanguagesSection({ languages, isOwnProfile }: LanguagesSectionProps) {
  const t = useTranslations('sections');

  if (!languages.length && !isOwnProfile) return null;

  return (
    <section className="mt-8" aria-label={t('languages')}>
      <h2 className="mb-4 text-xl font-semibold">{t('languages')}</h2>
      <EditableSection<ProfileLanguage>
        sectionTitle={t('languages')}
        profileKey="languages"
        isOwnProfile={isOwnProfile}
        fields={LANGUAGE_FIELDS}
        toValues={languageToValues}
        fromValues={
          valuesToLanguage as (v: Record<string, string | boolean>) => Omit<ProfileLanguage, 'rkey'>
        }
        collection="id.sifa.profile.language"
        renderEntry={(lang, controls) => (
          <EditableEntry
            key={lang.rkey}
            isOwnProfile={isOwnProfile}
            onEdit={controls?.onEdit ?? (() => {})}
            onDelete={controls?.onDelete ?? (() => {})}
            entryLabel={lang.language}
          >
            <div className="flex items-baseline gap-1.5">
              <span className="font-medium">{lang.language}</span>
              {lang.proficiency && (
                <span className="text-xs text-muted-foreground">
                  ({PROFICIENCY_LABELS[lang.proficiency] ?? lang.proficiency})
                </span>
              )}
            </div>
          </EditableEntry>
        )}
      />
    </section>
  );
}
