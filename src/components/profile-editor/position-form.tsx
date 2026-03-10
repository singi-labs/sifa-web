'use client';

import type { FieldDef } from './edit-dialog';
import type { ProfilePosition } from '@/lib/types';

export const POSITION_FIELDS: FieldDef[] = [
  { name: 'title', label: 'Job Title', required: true, placeholder: 'Software Engineer' },
  { name: 'companyName', label: 'Company', required: true, placeholder: 'Acme Corp' },
  { name: 'startDate', label: 'Start Date', type: 'date', required: true },
  { name: 'endDate', label: 'End Date', type: 'date' },
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
    startDate: pos.startDate,
    endDate: pos.endDate ?? '',
    current: pos.current,
    location: pos.location ?? '',
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
    location: (values.location as string) || undefined,
    description: (values.description as string) || undefined,
  };
}
