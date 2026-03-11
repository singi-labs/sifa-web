'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { processLinkedInExport, type ImportPreview } from '@/lib/import/orchestrator';
import { useAuth } from '@/components/auth-provider';
import { fetchProfile } from '@/lib/api';
import { UploadStep } from './components/upload-step';
import { PreviewStep } from './components/preview-step';
import { ConfirmStep } from './components/confirm-step';

export interface ExistingProfileData {
  positions: Array<{ companyName: string; title: string; startDate?: string }>;
  education: Array<{ institution: string; degree?: string | null }>;
  skills: Array<{ skillName: string }>;
}

type Step = 'upload' | 'preview' | 'confirm';

export default function ImportPage() {
  const router = useRouter();
  const t = useTranslations('import');
  const tAuth = useTranslations('auth');
  const { session, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !session) {
      toast(tAuth('loginRequired'), {
        description: tAuth('loginRequiredImport'),
      });
      router.replace(`/login?returnTo=/import`);
    }
  }, [isLoading, session, router, tAuth]);
  const [step, setStep] = useState<Step>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [confirmedPreview, setConfirmedPreview] = useState<ImportPreview | null>(null);
  const [existingData, setExistingData] = useState<ExistingProfileData | null>(null);

  useEffect(() => {
    if (!session?.did) return;
    fetchProfile(session.did).then((profile) => {
      if (!profile) return;
      const pos = (profile.positions as ExistingProfileData['positions']) ?? [];
      const edu = (profile.education as ExistingProfileData['education']) ?? [];
      const sk = (profile.skills as ExistingProfileData['skills']) ?? [];
      if (pos.length > 0 || edu.length > 0 || sk.length > 0) {
        setExistingData({ positions: pos, education: edu, skills: sk });
      }
    });
  }, [session?.did]);

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
    router.push(session?.handle ? `/p/${session.handle}` : '/');
  }, [router, session]);

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
        <PreviewStep
          preview={preview}
          existingData={existingData}
          onConfirm={handleConfirm}
          onBack={() => setStep('upload')}
        />
      )}

      {step === 'confirm' && confirmedPreview && (
        <ConfirmStep preview={confirmedPreview} onDone={handleDone} />
      )}
    </main>
  );
}
