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
  location?: string;
}

export function mapPositionsCsv(row: Record<string, string>): SifaPosition {
  const endDate = parseLinkedInDate(row['Finished On']);
  const startDate = parseLinkedInDate(row['Started On']);
  const current = startDate !== undefined && endDate === undefined ? true : undefined;

  return {
    companyName: row['Company Name']?.trim() ?? '',
    title: row['Title']?.trim() ?? '',
    description: optional(row['Description']),
    startDate,
    endDate,
    ...(current ? { current } : {}),
    location: optional(row['Location']),
  };
}

// ── Profile.csv → id.sifa.profile.self ────────────────────────────────

export interface SifaProfile {
  firstName?: string;
  lastName?: string;
  headline?: string;
  about?: string;
  location?: string;
}

export function mapProfileCsv(row: Record<string, string>): SifaProfile {
  return {
    firstName: optional(row['First Name']),
    lastName: optional(row['Last Name']),
    headline: optional(row['Headline']),
    about: optional(row['Summary']),
    location: optional(row['Geo Location']),
  };
}

// ── Education.csv → id.sifa.profile.education ─────────────────────────

export interface SifaEducation {
  institution: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
}

export function mapEducationCsv(row: Record<string, string>): SifaEducation {
  return {
    institution: row['School Name']?.trim() ?? '',
    degree: optional(row['Degree Name']),
    fieldOfStudy: optional(row['Notes']),
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
