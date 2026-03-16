'use client';

import { useEffect, useState } from 'react';

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
  const [position, setPosition] = useState(0);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const key = e.key;
      if (key === KONAMI_CODE[position]) {
        const next = position + 1;
        if (next === KONAMI_CODE.length) {
          setActivated(true);
          setPosition(0);
        } else {
          setPosition(next);
        }
      } else {
        setPosition(key === KONAMI_CODE[0] ? 1 : 0);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [position]);

  return { activated, dismiss: () => setActivated(false) };
}
