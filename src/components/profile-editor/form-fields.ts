import type { FieldDef } from './edit-dialog';

export const EDUCATION_FIELDS: FieldDef[] = [
  { name: 'institution', label: 'Institution', required: true, placeholder: 'University name' },
  { name: 'degree', label: 'Degree', placeholder: 'BSc, MSc, PhD...' },
  { name: 'fieldOfStudy', label: 'Field of Study', placeholder: 'Computer Science' },
  { name: 'startDate', label: 'Start Date', type: 'date' },
  { name: 'endDate', label: 'End Date', type: 'date' },
];

export const SKILL_FIELDS: FieldDef[] = [
  { name: 'skillName', label: 'Skill', required: true, placeholder: 'TypeScript' },
  { name: 'category', label: 'Category', placeholder: 'Frontend, Backend, DevOps...' },
];

export const PROJECT_FIELDS: FieldDef[] = [
  { name: 'name', label: 'Project Name', required: true },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'url', label: 'URL', type: 'url' },
  { name: 'startDate', label: 'Start Date', type: 'date' },
  { name: 'endDate', label: 'End Date', type: 'date' },
];

export const CERTIFICATION_FIELDS: FieldDef[] = [
  { name: 'name', label: 'Certification Name', required: true },
  { name: 'issuingOrg', label: 'Issuing Organization', required: true },
  { name: 'issueDate', label: 'Issue Date', type: 'date' },
  { name: 'expiryDate', label: 'Expiry Date', type: 'date' },
  { name: 'credentialUrl', label: 'Credential URL', type: 'url' },
];

export const PUBLICATION_FIELDS: FieldDef[] = [
  { name: 'title', label: 'Title', required: true },
  { name: 'publisher', label: 'Publisher' },
  { name: 'date', label: 'Date', type: 'date' },
  { name: 'url', label: 'URL', type: 'url' },
  { name: 'description', label: 'Description', type: 'textarea' },
];

export const VOLUNTEERING_FIELDS: FieldDef[] = [
  { name: 'organization', label: 'Organization', required: true },
  { name: 'role', label: 'Role' },
  { name: 'cause', label: 'Cause' },
  { name: 'startDate', label: 'Start Date', type: 'date' },
  { name: 'endDate', label: 'End Date', type: 'date' },
  { name: 'description', label: 'Description', type: 'textarea' },
];

export const HONOR_FIELDS: FieldDef[] = [
  { name: 'title', label: 'Award Title', required: true },
  { name: 'issuer', label: 'Issuer' },
  { name: 'date', label: 'Date', type: 'date' },
  { name: 'description', label: 'Description', type: 'textarea' },
];

export const LANGUAGE_FIELDS: FieldDef[] = [
  { name: 'language', label: 'Language', required: true },
  {
    name: 'proficiency',
    label: 'Proficiency',
    placeholder: 'elementary, limited_working, professional_working, full_professional, native',
  },
];

export const COURSE_FIELDS: FieldDef[] = [
  { name: 'name', label: 'Course Name', required: true },
  { name: 'institution', label: 'Institution' },
  { name: 'number', label: 'Course Number' },
];
