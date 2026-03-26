import { useTranslations } from 'next-intl';

export function Methodology() {
  const t = useTranslations('stats');

  const sections = [
    { title: t('methodologyPlcTitle'), body: t('methodologyPlc') },
    { title: t('methodologyPdsTitle'), body: t('methodologyPds') },
    { title: t('methodologyReachableTitle'), body: t('methodologyReachable') },
    { title: t('methodologyCollectionTitle'), body: t('methodologyCollection') },
  ];

  return (
    <section className="mt-12">
      <h2 className="text-lg font-semibold text-foreground">{t('methodologyTitle')}</h2>
      <div className="mt-4 space-y-6">
        {sections.map((s) => (
          <div key={s.title}>
            <h3 className="text-sm font-medium text-foreground">{s.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
          </div>
        ))}
        <div>
          <h3 className="text-sm font-medium text-foreground">{t('methodologyComparisonTitle')}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('methodologyComparisonBefore')}
            <a
              href="https://bsky.jazco.dev/stats"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              Jaz&apos;s Bluesky statistics
            </a>
            {t('methodologyComparisonAfter')}
          </p>
        </div>
      </div>
    </section>
  );
}
