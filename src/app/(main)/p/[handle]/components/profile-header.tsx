import { sanitize } from '@/lib/sanitize';
import { resolveDisplayFollowers } from '@/lib/follower-utils';

interface ProfileHeaderProps {
  profile: {
    handle: string;
    headline?: string;
    followersCount: number;
    followingCount: number;
    connectionsCount: number;
    atprotoFollowersCount?: number;
  };
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const displayFollowers =
    resolveDisplayFollowers(profile.atprotoFollowersCount, profile.followersCount) ?? 0;

  return (
    <div>
      <h1 className="text-2xl font-bold">{sanitize(profile.handle)}</h1>
      {profile.headline && (
        <p className="mt-1 text-lg text-muted-foreground">{sanitize(profile.headline)}</p>
      )}
      <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
        <span>{displayFollowers} followers</span>
        <span>{profile.followingCount} following</span>
        <span>{profile.connectionsCount} connections</span>
      </div>
    </div>
  );
}
