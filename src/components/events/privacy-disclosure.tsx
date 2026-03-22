'use client';

import { Info } from '@phosphor-icons/react';

export function PrivacyDisclosure() {
  return (
    <details className="rounded-lg border border-border px-4 py-3 text-sm text-muted-foreground">
      <summary className="flex cursor-pointer items-center gap-2 font-medium text-foreground">
        <Info size={16} aria-hidden />
        How this works
      </summary>
      <p className="mt-2 leading-relaxed">
        This page shows public RSVP data from Smoke Signal and public AT Protocol profiles. When you
        sign in, your Bluesky connections are checked in your browser using the public API — this
        lookup is not stored. Sifa follows and connections are stored in your PDS under{' '}
        <code className="rounded bg-muted px-1 text-xs">id.sifa.*</code>, owned and portable by you.
      </p>
    </details>
  );
}
