'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface AtprotoCounterProps {
  userCount: number;
  growthPerSecond: number;
  timestamp: number;
  prefix: string;
  suffix: string;
  cta: string;
}

function nextPoissonDelay(ratePerSecond: number): number {
  const meanMs = 1000 / ratePerSecond;
  const delay = -Math.log(Math.random()) * meanMs;
  return Math.max(500, Math.min(delay, meanMs * 5));
}

export function AtprotoCounter({
  userCount,
  growthPerSecond,
  timestamp,
  prefix,
  suffix,
  cta,
}: AtprotoCounterProps) {
  const interpolate = useCallback(() => {
    if (growthPerSecond <= 0) return userCount;
    const elapsed = Date.now() / 1000 - timestamp;
    return Math.floor(userCount + elapsed * growthPerSecond);
  }, [userCount, growthPerSecond, timestamp]);

  const [displayCount, setDisplayCount] = useState(interpolate);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (growthPerSecond <= 0) return;

    function scheduleTick() {
      const delay = nextPoissonDelay(growthPerSecond);
      timeoutRef.current = setTimeout(() => {
        setDisplayCount((prev) => prev + 1);
        scheduleTick();
      }, delay);
    }

    scheduleTick();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [growthPerSecond]);

  const formatted = displayCount.toLocaleString('en-US');

  return (
    <div className="mt-6 max-w-lg text-center">
      <p className="text-sm text-muted-foreground">
        {prefix}{' '}
        <span className="text-base font-semibold tabular-nums text-foreground">
          {formatted}
        </span>{' '}
        {suffix}{' '}
        <a href="/search" className="font-medium text-primary hover:underline">
          {cta}
        </a>
      </p>
    </div>
  );
}
