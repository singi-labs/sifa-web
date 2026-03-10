'use client';

import { useTranslations } from 'next-intl';
import type { ProfileCertification } from '@/lib/types';

interface CredentialsSectionProps {
  certifications: ProfileCertification[];
}

export function CredentialsSection({ certifications }: CredentialsSectionProps) {
  const t = useTranslations('sections');

  if (!certifications.length) return null;

  return (
    <section className="mt-8" aria-label={t('credentials')}>
      <h2 className="mb-4 text-xl font-semibold">{t('credentials')}</h2>
      <div className="space-y-3">
        {certifications.map((cert) => (
          <div key={cert.rkey} className="flex items-start justify-between gap-2">
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
              <span className="shrink-0 text-xs text-muted-foreground">{cert.issueDate}</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
