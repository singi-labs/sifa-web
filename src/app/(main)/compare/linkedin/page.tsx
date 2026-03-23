import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { CheckCircle } from '@phosphor-icons/react/dist/ssr';

export const metadata: Metadata = {
  title: 'LinkedIn alternative with data ownership',
  description:
    'LinkedIn owns your career data. Sifa stores it in your own account, portable and yours to keep. No ads, no lock-in. See the full comparison.',
};

const TABLE_ROWS = [
  'data',
  'portability',
  'signIn',
  'algorithm',
  'privacy',
  'jurisdiction',
  'endorsements',
  'profileViews',
  'cost',
  'sourceCode',
  'crossApp',
  'networkSize',
  'jobBoard',
  'companyPages',
] as const;

const SIFA_WINS = new Set([
  'data',
  'portability',
  'signIn',
  'algorithm',
  'privacy',
  'jurisdiction',
  'endorsements',
  'profileViews',
  'cost',
  'sourceCode',
  'crossApp',
]);

const LINKEDIN_WINS = new Set(['networkSize', 'jobBoard', 'companyPages']);

const WHEN_LINKEDIN_KEYS = ['recruiting', 'industry', 'companyPages', 'network'] as const;

const FAQ_KEYS = ['import', 'both', 'free', 'pds', 'stored', 'usLaw', 'jobBoard'] as const;

const DIFF_KEYS = [
  { titleKey: 'diffProfileTitle', bodyKey: 'diffProfile' },
  { titleKey: 'diffEndorsementsTitle', bodyKey: 'diffEndorsements' },
  { titleKey: 'diffEuropeTitle', bodyKey: 'diffEurope' },
  { titleKey: 'diffPaywallsTitle', bodyKey: 'diffPaywalls' },
] as const;

export default async function CompareLinkedInPage() {
  const t = await getTranslations('compareLinkedin');

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_KEYS.map((key) => ({
      '@type': 'Question',
      name: t(`faq.${key}Q`),
      acceptedAnswer: {
        '@type': 'Answer',
        text: t(`faq.${key}A`),
      },
    })),
  };

  const linkClass = 'font-medium text-foreground underline-offset-4 hover:underline';

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="mx-auto max-w-3xl px-4 py-12">
        {/* Hero */}
        <p className="text-sm font-medium text-muted-foreground">{t('kicker')}</p>
        <h1 className="mt-2 text-3xl font-bold">{t('title')}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{t('subhead')}</p>
        <div className="mt-6">
          <Link
            href="/import"
            className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {t('heroCta')}
          </Link>
        </div>

        {/* Comparison table */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold">{t('tableCaption')}</h2>
          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="hidden sm:table-header-group">
                <tr className="border-b border-border bg-muted/40">
                  <th scope="col" className="px-4 py-3 text-left font-medium">
                    &nbsp;
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-medium">
                    {t('colLinkedin')}
                  </th>
                  <th scope="col" className="bg-primary/5 px-4 py-3 text-left font-medium">
                    {t('colSifa')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {TABLE_ROWS.map((key) => (
                  <tr
                    key={key}
                    className="flex flex-col border-b border-border last:border-0 sm:table-row"
                  >
                    <th
                      scope="row"
                      className="block px-4 pt-3 pb-1 text-left font-semibold sm:table-cell sm:w-36 sm:py-3 sm:pb-3 sm:align-top sm:font-medium"
                    >
                      {t(`table.${key}.label`)}
                    </th>
                    <td
                      className={`block px-4 pb-1 before:mb-1 before:block before:text-xs before:font-semibold before:text-foreground before:content-[attr(data-label)] sm:table-cell sm:py-3 sm:align-top sm:before:hidden ${LINKEDIN_WINS.has(key) ? 'text-foreground' : 'text-muted-foreground'}`}
                      data-label={t('colLinkedin')}
                    >
                      <span className="flex items-start gap-2">
                        {LINKEDIN_WINS.has(key) && (
                          <CheckCircle
                            size={18}
                            weight="fill"
                            className="mt-0.5 shrink-0 text-green-600 dark:text-green-400"
                            aria-hidden="true"
                          />
                        )}
                        <span>{t(`table.${key}.linkedin`)}</span>
                      </span>
                    </td>
                    <td
                      className={`block bg-primary/5 px-4 pb-3 before:mb-1 before:block before:text-xs before:font-semibold before:text-foreground before:content-[attr(data-label)] sm:table-cell sm:py-3 sm:align-top sm:before:hidden ${SIFA_WINS.has(key) ? 'text-foreground' : 'text-muted-foreground'}`}
                      data-label={t('colSifa')}
                    >
                      <span className="flex items-start gap-2">
                        {SIFA_WINS.has(key) && (
                          <CheckCircle
                            size={18}
                            weight="fill"
                            className="mt-0.5 shrink-0 text-green-600 dark:text-green-400"
                            aria-hidden="true"
                          />
                        )}
                        <span>{t(`table.${key}.sifa`)}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Honest acknowledgment */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold">{t('acknowledgmentTitle')}</h2>
          <p className="mt-2 text-muted-foreground">
            {t.rich('acknowledgment', {
              roadmapLink: (chunks) => (
                <Link href="/roadmap" className={linkClass}>
                  {chunks}
                </Link>
              ),
            })}
          </p>

          <h3 className="mt-6 text-lg font-semibold">{t('whenLinkedinTitle')}</h3>
          <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
            {WHEN_LINKEDIN_KEYS.map((key) => (
              <li key={key}>{t(`whenLinkedin.${key}`)}</li>
            ))}
          </ul>
        </section>

        {/* Key differentiators */}
        <section className="mt-12 space-y-6">
          {DIFF_KEYS.map(({ titleKey, bodyKey }) => (
            <div key={titleKey} className="rounded-lg border border-border px-5 py-4">
              <h2 className="text-lg font-semibold">{t(titleKey)}</h2>
              <p className="mt-2 text-muted-foreground">{t(bodyKey)}</p>
            </div>
          ))}
        </section>

        {/* FAQ */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold">{t('faqTitle')}</h2>
          <dl className="mt-4 divide-y divide-border">
            {FAQ_KEYS.map((key) => (
              <div key={key} className="py-4">
                <dt className="font-medium text-foreground">{t(`faq.${key}Q`)}</dt>
                <dd className="mt-1 text-muted-foreground">
                  {t.rich(`faq.${key}A`, {
                    roadmapLink: (chunks) => (
                      <Link href="/roadmap" className={linkClass}>
                        {chunks}
                      </Link>
                    ),
                  })}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* CTA */}
        <section className="mt-12 rounded-lg border border-border bg-muted/40 px-6 py-8 text-center">
          <h2 className="text-xl font-semibold">{t('ctaTitle')}</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/login"
              className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {t('ctaPrimary')}
            </Link>
            <Link
              href="/import"
              className="rounded-md border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-accent"
            >
              {t('ctaSecondary')}
            </Link>
            <Link
              href="/roadmap"
              className="rounded-md border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-accent"
            >
              {t('ctaTertiary')}
            </Link>
          </div>
        </section>

        {/* Last updated */}
        <p className="mt-8 text-xs text-muted-foreground">{t('lastUpdated')}</p>
      </div>
    </>
  );
}
