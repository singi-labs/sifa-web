'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowsClockwise } from '@phosphor-icons/react';
import { useAuth } from '@/components/auth-provider';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { SuggestionCard } from '@/components/suggestion-card';
import { Button } from '@/components/ui/button';
import {
  fetchSuggestions,
  syncSuggestions,
  dismissSuggestion,
  undismissSuggestion,
  followUser,
  type SuggestionProfile,
} from '@/lib/api';
import { toast } from 'sonner';

const SOURCES = ['all', 'bluesky', 'tangled'] as const;

export function SuggestionsSection() {
  const { session, isLoading: authLoading } = useAuth();
  const { requireAuth } = useRequireAuth();
  const [source, setSource] = useState<string>('all');
  const [showHidden, setShowHidden] = useState(false);
  const [onSifa, setOnSifa] = useState<SuggestionProfile[]>([]);
  const [notOnSifa, setNotOnSifa] = useState<SuggestionProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>();
  const autoSynced = useRef(false);

  const handleSync = useCallback(async () => {
    setSyncing(true);
    try {
      const result = await syncSuggestions();
      const total = result.imported.bluesky + result.imported.tangled;
      if (total > 0) {
        toast.success(`Synced ${total} follows from your PDS`);
      } else {
        toast.success('Already up to date');
      }
      const src = source === 'all' ? undefined : source;
      const data = await fetchSuggestions({ source: src, includeDismissed: showHidden });
      setOnSifa(data.onSifa);
      setNotOnSifa(data.notOnSifa);
      setCursor(data.cursor);
    } catch {
      toast.error('Failed to sync follows');
    } finally {
      setSyncing(false);
    }
  }, [source, showHidden]);

  const loadMore = useCallback(() => {
    if (!session || !cursor) return;
    setLoading(true);
    void fetchSuggestions({
      source: source === 'all' ? undefined : source,
      includeDismissed: showHidden,
      cursor,
    }).then((data) => {
      setOnSifa((prev) => [...prev, ...data.onSifa]);
      setNotOnSifa((prev) => [...prev, ...data.notOnSifa]);
      setCursor(data.cursor);
      setLoading(false);
    });
  }, [session, source, showHidden, cursor]);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    const src = source === 'all' ? undefined : source;
    fetchSuggestions({ source: src, includeDismissed: showHidden }).then(async (data) => {
      if (cancelled) return;
      setOnSifa(data.onSifa);
      setNotOnSifa(data.notOnSifa);
      setCursor(data.cursor);
      setLoading(false);

      // Auto-sync on first visit if no suggestions found
      if (data.onSifa.length === 0 && data.notOnSifa.length === 0 && !autoSynced.current) {
        autoSynced.current = true;
        setSyncing(true);
        try {
          await syncSuggestions();
          if (cancelled) return;
          const refreshed = await fetchSuggestions({ source: src, includeDismissed: showHidden });
          if (cancelled) return;
          setOnSifa(refreshed.onSifa);
          setNotOnSifa(refreshed.notOnSifa);
          setCursor(refreshed.cursor);
        } catch {
          // Sync failed silently — user can retry manually
        } finally {
          if (!cancelled) setSyncing(false);
        }
      }
    });
    // Record last visit for badge calculation
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('sifa:suggestions-last-visited', new Date().toISOString());
    }
    return () => {
      cancelled = true;
    };
  }, [session, source, showHidden]);

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
        const ok = await followUser(did);
        if (ok) {
          setOnSifa((prev) => prev.filter((s) => s.did !== did));
          toast.success('Followed! View in My Network', {
            action: {
              label: 'View',
              onClick: () => {
                window.location.href = '/my-network';
              },
            },
          });
        }
      });
    },
    [requireAuth],
  );

  if (authLoading || !session) return null;

  return (
    <section className="mt-10 border-t border-border pt-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">People you may know</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            From your follows on other AT Protocol services
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing}>
          <ArrowsClockwise
            className={`mr-1.5 h-4 w-4${syncing ? ' animate-spin' : ''}`}
            weight="bold"
            aria-hidden="true"
          />
          {syncing ? 'Syncing...' : 'Sync follows'}
        </Button>
      </div>

      {/* Filters */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-2">
          {SOURCES.map((s) => (
            <Button
              key={s}
              variant={source === s ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setSource(s);
                setLoading(true);
              }}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </Button>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setShowHidden(!showHidden);
            setLoading(true);
          }}
        >
          {showHidden ? 'Hide dismissed' : 'Show hidden'}
        </Button>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">More services coming soon</p>

      {loading && onSifa.length === 0 && notOnSifa.length === 0 ? (
        <p className="mt-8 text-center text-muted-foreground">Loading suggestions...</p>
      ) : syncing && onSifa.length === 0 && notOnSifa.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-2 text-muted-foreground">
          <ArrowsClockwise className="h-6 w-6 animate-spin" weight="bold" aria-hidden="true" />
          <p>Syncing your follows from your PDS...</p>
        </div>
      ) : onSifa.length === 0 && notOnSifa.length === 0 ? (
        <p className="mt-8 text-center text-muted-foreground">
          No suggestions found. Follow people on Bluesky or Tangled, and they will appear here when
          they join Sifa.
        </p>
      ) : (
        <>
          {/* On Sifa */}
          {onSifa.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
                On Sifa ({onSifa.length})
              </h3>
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
                    onUndismiss={handleUndismiss}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Not yet on Sifa */}
          {notOnSifa.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
                Not yet on Sifa ({notOnSifa.length})
              </h3>
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
                    onUndismiss={handleUndismiss}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Load more */}
          {cursor && (
            <div className="mt-6 text-center">
              <Button variant="outline" onClick={loadMore}>
                Load more
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
