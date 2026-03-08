import { describe, it, expect } from 'vitest';
import {
  mapPositionsCsv,
  mapProfileCsv,
  mapEducationCsv,
  mapSkillsCsv,
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
      expect(result.companyName).toBe('Acme Corp');
      expect(result.title).toBe('Senior Engineer');
      expect(result.description).toBe('Built things');
      expect(result.startDate).toBe('2020-01');
      expect(result.endDate).toBe('2023-12');
    });

    it('handles current position (no end date)', () => {
      const csvRow = {
        'Company Name': 'Current Co',
        Title: 'CTO',
        'Started On': 'Mar 2024',
        'Finished On': '',
      };

      const result = mapPositionsCsv(csvRow);
      expect(result.endDate).toBeUndefined();
      expect(result.current).toBe(true);
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
      expect(result.fieldOfStudy).toBe('Computer Science');
    });
  });

  describe('mapSkillsCsv', () => {
    it('maps Skills.csv columns', () => {
      const csvRow = {
        Name: 'TypeScript',
      };

      const result = mapSkillsCsv(csvRow);
      expect(result.skillName).toBe('TypeScript');
    });
  });
});
