'use client';

import { useCallback, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Copy, DownloadSimple } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/lib/analytics';

interface ConnectQRProps {
  handle: string;
  avatar?: string;
}

export function ConnectQR({ handle, avatar }: ConnectQRProps) {
  const t = useTranslations('connect');
  const qrRef = useRef<HTMLDivElement>(null);
  const profileUrl = `https://sifa.id/p/${handle}?connect=1`;
  const qrSize = 256;

  const handleCopyLink = useCallback(() => {
    trackEvent('connect-copy-link', { handle });
    void navigator.clipboard.writeText(profileUrl).then(() => {
      toast.success(t('linkCopied'));
    });
  }, [handle, profileUrl, t]);

  const handleDownloadQR = useCallback(() => {
    trackEvent('connect-download-qr', { handle });
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const canvas = document.createElement('canvas');
    const scale = 3;
    canvas.width = qrSize * scale;
    canvas.height = qrSize * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const link = document.createElement('a');
      link.download = `sifa-connect-${handle}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgData)}`;
  }, [handle, qrSize]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div ref={qrRef} className="rounded-2xl bg-white p-4">
        <QRCodeSVG
          value={profileUrl}
          size={qrSize}
          level="H"
          marginSize={0}
          imageSettings={
            avatar
              ? {
                  src: avatar,
                  height: 48,
                  width: 48,
                  excavate: true,
                }
              : undefined
          }
        />
      </div>

      <p className="text-center text-sm text-muted-foreground">{t('scanToConnect')}</p>

      <div className="flex gap-3">
        <Button variant="outline" size="sm" onClick={handleCopyLink}>
          <Copy className="mr-1.5 h-4 w-4" weight="bold" aria-hidden="true" />
          {t('copyLink')}
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownloadQR}>
          <DownloadSimple className="mr-1.5 h-4 w-4" weight="bold" aria-hidden="true" />
          {t('downloadQr')}
        </Button>
      </div>
    </div>
  );
}
