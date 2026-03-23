import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { event } from '@/data/events/atmosphereconf-2026';
import { fetchEventInsights } from '@/lib/insights';
import { InsightsNav } from '@/components/events/insights-nav';
import { InsightSection } from '@/components/events/insight-section';
import { MethodologyDisclosure } from '@/components/events/methodology-disclosure';
import { DonutChart } from '@/components/charts/DonutChart';
import { HorizontalBarChart } from '@/components/charts/HorizontalBarChart';
import { AreaTimeline } from '@/components/charts/AreaTimeline';
import { TreemapChart } from '@/components/charts/TreemapChart';
import { NetworkGraph } from '@/components/charts/NetworkGraph';
import { DataTable } from '@/components/charts/DataTable';

export const dynamic = 'force-static';
export const revalidate = 3600;

export function generateStaticParams() {
  return [{ slug: event.slug }];
}

interface InsightsPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: InsightsPageProps): Promise<Metadata> {
  const { slug } = await params;
  if (slug !== event.slug) return { title: 'Not Found' };

  return {
    title: `${event.name} Attendee Insights | Sifa ID`,
    description: `Data insights about ${event.name} attendees: PDS distribution, network connections, post activity, and more. All from public AT Protocol data.`,
    alternates: { canonical: `https://sifa.id/events/${event.slug}/insights` },
    openGraph: {
      title: `${event.name} Attendee Insights | Sifa ID`,
      description: `Data insights about ${event.name} attendees from public AT Protocol data.`,
      url: `https://sifa.id/events/${event.slug}/insights`,
      siteName: 'Sifa ID',
      type: 'website',
    },
  };
}

