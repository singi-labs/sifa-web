import type { LocationValue } from '@/lib/types';
import { parseLocationString } from '@/lib/location-utils';
import { restoreLineBreaks } from './restore-line-breaks';

const MONTHS: Record<string, string> = {
  Jan: '01',
  Feb: '02',
  Mar: '03',
  Apr: '04',
  May: '05',
  Jun: '06',
  Jul: '07',
  Aug: '08',
  Sep: '09',
  Oct: '10',
  Nov: '11',
  Dec: '12',
};

/**
 * Parse LinkedIn date format ("Mon YYYY" or "YYYY") to ISO partial date ("YYYY-MM" or "YYYY").
 * Returns undefined for empty/unrecognised input.
 */
export function parseLinkedInDate(dateStr: string | undefined): string | undefined {
  if (!dateStr?.trim()) return undefined;
  const parts = dateStr.trim().split(' ');
  if (parts.length === 2) {
    const month = MONTHS[parts[0]!];
    if (month) return `${parts[1]}-${month}`;
  }
  if (parts.length === 1 && /^\d{4}$/.test(parts[0]!)) {
    return parts[0];
  }
  return undefined;
}

/** Return trimmed string or undefined if empty/missing. */
function optional(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

// ── Positions.csv → id.sifa.profile.position ──────────────────────────

export interface SifaPosition {
  companyName: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  location?: LocationValue;
}

export function mapPositionsCsv(row: Record<string, string>): SifaPosition {
  const endDate = parseLinkedInDate(row['Finished On']);
  const startDate = parseLinkedInDate(row['Started On']);
  const current = startDate !== undefined && endDate === undefined ? true : undefined;

  return {
    companyName: row['Company Name']?.trim() ?? '',
    title: row['Title']?.trim() ?? '',
    description: restoreLineBreaks(optional(row['Description'])),
    startDate,
    endDate,
    ...(current ? { current } : {}),
    location: row['Location'] ? parseLocationString(row['Location']) ?? undefined : undefined,
  };
}

// ── Profile.csv → id.sifa.profile.self ────────────────────────────────

export interface SifaProfile {
  firstName?: string;
  lastName?: string;
  headline?: string;
  about?: string;
  location?: LocationValue;
}

export function mapProfileCsv(row: Record<string, string>): SifaProfile {
  return {
    firstName: optional(row['First Name']),
    lastName: optional(row['Last Name']),
    headline: optional(row['Headline']),
    about: restoreLineBreaks(optional(row['Summary'])),
    location: row['Geo Location'] ? parseLocationString(row['Geo Location']) ?? undefined : undefined,
  };
}

// ── Education.csv → id.sifa.profile.education ─────────────────────────

export interface SifaEducation {
  institution: string;
  degree?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export function mapEducationCsv(row: Record<string, string>): SifaEducation {
  return {
    institution: row['School Name']?.trim() ?? '',
    degree: optional(row['Degree Name']),
    description: restoreLineBreaks(optional(row['Notes'])),
    startDate: parseLinkedInDate(row['Start Date']),
    endDate: parseLinkedInDate(row['End Date']),
  };
}

// ── Skills.csv → id.sifa.profile.skill ────────────────────────────────

export interface SifaSkill {
  skillName: string;
}

export function mapSkillsCsv(row: Record<string, string>): SifaSkill {
  return {
    skillName: row['Name']?.trim() ?? '',
  };
}

// ── Certifications.csv → id.sifa.profile.certification ──────────────

export interface SifaCertification {
  name: string;
  authority?: string;
  credentialUrl?: string;
  credentialId?: string;
  issuedAt?: string;
}

export function mapCertificationsCsv(row: Record<string, string>): SifaCertification {
  return {
    name: row['Name']?.trim() ?? '',
    authority: optional(row['Authority']),
    credentialUrl: optional(row['Url']),
    credentialId: optional(row['License Number']),
    issuedAt: parseLinkedInDate(row['Started On']),
  };
}

// ── Projects.csv → id.sifa.profile.project ──────────────────────────

export interface SifaProject {
  name: string;
  description?: string;
  url?: string;
  startDate?: string;
  endDate?: string;
}

export function mapProjectsCsv(row: Record<string, string>): SifaProject {
  return {
    name: row['Title']?.trim() ?? '',
    description: restoreLineBreaks(optional(row['Description'])),
    url: optional(row['Url']),
    startDate: parseLinkedInDate(row['Started On']),
    endDate: parseLinkedInDate(row['Finished On']),
  };
}

// ── Volunteering.csv → id.sifa.profile.volunteering ─────────────────

export interface SifaVolunteering {
  organization: string;
  role?: string;
  cause?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export function mapVolunteeringCsv(row: Record<string, string>): SifaVolunteering {
  return {
    organization: row['Company Name']?.trim() ?? '',
    role: optional(row['Role']),
    cause: optional(row['Cause']),
    description: restoreLineBreaks(optional(row['Description'])),
    startDate: parseLinkedInDate(row['Started On']),
    endDate: parseLinkedInDate(row['Finished On']),
  };
}

// ── Publications.csv → id.sifa.profile.publication ──────────────────

export interface SifaPublication {
  title: string;
  publisher?: string;
  url?: string;
  description?: string;
  publishedAt?: string;
}

/**
 * Parse LinkedIn publication date format ("Mon D, YYYY" or "Mon YYYY") to ISO partial date.
 * Falls back to parseLinkedInDate for "Mon YYYY" / "YYYY" formats.
 * Returns undefined for empty/unrecognised input.
 */
function parsePublicationDate(dateStr: string | undefined): string | undefined {
  if (!dateStr?.trim()) return undefined;
  const trimmed = dateStr.trim();

  // "Mon D, YYYY" format (e.g. "Aug 1, 2011")
  const longMatch = trimmed.match(/^(\w{3})\s+\d{1,2},\s+(\d{4})$/);
  if (longMatch) {
    const month = MONTHS[longMatch[1]!];
    if (month) return `${longMatch[2]}-${month}`;
  }

  // Fall back to standard LinkedIn date parsing ("Mon YYYY" or "YYYY")
  return parseLinkedInDate(trimmed);
}

export function mapPublicationsCsv(row: Record<string, string>): SifaPublication {
  return {
    title: row['Name']?.trim() ?? '',
    publisher: optional(row['Publisher']),
    url: optional(row['Url']),
    description: restoreLineBreaks(optional(row['Description'])),
    publishedAt: parsePublicationDate(row['Published On']),
  };
}

// ── Courses.csv → id.sifa.profile.course ────────────────────────────

export interface SifaCourse {
  name: string;
  number?: string;
}

export function mapCoursesCsv(row: Record<string, string>): SifaCourse {
  return {
    name: row['Name']?.trim() ?? '',
    number: optional(row['Number']),
  };
}

// ── Honors.csv → id.sifa.profile.honor ──────────────────────────────

export interface SifaHonor {
  title: string;
  description?: string;
  awardedAt?: string;
}

export function mapHonorsCsv(row: Record<string, string>): SifaHonor {
  return {
    title: row['Title']?.trim() ?? '',
    description: restoreLineBreaks(optional(row['Description'])),
    awardedAt: parseLinkedInDate(row['Issued On']),
  };
}

// ── Languages.csv → id.sifa.profile.language ────────────────────────

export interface SifaLanguage {
  name: string;
  proficiency?: string;
}

const PROFICIENCY_MAP: Record<string, string> = {
  'Native or bilingual proficiency': 'native',
  'Full professional proficiency': 'full_professional',
  'Professional working proficiency': 'professional_working',
  'Limited working proficiency': 'limited_working',
  'Elementary proficiency': 'elementary',
};

export function mapLanguagesCsv(row: Record<string, string>): SifaLanguage {
  const rawProficiency = row['Proficiency']?.trim();
  return {
    name: row['Name']?.trim() ?? '',
    proficiency: rawProficiency ? PROFICIENCY_MAP[rawProficiency] : undefined,
  };
}
