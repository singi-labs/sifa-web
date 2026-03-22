'use client';

import { useEffect, useState } from 'react';
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

function getCachedConnections(did: string): ConnectionMap | null {
  try {
    const raw = sessionStorage.getItem(`${CACHE_KEY_PREFIX}${did}`);
    if (!raw) return null;
    const entries = JSON.parse(raw) as Array<[string, ConnectionType]>;
    return new Map(entries);
  } catch {
    return null;
  }
}

function setCachedConnections(did: string, connections: ConnectionMap): void {
  try {
    const entries = Array.from(connections.entries());
    sessionStorage.setItem(`${CACHE_KEY_PREFIX}${did}`, JSON.stringify(entries));
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
  const isLoggedIn = session !== null;
  const [connections, setConnections] = useState<ConnectionMap>(() => {
    if (!session?.did) return new Map();
    return getCachedConnections(session.did) ?? new Map();
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!session?.did || attendeeDids.length === 0) {
      setConnections(new Map());
      setIsLoading(false);
      return;
    }

    const cached = getCachedConnections(session.did);
    if (cached) {
      setConnections(cached);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);

    detectConnections(session.did, attendeeDids, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setConnections(result);
          setCachedConnections(session.did, result);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [session?.did, attendeeDids]);

  return { connections, isLoading, isLoggedIn };
}
