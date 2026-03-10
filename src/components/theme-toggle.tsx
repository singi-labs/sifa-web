'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from '@phosphor-icons/react';
import { useLayoutEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations('common');

  // Required for hydration mismatch prevention -- theme is unknown during SSR
  /* eslint-disable react-hooks/set-state-in-effect */
  useLayoutEffect(() => {
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!mounted) {
    return (
      <button
        className={cn(
          'inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground',
          className,
        )}
        disabled
        aria-hidden="true"
      >
        <span className="h-5 w-5" />
      </button>
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors',
        'hover:bg-accent hover:text-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className,
      )}
      aria-label={isDark ? t('switchToLight') : t('switchToDark')}
    >
      {isDark ? (
        <Sun className="h-5 w-5" weight="regular" aria-hidden="true" />
      ) : (
        <Moon className="h-5 w-5" weight="regular" aria-hidden="true" />
      )}
    </button>
  );
}
