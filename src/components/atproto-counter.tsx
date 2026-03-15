'use client';

import { useCallback, useEffect, useState } from 'react';

interface AtprotoCounterProps {
  userCount: number;
  growthPerSecond: number;
  timestamp: number;
  prefix: string;
  suffix: string;
  cta: string;
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

  useEffect(() => {
    if (growthPerSecond <= 0) return;

    const interval = setInterval(() => {
      setDisplayCount(interpolate());
    }, 1000);

    return () => clearInterval(interval);
  }, [growthPerSecond, interpolate]);

  const formatted = displayCount.toLocaleString('en-US');

  return (
    <div className="mt-6 max-w-lg text-center">
      <p className="text-sm text-muted-foreground">
        {prefix}{' '}
        <span className="font-mono text-base font-semibold tabular-nums text-foreground">
          {formatted}
        </span>{' '}
        {suffix}
      </p>
      <a
        href="/search"
        className="mt-1 inline-block text-sm font-medium text-primary hover:underline"
      >
        {cta}
      </a>
    </div>
  );
}
