import { parseCsv } from './csv-parser';
import {
  mapProfileCsv,
  mapPositionsCsv,
  mapEducationCsv,
  mapSkillsCsv,
  mapCertificationsCsv,
  mapProjectsCsv,
  mapVolunteeringCsv,
  mapPublicationsCsv,
  mapCoursesCsv,
  mapHonorsCsv,
  mapLanguagesCsv,
  type SifaProfile,
  type SifaPosition,
  type SifaEducation,
  type SifaSkill,
  type SifaCertification,
  type SifaProject,
  type SifaVolunteering,
  type SifaPublication,
  type SifaCourse,
  type SifaHonor,
  type SifaLanguage,
} from './field-mapper';
import { extractLinkedInZip, type LanguageOption } from './zip-extractor';

export type { LanguageOption } from './zip-extractor';

export interface ImportPreview {
  profile: SifaProfile | null;
  positions: SifaPosition[];
  education: SifaEducation[];
  skills: SifaSkill[];
  certifications: SifaCertification[];
  projects: SifaProject[];
  volunteering: SifaVolunteering[];
  publications: SifaPublication[];
  courses: SifaCourse[];
  honors: SifaHonor[];
  languages: SifaLanguage[];
}

/**
 * Result of the initial ZIP extraction phase.
 * If multiple languages are detected, the caller must present a language picker
 * before calling `buildPreview()`.
 */
export interface ExtractionResult {
  /** Available languages. Empty array means single-language export. */
  languages: LanguageOption[];
  /** Build the import preview, optionally for a specific language. */
  buildPreview: (language?: string) => ImportPreview;
}

/**
 * Process a map of CSV filename -> content into a structured import preview.
 * Handles missing files gracefully by returning empty arrays / null.
 */
export function processLinkedInCsvFiles(csvFiles: Map<string, string>): ImportPreview {
  const preview: ImportPreview = {
    profile: null,
    positions: [],
    education: [],
    skills: [],
    certifications: [],
    projects: [],
    volunteering: [],
    publications: [],
    courses: [],
    honors: [],
    languages: [],
  };

  const profileCsv = csvFiles.get('Profile.csv');
  if (profileCsv) {
    const rows = parseCsv(profileCsv);
    if (rows.length > 0) {
      preview.profile = mapProfileCsv(rows[0]!);
    }
  }

  const positionsCsv = csvFiles.get('Positions.csv');
  if (positionsCsv) {
    preview.positions = parseCsv(positionsCsv)
      .map(mapPositionsCsv)
      .filter((p) => p.company && p.title);
  }

  const educationCsv = csvFiles.get('Education.csv');
  if (educationCsv) {
    preview.education = parseCsv(educationCsv)
      .map(mapEducationCsv)
      .filter((e) => e.institution);
  }

  const skillsCsv = csvFiles.get('Skills.csv');
  if (skillsCsv) {
    preview.skills = parseCsv(skillsCsv)
      .map(mapSkillsCsv)
      .filter((s) => s.name);
  }

  const certificationsCsv = csvFiles.get('Certifications.csv');
  if (certificationsCsv) {
    preview.certifications = parseCsv(certificationsCsv)
      .map(mapCertificationsCsv)
      .filter((c) => c.name);
  }

  const projectsCsv = csvFiles.get('Projects.csv');
  if (projectsCsv) {
    preview.projects = parseCsv(projectsCsv)
      .map(mapProjectsCsv)
      .filter((p) => p.name);
  }

  const volunteeringCsv = csvFiles.get('Volunteering.csv');
  if (volunteeringCsv) {
    preview.volunteering = parseCsv(volunteeringCsv)
      .map(mapVolunteeringCsv)
      .filter((v) => v.organization);
  }

  const publicationsCsv = csvFiles.get('Publications.csv');
  if (publicationsCsv) {
    preview.publications = parseCsv(publicationsCsv)
      .map(mapPublicationsCsv)
      .filter((p) => p.title);
  }

  const coursesCsv = csvFiles.get('Courses.csv');
  if (coursesCsv) {
    preview.courses = parseCsv(coursesCsv)
      .map(mapCoursesCsv)
      .filter((c) => c.name);
  }

  const honorsCsv = csvFiles.get('Honors.csv');
  if (honorsCsv) {
    preview.honors = parseCsv(honorsCsv)
      .map(mapHonorsCsv)
      .filter((h) => h.title);
  }

  const languagesCsv = csvFiles.get('Languages.csv');
  if (languagesCsv) {
    preview.languages = parseCsv(languagesCsv)
      .map(mapLanguagesCsv)
      .filter((l) => l.name);
  }

  return preview;
}

/**
 * Extract a LinkedIn ZIP file and detect available languages.
 * Returns an ExtractionResult that lets callers pick a language before building the preview.
 */
export async function extractLinkedInExport(file: File): Promise<ExtractionResult> {
  const extraction = await extractLinkedInZip(file);

  return {
    languages: extraction.languages,
    buildPreview: (language?: string) => {
      const csvFiles = extraction.extractForLanguage(language);
      return processLinkedInCsvFiles(csvFiles);
    },
  };
}

/**
 * Full pipeline: extract a LinkedIn ZIP file and produce an import preview.
 * For single-language exports, works exactly as before.
 * For multi-language exports, uses the first detected language by default.
 *
 * @deprecated Use extractLinkedInExport() for multi-language support.
 */
export async function processLinkedInExport(file: File): Promise<ImportPreview> {
  const result = await extractLinkedInExport(file);
  const language = result.languages.length > 0 ? result.languages[0]!.dirName : undefined;
  return result.buildPreview(language);
}
