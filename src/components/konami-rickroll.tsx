'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { useKonamiCode } from '@/hooks/use-konami-code';

const mobileQuery = '(max-width: 768px)';

function subscribeToMobile(callback: () => void) {
  const mq = window.matchMedia(mobileQuery);
  mq.addEventListener('change', callback);
  return () => mq.removeEventListener('change', callback);
}

function getIsMobile() {
  return window.matchMedia(mobileQuery).matches;
}

function useIsMobile() {
  return useSyncExternalStore(subscribeToMobile, getIsMobile, () => false);
}

export function KonamiRickroll() {
  const { activated, dismiss } = useKonamiCode();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!activated) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') dismiss();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activated, dismiss]);

  if (!activated) return null;

  const src = isMobile ? '/assets/e9a1c3f-m.mp4' : '/assets/e9a1c3f-d.mp4';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80">
      <div className="relative flex items-center justify-center w-full h-full px-4">
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 z-10"
          aria-label="Close"
        >
          &times;
        </button>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption -- easter egg, no captions needed */}
        <video className="max-h-[80vh] max-w-full rounded-lg" src={src} autoPlay controls />
      </div>
    </div>
  );
}
