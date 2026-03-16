'use client';

import { useEffect } from 'react';
import { useKonamiCode } from '@/hooks/use-konami-code';

export function KonamiRickroll() {
  const { activated, dismiss } = useKonamiCode();

  useEffect(() => {
    if (!activated) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') dismiss();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activated, dismiss]);

  if (!activated) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80">
      <div className="relative w-full max-w-2xl px-4">
        <button
          onClick={dismiss}
          className="absolute -top-10 right-4 text-white text-2xl hover:text-gray-300"
          aria-label="Close"
        >
          &times;
        </button>
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            className="absolute inset-0 h-full w-full rounded-lg"
            src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1"
            title="Never Gonna Give You Up"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
