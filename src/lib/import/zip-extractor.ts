import JSZip from 'jszip';

/**
 * Extract CSV files from a LinkedIn data export ZIP.
 * Returns a map of filename -> CSV content string.
 * LinkedIn ZIPs may have nested paths; we strip directories and use only the filename.
 */
export async function extractLinkedInZip(file: File): Promise<Map<string, string>> {
  const zip = await JSZip.loadAsync(file);
  const csvFiles = new Map<string, string>();

  for (const [name, entry] of Object.entries(zip.files)) {
    if (name.endsWith('.csv') && !entry.dir) {
      // Extract just the filename (LinkedIn ZIPs may have nested paths)
      const fileName = name.split('/').pop() ?? name;
      csvFiles.set(fileName, await entry.async('text'));
    }
  }

  return csvFiles;
}
