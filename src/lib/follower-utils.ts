/**
 * Prefer AT Protocol (Bluesky) follower count over Sifa-internal count.
 * Returns the count to display, or undefined if both are zero/absent.
 */
export function resolveDisplayFollowers(
  atprotoFollowersCount: number | undefined | null,
  followersCount: number | undefined | null,
): number | undefined {
  if (atprotoFollowersCount != null && atprotoFollowersCount > 0) return atprotoFollowersCount;
  if (followersCount != null && followersCount > 0) return followersCount;
  return undefined;
}
