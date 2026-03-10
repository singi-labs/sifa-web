'use client';

import { useCallback, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useRequireAuth } from '@/hooks/use-require-auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3100';

interface FollowButtonProps {
  targetDid: string;
  isFollowing: boolean;
}

export function FollowButton({ targetDid, isFollowing: initialFollowing }: FollowButtonProps) {
  const t = useTranslations('common');
  const [following, setFollowing] = useState(initialFollowing);
  const [isPending, startTransition] = useTransition();
  const { requireAuth } = useRequireAuth();

  const toggleFollow = useCallback(() => {
    requireAuth(() => {
      // Optimistic update
      const wasFollowing = following;
      setFollowing(!wasFollowing);

      startTransition(async () => {
        try {
          if (wasFollowing) {
            const res = await fetch(`${API_URL}/api/follow/${encodeURIComponent(targetDid)}`, {
              method: 'DELETE',
              credentials: 'include',
            });
            if (!res.ok) throw new Error('Unfollow failed');
          } else {
            const res = await fetch(`${API_URL}/api/follow`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ subjectDid: targetDid }),
            });
            if (!res.ok) throw new Error('Follow failed');
          }
        } catch {
          // Revert optimistic update on failure
          setFollowing(wasFollowing);
        }
      });
    });
  }, [following, targetDid, requireAuth]);

  return (
    <Button
      variant={following ? 'outline' : 'default'}
      size="sm"
      onClick={toggleFollow}
      disabled={isPending}
      aria-pressed={following}
    >
      {following ? t('unfollow') : t('follow')}
    </Button>
  );
}
