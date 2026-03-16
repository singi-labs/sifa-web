'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
];

export function useKonamiCode() {
  const [activated, setActivated] = useState(false);
  const positionRef = useRef(0);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === KONAMI_CODE[positionRef.current]) {
        const next = positionRef.current + 1;
        if (next === KONAMI_CODE.length) {
          setActivated(true);
          positionRef.current = 0;
        } else {
          positionRef.current = next;
        }
      } else {
        positionRef.current = key === KONAMI_CODE[0] ? 1 : 0;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const dismiss = useCallback(() => setActivated(false), []);

  return { activated, dismiss };
}
