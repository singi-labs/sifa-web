import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchProfile } from '@/lib/api';
import { fetchSmokeSignalAttendees } from '@/lib/smoke-signal';
import { sanitize } from '@/lib/sanitize';
import { IdentityCard } from '@/components/identity-card';
import { event, SPEAKER_TYPE_LABELS } from '@/data/events/atmosphereconf-2026';
import type { LocationValue, ProfilePosition } from '@/lib/types';

export const revalidate = 3600;

interface SideEventPageProps {
  params: Promise<{ slug: string; subSlug: string }>;
}

export async function generateMetadata({ params }: SideEventPageProps): Promise<Metadata> {
  const { slug, subSlug } = await params;
  if (slug !== event.slug) return { title: 'Event Not Found' };

  const sideEvent = event.sideEvents.find((se) => se.slug === subSlug);
  if (!sideEvent) return { title: 'Event Not Found' };

  const title = `${sideEvent.name} \u2014 Who's Going`;
  const description = `Professional identity cards for attendees at ${sideEvent.name}, a side event of ${event.name}.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://sifa.id/events/${event.slug}/${sideEvent.slug}`,
    },
    openGraph: {
      title: `${title} | Sifa`,
      description,
      url: `https://sifa.id/events/${event.slug}/${sideEvent.slug}`,
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

export default async function SideEventPage({ params }: SideEventPageProps) {
  const { slug, subSlug } = await params;
  if (slug !== event.slug) notFound();

  const sideEvent = event.sideEvents.find((se) => se.slug === subSlug);
  if (!sideEvent) notFound();

  const speakerHandles = new Set(sideEvent.speakers.map((s) => s.handle));
  const speakerBadgeMap = new Map(
    sideEvent.speakers.map((s) => [s.handle, SPEAKER_TYPE_LABELS[s.speakerType]]),
  );

  const attendeeHandles = sideEvent.smokesignalUrl
    ? await fetchSmokeSignalAttendees(sideEvent.smokesignalUrl)
    : [];

  const allHandles = Array.from(
    new Set([...sideEvent.speakers.map((s) => s.handle), ...attendeeHandles]),
  );

  const profiles = await fetchAllProfiles(allHandles);

  type ProfileEntry = {
    profile: NonNullable<Awaited<ReturnType<typeof fetchProfile>>>;
    badge?: string;
    isSpeaker: boolean;
  };

  const entries: ProfileEntry[] = [];
  for (let i = 0; i < allHandles.length; i++) {
    const handle = allHandles[i]!;
    const profile = profiles[i];
    if (!profile) continue;

    entries.push({
      profile,
      badge: speakerBadgeMap.get(handle),
      isSpeaker: speakerHandles.has(handle),
    });
  }

  entries.sort((a, b) => {
    if (a.isSpeaker && !b.isSpeaker) return -1;
    if (!a.isSpeaker && b.isSpeaker) return 1;
    const nameA = (a.profile.displayName ?? a.profile.handle).toLowerCase();
    const nameB = (b.profile.displayName ?? b.profile.handle).toLowerCase();
    return nameA.localeCompare(nameB);
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: sanitize(sideEvent.name),
    startDate: sideEvent.dates,
    location: {
      '@type': 'Place',
      name: sanitize(event.location),
    },
    url: `https://sifa.id/events/${event.slug}/${sideEvent.slug}`,
    superEvent: {
      '@type': 'Event',
      name: sanitize(event.name),
      url: event.url,
    },
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href={`/events/${event.slug}`} className="hover:text-foreground hover:underline">
          {event.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{sideEvent.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">{sideEvent.name}</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {sideEvent.dates} &middot; {event.location}
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          A side event of{' '}
          <Link
            href={`/events/${event.slug}`}
            className="underline underline-offset-4 hover:text-foreground"
          >
            {event.name}
          </Link>
        </p>
      </div>

      {entries.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          No attendees yet. Check back closer to the event.
        </p>
      ) : (
        <>
          {/* Stats */}
          <div className="mb-6 flex justify-center gap-6 text-sm text-muted-foreground">
            <span>
              <strong className="text-foreground">{entries.length}</strong> participants
            </span>
          </div>

          {/* Card grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {entries.map(({ profile, badge }) => {
              const location: LocationValue | null = profile.locationCountry
                ? {
                    country: profile.locationCountry,
                    countryCode: profile.countryCode ?? undefined,
                    region: profile.locationRegion ?? undefined,
                    city: profile.locationCity ?? undefined,
                  }
                : null;

              const currentPosition = (profile.positions as ProfilePosition[] | undefined)?.find(
                (p: ProfilePosition) => p.current,
              );

              return (
                <Link
                  key={profile.handle}
                  href={`/p/${profile.handle}`}
                  className="transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <IdentityCard
                    did={profile.did}
                    handle={profile.handle}
                    displayName={profile.displayName}
                    avatar={profile.avatar}
                    headline={profile.headline}
                    about={profile.about}
                    currentRole={currentPosition?.title}
                    currentCompany={currentPosition?.companyName}
                    location={location}
                    website={profile.website}
                    openTo={profile.openTo}
                    followersCount={profile.followersCount}
                    trustStats={profile.trustStats}
                    verifiedAccounts={profile.verifiedAccounts}
                    activeApps={profile.activeApps}
                    claimed={profile.claimed}
                    variant="embed"
                    badge={badge}
                    hideFooter
                  />
                </Link>
              );
            })}
          </div>
        </>
      )}

      {/* RSVP CTA */}
      {sideEvent.smokesignalUrl && (
        <div className="mt-12 rounded-lg border border-border bg-muted/30 p-6 text-center">
          <h2 className="text-lg font-semibold">Going to {sideEvent.name}?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            RSVP on Smoke Signal to appear on this page.
          </p>
          <a
            href={sideEvent.smokesignalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-foreground"
          >
            RSVP on Smoke Signal
          </a>
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
