import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchProfile } from '@/lib/api';
import { fetchSmokeSignalAttendees } from '@/lib/smoke-signal';
import { sanitize } from '@/lib/sanitize';
import { event, SPEAKER_TYPE_LABELS } from '@/data/events/atmosphereconf-2026';
import type { ProfilePosition } from '@/lib/types';
import { EventCardGrid, type EventEntry, type FilterGroup } from './event-card-grid';

export const revalidate = 3600;

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
      title: `${title} | Sifa`,
      description,
      url: `https://sifa.id/events/${event.slug}`,
      siteName: 'Sifa',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Sifa`,
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
  const concurrency = 10;
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

  const speakerHandles = new Set(event.speakers.map((s) => s.handle));
  const speakerBadgeMap = new Map(
    event.speakers.map((s) => [s.handle, SPEAKER_TYPE_LABELS[s.speakerType]]),
  );
  const speakerTypeMap = new Map(
    event.speakers.map((s) => [s.handle, s.speakerType as FilterGroup]),
  );

  const attendeeHandles = await fetchSmokeSignalAttendees(event.smokesignalUrl);

  // Deduplicate: merge speakers and attendees, speakers take priority
  const allHandles = Array.from(
    new Set([...event.speakers.map((s) => s.handle), ...attendeeHandles]),
  );

  const profiles = await fetchAllProfiles(allHandles);

  const entries: EventEntry[] = [];
  for (let i = 0; i < allHandles.length; i++) {
    const handle = allHandles[i]!;
    const profile = profiles[i];
    if (!profile) continue;

    const isSpeaker = speakerHandles.has(handle);

    entries.push({
      profile,
      badge: speakerBadgeMap.get(handle),
      isSpeaker,
      group: isSpeaker ? (speakerTypeMap.get(handle) ?? 'presentation') : 'attendee',
    });
  }

  // Sort: speakers first (alphabetical), then attendees (alphabetical)
  entries.sort((a, b) => {
    if (a.isSpeaker && !b.isSpeaker) return -1;
    if (!a.isSpeaker && b.isSpeaker) return 1;
    const nameA = (a.profile.displayName ?? a.profile.handle).toLowerCase();
    const nameB = (b.profile.displayName ?? b.profile.handle).toLowerCase();
    return nameA.localeCompare(nameB);
  });

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
    <main className="mx-auto max-w-6xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">{event.name}</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {event.dates} &middot; {event.location}
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Professional identity cards for speakers and{' '}
          <a
            href={event.smokesignalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Smoke Signal RSVPs
          </a>{' '}
          at{' '}
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-foreground"
          >
            {event.name}
          </a>
          , powered by open AT Protocol data.
        </p>
        <div className="mt-4">
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Claim your profile
          </Link>
        </div>
      </div>

      <EventCardGrid entries={entries} speakerCount={speakerCount} attendeeCount={attendeeCount} />

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
          className="mt-3 inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-foreground"
        >
          RSVP on Smoke Signal
        </a>
      </div>

      {/* Side events */}
      {event.sideEvents.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold">Side Events</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {event.sideEvents.map((sideEvent) => (
              <Link
                key={sideEvent.slug}
                href={`/events/${event.slug}/${sideEvent.slug}`}
                className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
              >
                <h3 className="font-semibold">{sideEvent.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{sideEvent.dates}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

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
    </main>
  );
}
