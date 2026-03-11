'use client';

import { useCallback, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload } from '@phosphor-icons/react';

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

  const handleFile = useCallback(
    (file: File) => {
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
    },
    [onFileSelected],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragActive(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('heading')}</CardTitle>
        <CardDescription>
          {t('description')}
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
            <p className="text-sm text-muted-foreground">
              {t('dropZone')}
            </p>
          )}
          <input
            ref={inputRef}
            type="file"
            accept=".zip"
            className="hidden"
            onChange={handleInputChange}
            data-testid="file-input"
          />
          {isProcessing && (
            <p className="mt-4 text-sm text-muted-foreground">{t('processing')}</p>
          )}
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
        <p className="mt-4 text-xs text-muted-foreground">
          {t('privacyNote')}
        </p>
      </CardContent>
    </Card>
  );
}
