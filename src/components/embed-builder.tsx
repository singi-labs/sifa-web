'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/auth-provider';
import { toast } from 'sonner';

type Theme = 'auto' | 'light' | 'dark';

export function EmbedBuilder() {
  const t = useTranslations('embedBuilder');
  const { session } = useAuth();
  const [identifier, setIdentifier] = useState(session?.handle ?? '');
  const [theme, setTheme] = useState<Theme>('auto');

  const embedCode = useMemo(() => {
    if (!identifier.trim()) return '';

    const isDid = identifier.startsWith('did:');
    const dataAttr = isDid
      ? `data-did="${identifier}"`
      : `data-handle="${identifier}"`;
    const themeAttr = theme !== 'auto' ? ` data-theme="${theme}"` : '';

    return `<script src="https://sifa.id/embed.js" ${dataAttr}${themeAttr}></script>`;
  }, [identifier, theme]);

  const previewBg =
    theme === 'dark'
      ? '#1a1a2e'
      : theme === 'light'
        ? '#fff'
        : undefined;

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

        <fieldset>
          <legend className="text-sm font-medium">{t('themeLabel')}</legend>
          <div className="mt-2 flex gap-4">
            {(['auto', 'light', 'dark'] as const).map((value) => (
              <label key={value} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="embed-theme"
                  value={value}
                  checked={theme === value}
                  onChange={() => setTheme(value)}
                />
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </label>
            ))}
          </div>
        </fieldset>

        {identifier.trim() && (
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
        <div
          className="mt-2 min-h-[300px] rounded-md border border-border"
          style={previewBg ? { backgroundColor: previewBg } : undefined}
        >
          {identifier.trim() ? (
            <iframe
              src={`/embed/${encodeURIComponent(identifier)}?theme=${theme}`}
              title={t('previewTitle')}
              className="h-[300px] w-full rounded-md"
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
