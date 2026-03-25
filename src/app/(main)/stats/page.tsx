import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { HeadlineCards } from '@/components/stats/headline-cards';
import { CumulativeChart } from '@/components/stats/cumulative-chart';
import { DailyChart } from '@/components/stats/daily-chart';
import { PdsTable } from '@/components/stats/pds-table';
import { Methodology } from '@/components/stats/methodology';

export const metadata: Metadata = {
  title: 'AT Protocol Network Statistics | Sifa',
  description:
    'Live statistics from the AT Protocol PLC directory. Track identity growth, PDS providers, and network reachability.',
  openGraph: {
    title: 'AT Protocol Network Statistics',
    description:
      'Track AT Protocol identity growth, PDS providers, and network reachability from the PLC directory.',
  },
};

async function loadStats() {
  try {
    const raw = await readFile(join(process.cwd(), 'public', 'data', 'plc-stats.json'), 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default async function StatsPage() {
  const t = await getTranslations('stats');
  const stats = await loadStats();

  if (!stats) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="mt-4 text-muted-foreground">Stats data is not available yet.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <p className="mt-2 text-muted-foreground">{t('subtitle')}</p>

      <div className="mt-8">
        <HeadlineCards
          totalDids={stats.summary.totalDids}
          reachableDids={stats.summary.reachableDids}
          totalPdsHosts={stats.summary.totalPdsHosts}
          dataThrough={stats.summary.dataThrough}
        />
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-foreground">{t('cumulativeTitle')}</h2>
        <CumulativeChart data={stats.monthly} groups={stats.groups} className="mt-4" />
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-foreground">{t('dailyTitle')}</h2>
        <DailyChart data={stats.daily} groups={stats.groups} className="mt-4" />
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-foreground">{t('pdsTableTitle')}</h2>
        <div className="mt-4">
          <PdsTable data={stats.pdsTable} />
        </div>
      </section>

      <Methodology />
    </div>
  );
}
