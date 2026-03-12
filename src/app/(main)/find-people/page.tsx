'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { SuggestionCard } from '@/components/suggestion-card';
import { Button } from '@/components/ui/button';
import {
  fetchSuggestions,
  dismissSuggestion,
  undismissSuggestion,
  createInvite,
  type SuggestionProfile,
} from '@/lib/api';
import { toast } from 'sonner';

const SOURCES = ['all', 'bluesky', 'tangled'] as const;

export default function FindPeoplePage() {
  const { session, isLoading: authLoading } = useAuth();
  const { requireAuth } = useRequireAuth();
  const [source, setSource] = useState<string>('all');
  const [showHidden, setShowHidden] = useState(false);
  const [onSifa, setOnSifa] = useState<SuggestionProfile[]>([]);
  const [notOnSifa, setNotOnSifa] = useState<SuggestionProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<string | undefined>();

  const loadSuggestions = useCallback(
    async (reset = true) => {
      if (!session) return;
      setLoading(true);
      const data = await fetchSuggestions({
        source: source === 'all' ? undefined : source,
        includeDismissed: showHidden,
        cursor: reset ? undefined : cursor,
      });
      if (reset) {
        setOnSifa(data.onSifa);
        setNotOnSifa(data.notOnSifa);
      } else {
        setOnSifa((prev) => [...prev, ...data.onSifa]);
        setNotOnSifa((prev) => [...prev, ...data.notOnSifa]);
      }
      setCursor(data.cursor);
      setLoading(false);
    },
    [session, source, showHidden, cursor],
  );

  useEffect(() => {
    if (session) {
      void loadSuggestions(true);
      // Record last visit for badge calculation
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('sifa:suggestions-last-visited', new Date().toISOString());
      }
    }
  }, [session, source, showHidden]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDismiss = useCallback(async (did: string) => {
    setOnSifa((prev) => prev.filter((s) => s.did !== did));
    setNotOnSifa((prev) => prev.filter((s) => s.did !== did));
    await dismissSuggestion(did);
  }, []);

  const handleUndismiss = useCallback(async (did: string) => {
    setOnSifa((prev) => prev.map((s) => (s.did === did ? { ...s, dismissed: false } : s)));
    setNotOnSifa((prev) => prev.map((s) => (s.did === did ? { ...s, dismissed: false } : s)));
    await undismissSuggestion(did);
  }, []);

  const handleFollow = useCallback(
    (did: string) => {
      requireAuth(async () => {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3100'}/api/follow`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ subjectDid: did }),
          },
        );
        if (res.ok) {
          setOnSifa((prev) => prev.filter((s) => s.did !== did));
          toast.success('Followed successfully');
        }
      });
    },
    [requireAuth],
  );

  const handleInvite = useCallback(async (did: string) => {
    try {
      const url = await createInvite(did);
      await navigator.clipboard.writeText(url);
      toast.success('Invite link copied to clipboard');
    } catch {
      toast.error('Failed to create invite');
    }
  }, []);

  if (authLoading) return null;

  if (!session) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold">Find People</h1>
        <p className="mt-2 text-muted-foreground">
          Sign in to discover people you know from other AT Protocol services.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">Find People</h1>
      <p className="mt-1 text-muted-foreground">
        Discover people you know from other AT Protocol services
      </p>

      {/* Filters */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-2">
          {SOURCES.map((s) => (
            <Button
              key={s}
              variant={source === s ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSource(s)}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </Button>
          ))}
        </div>
        <Button variant="ghost" size="sm" onClick={() => setShowHidden(!showHidden)}>
          {showHidden ? 'Hide dismissed' : 'Show hidden'}
        </Button>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">More services coming soon</p>

      {loading && onSifa.length === 0 && notOnSifa.length === 0 ? (
        <p className="mt-8 text-center text-muted-foreground">Loading suggestions...</p>
      ) : onSifa.length === 0 && notOnSifa.length === 0 ? (
        <p className="mt-8 text-center text-muted-foreground">
          No suggestions found. Follow people on Bluesky or Tangled, and they will appear here when
          they join Sifa.
        </p>
      ) : (
        <>
          {/* On Sifa */}
          {onSifa.length > 0 && (
            <section className="mt-6">
              <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
                On Sifa ({onSifa.length})
              </h2>
              <div className="space-y-2">
                {onSifa.map((s) => (
                  <SuggestionCard
                    key={s.did}
                    did={s.did}
                    handle={s.handle}
                    displayName={s.displayName}
                    headline={s.headline}
                    avatarUrl={s.avatarUrl}
                    source={s.source}
                    claimed={true}
                    dismissed={s.dismissed}
                    onDismiss={handleDismiss}
                    onFollow={handleFollow}
                    onInvite={handleInvite}
                    onUndismiss={handleUndismiss}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Not yet on Sifa */}
          {notOnSifa.length > 0 && (
            <section className="mt-6">
              <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
                Not yet on Sifa ({notOnSifa.length})
              </h2>
              <div className="space-y-2">
                {notOnSifa.map((s) => (
                  <SuggestionCard
                    key={s.did}
                    did={s.did}
                    handle={s.handle}
                    displayName={s.displayName}
                    source={s.source}
                    claimed={false}
                    dismissed={s.dismissed}
                    onDismiss={handleDismiss}
                    onFollow={handleFollow}
                    onInvite={handleInvite}
                    onUndismiss={handleUndismiss}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Load more */}
          {cursor && (
            <div className="mt-6 text-center">
              <Button variant="outline" onClick={() => loadSuggestions(false)}>
                Load more
              </Button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
