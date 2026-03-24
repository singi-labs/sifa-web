'use client';

import { useTranslations } from 'next-intl';
import { CheckCircle, ShieldCheck } from '@phosphor-icons/react';
import { Popover } from '@base-ui/react/popover';

interface VerificationPopoverProps {
  verified: boolean;
  verifiedVia?: string | null;
  keytraceVerified?: boolean;
}

const VERIFIED_VIA_KEYS: Record<string, string> = {
  'rel-me': 'verifiedViaRelMe',
  dns: 'verifiedViaDns',
  meta: 'verifiedViaMeta',
};

export function VerificationPopover({
  verified,
  verifiedVia,
  keytraceVerified,
}: VerificationPopoverProps) {
  const t = useTranslations('sections');

  const methods: string[] = [];
  if (keytraceVerified) {
    methods.push(t('verifiedViaKeytrace'));
  }
  if (verified && verifiedVia) {
    const key = VERIFIED_VIA_KEYS[verifiedVia];
    methods.push(key ? t(key) : `Verified via ${verifiedVia}`);
  }

  if (methods.length === 0) return null;

  return (
    <Popover.Root>
      <Popover.Trigger
        className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors hover:opacity-80"
        aria-label={t('verificationMethods')}
      >
        {keytraceVerified ? (
          <ShieldCheck
            size={16}
            weight="fill"
            className="text-green-600 dark:text-green-400"
            aria-hidden="true"
          />
        ) : (
          <CheckCircle
            size={16}
            weight="fill"
            className="text-green-600 dark:text-green-400"
            aria-hidden="true"
          />
        )}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={8}>
          <Popover.Popup className="z-[60] w-64 rounded-lg border border-border bg-popover p-3 text-sm text-popover-foreground shadow-md">
            <Popover.Arrow className="fill-popover stroke-border" />
            <p className="mb-2 font-medium">{t('verificationMethods')}</p>
            <ul className="space-y-1">
              {methods.map((method) => (
                <li key={method} className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle
                    size={14}
                    weight="fill"
                    className="shrink-0 text-green-600 dark:text-green-400"
                    aria-hidden="true"
                  />
                  {method}
                </li>
              ))}
            </ul>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
