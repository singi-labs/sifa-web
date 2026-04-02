import type { FieldDef } from './edit-dialog';
import { PLATFORM_OPTIONS } from '@/lib/platforms';

export const EDUCATION_FIELDS: FieldDef[] = [
  { name: 'institution', label: 'Institution', required: true, placeholder: 'University name' },
  { name: 'degree', label: 'Degree', placeholder: 'BSc, MSc, PhD...' },
  { name: 'fieldOfStudy', label: 'Field of Study', placeholder: 'Computer Science' },
  { name: 'startedAt', label: 'Start Date', type: 'month' },
  { name: 'endedAt', label: 'End Date', type: 'month' },
];

export const SKILL_FIELDS: FieldDef[] = [
  { name: 'name', label: 'Skill', required: true, placeholder: 'TypeScript' },
  { name: 'category', label: 'Category', placeholder: 'Frontend, Backend, DevOps...' },
];

export const PROJECT_FIELDS: FieldDef[] = [
  { name: 'name', label: 'Project Name', required: true },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'url', label: 'URL', type: 'url' },
  { name: 'startDate', label: 'Start Date', type: 'month' },
  { name: 'endDate', label: 'End Date', type: 'month' },
];

export const CERTIFICATION_FIELDS: FieldDef[] = [
  { name: 'name', label: 'Certification Name', required: true },
  { name: 'issuingOrg', label: 'Issuing Organization', required: true },
  { name: 'issueDate', label: 'Issue Date', type: 'month' },
  { name: 'expiryDate', label: 'Expiry Date', type: 'month' },
  { name: 'credentialUrl', label: 'Credential URL', type: 'url' },
];

export const PUBLICATION_FIELDS: FieldDef[] = [
  { name: 'title', label: 'Title', required: true },
  { name: 'publisher', label: 'Publisher' },
  { name: 'date', label: 'Date', type: 'month' },
  { name: 'url', label: 'URL', type: 'url' },
  { name: 'description', label: 'Description', type: 'textarea' },
];

export const VOLUNTEERING_FIELDS: FieldDef[] = [
  { name: 'organization', label: 'Organization', required: true },
  { name: 'role', label: 'Role' },
  { name: 'cause', label: 'Cause' },
  { name: 'startDate', label: 'Start Date', type: 'month' },
  { name: 'endDate', label: 'End Date', type: 'month' },
  { name: 'description', label: 'Description', type: 'textarea' },
];

export const HONOR_FIELDS: FieldDef[] = [
  { name: 'title', label: 'Award Title', required: true },
  { name: 'issuer', label: 'Issuer' },
  { name: 'date', label: 'Date', type: 'month' },
  { name: 'description', label: 'Description', type: 'textarea' },
];

export const LANGUAGE_FIELDS: FieldDef[] = [
  { name: 'language', label: 'Language', required: true },
  {
    name: 'proficiency',
    label: 'Proficiency',
    type: 'select',
    placeholder: 'Select proficiency...',
    options: [
      { value: 'elementary', label: 'Elementary' },
      { value: 'limited_working', label: 'Limited Working' },
      { value: 'professional_working', label: 'Professional Working' },
      { value: 'full_professional', label: 'Full Professional' },
      { value: 'native', label: 'Native or Bilingual' },
    ],
  },
];

export const COURSE_FIELDS: FieldDef[] = [
  { name: 'name', label: 'Course Name', required: true },
  { name: 'institution', label: 'Institution' },
  { name: 'number', label: 'Course Number' },
];

export function getExternalAccountFields(
  handle: string,
  tSections: (key: string, params?: Record<string, string>) => string,
): FieldDef[] {
  return [
    {
      name: 'platform',
      label: 'Platform',
      type: 'select',
      required: true,
      placeholder: 'Select a platform...',
      options: PLATFORM_OPTIONS,
    },
    { name: 'url', label: 'URL', type: 'url', required: true },
    { name: 'label', label: 'Label', placeholder: 'My Blog, Photography...' },
    {
      name: 'feedUrl',
      label: 'RSS / Atom Feed URL',
      type: 'url',
      placeholder: 'https://example.com/feed.xml',
      description:
        'Used to show your posts in the ATmosphere Stream. Leave empty for auto-detection.',
      visibleWhen: (values) => values.platform === 'website',
    },
    {
      name: 'verifyHintGithub',
      label: 'Verification',
      type: 'hint',
      description: tSections('verifyHintGithub'),
      hintUrl: `https://sifa.id/p/${handle}`,
      hintActionUrl: 'https://github.com/settings/',
      hintActionLabel: 'Open GitHub profile settings',
      visibleWhen: (values) => values.platform === 'github',
    },
    {
      name: 'verifyHintWebsite',
      label: 'Verification',
      type: 'hint',
      description: tSections('verifyHintWebsite'),
      hintUrl: `https://sifa.id/p/${handle}`,
      hintSnippet: `<link rel="me" href="https://sifa.id/p/${handle}">`,
      visibleWhen: (values) => values.platform === 'website',
    },
    {
      name: 'verifyHintFediverse',
      label: 'Verification',
      type: 'hint',
      description: tSections('verifyHintFediverse'),
      hintUrl: `https://sifa.id/p/${handle}`,
      visibleWhen: (values) => values.platform === 'fediverse',
    },
    {
      name: 'verifyHintRss',
      label: 'Verification',
      type: 'hint',
      description: tSections('verifyHintRss'),
      hintUrl: `https://sifa.id/p/${handle}`,
      visibleWhen: (values) => values.platform === 'rss',
    },
    {
      name: 'verifyHintOrcid',
      label: 'Verification & Publications',
      type: 'hint',
      description: tSections('verifyHintOrcid'),
      hintUrl: `https://sifa.id/p/${handle}`,
      hintActionUrl: 'https://orcid.org/my-orcid',
      hintActionLabel: 'Open ORCID profile',
      visibleWhen: (values) => values.platform === 'orcid',
    },
  ];
}

export const EXTERNAL_ACCOUNT_FIELDS = getExternalAccountFields('', (k) => k);
