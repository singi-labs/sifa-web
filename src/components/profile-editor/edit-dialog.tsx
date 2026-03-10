'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from '@phosphor-icons/react';

export interface FieldDef {
  name: string;
  label: string;
  type?: 'text' | 'textarea' | 'date' | 'url' | 'checkbox';
  required?: boolean;
  placeholder?: string;
}

interface EditDialogProps {
  title: string;
  fields: FieldDef[];
  initialValues?: Record<string, string | boolean>;
  onSave: (values: Record<string, string | boolean>) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
  saving?: boolean;
}

export function EditDialog({
  title,
  fields,
  initialValues = {},
  onSave,
  onCancel,
}: EditDialogProps) {
  const [values, setValues] = useState<Record<string, string | boolean>>(() => {
    const init: Record<string, string | boolean> = {};
    for (const f of fields) {
      init[f.name] = initialValues[f.name] ?? (f.type === 'checkbox' ? false : '');
    }
    return init;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const result = await onSave(values);
    setSaving(false);
    if (!result.success) {
      setError(result.error ?? 'Failed to save');
    }
  };

  const updateValue = (name: string, value: string | boolean) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-label={title}
      aria-modal="true"
    >
      <div className="mx-4 w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={onCancel}
            aria-label="Close"
          >
            <X className="h-4 w-4" weight="bold" aria-hidden="true" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              <label htmlFor={`edit-${field.name}`} className="mb-1 block text-sm font-medium">
                {field.label}
                {field.required && <span className="text-destructive"> *</span>}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  id={`edit-${field.name}`}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  rows={4}
                  value={values[field.name] as string}
                  onChange={(e) => updateValue(field.name, e.target.value)}
                  required={field.required}
                  placeholder={field.placeholder}
                />
              ) : field.type === 'checkbox' ? (
                <div className="flex items-center gap-2">
                  <input
                    id={`edit-${field.name}`}
                    type="checkbox"
                    className="h-4 w-4 rounded border-border"
                    checked={values[field.name] as boolean}
                    onChange={(e) => updateValue(field.name, e.target.checked)}
                  />
                  <span className="text-sm text-muted-foreground">{field.placeholder}</span>
                </div>
              ) : (
                <Input
                  id={`edit-${field.name}`}
                  type={field.type ?? 'text'}
                  value={values[field.name] as string}
                  onChange={(e) => updateValue(field.name, e.target.value)}
                  required={field.required}
                  placeholder={field.placeholder}
                />
              )}
            </div>
          ))}

          {error && (
            <p className="text-sm text-destructive" role="alert">{error}</p>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
