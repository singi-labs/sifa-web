'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Upload, Eye, Info } from '@phosphor-icons/react';

interface UploadStepProps {
  onFileSelected: (file: File) => void;
  isProcessing: boolean;
  extractionError?: string | null;
}

export function UploadStep({ onFileSelected, isProcessing, extractionError }: UploadStepProps) {
  const t = useTranslations('import.upload');
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setFileError(null);
    if (!file.name.endsWith('.zip')) {
      setFileError(t('fileTypeError'));
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      setFileError(t('fileSizeError'));
      return;
    }
    setFileName(file.name);
    onFileSelected(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('heading')}</CardTitle>
        <CardDescription>
          {t('descriptionPrefix')}
          <a
            href="https://www.linkedin.com/mypreferences/d/download-my-data"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground"
          >
            {t('descriptionLinkText')}
          </a>
          {t('descriptionMiddle')}
          <Dialog>
            <DialogTrigger className="ml-1 inline-flex translate-y-0.5 cursor-pointer text-muted-foreground hover:text-foreground">
              <Info className="size-4" weight="fill" aria-hidden="true" />
              <span className="sr-only">{t('screenshotCaption')}</span>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{t('screenshotCaption')}</DialogTitle>
              </DialogHeader>
              <Image
                src="/assets/linkedin-download-data.png"
                alt={t('screenshotAlt')}
                width={800}
                height={500}
                className="rounded-lg border"
              />
            </DialogContent>
          </Dialog>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          role="button"
          tabIndex={0}
          aria-label={t('dropZoneLabel')}
          className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors ${
            dragActive ? 'border-primary bg-primary/5' : 'border-border'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
        >
          <Upload className="mb-4 size-10 text-muted-foreground" />
          {fileName ? (
            <p className="text-sm font-medium">{fileName}</p>
          ) : (
            <p className="text-sm text-muted-foreground">{t('dropZone')}</p>
          )}
          <input
            ref={inputRef}
            type="file"
            accept=".zip"
            className="hidden"
            onChange={handleInputChange}
            data-testid="file-input"
          />
          {isProcessing && <p className="mt-4 text-sm text-muted-foreground">{t('processing')}</p>}
          {fileError && (
            <p className="mt-4 text-sm text-destructive" role="alert">
              {fileError}
            </p>
          )}
          {extractionError && (
            <p className="mt-4 text-sm text-destructive" role="alert">
              {extractionError}
            </p>
          )}
        </div>
        <div
          className="mt-4 flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30"
          role="note"
        >
          <Eye
            className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400"
            weight="fill"
            aria-hidden="true"
          />
          <p className="text-sm text-amber-800 dark:text-amber-300">{t('publicDataNotice')}</p>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{t('privacyNote')}</p>
      </CardContent>
    </Card>
  );
}
