import { describe, it, expect } from 'vitest';
import { processLinkedInCsvFiles } from '@/lib/import/orchestrator';

describe('Import orchestrator', () => {
  it('processLinkedInCsvFiles returns structured preview', () => {
    const csvFiles = new Map<string, string>();
    csvFiles.set(
      'Positions.csv',
      'Company Name,Title,Started On,Finished On\nAcme Corp,Engineer,Jan 2020,Dec 2023',
    );
    csvFiles.set(
      'Education.csv',
      'School Name,Degree Name,Notes,Start Date,End Date\nMIT,BSc,CS,2015,2019',
    );
    csvFiles.set('Skills.csv', 'Name\nTypeScript\nRust');
    csvFiles.set(
      'Profile.csv',
      'First Name,Last Name,Headline,Summary,Geo Location\nAlice,Smith,Senior Eng,Building things,Amsterdam',
    );

    const preview = processLinkedInCsvFiles(csvFiles);

    expect(preview.positions).toHaveLength(1);
    expect(preview.positions[0]?.companyName).toBe('Acme Corp');
    expect(preview.education).toHaveLength(1);
    expect(preview.education[0]?.institution).toBe('MIT');
    expect(preview.skills).toHaveLength(2);
    expect(preview.skills[0]?.skillName).toBe('TypeScript');
    expect(preview.profile?.headline).toBe('Senior Eng');
  });

  it('handles missing CSV files gracefully', () => {
    const csvFiles = new Map<string, string>();
    csvFiles.set('Profile.csv', 'First Name,Last Name,Headline\nAlice,Smith,Engineer');
    // No Positions, Education, or Skills files

    const preview = processLinkedInCsvFiles(csvFiles);

    expect(preview.profile?.headline).toBe('Engineer');
    expect(preview.positions).toHaveLength(0);
    expect(preview.education).toHaveLength(0);
    expect(preview.skills).toHaveLength(0);
  });

  it('handles empty CSV content (header only)', () => {
    const csvFiles = new Map<string, string>();
    csvFiles.set('Skills.csv', 'Name\n'); // header only, no data

    const preview = processLinkedInCsvFiles(csvFiles);

    expect(preview.skills).toHaveLength(0);
  });

  it('handles completely empty map', () => {
    const csvFiles = new Map<string, string>();

    const preview = processLinkedInCsvFiles(csvFiles);

    expect(preview.profile).toBeNull();
    expect(preview.positions).toHaveLength(0);
    expect(preview.education).toHaveLength(0);
    expect(preview.skills).toHaveLength(0);
  });

  it('filters out rows with missing required fields', () => {
    const csvFiles = new Map<string, string>();
    csvFiles.set(
      'Positions.csv',
      'Company Name,Title,Started On\nAcme,Engineer,Jan 2020\n,,Mar 2021\n,Designer,Jun 2022',
    );
    csvFiles.set(
      'Education.csv',
      'School Name,Degree Name,Start Date,End Date\nMIT,BSc,2015,2019\n,,2001,2002',
    );
    csvFiles.set('Skills.csv', 'Name\nTypeScript\n');

    const preview = processLinkedInCsvFiles(csvFiles);

    expect(preview.positions).toHaveLength(1);
    expect(preview.positions[0]?.companyName).toBe('Acme');
    expect(preview.education).toHaveLength(1);
    expect(preview.education[0]?.institution).toBe('MIT');
    expect(preview.skills).toHaveLength(1);
    expect(preview.skills[0]?.skillName).toBe('TypeScript');
  });
});
