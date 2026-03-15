'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';

interface EmbedThemeForcerProps {
  theme: string;
}

export function EmbedThemeForcer({ theme }: EmbedThemeForcerProps) {
  const { setTheme } = useTheme();

  useEffect(() => {
    if (theme === 'dark' || theme === 'light') {
      setTheme(theme);
    } else {
      setTheme('system');
    }
  }, [theme, setTheme]);

  return null;
}
