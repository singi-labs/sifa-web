'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { processLinkedInExport, type ImportPreview } from '@/lib/import/orchestrator';
import { UploadStep } from './components/upload-step';
import { PreviewStep } from './components/preview-step';
import { ConfirmStep } from './components/confirm-step';

type Step = 'upload' | 'preview' | 'confirm';

export default function ImportPage() {
  const router = useRouter();
  const t = useTranslations('import');
  const [step, setStep] = useState<Step>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [confirmedPreview, setConfirmedPreview] = useState<ImportPreview | null>(null);

  const handleFileSelected = useCallback(async (file: File) => {
    setIsProcessing(true);
    try {
      const result = await processLinkedInExport(file);
      setPreview(result);
      setStep('preview');
    } catch {
      // If parsing fails, stay on upload step -- user can try another file
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleConfirm = useCallback((data: ImportPreview) => {
    setConfirmedPreview(data);
    setStep('confirm');
  }, []);

  const handleDone = useCallback(() => {
    router.push('/p/me');
  }, [router]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold">{t('title')}</h1>
      <p className="mb-8 text-muted-foreground">
        Bring your professional history to Sifa. Your data is processed entirely in your browser.
      </p>

      {/* Step indicator */}
      <div className="mb-8 flex items-center gap-2" aria-label="Import steps">
        {(['upload', 'preview', 'confirm'] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            {i > 0 && <div className="h-px w-8 bg-border" />}
            <div
              className={`flex size-8 items-center justify-center rounded-full text-sm font-medium ${
                step === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              {i + 1}
            </div>
            <span className="hidden text-sm sm:inline">
              {s === 'upload' && t('uploadStep')}
              {s === 'preview' && t('previewStep')}
              {s === 'confirm' && t('confirmStep')}
            </span>
          </div>
        ))}
      </div>

      {step === 'upload' && (
        <UploadStep onFileSelected={handleFileSelected} isProcessing={isProcessing} />
      )}

      {step === 'preview' && preview && (
        <PreviewStep preview={preview} onConfirm={handleConfirm} onBack={() => setStep('upload')} />
      )}

      {step === 'confirm' && confirmedPreview && (
        <ConfirmStep preview={confirmedPreview} onDone={handleDone} />
      )}
    </main>
  );
}
