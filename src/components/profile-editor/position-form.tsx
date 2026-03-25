'use client';

import type { FieldDef } from './edit-dialog';
import type { ProfilePosition } from '@/lib/types';
import { formatLocation, parseLocationString } from '@/lib/location-utils';

/** Normalise a partial date to YYYY-MM for the month input. */
const toMonth = (v: string | undefined): string => {
  if (!v) return '';
  if (/^\d{4}$/.test(v)) return `${v}-01`;
  return v;
};

export const POSITION_FIELDS: FieldDef[] = [
  { name: 'title', label: 'Job Title', required: true, placeholder: 'Software Engineer' },
  { name: 'company', label: 'Company', required: true, placeholder: 'Acme Corp' },
  { name: 'startedAt', label: 'Start Date', type: 'month', required: true },
  { name: 'endedAt', label: 'End Date', type: 'month' },
  { name: 'location', label: 'Location', placeholder: 'Amsterdam, Netherlands' },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    placeholder: 'Describe your role...',
  },
];

export function positionToValues(pos: ProfilePosition): Record<string, string | boolean> {
  return {
    title: pos.title,
    company: pos.company,
    startedAt: toMonth(pos.startedAt),
    endedAt: toMonth(pos.endedAt),
    location: pos.location ? formatLocation(pos.location) : '',
    description: pos.description ?? '',
  };
}

export function valuesToPosition(
  values: Record<string, string | boolean>,
): Omit<ProfilePosition, 'rkey'> {
  return {
    title: values.title as string,
    company: values.company as string,
    startedAt: values.startedAt as string,
    endedAt: (values.endedAt as string) || undefined,
    location: (values.location as string)
      ? (parseLocationString(values.location as string) ?? undefined)
      : undefined,
    description: (values.description as string) || undefined,
  };
}
