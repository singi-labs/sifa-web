'use client';

import { useEffect, useState } from 'react';

interface AtprotoCounterProps {
  userCount: number;
  growthPerSecond: number;
  timestamp: number;
  label: string;
  cta: string;
}

export function AtprotoCounter({
  userCount,
  growthPerSecond,
  timestamp,
  label,
  cta,
}: AtprotoCounterProps) {
  const [displayCount, setDisplayCount] = useState(userCount);

  useEffect(() => {
    if (growthPerSecond <= 0) return;

    // Set initial interpolated value immediately
    const elapsed = Date.now() / 1000 - timestamp;
    setDisplayCount(Math.floor(userCount + elapsed * growthPerSecond));

    const interval = setInterval(() => {
      const now = Date.now() / 1000 - timestamp;
      setDisplayCount(Math.floor(userCount + now * growthPerSecond));
    }, 1000);

    return () => clearInterval(interval);
  }, [userCount, growthPerSecond, timestamp]);

  const formatted = displayCount.toLocaleString('en-US');

  return (
    <div className="mt-6 max-w-lg text-center">
      <p className="text-sm text-muted-foreground">
        <span className="font-mono text-base font-semibold tabular-nums text-foreground">
          {formatted}
        </span>{' '}
        {label}
      </p>
      <a
        href="/import"
        className="mt-1 inline-block text-sm font-medium text-primary hover:underline"
      >
        {cta}
      </a>
    </div>
  );
}
