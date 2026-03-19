import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { CheckCircle, Circle, ArrowRight } from '@phosphor-icons/react/dist/ssr';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Roadmap',
};

type RoadmapItem = {
  key: string;
  done: boolean;
};

const roadmapItems: RoadmapItem[] = [
  { key: 'profilePage', done: true },
  { key: 'linkedinImport', done: true },
  { key: 'profileEditing', done: true },
  { key: 'searchFindPeople', done: true },
  { key: 'profileEmbeds', done: true },
  { key: 'endorsements', done: true },
  { key: 'profileEnhancements', done: false },
  { key: 'atmosphereStream', done: false },
  { key: 'endorsementsAttestations', done: false },
  { key: 'activityIntegration', done: false },
  { key: 'verifiedConnections', done: false },
  { key: 'notifications', done: false },
  { key: 'profileAnalytics', done: false },
  { key: 'jobProfiles', done: false },
  { key: 'eventRsvp', done: false },
  { key: 'companyPages', done: false },
  { key: 'advancedSearch', done: false },
  { key: 'multiAccountLinking', done: false },
];

export default async function RoadmapPage() {
  const t = await getTranslations('roadmap');

  const linkClass = 'font-medium text-foreground underline-offset-4 hover:underline';

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <p className="mt-2 text-muted-foreground">{t('subtitle')}</p>

      <div className="mt-8 space-y-3">
        {roadmapItems.map((item) => (
          <div
            key={item.key}
            className="flex items-start gap-3 rounded-md border border-border px-4 py-3"
          >
            {item.done ? (
              <CheckCircle
                size={22}
                weight="fill"
                className="mt-0.5 shrink-0 text-green-600 dark:text-green-400"
                aria-hidden="true"
              />
            ) : (
              <Circle
                size={22}
                className="mt-0.5 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
            )}
            <div>
              <p
                className={
                  item.done ? 'font-medium text-muted-foreground' : 'font-medium text-foreground'
                }
              >
                {t(`items.${item.key}`)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-md border border-border bg-muted/40 px-4 py-3">
        <p className="text-sm text-muted-foreground">{t('disclaimer')}</p>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">{t('contributeTitle')}</h2>
        <p className="mt-2 text-muted-foreground">{t('contributeBody')}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="https://github.com/singi-labs/sifa-web/issues/new?labels=enhancement&title=Idea%3A+"
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('suggestIdea')}
            <ArrowRight size={16} aria-hidden="true" />
          </a>
          <a
            href="https://github.com/singi-labs/sifa-web/issues/new?labels=bug&title=Bug%3A+"
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('reportBug')}
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {t('prWelcome')}{' '}
          <a
            href="https://github.com/singi-labs"
            className={linkClass}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('viewOnGithub')}
          </a>
        </p>
      </section>
    </div>
  );
}
