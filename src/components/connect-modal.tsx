'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth-provider';
import { trackEvent } from '@/lib/analytics';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3100';

interface ConnectModalProps {
  did: string;
  handle: string;
  displayName?: string;
  avatar?: string;
  headline?: string;
  isOwnProfile?: boolean;
  isFollowing?: boolean;
}

export function ConnectModal({
  did,
  handle,
  displayName,
  avatar,
  headline,
  isOwnProfile,
  isFollowing: initialFollowing,
}: ConnectModalProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { session } = useAuth();
  const t = useTranslations('connect');
  const tCommon = useTranslations('common');
  const [open, setOpen] = useState(false);
  const [following, setFollowing] = useState(initialFollowing ?? false);
  const [isPending, startTransition] = useTransition();
  const [justConnected, setJustConnected] = useState(false);

  const label = displayName ?? handle;

  useEffect(() => {
    if (searchParams.get('connect') === '1') {
      setOpen(true);
      trackEvent('connect-modal-open', { handle });
    }
  }, [searchParams, handle]);

  const handleClose = useCallback(() => {
    setOpen(false);
    // Remove ?connect=1 from URL without reload
    const url = new URL(window.location.href);
    url.searchParams.delete('connect');
    router.replace(url.pathname + url.search, { scroll: false });
  }, [router]);

  const handleConnect = useCallback(() => {
    trackEvent('connect-modal-follow', { handle });
    setFollowing(true);

    startTransition(async () => {
      try {
        const res = await fetch(`${API_URL}/api/follow`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ subjectDid: did }),
        });
        if (!res.ok) throw new Error('Follow failed');
        setJustConnected(true);
        toast.success(t('connected'));
        setTimeout(() => handleClose(), 1500);
      } catch {
        setFollowing(false);
      }
    });
  }, [did, handle, handleClose, t]);

  const handleSignIn = useCallback(() => {
    trackEvent('connect-modal-sign-in', { handle });
    window.location.href = `/login?returnTo=${encodeURIComponent(`/p/${handle}?connect=1`)}`;
  }, [handle]);

  if (isOwnProfile) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="flex flex-col items-center gap-3 pt-2">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-muted text-2xl font-semibold text-muted-foreground">
              {avatar ? (
                <Image
                  src={avatar}
                  alt=""
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <span aria-hidden="true">{label.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <DialogTitle className="text-center">
              {following || justConnected
                ? t('modalAlreadyConnected', { name: label })
                : t('modalTitle', { name: label })}
            </DialogTitle>
            {headline && (
              <DialogDescription className="text-center">{headline}</DialogDescription>
            )}
          </div>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          {session ? (
            following || justConnected ? (
              <Button variant="outline" onClick={handleClose}>
                {t('modalDismiss')}
              </Button>
            ) : (
              <Button onClick={handleConnect} disabled={isPending} className="w-full sm:w-auto">
                {t('connectAction')}
              </Button>
            )
          ) : (
            <Button onClick={handleSignIn} className="w-full sm:w-auto">
              {tCommon('signIn')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
