import { describe, it, expect } from 'vitest';
import {
  mapPositionsCsv,
  mapProfileCsv,
  mapEducationCsv,
  mapSkillsCsv,
  mapCertificationsCsv,
  mapProjectsCsv,
  mapPublicationsCsv,
} from '@/lib/import/field-mapper';

describe('LinkedIn field mapper', () => {
  describe('mapPositionsCsv', () => {
    it('maps Positions.csv columns to id.sifa.profile.position', () => {
      const csvRow = {
        'Company Name': 'Acme Corp',
        Title: 'Senior Engineer',
        Description: 'Built things',
        'Started On': 'Jan 2020',
        'Finished On': 'Dec 2023',
        Location: 'Amsterdam, Netherlands',
      };

      const result = mapPositionsCsv(csvRow);
      expect(result.company).toBe('Acme Corp');
      expect(result.title).toBe('Senior Engineer');
      expect(result.description).toBe('Built things');
      expect(result.startedAt).toBe('2020-01');
      expect(result.endedAt).toBe('2023-12');
    });

    it('handles current position (no end date)', () => {
      const csvRow = {
        'Company Name': 'Current Co',
        Title: 'CTO',
        'Started On': 'Mar 2024',
        'Finished On': '',
      };

      const result = mapPositionsCsv(csvRow);
      expect(result.endedAt).toBeUndefined();
    });

    it('handles missing optional fields', () => {
      const csvRow = {
        'Company Name': 'Minimal Co',
        Title: 'Worker',
        'Started On': 'Jun 2022',
      };

      const result = mapPositionsCsv(csvRow);
      expect(result.description).toBeUndefined();
    });
  });

  describe('mapProfileCsv', () => {
    it('maps Profile.csv columns to id.sifa.profile.self', () => {
      const csvRow = {
        'First Name': 'Alice',
        'Last Name': 'Smith',
        Headline: 'Senior Engineer at Acme',
        Summary: 'Building great things',
        'Geo Location': 'Amsterdam Area, Netherlands',
      };

      const result = mapProfileCsv(csvRow);
      expect(result.headline).toBe('Senior Engineer at Acme');
      expect(result.about).toBe('Building great things');
    });
  });

  describe('mapEducationCsv', () => {
    it('maps Education.csv columns', () => {
      const csvRow = {
        'School Name': 'MIT',
        'Degree Name': 'BSc',
        Notes: 'Computer Science',
        'Start Date': '2015',
        'End Date': '2019',
      };

      const result = mapEducationCsv(csvRow);
      expect(result.institution).toBe('MIT');
      expect(result.degree).toBe('BSc');
      expect(result.description).toBe('Computer Science');
    });
  });

  describe('mapSkillsCsv', () => {
    it('maps Skills.csv columns', () => {
      const csvRow = {
        Name: 'TypeScript',
      };

      const result = mapSkillsCsv(csvRow);
      expect(result.name).toBe('TypeScript');
    });
  });

  describe('mapCertificationsCsv', () => {
    it('keeps valid credential URLs', () => {
      const result = mapCertificationsCsv({
        Name: 'AWS SA',
        Authority: 'Amazon',
        Url: 'https://aws.amazon.com/cert/123',
        'License Number': 'ABC-123',
        'Started On': 'Jan 2023',
      });
      expect(result.credentialUrl).toBe('https://aws.amazon.com/cert/123');
    });

    it('strips invalid credential URLs', () => {
      const result = mapCertificationsCsv({
        Name: 'Some Cert',
        Url: 'not-a-url',
      });
      expect(result.credentialUrl).toBeUndefined();
    });

    it('strips empty credential URLs', () => {
      const result = mapCertificationsCsv({
        Name: 'Some Cert',
        Url: '  ',
      });
      expect(result.credentialUrl).toBeUndefined();
    });
  });

  describe('mapProjectsCsv', () => {
    it('strips invalid project URLs', () => {
      const result = mapProjectsCsv({
        Title: 'My Project',
        Url: 'broken',
      });
      expect(result.url).toBeUndefined();
    });

    it('keeps valid project URLs', () => {
      const result = mapProjectsCsv({
        Title: 'My Project',
        Url: 'https://github.com/example',
      });
      expect(result.url).toBe('https://github.com/example');
    });

    it('truncates project names exceeding 100 graphemes', () => {
      const longName = 'A'.repeat(150);
      const result = mapProjectsCsv({ Title: longName });
      expect(result.name.length).toBeLessThanOrEqual(100);
      expect(result.name.endsWith('…')).toBe(true);
    });

    it('preserves project names within 100 graphemes', () => {
      const result = mapProjectsCsv({ Title: 'Short Project' });
      expect(result.name).toBe('Short Project');
    });
  });

  describe('mapPublicationsCsv', () => {
    it('strips invalid publication URLs', () => {
      const result = mapPublicationsCsv({
        Name: 'My Paper',
        Url: 'garbage',
      });
      expect(result.url).toBeUndefined();
    });
  });

  describe('truncation', () => {
    it('truncates skill names exceeding 64 graphemes', () => {
      const result = mapSkillsCsv({ Name: 'X'.repeat(80) });
      expect(result.name.length).toBeLessThanOrEqual(64);
      expect(result.name.endsWith('…')).toBe(true);
    });

    it('truncates position company names exceeding 100 graphemes', () => {
      const result = mapPositionsCsv({
        'Company Name': 'C'.repeat(120),
        Title: 'Engineer',
      });
      expect(result.company.length).toBeLessThanOrEqual(100);
      expect(result.company.endsWith('…')).toBe(true);
    });
  });
});
