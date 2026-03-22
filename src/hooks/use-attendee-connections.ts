'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/components/auth-provider';

export type ConnectionType = 'mutual' | 'following' | 'followedBy';
export type ConnectionMap = Map<string, ConnectionType>;

const BSKY_API = 'https://public.api.bsky.app/xrpc/app.bsky.graph.getRelationships';
const BATCH_SIZE = 30;
const CACHE_KEY_PREFIX = 'sifa:event-connections:';

interface RelationshipEntry {
  did: string;
  following?: string;
  followedBy?: string;
}

interface RelationshipsResponse {
  actor: string;
  relationships: RelationshipEntry[];
}

function classifyRelationship(entry: RelationshipEntry): ConnectionType | null {
  const hasFollowing = typeof entry.following === 'string' && entry.following.length > 0;
  const hasFollowedBy = typeof entry.followedBy === 'string' && entry.followedBy.length > 0;

  if (hasFollowing && hasFollowedBy) return 'mutual';
  if (hasFollowing) return 'following';
  if (hasFollowedBy) return 'followedBy';
  return null;
}

function buildBatchUrl(actor: string, others: string[]): string {
  const url = new URL(BSKY_API);
  url.searchParams.set('actor', actor);
  for (const did of others) {
    url.searchParams.append('others', did);
  }
  return url.toString();
}

/**
 * Pure function that detects connections between a user and a list of attendee DIDs.
 * Exported separately for testability.
 */
export async function detectConnections(
  userDid: string | null,
  attendeeDids: string[],
  signal?: AbortSignal,
): Promise<ConnectionMap> {
  const connections: ConnectionMap = new Map();

  if (!userDid || attendeeDids.length === 0) {
    return connections;
  }

  // Split into batches of BATCH_SIZE
  const batches: string[][] = [];
  for (let i = 0; i < attendeeDids.length; i += BATCH_SIZE) {
    batches.push(attendeeDids.slice(i, i + BATCH_SIZE));
  }

  const results = await Promise.allSettled(
    batches.map(async (batch) => {
      const url = buildBatchUrl(userDid, batch);
      const response = await fetch(url, { signal });

      if (!response.ok) {
        throw new Error(`API returned ${String(response.status)}`);
      }

      return (await response.json()) as RelationshipsResponse;
    }),
  );

  for (const result of results) {
    if (result.status === 'fulfilled') {
      for (const entry of result.value.relationships) {
        const connectionType = classifyRelationship(entry);
        if (connectionType) {
          connections.set(entry.did, connectionType);
        }
      }
    }
    // Rejected batches are silently skipped — partial results are fine
  }

  return connections;
}

function getCacheKey(did: string, attendeeCount: number): string {
  return `${CACHE_KEY_PREFIX}${did}:${String(attendeeCount)}`;
}

function getCachedConnections(did: string, attendeeCount: number): ConnectionMap | null {
  try {
    const raw = sessionStorage.getItem(getCacheKey(did, attendeeCount));
    if (!raw) return null;
    const entries = JSON.parse(raw) as Array<[string, ConnectionType]>;
    return new Map(entries);
  } catch {
    return null;
  }
}

function setCachedConnections(
  did: string,
  attendeeCount: number,
  connections: ConnectionMap,
): void {
  try {
    const entries = Array.from(connections.entries());
    sessionStorage.setItem(getCacheKey(did, attendeeCount), JSON.stringify(entries));
  } catch {
    // sessionStorage unavailable
  }
}

interface UseAttendeeConnectionsResult {
  connections: ConnectionMap;
  isLoading: boolean;
  isLoggedIn: boolean;
}

export function useAttendeeConnections(attendeeDids: string[]): UseAttendeeConnectionsResult {
  const { session } = useAuth();
  const userDid = session?.did ?? null;
  const isLoggedIn = userDid !== null;
  const attendeeCount = attendeeDids.length;

  // Check cache synchronously outside the effect to avoid setState-in-effect lint errors
  const cachedConnections = useMemo<ConnectionMap | null>(() => {
    if (!userDid || attendeeCount === 0) return null;
    return getCachedConnections(userDid, attendeeCount);
  }, [userDid, attendeeCount]);

  const needsFetch = userDid !== null && attendeeCount > 0 && cachedConnections === null;

  // Track fetch results. When needsFetch becomes true, we're loading until a result arrives.
  const [fetchResult, setFetchResult] = useState<{
    key: string;
    connections: ConnectionMap;
  } | null>(null);

  const fetchKey = needsFetch ? `${userDid}:${String(attendeeCount)}` : '';

  useEffect(() => {
    if (!needsFetch || !userDid) {
      return;
    }

    const controller = new AbortController();

    detectConnections(userDid, attendeeDids, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setCachedConnections(userDid, attendeeCount, result);
          setFetchResult({ key: fetchKey, connections: result });
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          // Mark fetch as done with empty result on error
          setFetchResult({ key: fetchKey, connections: new Map() });
        }
      });

    return () => {
      controller.abort();
    };
  }, [needsFetch, userDid, attendeeDids, attendeeCount, fetchKey]);

  // Derive final state without synchronous setState in effects
  const hasFetchResult = fetchResult !== null && fetchResult.key === fetchKey;
  const connections =
    cachedConnections ??
    (hasFetchResult ? fetchResult.connections : new Map<string, ConnectionType>());
  const isLoading = needsFetch && !hasFetchResult;

  return { connections, isLoading, isLoggedIn };
}
