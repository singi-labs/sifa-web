import type {
  ProfileEducation,
  ProfileSkill,
  ProfileCertification,
  ProfileProject,
  ProfilePublication,
  ProfileVolunteering,
  ProfileHonor,
  ProfileLanguage,
  ProfileCourse,
  ExternalAccount,
} from '@/lib/types';

const optStr = (v: unknown): string | undefined => (v as string) || undefined;

// --- Education ---

export function educationToValues(item: ProfileEducation): Record<string, string | boolean> {
  return {
    institution: item.institution,
    degree: item.degree ?? '',
    fieldOfStudy: item.fieldOfStudy ?? '',
    startDate: item.startDate ?? '',
    endDate: item.endDate ?? '',
  };
}

export function valuesToEducation(
  values: Record<string, string | boolean>,
): Omit<ProfileEducation, 'rkey'> {
  return {
    institution: values.institution as string,
    degree: optStr(values.degree),
    fieldOfStudy: optStr(values.fieldOfStudy),
    startDate: optStr(values.startDate),
    endDate: optStr(values.endDate),
  };
}

// --- Skill ---

export function skillToValues(item: ProfileSkill): Record<string, string | boolean> {
  return {
    skillName: item.skillName,
    category: item.category ?? '',
  };
}

export function valuesToSkill(
  values: Record<string, string | boolean>,
): Omit<ProfileSkill, 'rkey' | 'endorsementCount'> {
  return {
    skillName: values.skillName as string,
    category: optStr(values.category),
  };
}

// --- Certification ---

export function certificationToValues(
  item: ProfileCertification,
): Record<string, string | boolean> {
  return {
    name: item.name,
    issuingOrg: item.issuingOrg,
    issueDate: item.issueDate ?? '',
    expiryDate: item.expiryDate ?? '',
    credentialUrl: item.credentialUrl ?? '',
  };
}

export function valuesToCertification(
  values: Record<string, string | boolean>,
): Omit<ProfileCertification, 'rkey'> {
  return {
    name: values.name as string,
    issuingOrg: values.issuingOrg as string,
    issueDate: optStr(values.issueDate),
    expiryDate: optStr(values.expiryDate),
    credentialUrl: optStr(values.credentialUrl),
  };
}

// --- Project ---

export function projectToValues(item: ProfileProject): Record<string, string | boolean> {
  return {
    name: item.name,
    description: item.description ?? '',
    url: item.url ?? '',
    startDate: item.startDate ?? '',
    endDate: item.endDate ?? '',
  };
}

export function valuesToProject(
  values: Record<string, string | boolean>,
): Omit<ProfileProject, 'rkey'> {
  return {
    name: values.name as string,
    description: optStr(values.description),
    url: optStr(values.url),
    startDate: optStr(values.startDate),
    endDate: optStr(values.endDate),
  };
}

// --- Publication ---

export function publicationToValues(item: ProfilePublication): Record<string, string | boolean> {
  return {
    title: item.title,
    publisher: item.publisher ?? '',
    date: item.date ?? '',
    url: item.url ?? '',
    description: item.description ?? '',
  };
}

export function valuesToPublication(
  values: Record<string, string | boolean>,
): Omit<ProfilePublication, 'rkey'> {
  return {
    title: values.title as string,
    publisher: optStr(values.publisher),
    date: optStr(values.date),
    url: optStr(values.url),
    description: optStr(values.description),
  };
}

// --- Volunteering ---

export function volunteeringToValues(
  item: ProfileVolunteering,
): Record<string, string | boolean> {
  return {
    organization: item.organization,
    role: item.role ?? '',
    cause: item.cause ?? '',
    startDate: item.startDate ?? '',
    endDate: item.endDate ?? '',
    description: item.description ?? '',
  };
}

export function valuesToVolunteering(
  values: Record<string, string | boolean>,
): Omit<ProfileVolunteering, 'rkey'> {
  return {
    organization: values.organization as string,
    role: optStr(values.role),
    cause: optStr(values.cause),
    startDate: optStr(values.startDate),
    endDate: optStr(values.endDate),
    description: optStr(values.description),
  };
}

// --- Honor ---

export function honorToValues(item: ProfileHonor): Record<string, string | boolean> {
  return {
    title: item.title,
    issuer: item.issuer ?? '',
    date: item.date ?? '',
    description: item.description ?? '',
  };
}

export function valuesToHonor(
  values: Record<string, string | boolean>,
): Omit<ProfileHonor, 'rkey'> {
  return {
    title: values.title as string,
    issuer: optStr(values.issuer),
    date: optStr(values.date),
    description: optStr(values.description),
  };
}

// --- Language ---

export function languageToValues(item: ProfileLanguage): Record<string, string | boolean> {
  return {
    language: item.language,
    proficiency: item.proficiency ?? '',
  };
}

export function valuesToLanguage(
  values: Record<string, string | boolean>,
): Omit<ProfileLanguage, 'rkey'> {
  return {
    language: values.language as string,
    proficiency: optStr(values.proficiency) as ProfileLanguage['proficiency'],
  };
}

// --- Course ---

export function courseToValues(item: ProfileCourse): Record<string, string | boolean> {
  return {
    name: item.name,
    institution: item.institution ?? '',
    number: item.number ?? '',
  };
}

export function valuesToCourse(
  values: Record<string, string | boolean>,
): Omit<ProfileCourse, 'rkey'> {
  return {
    name: values.name as string,
    institution: optStr(values.institution),
    number: optStr(values.number),
  };
}

// --- External Account ---

export function externalAccountToValues(
  item: ExternalAccount,
): Record<string, string | boolean> {
  return {
    platform: item.platform,
    url: item.url,
    label: item.label ?? '',
    feedUrl: item.feedUrl ?? '',
  };
}

export function valuesToExternalAccount(
  values: Record<string, string | boolean>,
): Omit<ExternalAccount, 'rkey' | 'verifiable' | 'verified' | 'verifiedVia'> {
  return {
    platform: values.platform as string,
    url: values.url as string,
    label: optStr(values.label),
    feedUrl: optStr(values.feedUrl),
  };
}
