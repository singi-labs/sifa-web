import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useKonamiCode } from '@/hooks/use-konami-code';

function pressKey(key: string) {
  window.dispatchEvent(new KeyboardEvent('keydown', { key }));
}

const KONAMI_SEQUENCE = [
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

describe('useKonamiCode', () => {
  it('starts not activated', () => {
    const { result } = renderHook(() => useKonamiCode());
    expect(result.current.activated).toBe(false);
  });

  it('activates after full Konami Code sequence', () => {
    const { result } = renderHook(() => useKonamiCode());

    act(() => {
      for (const key of KONAMI_SEQUENCE) {
        pressKey(key);
      }
    });

    expect(result.current.activated).toBe(true);
  });

  it('does not activate on partial sequence', () => {
    const { result } = renderHook(() => useKonamiCode());

    act(() => {
      pressKey('ArrowUp');
      pressKey('ArrowUp');
      pressKey('ArrowDown');
    });

    expect(result.current.activated).toBe(false);
  });

  it('resets on wrong key', () => {
    const { result } = renderHook(() => useKonamiCode());

    act(() => {
      pressKey('ArrowUp');
      pressKey('ArrowUp');
      pressKey('ArrowDown');
      pressKey('x'); // wrong key
    });

    expect(result.current.activated).toBe(false);

    // Should need full sequence again
    act(() => {
      for (const key of KONAMI_SEQUENCE) {
        pressKey(key);
      }
    });

    expect(result.current.activated).toBe(true);
  });

  it('works with uppercase B and A (Caps Lock)', () => {
    const { result } = renderHook(() => useKonamiCode());

    act(() => {
      for (const key of KONAMI_SEQUENCE.slice(0, 8)) {
        pressKey(key);
      }
      pressKey('B');
      pressKey('A');
    });

    expect(result.current.activated).toBe(true);
  });

  it('dismiss resets activated state', () => {
    const { result } = renderHook(() => useKonamiCode());

    act(() => {
      for (const key of KONAMI_SEQUENCE) {
        pressKey(key);
      }
    });

    expect(result.current.activated).toBe(true);

    act(() => {
      result.current.dismiss();
    });

    expect(result.current.activated).toBe(false);
  });
});
