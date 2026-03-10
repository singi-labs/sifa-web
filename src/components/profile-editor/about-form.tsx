'use client';

import type { FieldDef } from './edit-dialog';

export const ABOUT_FIELDS: FieldDef[] = [
  { name: 'headline', label: 'Headline', placeholder: 'What do you do?' },
  {
    name: 'about',
    label: 'About',
    type: 'textarea',
    placeholder: 'Tell your professional story...',
  },
  { name: 'location', label: 'Location', placeholder: 'City, Country' },
  { name: 'website', label: 'Website', type: 'url', placeholder: 'https://example.com' },
];

export function profileToAboutValues(profile: {
  headline?: string;
  about?: string;
  location?: string;
  website?: string;
}): Record<string, string | boolean> {
  return {
    headline: profile.headline ?? '',
    about: profile.about ?? '',
    location: profile.location ?? '',
    website: profile.website ?? '',
  };
}
