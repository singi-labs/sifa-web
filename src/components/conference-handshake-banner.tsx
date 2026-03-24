'use client';

import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Handshake, X } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useAuth } from '@/components/auth-provider';

const STORAGE_KEY = 'sifa-conference-banner-dismissed';
const CONFERENCE_START = new Date('2026-03-26T00:00:00Z');
const CONFERENCE_END = new Date('2026-03-30T00:00:00Z');

function getWasDismissed() {
  return typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY) === 'true';
}

function isConferencePeriod() {
  const now = new Date();
  return now >= CONFERENCE_START && now < CONFERENCE_END;
}

export function ConferenceHandshakeBanner() {
  const t = useTranslations('handshake');
  const { session } = useAuth();
  const wasDismissedOnLoad = useSyncExternalStore(
    () => () => {},
    getWasDismissed,
    () => true,
  );
  const [dismissed, setDismissed] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!session || !isConferencePeriod() || wasDismissedOnLoad || dismissed) {
    return null;
  }

  return (
    <>
      <div
        role="status"
        className="relative border-b border-primary/20 bg-primary/5 px-4 py-2 text-center text-sm font-medium text-foreground"
      >
        <div className="mx-auto flex max-w-5xl items-center justify-center gap-2">
          <Handshake className="h-4 w-4 shrink-0" weight="fill" aria-hidden="true" />
          <p>{t('conferenceBanner')}</p>
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="shrink-0 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary hover:bg-primary/20"
          >
            {t('conferenceBannerCta')}
          </button>
          <button
            type="button"
            onClick={() => {
              localStorage.setItem(STORAGE_KEY, 'true');
              setDismissed(true);
            }}
            className="ml-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-foreground/50 transition-opacity hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Dismiss banner"
          >
            <X className="h-3.5 w-3.5" weight="bold" aria-hidden="true" />
          </button>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('explainerTitle')}</DialogTitle>
            <DialogDescription>
              Record verified in-person meetings with people you meet at ATmosphereConf.
            </DialogDescription>
          </DialogHeader>
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                1
              </span>
              <span>{t('explainerStep1')}</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                2
              </span>
              <span>{t('explainerStep2')}</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                3
              </span>
              <span>{t('explainerStep3')}</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                4
              </span>
              <span>{t('explainerStep4')}</span>
            </li>
          </ol>
          <DialogFooter>
            <Link href="/meet">
              <Button size="sm">
                <Handshake className="mr-1.5 h-4 w-4" weight="bold" aria-hidden="true" />
                Open Meet page
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