export default async function InsightsPage({ params }: InsightsPageProps) {
  const { slug } = await params;
  if (slug !== event.slug) notFound();

  const insights = await fetchEventInsights(slug);

  return (
    <>
      <InsightsNav slug={slug} activeTab="insights" />

      {insights && (
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard value={insights.summary.attendeesTracked} label="Attendees tracked" />
          <StatCard value={insights.summary.pdsProviderCount} label="PDS providers" />
          <StatCard value={insights.summary.totalPosts} label="Posts during event" />
          <StatCard value={`${insights.summary.connectedPercentage}%`} label="Connected to 1+" />
        </div>
      )}

      <div className="mb-8">
        <MethodologyDisclosure />
      </div>

      {!insights ? (
        <div className="rounded-xl border border-border bg-secondary/30 p-8 text-center">
          <h2 className="text-lg font-semibold">Insights coming soon</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Data is being collected. Insights will appear here once the first hourly collection
            completes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <InsightSection
            id="pds-distribution"
            title="PDS Distribution"
            subtitle="Which PDS providers attendees use"
            summary={`Of ${insights.attendeeCount} attendees, ${insights.pdsDistribution.find((p) => p.host === 'bluesky')?.count ?? 0} use Bluesky's hosted PDS.`}
          >
            <HorizontalBarChart
              data={insights.pdsDistribution.map((p) => ({ name: p.host, value: p.count }))}
              maxItems={12}
            />
            <DataTable
              columns={[
                { key: 'name', label: 'Provider' },
                { key: 'value', label: 'Count' },
              ]}
              rows={insights.pdsDistribution.map((p) => ({ name: p.host, value: p.count }))}
            />
          </InsightSection>

          <InsightSection
            id="account-age"
            title="Account Age"
            subtitle="When attendees created their AT Protocol accounts"
          >
            <HorizontalBarChart
              data={insights.accountAgeDistribution.map((b) => ({ name: b.label, value: b.count }))}
            />
            <DataTable
              columns={[
                { key: 'name', label: 'Quarter' },
                { key: 'value', label: 'Count' },
              ]}
              rows={insights.accountAgeDistribution.map((b) => ({ name: b.label, value: b.count }))}
            />
          </InsightSection>

          <InsightSection
            id="did-method"
            title="DID Method"
            subtitle="did:plc vs did:web adoption"
            summary={`${insights.didMethodSplit.find((d) => d.method === 'did:web')?.count ?? 0} of ${insights.attendeeCount} attendees use did:web.`}
          >
            <DonutChart
              data={insights.didMethodSplit.map((d) => ({ name: d.method, value: d.count }))}
            />
            <DataTable
              columns={[
                { key: 'name', label: 'Method' },
                { key: 'value', label: 'Count' },
              ]}
              rows={insights.didMethodSplit.map((d) => ({ name: d.method, value: d.count }))}
            />
          </InsightSection>

          <InsightSection
            id="ecosystem-roles"
            title="ATProto Ecosystem Roles"
            subtitle="Feed generators, labelers, and more among attendees"
          >
            <HorizontalBarChart
              data={insights.ecosystemRoles.map((r) => ({ name: r.role, value: r.count }))}
            />
            <DataTable
              columns={[
                { key: 'name', label: 'Role' },
                { key: 'value', label: 'Count' },
              ]}
              rows={insights.ecosystemRoles.map((r) => ({ name: r.role, value: r.count }))}
            />
          </InsightSection>

          <InsightSection
            id="connection-graph"
            title="Attendee Connection Graph"
            subtitle="Follow relationships between attendees on AT Protocol"
            summary={`${insights.summary.connectedPercentage}% of attendees follow at least one other attendee.`}
            className="lg:col-span-2"
          >
            <NetworkGraph
              nodes={insights.connectionGraph.nodes}
              edges={insights.connectionGraph.edges}
            />
            <DataTable
              columns={[
                { key: 'handle', label: 'Handle' },
                { key: 'displayName', label: 'Name' },
                { key: 'degree', label: 'Connections' },
              ]}
              rows={insights.connectionGraph.nodes
                .sort((a, b) => b.degree - a.degree)
                .map((n) => ({ handle: n.handle, displayName: n.displayName, degree: n.degree }))}
            />
          </InsightSection>

          {insights.postTimeline.length > 0 && (
            <>
              <InsightSection
                id="post-timeline"
                title="Post Activity"
                subtitle="Posts from attendees during the conference"
                className="lg:col-span-2"
              >
                <AreaTimeline data={insights.postTimeline} />
              </InsightSection>

              {insights.clientDiversity.length > 0 && (
                <InsightSection
                  id="client-diversity"
                  title="Post Client Diversity"
                  subtitle="Which apps attendees post from"
                  className="lg:col-span-2"
                >
                  <TreemapChart
                    data={insights.clientDiversity.map((c) => ({ name: c.client, value: c.count }))}
                  />
                  <DataTable
                    columns={[
                      { key: 'name', label: 'Client' },
                      { key: 'value', label: 'Posts' },
                    ]}
                    rows={insights.clientDiversity.map((c) => ({ name: c.client, value: c.count }))}
                  />
                </InsightSection>
              )}
            </>
          )}

          {insights.postTimeline.length === 0 && (
            <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground lg:col-span-2">
              Post activity will appear here from March 26. The chart shows posts from
              ATmosphereConf attendees during the conference window.
            </div>
          )}
        </div>
      )}

      <div className="mt-12 rounded-xl border border-border bg-secondary/30 p-6 text-center">
        <h2 className="text-lg font-semibold">Your profile is in this dataset</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          If you&apos;re attending {event.name}, your public AT Protocol profile is already included
          in the analysis above. Claim your Sifa profile to show a richer identity card on the
          People page.
        </p>
        <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Sign in with your AT Protocol handle
          </Link>
          <Link
            href="/about"
            className="text-sm text-muted-foreground hover:text-foreground hover:underline"
          >
            Learn how Sifa works
          </Link>
        </div>
      </div>

      <div className="mt-8 border-t border-border pt-4 text-xs text-muted-foreground/80">
        <p>
          Data from public{' '}
          <a
            href="https://atproto.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-muted-foreground"
          >
            AT Protocol
          </a>{' '}
          records. Last updated:{' '}
          {insights
            ? new Date(insights.generatedAt).toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short',
                timeZone: 'UTC',
              })
            : 'pending'}{' '}
          UTC.
        </p>
      </div>
    </>
  );
}

function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/50 p-4 text-center">
      <div className="text-3xl font-bold tracking-tight text-primary">{value}</div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
