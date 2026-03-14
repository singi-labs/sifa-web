'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { resetProfile, deleteAccount } from '@/lib/profile-api';

interface ConfirmActionProps {
  handle: string;
  title: string;
  description: string;
  buttonLabel: string;
  placeholder: string;
  inputLabel: string;
  onConfirm: () => Promise<void>;
  variant: 'reset' | 'delete';
}

function ConfirmAction({
  handle,
  title,
  description,
  buttonLabel,
  placeholder,
  inputLabel,
  onConfirm,
  variant,
}: ConfirmActionProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const matches = input.toLowerCase() === handle.toLowerCase();

  async function handleSubmit() {
    if (!matches) return;
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-2">
        <label htmlFor={`confirm-${variant}`} className="text-sm font-medium">
          {inputLabel}
        </label>
        <input
          id={`confirm-${variant}`}
          type="text"
          className="w-full text-sm rounded-md border border-border bg-background px-3 py-2"
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>
      <button
        type="button"
        disabled={!matches || loading}
        onClick={handleSubmit}
        className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground disabled:opacity-50"
      >
        {loading ? '...' : buttonLabel}
      </button>
    </div>
  );
}

interface DangerZoneProps {
  handle: string;
}

export function DangerZone({ handle }: DangerZoneProps) {
  const t = useTranslations('dangerZone');
  const router = useRouter();

  async function handleReset() {
    const result = await resetProfile();
    if (result.success) {
      toast.success(t('resetSuccess'));
      router.push('/import');
    } else {
      toast.error(t('error'));
    }
  }

  async function handleDelete() {
    const result = await deleteAccount();
    if (result.success) {
      router.push(`/p/${handle}?deleted=1`);
    } else {
      toast.error(t('error'));
    }
  }

  return (
    <section className="rounded-lg border border-destructive/50 p-6">
      <h2 className="mb-4 text-lg font-semibold text-destructive">{t('title')}</h2>

      <ConfirmAction
        handle={handle}
        title={t('resetTitle')}
        description={t('resetDescription')}
        buttonLabel={t('resetButton')}
        placeholder={t('handlePlaceholder')}
        inputLabel={t('handleConfirmLabel')}
        onConfirm={handleReset}
        variant="reset"
      />

      <hr className="my-6 border-border" />

      <ConfirmAction
        handle={handle}
        title={t('deleteTitle')}
        description={t('deleteDescription')}
        buttonLabel={t('deleteButton')}
        placeholder={t('handlePlaceholder')}
        inputLabel={t('handleConfirmLabel')}
        onConfirm={handleDelete}
        variant="delete"
      />
    </section>
  );
}
