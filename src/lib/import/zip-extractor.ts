import JSZip from 'jszip';

export interface LanguageOption {
  /** Directory name in the ZIP (e.g. "en_US", "nl_NL") */
  dirName: string;
  /** Human-readable label derived from the directory name */
  label: string;
}

export interface ZipExtractionResult {
  /** Available language versions found in the ZIP. Empty if no language directories. */
  languages: LanguageOption[];
  /** Extract CSV files for a specific language (by dirName), or all files if no languages detected. */
  extractForLanguage: (language?: string) => Map<string, string>;
}

/**
 * Derive a human-readable label from a LinkedIn language directory name.
 * Handles formats like "en_US", "nl_NL", "English", "Dutch", "pt_BR".
 */
function labelFromDirName(dirName: string): string {
  // Try to use Intl.DisplayNames for locale-style directory names (e.g. "en_US" → "English")
  const localeMatch = dirName.match(/^([a-z]{2})(?:_([A-Z]{2}))?$/);
  if (localeMatch) {
    const locale = localeMatch[2] ? `${localeMatch[1]}-${localeMatch[2]}` : localeMatch[1]!;
    try {
      const displayName = new Intl.DisplayNames(['en'], { type: 'language' }).of(locale);
      if (displayName) return displayName;
    } catch {
      // Fall through to raw name
    }
  }
  return dirName;
}

/** Known CSV filenames from LinkedIn data exports. */
const KNOWN_CSV_FILES = new Set([
  'Profile.csv',
  'Positions.csv',
  'Education.csv',
  'Skills.csv',
  'Certifications.csv',
  'Projects.csv',
  'Volunteering.csv',
  'Publications.csv',
  'Courses.csv',
  'Honors.csv',
  'Languages.csv',
]);

/**
 * Extract CSV files from a LinkedIn data export ZIP.
 *
 * LinkedIn ZIPs with multi-language profiles contain language-specific directories
 * (e.g. "en_US/Profile.csv", "nl_NL/Profile.csv"). This function detects those
 * directories and lets callers choose which language to extract.
 *
 * Returns a ZipExtractionResult with detected languages and a function to extract
 * files for a given language.
 */
export async function extractLinkedInZip(file: File): Promise<ZipExtractionResult> {
  const zip = await JSZip.loadAsync(file);

  // Collect all CSV entries keyed by their path segments
  const allEntries: Array<{
    path: string;
    fileName: string;
    dirName: string | null;
    entry: JSZip.JSZipObject;
  }> = [];

  for (const [name, entry] of Object.entries(zip.files)) {
    if (name.endsWith('.csv') && !entry.dir) {
      const parts = name.split('/').filter(Boolean);
      const fileName = parts[parts.length - 1]!;

      // Determine if the file is inside a language directory
      // A language directory is a parent folder that contains known CSV files
      let dirName: string | null = null;
      if (parts.length >= 2) {
        dirName = parts[parts.length - 2]!;
      }

      allEntries.push({ path: name, fileName, dirName, entry });
    }
  }

  // Detect language directories: directories that contain at least one known LinkedIn CSV
  const dirCsvCounts = new Map<string, number>();
  for (const e of allEntries) {
    if (e.dirName && KNOWN_CSV_FILES.has(e.fileName)) {
      dirCsvCounts.set(e.dirName, (dirCsvCounts.get(e.dirName) ?? 0) + 1);
    }
  }

  // A directory counts as a language directory if it has 2+ known CSVs
  // and there are multiple such directories (i.e. multi-language export)
  const languageDirs = [...dirCsvCounts.entries()]
    .filter(([, count]) => count >= 2)
    .map(([dir]) => dir);

  const hasMultipleLanguages = languageDirs.length >= 2;

  const languages: LanguageOption[] = hasMultipleLanguages
    ? languageDirs.map((dir) => ({ dirName: dir, label: labelFromDirName(dir) }))
    : [];

  // Pre-read all CSV content
  const contentCache = new Map<string, string>();
  await Promise.all(
    allEntries.map(async (e) => {
      contentCache.set(e.path, await e.entry.async('text'));
    }),
  );

  function extractForLanguage(language?: string): Map<string, string> {
    const csvFiles = new Map<string, string>();

    if (hasMultipleLanguages && language) {
      // Extract only files from the selected language directory
      for (const e of allEntries) {
        if (e.dirName === language) {
          csvFiles.set(e.fileName, contentCache.get(e.path)!);
        }
      }
    } else {
      // No multi-language or no selection: original behavior (last write wins per filename)
      for (const e of allEntries) {
        csvFiles.set(e.fileName, contentCache.get(e.path)!);
      }
    }

    return csvFiles;
  }

  return { languages, extractForLanguage };
}
