'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { CheckCircle, Handshake, SignIn } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth-provider';
import { HandshakeNotePrompt } from '@/components/handshake-note-prompt';
import { trackEvent } from '@/lib/analytics';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3100';

interface HandshakeScannerProps {
  token: string;
}

type Status = 'idle' | 'confirming' | 'confirmed' | 'error';
type ErrorKind = 'selfScan' | 'expired' | 'usedToken' | 'rateLimited' | 'alreadyMet' | 'generic';

interface DisplayerInfo {
  did: string;
  handle?: string;
  displayName?: string;
  avatar?: string;
}

interface ConfirmResponse {
  meetingToken: string;
  rkey: string;
  displayerDid: string;
}

interface ErrorResponse {
  error?: string;
  code?: string;
  existingDate?: string;
}

function decodeTokenPayload(token: string): { did?: string; nonce?: string } {
  try {
    const parts = token.split('.');
    const payload = parts.length === 3 ? (parts[1] ?? token) : token;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64)) as { did?: string; nonce?: string };
  } catch {
    return {};
  }
}

function mapErrorCode(code: string | undefined, httpStatus: number): ErrorKind {
  switch (code) {
    case 'SELF_SCAN':
      return 'selfScan';
    case 'TOKEN_EXPIRED':
      return 'expired';
    case 'TOKEN_USED':
      return 'usedToken';
    case 'ALREADY_MET':
      return 'alreadyMet';
    default:
      if (httpStatus === 429) return 'rateLimited';
      return 'generic';
  }
}

export function HandshakeScanner({ token }: HandshakeScannerProps) {
  const t = useTranslations('handshake');
  const { session, isLoading: authLoading } = useAuth();
  const [status, setStatus] = useState<Status>('idle');
  const [errorKind, setErrorKind] = useState<ErrorKind | null>(null);
  const [alreadyMetDate, setAlreadyMetDate] = useState<string | null>(null);
  const [notePromptDismissed, setNotePromptDismissed] = useState(false);

  // Decode token to get displayer DID
  const { did: displayerDid } = decodeTokenPayload(token);
  const [displayer, setDisplayer] = useState<DisplayerInfo | null>(
    displayerDid ? { did: displayerDid } : null,
  );

  // Fetch displayer profile
  useEffect(() => {
    if (!displayerDid) return;

    fetch(`${API_URL}/api/profile/${encodeURIComponent(displayerDid)}`)
      .then(async (res) => {
        if (!res.ok) return;
        const data = (await res.json()) as {
          handle?: string;
          displayName?: string;
          avatar?: string;
        };
        setDisplayer({
          did: displayerDid,
          handle: data.handle,
          displayName: data.displayName,
          avatar: data.avatar,
        });
      })
      .catch(() => {
        // Keep minimal displayer info
      });
  }, [displayerDid]);

  const handleConfirm = useCallback(async () => {
    setStatus('confirming');
    trackEvent('handshake-confirm-attempt');

    try {
      const res = await fetch(`${API_URL}/api/meet/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as ErrorResponse;
        const kind = mapErrorCode(data.code ?? data.error, res.status);
        setErrorKind(kind);
        setStatus('error');

        if (kind === 'alreadyMet' && data.existingDate) {
          setAlreadyMetDate(data.existingDate);
        }

        trackEvent('handshake-confirm-error', { kind });
        return;
      }

      (await res.json()) as ConfirmResponse;
      setStatus('confirmed');
      trackEvent('handshake-confirmed-scanner');
    } catch {
      setErrorKind('generic');
      setStatus('error');
      toast.error(t('error'));
    }
  }, [token, t]);

  const displayerName = displayer?.displayName ?? displayer?.handle ?? '...';
  const displayerHandle = displayer?.handle;
  const isAuthenticated = session !== null;

  // Error state
  if (status === 'error' && errorKind) {
    const isAlreadyMet = errorKind === 'alreadyMet';
    return (
      <div className="flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center px-4 py-12">
        <div className="flex max-w-sm flex-col items-center gap-4 text-center">
          {isAlreadyMet ? (
            <>
              <Handshake className="h-16 w-16 text-primary" weight="fill" />
              <h1 className="text-xl font-semibold">{t('alreadyMet')}</h1>
              <p className="text-sm text-muted-foreground">
                {t('alreadyMetSubtitle', {
                  name: displayerName,
                  date: alreadyMetDate ? new Date(alreadyMetDate).toLocaleDateString() : '',
                })}
              </p>
            </>
          ) : (
            <>
              <h1 className="text-xl font-semibold">{t(errorKind)}</h1>
            </>
          )}

          {displayerHandle && (
            <Link
              href={`/p/${encodeURIComponent(displayerHandle)}`}
              className="text-sm text-primary underline underline-offset-2"
            >
              {t('viewProfile')}
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Confirmed state
  if (status === 'confirmed') {
    return (
      <div className="flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center px-4 py-12">
        <div className="flex max-w-sm flex-col items-center gap-4 text-center">
          <CheckCircle className="h-16 w-16 text-green-600" weight="fill" />
          <h1 className="text-xl font-semibold">{t('confirmed')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('confirmedSubtitle', { name: displayerName })}
          </p>
          {!notePromptDismissed && displayer && (
            <HandshakeNotePrompt
              subjectDid={displayer.did}
              subjectHandle={displayer.handle}
              subjectName={displayerName}
              subjectAvatar={displayer.avatar}
              onDismiss={() => setNotePromptDismissed(true)}
            />
          )}
          {displayerHandle && (
            <Link href={`/p/${encodeURIComponent(displayerHandle)}`}>
              <Button variant="outline" size="sm">
                {t('viewProfile')}
              </Button>
            </Link>
          )}
          <Link href="/" className="text-sm text-muted-foreground underline underline-offset-2">
            {t('done')}
          </Link>
        </div>
      </div>
    );
  }

  // Main scanner view
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center px-4 py-12">
      <div className="flex max-w-sm flex-col items-center gap-6 text-center">
        {/* Displayer identity */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-muted text-2xl font-semibold text-muted-foreground">
            {displayer?.avatar ? (
              <Image
                src={displayer.avatar}
                alt=""
                width={80}
                height={80}
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <span aria-hidden="true">{displayerName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div>
            <h1 className="text-lg font-semibold">{displayerName}</h1>
            {displayerHandle && <p className="text-sm text-muted-foreground">@{displayerHandle}</p>}
          </div>
        </div>

        {/* Auth-dependent actions */}
        {authLoading ? (
          <div className="h-10" />
        ) : isAuthenticated ? (
          <Button onClick={handleConfirm} disabled={status === 'confirming'} size="lg">
            <Handshake className="mr-1.5 h-5 w-5" weight="bold" aria-hidden="true" />
            {status === 'confirming' ? '...' : t('confirm')}
          </Button>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground">
              {t('signInSubtitle', { name: displayerName })}
            </p>
            <Link href={`/login?returnTo=${encodeURIComponent(`/meet?token=${token}`)}`}>
              <Button size="lg">
                <SignIn className="mr-1.5 h-5 w-5" weight="bold" aria-hidden="true" />
                {t('signInToHandshake')}
              </Button>
            </Link>
            {displayerHandle && (
              <Link
                href={`/p/${encodeURIComponent(displayerHandle)}`}
                className="text-sm text-muted-foreground underline underline-offset-2"
              >
                {t('justFollow')}
              </Link>
            )}
          </div>
        )}

        {/* Privacy notice */}
        <p className="max-w-xs text-xs text-muted-foreground">{t('privacyNotice')}</p>
      </div>
    </div>
  );
}
