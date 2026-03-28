'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { ArrowsClockwise, Handshake as HandshakeIcon, Info, QrCode } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { HandshakeNotePrompt } from '@/components/handshake-note-prompt';
import { trackEvent } from '@/lib/analytics';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3100';

interface HandshakeQRProps {
  handle: string;
  avatar?: string;
}

type Status = 'loading' | 'ready' | 'waiting' | 'confirmed' | 'error';

interface ScanResult {
  scannerDid: string;
  scannerName?: string;
  meetingToken: string;
}

function decodeToken(token: string): { nonce: string; sub?: string } {
  const base64 = token.replace(/-/g, '+').replace(/_/g, '/');
  // JWT has 3 parts; payload is the second
  const parts = base64.split('.');
  const payload = parts.length === 3 ? (parts[1] ?? base64) : base64;
  return JSON.parse(atob(payload)) as { nonce: string; sub?: string };
}

export function HandshakeQR({ handle, avatar }: HandshakeQRProps) {
  const t = useTranslations('handshake');
  const [status, setStatus] = useState<Status>('loading');
  const [token, setToken] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoRefreshRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollIntervalRef = useRef(2000);
  const [pendingNotes, setPendingNotes] = useState<
    Array<{ did: string; name: string; handle?: string; avatar?: string }>
  >([]);
  const [meetingCount, setMeetingCount] = useState(0);

  const qrSize = 256;

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearTimeout(pollRef.current);
      pollRef.current = null;
    }
    pollIntervalRef.current = 2000;
  }, []);

  const generateToken = useCallback(async () => {
    stopPolling();
    setStatus('loading');
    setScanResult(null);

    try {
      const res = await fetch(`${API_URL}/api/meet/token`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        if (res.status === 429) {
          toast.error(t('rateLimited'));
        } else {
          toast.error(t('error'));
        }
        setStatus('error');
        return;
      }

      const data = (await res.json()) as { token: string; expiresIn: number };
      setToken(data.token);
      setStatus('ready');
      trackEvent('handshake-qr-generated', { handle });

      // Start polling for scan with backoff on rate limits
      const { nonce } = decodeToken(data.token);
      pollIntervalRef.current = 2000;

      const poll = async () => {
        try {
          const statusRes = await fetch(`${API_URL}/api/meet/status/${encodeURIComponent(nonce)}`, {
            credentials: 'include',
          });

          if (statusRes.status === 429) {
            pollIntervalRef.current = Math.min(pollIntervalRef.current * 2, 30000);
            pollRef.current = setTimeout(() => void poll(), pollIntervalRef.current);
            return;
          }
          // Reset interval on success
          pollIntervalRef.current = 2000;

          if (!statusRes.ok) {
            pollRef.current = setTimeout(() => void poll(), pollIntervalRef.current);
            return;
          }

          const statusData = (await statusRes.json()) as {
            confirmed: boolean;
            scannerDid?: string;
            meetingToken?: string;
          };

          if (statusData.confirmed && statusData.scannerDid && statusData.meetingToken) {
            stopPolling();
            setStatus('waiting');

            // Write displayer's PDS record
            const confirmRes = await fetch(`${API_URL}/api/meet/confirm-displayer`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                meetingToken: statusData.meetingToken,
                scannerDid: statusData.scannerDid,
              }),
            });

            if (confirmRes.ok) {
              setScanResult({
                scannerDid: statusData.scannerDid,
                meetingToken: statusData.meetingToken,
              });
              setStatus('confirmed');
              navigator.vibrate?.(200);
              trackEvent('handshake-confirmed-displayer', { handle });

              // Fetch scanner profile for note prompt
              fetch(`${API_URL}/api/profile/${encodeURIComponent(statusData.scannerDid)}`)
                .then(async (profileRes) => {
                  if (!profileRes.ok) return;
                  const profileData = (await profileRes.json()) as {
                    handle?: string;
                    displayName?: string;
                    avatar?: string;
                  };
                  setPendingNotes((prev) => [
                    ...prev,
                    {
                      did: statusData.scannerDid!,
                      name: profileData.displayName ?? profileData.handle ?? statusData.scannerDid!,
                      handle: profileData.handle,
                      avatar: profileData.avatar,
                    },
                  ]);
                })
                .catch(() => {
                  // Fallback: add with DID as name
                  setPendingNotes((prev) => [
                    ...prev,
                    { did: statusData.scannerDid!, name: statusData.scannerDid! },
                  ]);
                });

              // Auto-generate new token after 3 seconds
              autoRefreshRef.current = setTimeout(() => {
                void generateToken();
              }, 3000);
            } else {
              toast.error(t('error'));
              setStatus('error');
            }
            return;
          }
        } catch {
          // Transient polling error -- keep trying
        }
        pollRef.current = setTimeout(() => void poll(), pollIntervalRef.current);
      };

      pollRef.current = setTimeout(() => void poll(), pollIntervalRef.current);
    } catch {
      toast.error(t('error'));
      setStatus('error');
    }
  }, [handle, stopPolling, t]);

  useEffect(() => {
    void generateToken();

    // Fetch meeting count
    fetch(`${API_URL}/api/meet/list`, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) return;
        const data = (await res.json()) as { meetings: unknown[] };
        setMeetingCount(data.meetings.length);
      })
      .catch(() => {});

    return () => {
      stopPolling();
      if (autoRefreshRef.current) {
        clearTimeout(autoRefreshRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNextHandshake = useCallback(() => {
    if (autoRefreshRef.current) {
      clearTimeout(autoRefreshRef.current);
      autoRefreshRef.current = null;
    }
    trackEvent('handshake-next', { handle });
    void generateToken();
  }, [generateToken, handle]);

  const qrUrl = token ? `https://sifa.id/meet?token=${token}` : '';

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Meeting count */}
      {meetingCount > 0 && (
        <p className="text-sm text-white/60">
          {meetingCount === 1 ? t('metCountOne') : t('metCount', { count: meetingCount })}
        </p>
      )}

      {/* QR Code */}
      <div className="relative rounded-2xl bg-white p-4">
        {status === 'confirmed' ? (
          <div
            className="flex flex-col items-center justify-center gap-3"
            style={{ width: qrSize, height: qrSize }}
          >
            <HandshakeIcon className="h-16 w-16 animate-scale-in text-green-600" weight="fill" />
            <p className="text-center text-lg font-semibold text-gray-900">{t('confirmed')}</p>
            <p className="text-center text-sm text-gray-600">
              {t('confirmedSubtitle', {
                name: scanResult?.scannerName ?? 'them',
              })}
            </p>
          </div>
        ) : status === 'loading' ? (
          <div
            className="flex items-center justify-center"
            style={{ width: qrSize, height: qrSize }}
          >
            <ArrowsClockwise className="h-8 w-8 animate-spin text-gray-400" weight="bold" />
          </div>
        ) : token ? (
          <QRCodeSVG
            value={qrUrl}
            size={qrSize}
            level="H"
            marginSize={0}
            imageSettings={
              avatar
                ? {
                    src: avatar,
                    height: 48,
                    width: 48,
                    excavate: true,
                  }
                : undefined
            }
          />
        ) : (
          <div
            className="flex items-center justify-center"
            style={{ width: qrSize, height: qrSize }}
          >
            <p className="text-sm text-gray-500">{t('error')}</p>
          </div>
        )}
      </div>

      {/* Status text */}
      <p className="text-center text-sm text-white/70">
        {status === 'confirmed'
          ? t('scanned', { name: scanResult?.scannerName ?? 'Someone' })
          : status === 'ready'
            ? t('waiting')
            : status === 'loading'
              ? ''
              : ''}
      </p>

      {/* Next handshake button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleNextHandshake}
        disabled={status === 'loading'}
        className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
      >
        <ArrowsClockwise className="mr-1.5 h-4 w-4" weight="bold" aria-hidden="true" />
        {t('nextHandshake')}
      </Button>

      {/* Scan theirs */}
      <p className="text-center text-xs text-white/40">
        <QrCode className="mr-1 inline h-3.5 w-3.5" weight="bold" aria-hidden="true" />
        {t('scanTheirs')}?{' '}
        <span className="text-white/60">Point your phone camera at their QR code.</span>
      </p>

      {/* Privacy notice */}
      <p className="max-w-xs text-center text-xs text-white/50" title={t('privacyNoticeDetail')}>
        {t('privacyNotice')}{' '}
        <Info className="inline h-3 w-3 text-white/40" weight="bold" aria-hidden="true" />
      </p>

      {/* Profile QR link */}
      <a
        href={`/connect/${encodeURIComponent(handle)}`}
        className="text-center text-xs text-white/40 underline underline-offset-2 hover:text-white/60"
      >
        {t('profileQrLink')}
      </a>

      {/* Pending note prompts */}
      {pendingNotes.map((note) => (
        <HandshakeNotePrompt
          key={note.did}
          subjectDid={note.did}
          subjectHandle={note.handle}
          subjectName={note.name}
          subjectAvatar={note.avatar}
          onDismiss={() => setPendingNotes((prev) => prev.filter((n) => n.did !== note.did))}
        />
      ))}
    </div>
  );
}
