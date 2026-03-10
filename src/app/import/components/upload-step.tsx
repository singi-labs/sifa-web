'use client';

import { useCallback, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload } from '@phosphor-icons/react';

interface UploadStepProps {
  onFileSelected: (file: File) => void;
  isProcessing: boolean;
}

export function UploadStep({ onFileSelected, isProcessing }: UploadStepProps) {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      setFileError(null);
      if (!file.name.endsWith('.zip')) {
        setFileError(
          'Please select a ZIP file (.zip). LinkedIn exports are delivered as ZIP archives.',
        );
        return;
      }
      if (file.size > 500 * 1024 * 1024) {
        setFileError('File is too large (max 500 MB). Try re-downloading your LinkedIn export.');
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
        <CardTitle>Upload your LinkedIn data export</CardTitle>
        <CardDescription>
          Go to LinkedIn &gt; Settings &gt; Data Privacy &gt; &quot;Download larger data
          archive&quot;. Upload the ZIP file you receive (batch 1 arrives in ~10 minutes).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          role="button"
          tabIndex={0}
          aria-label="Drop zone for LinkedIn ZIP file"
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
              Drag and drop your LinkedIn ZIP file here, or click to browse
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
            <p className="mt-4 text-sm text-muted-foreground">Processing ZIP file...</p>
          )}
          {fileError && (
            <p className="mt-4 text-sm text-destructive" role="alert">
              {fileError}
            </p>
          )}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Your data is processed entirely in your browser. No raw CSV data is sent to our servers.
        </p>
      </CardContent>
    </Card>
  );
}
