'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { toast } from 'sonner';

export function EmbedBuilder() {
  const t = useTranslations('embedBuilder');
  const { session } = useAuth();
  const searchParams = useSearchParams();
  const [identifier, setIdentifier] = useState(searchParams.get('handle') ?? session?.handle ?? '');
  const [debouncedIdentifier, setDebouncedIdentifier] = useState(identifier);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedIdentifier(identifier);
    }, 500);
    return () => clearTimeout(timer);
  }, [identifier]);

  const embedCode = useMemo(() => {
    if (!debouncedIdentifier.trim()) return '';

    const isDid = debouncedIdentifier.startsWith('did:');
    const dataAttr = isDid
      ? `data-did="${debouncedIdentifier}"`
      : `data-handle="${debouncedIdentifier}"`;

    return `<script src="https://sifa.id/embed.js" ${dataAttr}></script>`;
  }, [debouncedIdentifier]);

  const [iframeHeight, setIframeHeight] = useState(300);

  const handleMessage = useCallback((e: MessageEvent) => {
    if (e.data?.type === 'sifa-embed-resize' && typeof e.data.height === 'number') {
      setIframeHeight(e.data.height);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  function handleCopy() {
    void navigator.clipboard.writeText(embedCode).then(() => {
      toast.success(t('copied'));
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Left column: config form */}
      <div className="space-y-6">
        <div>
          <label htmlFor="embed-identifier" className="block text-sm font-medium">
            {t('identifierLabel')}
          </label>
          <input
            id="embed-identifier"
            type="text"
            aria-label={t('identifierLabel')}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="alice.bsky.social"
            className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </div>

        <p className="text-sm text-muted-foreground">{t('themeNote')}</p>

        {debouncedIdentifier.trim() && (
          <div>
            <label className="block text-sm font-medium">{t('codeLabel')}</label>
            <pre
              data-testid="embed-code"
              className="mt-1 overflow-x-auto rounded-md bg-muted p-3 text-xs"
            >
              {embedCode}
            </pre>
            <button
              type="button"
              onClick={handleCopy}
              className="mt-2 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
            >
              {t('copy')}
            </button>
          </div>
        )}
      </div>

      {/* Right column: preview */}
      <div>
        <p className="text-sm font-medium">{t('previewLabel')}</p>
        <div className="mt-2 rounded-md border border-border">
          {debouncedIdentifier.trim() ? (
            <iframe
              src={`/embed/${encodeURIComponent(debouncedIdentifier)}`}
              title={t('previewTitle')}
              className="w-full rounded-md"
              style={{ height: `${iframeHeight}px` }}
            />
          ) : (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              {t('enterHandle')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
