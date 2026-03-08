import { parseCsv } from './csv-parser';
import {
  mapProfileCsv,
  mapPositionsCsv,
  mapEducationCsv,
  mapSkillsCsv,
  type SifaProfile,
  type SifaPosition,
  type SifaEducation,
  type SifaSkill,
} from './field-mapper';
import { extractLinkedInZip } from './zip-extractor';

export interface ImportPreview {
  profile: SifaProfile | null;
  positions: SifaPosition[];
  education: SifaEducation[];
  skills: SifaSkill[];
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
    preview.positions = parseCsv(positionsCsv).map(mapPositionsCsv);
  }

  const educationCsv = csvFiles.get('Education.csv');
  if (educationCsv) {
    preview.education = parseCsv(educationCsv).map(mapEducationCsv);
  }

  const skillsCsv = csvFiles.get('Skills.csv');
  if (skillsCsv) {
    preview.skills = parseCsv(skillsCsv).map(mapSkillsCsv);
  }

  return preview;
}

/**
 * Full pipeline: extract a LinkedIn ZIP file and produce an import preview.
 * The ZIP is processed client-side (browser) -- raw CSV data never leaves the user's device.
 */
export async function processLinkedInExport(file: File): Promise<ImportPreview> {
  const csvFiles = await extractLinkedInZip(file);
  return processLinkedInCsvFiles(csvFiles);
}
