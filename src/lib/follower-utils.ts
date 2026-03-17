export type FollowerSource = 'atproto' | 'sifa';

export interface DisplayFollowers {
  count: number;
  source: FollowerSource;
}

/**
 * Prefer AT Protocol (Bluesky) follower count over Sifa-internal count.
 * Returns the count and source to display, or undefined if both are zero/absent.
 */
export function resolveDisplayFollowers(
  atprotoFollowersCount: number | undefined | null,
  followersCount: number | undefined | null,
): DisplayFollowers | undefined {
  if (atprotoFollowersCount != null && atprotoFollowersCount > 0)
    return { count: atprotoFollowersCount, source: 'atproto' };
  if (followersCount != null && followersCount > 0)
    return { count: followersCount, source: 'sifa' };
  return undefined;
}
