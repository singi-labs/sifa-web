import type { Metadata } from 'next';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Expert Directory',
  description: 'Find professionals and experts across industries and skills on Sifa.',
};

const BEACHHEAD_TOPICS = [
  { slug: 'atproto', label: 'AT Protocol', description: 'Developers building on the AT Protocol' },
  {
    slug: 'devrel',
    label: 'Developer Relations',
    description: 'DevRel professionals and advocates',
  },
  {
    slug: 'open-source',
    label: 'Open Source',
    description: 'Open source contributors and maintainers',
  },
  { slug: 'typescript', label: 'TypeScript', description: 'TypeScript developers and experts' },
  { slug: 'react', label: 'React', description: 'React and frontend engineers' },
];

export default function ExpertsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold">Expert Directory</h1>
      <p className="mt-2 text-muted-foreground">
        Find professionals with demonstrated expertise across the AT Protocol ecosystem.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {BEACHHEAD_TOPICS.map((topic) => (
          <Link
            key={topic.slug}
            href={`/experts/${topic.slug}`}
            className="rounded-lg border border-border p-4 transition-colors hover:bg-accent"
          >
            <h2 className="font-semibold">{topic.label}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{topic.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
