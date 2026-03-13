'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Globe } from '@phosphor-icons/react';
import { getFaviconUrl } from '@/lib/platforms';

interface FaviconProps {
  url: string;
  size?: number;
  className?: string;
}

export function Favicon({ url, size = 20, className }: FaviconProps) {
  const [failed, setFailed] = useState(false);
  const faviconUrl = getFaviconUrl(url);

  if (!faviconUrl || failed) {
    return <Globe size={size} weight="regular" className={className} />;
  }

  return (
    <Image
      src={faviconUrl}
      alt=""
      width={size}
      height={size}
      className={className}
      onError={() => setFailed(true)}
      unoptimized
    />
  );
}
