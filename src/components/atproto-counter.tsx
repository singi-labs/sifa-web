'use client';

import { useEffect, useRef, useState } from 'react';

interface AtprotoCounterProps {
  userCount: number;
  growthPerSecond: number;
  timestamp: number;
  prefix: string;
  suffix: string;
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
}: AtprotoCounterProps) {
  const [displayCount, setDisplayCount] = useState(userCount);
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

    // Catch up to current time, then start ticking
    timeoutRef.current = setTimeout(() => {
      const elapsed = Date.now() / 1000 - timestamp;
      setDisplayCount(Math.floor(userCount + elapsed * growthPerSecond));
      scheduleTick();
    }, 0);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [userCount, growthPerSecond, timestamp]);

  const formatted = displayCount.toLocaleString('en-US');

  return (
    <div className="mt-6 max-w-xl text-center">
      <p className="text-sm text-muted-foreground">
        {prefix}{' '}
        <span className="text-base font-semibold tabular-nums text-foreground">{formatted}</span>{' '}
        {suffix}
      </p>
    </div>
  );
}
