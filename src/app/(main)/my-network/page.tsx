'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Users } from '@phosphor-icons/react';
import { useAuth } from '@/components/auth-provider';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { SuggestionCard } from '@/components/suggestion-card';
import { Button, buttonVariants } from '@/components/ui/button';
import { fetchFollowing, unfollowUser, type FollowProfile } from '@/lib/api';
import { toast } from 'sonner';

const SOURCES = ['all', 'sifa', 'bluesky', 'tangled'] as const;

export default function MyNetworkPage() {
  const { session, isLoading: authLoading } = useAuth();
  const { requireAuth } = useRequireAuth();
  const [source, setSource] = useState<string>('all');
  const [follows, setFollows] = useState<FollowProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<string | undefined>();

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    const src = source === 'all' ? undefined : source;
    fetchFollowing({ source: src }).then((data) => {
      if (cancelled) return;
      setFollows(data.follows);
      setCursor(data.cursor);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [session, source]);

  const loadMore = useCallback(() => {
    if (!session || !cursor) return;
    setLoading(true);
    const src = source === 'all' ? undefined : source;
    void fetchFollowing({ source: src, cursor }).then((data) => {
      setFollows((prev) => [...prev, ...data.follows]);
      setCursor(data.cursor);
      setLoading(false);
    });
  }, [session, source, cursor]);

  const handleUnfollow = useCallback(
    (did: string) => {
      requireAuth(async () => {
        const ok = await unfollowUser(did);
        if (ok) {
          setFollows((prev) => prev.filter((f) => f.did !== did));
          toast.success('Unfollowed');
        } else {
          toast.error('Failed to unfollow');
        }
      });
    },
    [requireAuth],
  );

  if (authLoading) return null;

  if (!session) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold">My Network</h1>
        <p className="mt-2 text-muted-foreground">Sign in to see who you follow.</p>
      </main>
    );
  }

  const claimed = follows.filter((f) => f.claimed);
  const unclaimed = follows.filter((f) => !f.claimed);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold">My Network</h1>
        <p className="mt-1 text-muted-foreground">
          {follows.length > 0
            ? `Following ${follows.length}${cursor ? '+' : ''} people`
            : 'People you follow'}
        </p>
      </div>

      {/* Source filter tabs */}
      <div className="mt-4 flex gap-2">
        {SOURCES.map((s) => (
          <Button
            key={s}
            variant={source === s ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSource(s);
              setFollows([]);
              setLoading(true);
            }}
          >
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </Button>
        ))}
      </div>

      {loading && follows.length === 0 ? (
        <p className="mt-8 text-center text-muted-foreground">Loading...</p>
      ) : follows.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-4 text-center">
          <Users className="h-12 w-12 text-muted-foreground/50" weight="light" aria-hidden="true" />
          <div>
            <p className="text-lg font-medium">Your network is empty</p>
            <p className="mt-1 text-muted-foreground">
              Follow people you know from Bluesky or Tangled to build your professional network.
            </p>
          </div>
          <Link href="/find-people" className={buttonVariants()}>
            Find People
          </Link>
        </div>
      ) : (
        <>
          {/* Sifa connections */}
          {claimed.length > 0 && (
            <section className="mt-6">
              <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
                On Sifa ({claimed.length})
              </h2>
              <div className="space-y-2">
                {claimed.map((f) => (
                  <SuggestionCard
                    key={f.did}
                    did={f.did}
                    handle={f.handle}
                    displayName={f.displayName}
                    headline={f.headline}
                    avatarUrl={f.avatarUrl}
                    source={f.source}
                    claimed={true}
                    onUnfollow={f.source === 'sifa' ? handleUnfollow : undefined}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Following elsewhere */}
          {unclaimed.length > 0 && (
            <section className="mt-6">
              <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
                Following elsewhere ({unclaimed.length})
              </h2>
              <div className="space-y-2">
                {unclaimed.map((f) => (
                  <SuggestionCard
                    key={f.did}
                    did={f.did}
                    handle={f.handle}
                    displayName={f.displayName}
                    avatarUrl={f.avatarUrl}
                    source={f.source}
                    claimed={false}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Load more */}
          {cursor && (
            <div className="mt-6 text-center">
              <Button variant="outline" onClick={loadMore} disabled={loading}>
                {loading ? 'Loading...' : 'Load more'}
              </Button>
            </div>
          )}

          {/* Find People CTA */}
          <div className="mt-8 rounded-lg border border-border p-4 text-center">
            <p className="text-sm text-muted-foreground">Looking for someone?</p>
            <Link
              href="/find-people"
              className={buttonVariants({ variant: 'outline', size: 'sm', className: 'mt-2' })}
            >
              Find People
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
