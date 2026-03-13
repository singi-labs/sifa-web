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
  { name: 'companyName', label: 'Company', required: true, placeholder: 'Acme Corp' },
  { name: 'startDate', label: 'Start Date', type: 'month', required: true },
  { name: 'endDate', label: 'End Date', type: 'month' },
  {
    name: 'current',
    label: 'Current Position',
    type: 'checkbox',
    placeholder: 'I currently work here',
  },
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
    companyName: pos.companyName,
    startDate: toMonth(pos.startDate),
    endDate: toMonth(pos.endDate),
    current: pos.current,
    location: pos.location ? formatLocation(pos.location) : '',
    description: pos.description ?? '',
  };
}

export function valuesToPosition(
  values: Record<string, string | boolean>,
): Omit<ProfilePosition, 'rkey'> {
  return {
    title: values.title as string,
    companyName: values.companyName as string,
    startDate: values.startDate as string,
    endDate: (values.endDate as string) || undefined,
    current: values.current as boolean,
    location: (values.location as string)
      ? parseLocationString(values.location as string) ?? undefined
      : undefined,
    description: (values.description as string) || undefined,
  };
}
