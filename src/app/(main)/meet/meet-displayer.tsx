'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/components/auth-provider';
import { HandshakeQR } from '@/components/handshake-qr';

export function MeetDisplayer() {
  const { session, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !session) {
      window.location.href = '/login?returnTo=/meet';
    }
  }, [isLoading, session]);

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center bg-gray-900">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const label = session.displayName ?? session.handle;

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center bg-gray-900 px-4 py-12">
      <div className="flex flex-col items-center gap-6">
        {/* Identity */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-white/10 text-xl font-semibold text-white/70">
            {session.avatar ? (
              <Image
                src={session.avatar}
                alt=""
                width={64}
                height={64}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <span aria-hidden="true">{label.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="text-center">
            <h1 className="text-lg font-semibold text-white">{label}</h1>
            <p className="text-sm text-white/60">@{session.handle}</p>
          </div>
        </div>

        {/* QR */}
        <HandshakeQR handle={session.handle} avatar={session.avatar} />
      </div>
    </div>
  );
}
