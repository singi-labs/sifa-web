import { searchProfiles } from '@/lib/api';
import { getTranslations } from 'next-intl/server';
import { ProfileCard } from '@/components/profile-card';
import { SearchInput } from './search-input';

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? '';
  const results = query ? await searchProfiles(query) : [];
  const t = await getTranslations('search');

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Search</h1>
      <SearchInput defaultValue={query} />

      <div className="mt-6 space-y-3">
        {query && results.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">
            {t('noResults', { query })}
          </p>
        )}
        {results.map((profile) => (
          <ProfileCard
            key={profile.handle}
            handle={profile.handle}
            headline={profile.headline}
            avatar={profile.avatar}
          />
        ))}
      </div>
    </main>
  );
}
