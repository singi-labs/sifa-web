import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchProfile } from '@/lib/api';
import { fetchEventInsights } from '@/lib/insights';
import { fetchEventAttendees } from '@/lib/event-attendees';
import { sanitize } from '@/lib/sanitize';
import { event, SPEAKER_TYPE_LABELS } from '@/data/events/atmosphereconf-2026';
import { InsightsNav } from '@/components/events/insights-nav';
import { type EventEntry, type FilterGroup } from './event-card-grid';
import { EventPageClient } from './event-page-client';

export const dynamic = 'force-static';
export const revalidate = 300;

export function generateStaticParams() {
  return [{ slug: event.slug }];
}

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  if (slug !== event.slug) return { title: 'Event Not Found' };

  const title = `${event.name} \u2014 Who's Going`;
  const description = `Professional identity cards for speakers and attendees at ${event.name}, the global AT Protocol community conference in ${event.location}.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://sifa.id/events/${event.slug}`,
    },
    openGraph: {
      title: `${title} | Sifa ID`,
      description,
      url: `https://sifa.id/events/${event.slug}`,
      siteName: 'Sifa ID',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Sifa ID`,
      description,
    },
  };
}

async function fetchProfileSafe(handle: string) {
  try {
    return await fetchProfile(handle);
  } catch {
    return null;
  }
}

async function fetchAllProfiles(handles: string[]) {
  const concurrency = 25;
  const results: Array<Awaited<ReturnType<typeof fetchProfile>>> = [];

  for (let i = 0; i < handles.length; i += concurrency) {
    const batch = handles.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(fetchProfileSafe));
    results.push(...batchResults);
  }

  return results;
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  if (slug !== event.slug) notFound();

  const speakerBadgeMap = new Map(
    event.speakers.map((s) => [s.handle, SPEAKER_TYPE_LABELS[s.speakerType]]),
  );
  const speakerTypeMap = new Map(
    event.speakers.map((s) => [s.handle, s.speakerType as FilterGroup]),
  );

  // Fetch RSVP attendee DIDs from sifa-api (sourced from Jetstream firehose)
  const attendeeDids = await fetchEventAttendees(slug);

  // Fetch speaker profiles (by handle) and attendee profiles (by DID) in parallel
  const [speakerProfiles, attendeeProfiles, insights] = await Promise.all([
    fetchAllProfiles(event.speakers.map((s) => s.handle)),
    fetchAllProfiles(attendeeDids),
    fetchEventInsights(slug),
  ]);

  // Build entries from speakers first, then attendees (deduped by handle)
  const entries: EventEntry[] = [];
  const seenHandles = new Set<string>();

  for (let i = 0; i < event.speakers.length; i++) {
    const speaker = event.speakers[i]!;
    const profile = speakerProfiles[i];
    if (!profile) continue;

    seenHandles.add(speaker.handle);
    entries.push({
      profile,
      badge: speakerBadgeMap.get(speaker.handle),
      isSpeaker: true,
      group: speakerTypeMap.get(speaker.handle) ?? 'presentation',
    });
  }

  for (const profile of attendeeProfiles) {
    if (!profile || seenHandles.has(profile.handle)) continue;
    seenHandles.add(profile.handle);
    entries.push({
      profile,
      badge: undefined,
      isSpeaker: false,
      group: 'attendee',
    });
  }

  const speakerCount = entries.filter((e) => e.isSpeaker).length;
  const attendeeCount = entries.length - speakerCount;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: sanitize(event.name),
    startDate: '2026-03-26',
    endDate: '2026-03-29',
    location: {
      '@type': 'Place',
      name: sanitize(event.location),
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Vancouver',
        addressRegion: 'BC',
        addressCountry: 'CA',
      },
    },
    url: event.url,
    description: `The global AT Protocol community conference. ${speakerCount} speakers, ${attendeeCount} attendees.`,
    organizer: {
      '@type': 'Organization',
      name: 'ATmosphereConf',
      url: event.url,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <InsightsNav slug={event.slug} activeTab="people" attendeeCount={entries.length} />

      <EventPageClient entries={entries} eventSlug={event.slug} />

      {insights && (
        <section
          aria-label="Attendee insights preview"
          className="mt-12 rounded-xl border border-border bg-secondary/30 p-6"
        >
          <h2 className="text-lg font-semibold">Explore who&apos;s attending {event.name}</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
            <div>
              <div className="text-2xl font-bold text-primary">
                {insights.summary.pdsProviderCount}
              </div>
              <div className="text-xs text-muted-foreground">PDS providers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {insights.pdsDistribution
                  .filter((p) => p.isSelfHosted)
                  .reduce((sum, p) => sum + p.count, 0)}
              </div>
              <div className="text-xs text-muted-foreground">Self-hosted PDSes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {insights.summary.connectedPercentage}%
              </div>
              <div className="text-xs text-muted-foreground">Mutual-connected</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {insights.connectionGraph.edges.length}
              </div>
              <div className="text-xs text-muted-foreground">Follow connections</div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <Link
              href={`/events/${event.slug}/insights`}
              className="text-sm font-medium text-primary hover:underline"
            >
              View full insights →
            </Link>
          </div>
        </section>
      )}

      {/* RSVP CTA */}
      <div className="mt-12 rounded-lg border border-border bg-muted/30 p-6 text-center">
        <h2 className="text-lg font-semibold">Going to {event.name}?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          RSVP on{' '}
          <a
            href={event.smokesignalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Smoke Signal
          </a>{' '}
          to appear on this page. The conference expects 300+ attendees &mdash; these are the ones
          who RSVPd on Smoke Signal.
        </p>
        <a
          href={event.smokesignalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-foreground"
        >
          <Image
            src="/assets/smoke-signal-logo.png"
            alt=""
            width={20}
            height={20}
            className="rounded-sm"
          />
          RSVP on Smoke Signal
        </a>
      </div>

      {/* Handshake promo */}
      <div className="mt-12 rounded-lg border border-primary/20 bg-primary/5 p-6 text-center">
        <h2 className="text-lg font-semibold">Meeting someone at {event.name}?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Use Handshake to record verified in-person meetings. Show your QR code, they scan it, and
          you&apos;re connected as an IRL meeting on both your profiles.
        </p>
        <Link
          href="/meet"
          className="mt-3 inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Open Meet page
        </Link>
      </div>

      {/* Footer CTAs */}
      <div className="mt-12 flex flex-col items-center gap-3 border-t border-border pt-8 text-center">
        <Link href="/login" className="text-sm font-medium text-primary hover:underline">
          Claim your profile on Sifa
        </Link>
        <Link
          href="/embed"
          className="text-sm text-muted-foreground hover:text-foreground hover:underline"
        >
          Embed your card on any website
        </Link>
      </div>
    </>
  );
}
