import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { event } from '@/data/events/atmosphereconf-2026';

interface EventLayoutProps {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function EventLayout({ children, params }: EventLayoutProps) {
  const { slug } = await params;
  if (slug !== event.slug) notFound();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {/* Event header */}
      <div className="mb-6 text-center">
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

      {children}
    </main>
  );
}
