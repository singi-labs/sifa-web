import { describe, it, expect, vi } from 'vitest';

// Helper to create a mock File (content doesn't matter since JSZip is mocked)
function createMockZipFile(): File {
  // We mock JSZip.loadAsync below, so the actual File content doesn't matter
  return new File(['mock'], 'test.zip', { type: 'application/zip' });
}

function mockJSZip(entries: Record<string, string>) {
  vi.doMock('jszip', () => ({
    default: {
      loadAsync: vi.fn().mockResolvedValue({
        files: Object.fromEntries(
          Object.entries(entries).map(([name, content]) => [
            name,
            {
              dir: name.endsWith('/'),
              async: vi.fn().mockResolvedValue(content),
            },
          ]),
        ),
      }),
    },
  }));
}

describe('extractLinkedInZip', () => {
  it('detects no languages for a flat ZIP structure', async () => {
    mockJSZip({
      'Profile.csv': 'First Name,Last Name\nAlice,Smith',
      'Positions.csv': 'Company Name,Title\nAcme,Engineer',
      'Skills.csv': 'Name\nTypeScript',
    });

    // Re-import to pick up the mock
    const { extractLinkedInZip: extract } = await import('@/lib/import/zip-extractor');
    const result = await extract(createMockZipFile());

    expect(result.languages).toHaveLength(0);

    const csvFiles = result.extractForLanguage();
    expect(csvFiles.get('Profile.csv')).toContain('Alice');
    expect(csvFiles.get('Positions.csv')).toContain('Acme');
  });

  it('detects multiple language directories', async () => {
    vi.resetModules();
    mockJSZip({
      'en_US/Profile.csv': 'First Name,Last Name\nAlice,Smith',
      'en_US/Positions.csv': 'Company Name,Title\nAcme,Engineer',
      'en_US/Skills.csv': 'Name\nTypeScript',
      'nl_NL/Profile.csv': 'First Name,Last Name\nAlice,Smith',
      'nl_NL/Positions.csv': 'Company Name,Title\nAcme,Ingenieur',
      'nl_NL/Skills.csv': 'Name\nTypeScript',
    });

    const { extractLinkedInZip: extract } = await import('@/lib/import/zip-extractor');
    const result = await extract(createMockZipFile());

    expect(result.languages).toHaveLength(2);
    const dirNames = result.languages.map((l) => l.dirName).sort();
    expect(dirNames).toEqual(['en_US', 'nl_NL']);

    // Each language has a human-readable label
    for (const lang of result.languages) {
      expect(lang.label).toBeTruthy();
    }
  });

  it('extracts only files from the selected language directory', async () => {
    vi.resetModules();
    mockJSZip({
      'en_US/Profile.csv': 'First Name,Last Name\nAlice,Smith',
      'en_US/Positions.csv': 'Company Name,Title\nAcme,Engineer',
      'en_US/Skills.csv': 'Name\nTypeScript',
      'nl_NL/Profile.csv': 'First Name,Last Name\nAlice,Smit',
      'nl_NL/Positions.csv': 'Company Name,Title\nAcme,Ingenieur',
      'nl_NL/Skills.csv': 'Name\nTypeScript',
    });

    const { extractLinkedInZip: extract } = await import('@/lib/import/zip-extractor');
    const result = await extract(createMockZipFile());

    const enFiles = result.extractForLanguage('en_US');
    expect(enFiles.get('Profile.csv')).toContain('Alice,Smith');
    expect(enFiles.get('Positions.csv')).toContain('Engineer');

    const nlFiles = result.extractForLanguage('nl_NL');
    expect(nlFiles.get('Profile.csv')).toContain('Alice,Smit');
    expect(nlFiles.get('Positions.csv')).toContain('Ingenieur');
  });

  it('treats a single language directory as no language choice needed', async () => {
    vi.resetModules();
    mockJSZip({
      'en_US/Profile.csv': 'First Name,Last Name\nAlice,Smith',
      'en_US/Positions.csv': 'Company Name,Title\nAcme,Engineer',
      'en_US/Skills.csv': 'Name\nTypeScript',
    });

    const { extractLinkedInZip: extract } = await import('@/lib/import/zip-extractor');
    const result = await extract(createMockZipFile());

    // Only one language dir — no choice needed
    expect(result.languages).toHaveLength(0);

    // extractForLanguage without arg still works
    const csvFiles = result.extractForLanguage();
    expect(csvFiles.get('Profile.csv')).toContain('Alice');
  });

  it('handles nested directory paths in ZIP', async () => {
    vi.resetModules();
    mockJSZip({
      'linkedin-export/en_US/Profile.csv': 'First Name,Last Name\nAlice,Smith',
      'linkedin-export/en_US/Positions.csv': 'Company Name,Title\nAcme,Engineer',
      'linkedin-export/en_US/Skills.csv': 'Name\nTypeScript',
      'linkedin-export/nl_NL/Profile.csv': 'First Name,Last Name\nAlice,Smit',
      'linkedin-export/nl_NL/Positions.csv': 'Company Name,Title\nAcme,Ingenieur',
      'linkedin-export/nl_NL/Skills.csv': 'Name\nTypeScript',
    });

    const { extractLinkedInZip: extract } = await import('@/lib/import/zip-extractor');
    const result = await extract(createMockZipFile());

    expect(result.languages).toHaveLength(2);
  });
});
