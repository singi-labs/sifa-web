import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SectionEditor, EditableEntry } from '@/components/profile-editor/section-editor';
import { EditDialog } from '@/components/profile-editor/edit-dialog';
import {
  POSITION_FIELDS,
  positionToValues,
  valuesToPosition,
} from '@/components/profile-editor/position-form';
import { ABOUT_FIELDS, profileToAboutValues } from '@/components/profile-editor/about-form';
import {
  educationToValues,
  valuesToEducation,
  skillToValues,
  valuesToSkill,
  certificationToValues,
  valuesToCertification,
  projectToValues,
  valuesToProject,
  publicationToValues,
  valuesToPublication,
  volunteeringToValues,
  valuesToVolunteering,
  honorToValues,
  valuesToHonor,
  languageToValues,
  valuesToLanguage,
  courseToValues,
  valuesToCourse,
} from '@/components/profile-editor/section-converters';

describe('SectionEditor', () => {
  it('renders children without edit controls for non-owner', () => {
    render(
      <SectionEditor sectionTitle="Career">
        <p>Career content</p>
      </SectionEditor>,
    );
    expect(screen.getByText('Career content')).toBeDefined();
    expect(screen.queryByRole('button', { name: /add/i })).toBeNull();
  });

  it('shows add button for own profile', () => {
    const onAdd = vi.fn();
    render(
      <SectionEditor sectionTitle="Career" isOwnProfile onAdd={onAdd}>
        <p>Career content</p>
      </SectionEditor>,
    );
    expect(screen.getByRole('button', { name: 'Add Career' })).toBeDefined();
  });

  it('calls onAdd when add button clicked', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(
      <SectionEditor sectionTitle="Career" isOwnProfile onAdd={onAdd}>
        <p>Content</p>
      </SectionEditor>,
    );
    await user.click(screen.getByRole('button', { name: 'Add Career' }));
    expect(onAdd).toHaveBeenCalledOnce();
  });
});

describe('EditableEntry', () => {
  it('renders children without controls for non-owner', () => {
    render(
      <EditableEntry onEdit={vi.fn()} onDelete={vi.fn()} entryLabel="Engineer">
        <p>Entry</p>
      </EditableEntry>,
    );
    expect(screen.getByText('Entry')).toBeDefined();
    expect(screen.queryByRole('button', { name: /options/i })).toBeNull();
  });

  it('shows kebab menu trigger for own profile', () => {
    render(
      <EditableEntry isOwnProfile onEdit={vi.fn()} onDelete={vi.fn()} entryLabel="Engineer">
        <p>Entry</p>
      </EditableEntry>,
    );
    expect(screen.getByRole('button', { name: 'Engineer options' })).toBeDefined();
  });

  it('renders kebab trigger with correct aria attributes', () => {
    render(
      <EditableEntry isOwnProfile onEdit={vi.fn()} onDelete={vi.fn()} entryLabel="Engineer">
        <p>Entry</p>
      </EditableEntry>,
    );
    const trigger = screen.getByRole('button', { name: 'Engineer options' });
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
  });

  it('renders trailing content alongside kebab menu', () => {
    render(
      <EditableEntry
        isOwnProfile
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        entryLabel="GitHub"
        trailingContent={
          <button type="button" aria-label="Set as primary">
            star
          </button>
        }
      >
        <p>GitHub link</p>
      </EditableEntry>,
    );
    expect(screen.getByRole('button', { name: 'Set as primary' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'GitHub options' })).toBeDefined();
  });
});

describe('EditDialog', () => {
  it('renders form with fields', () => {
    render(
      <EditDialog
        title="Edit Position"
        fields={[{ name: 'title', label: 'Job Title', required: true }]}
        onSave={vi.fn().mockResolvedValue({ success: true })}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByRole('dialog', { name: 'Edit Position' })).toBeDefined();
    expect(screen.getByLabelText(/Job Title/)).toBeDefined();
  });

  it('calls onCancel when cancel clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <EditDialog
        title="Edit"
        fields={[{ name: 'x', label: 'X' }]}
        onSave={vi.fn().mockResolvedValue({ success: true })}
        onCancel={onCancel}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('calls onSave with values on submit', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue({ success: true });
    render(
      <EditDialog
        title="Edit"
        fields={[{ name: 'title', label: 'Title' }]}
        onSave={onSave}
        onCancel={vi.fn()}
      />,
    );
    await user.type(screen.getByLabelText('Title'), 'Engineer');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).toHaveBeenCalledWith({ title: 'Engineer' });
  });

  it('shows error message on failed save', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue({ success: false, error: 'Server error' });
    render(
      <EditDialog
        title="Edit"
        fields={[{ name: 'title', label: 'Title' }]}
        onSave={onSave}
        onCancel={vi.fn()}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.getByText('Server error')).toBeDefined();
  });

  it('populates initial values', () => {
    render(
      <EditDialog
        title="Edit"
        fields={[{ name: 'title', label: 'Title' }]}
        initialValues={{ title: 'Engineer' }}
        onSave={vi.fn().mockResolvedValue({ success: true })}
        onCancel={vi.fn()}
      />,
    );
    expect((screen.getByLabelText('Title') as HTMLInputElement).value).toBe('Engineer');
  });
});

describe('Position form helpers', () => {
  it('converts position to form values', () => {
    const values = positionToValues({
      rkey: '1',
      title: 'Engineer',
      company: 'Acme',
      startedAt: '2020-01',
    });
    expect(values.title).toBe('Engineer');
    expect(values.company).toBe('Acme');
  });

  it('converts form values to position', () => {
    const pos = valuesToPosition({
      title: 'Engineer',
      company: 'Acme',
      startedAt: '2020-01',
      endedAt: '',
      location: '',
      description: '',
    });
    expect(pos.title).toBe('Engineer');
    expect(pos.endedAt).toBeUndefined();
    expect(pos.location).toBeUndefined();
  });

  it('has correct number of fields', () => {
    expect(POSITION_FIELDS.length).toBe(6);
  });
});

describe('About form helpers', () => {
  it('converts profile to about values', () => {
    const values = profileToAboutValues({
      headline: 'Dev',
      about: 'Hi',
      location: { country: 'NL' },
    });
    expect(values.headline).toBe('Dev');
    expect(values.website).toBe('');
  });

  it('has correct number of fields', () => {
    expect(ABOUT_FIELDS.length).toBe(4);
  });
});

describe('Section converters', () => {
  describe('education round-trip', () => {
    it('converts education to values and back', () => {
      const original = {
        rkey: 'e1',
        institution: 'MIT',
        degree: 'BSc',
        fieldOfStudy: 'CS',
        startedAt: '2018-09',
        endedAt: '2022-06',
      };
      const values = educationToValues(original);
      expect(values.institution).toBe('MIT');
      expect(values.degree).toBe('BSc');

      const result = valuesToEducation(values);
      expect(result.institution).toBe('MIT');
      expect(result.degree).toBe('BSc');
      expect(result.fieldOfStudy).toBe('CS');
      expect(result.startedAt).toBe('2018-09');
      expect(result.endedAt).toBe('2022-06');
    });

    it('converts empty optional strings to undefined', () => {
      const values = educationToValues({ rkey: 'e2', institution: 'Stanford' });
      expect(values.degree).toBe('');

      const result = valuesToEducation(values);
      expect(result.degree).toBeUndefined();
      expect(result.fieldOfStudy).toBeUndefined();
      expect(result.startedAt).toBeUndefined();
      expect(result.endedAt).toBeUndefined();
    });
  });

  describe('skill round-trip', () => {
    it('converts skill to values and back', () => {
      const original = { rkey: 's1', name: 'TypeScript', category: 'technical' };
      const values = skillToValues(original);
      expect(values.name).toBe('TypeScript');

      const result = valuesToSkill(values);
      expect(result.name).toBe('TypeScript');
      expect(result.category).toBe('technical');
    });

    it('converts empty category to undefined', () => {
      const result = valuesToSkill({ name: 'Rust', category: '' });
      expect(result.category).toBeUndefined();
    });
  });

  describe('certification round-trip', () => {
    it('converts certification to values and back', () => {
      const original = {
        rkey: 'c1',
        name: 'AWS Solutions Architect',
        issuingOrg: 'Amazon',
        issueDate: '2023-01',
        expiryDate: '2026-01',
        credentialUrl: 'https://aws.amazon.com/cert/123',
      };
      const values = certificationToValues(original);
      expect(values.name).toBe('AWS Solutions Architect');
      expect(values.issuingOrg).toBe('Amazon');

      const result = valuesToCertification(values);
      expect(result.name).toBe('AWS Solutions Architect');
      expect(result.issuingOrg).toBe('Amazon');
      expect(result.issuedAt).toBe('2023-01');
      expect(result.expiresAt).toBe('2026-01');
      expect(result.credentialUrl).toBe('https://aws.amazon.com/cert/123');
    });

    it('converts empty optional strings to undefined', () => {
      const result = valuesToCertification({
        name: 'Cert',
        issuingOrg: 'Org',
        issueDate: '',
        expiryDate: '',
        credentialUrl: '',
      });
      expect(result.issuedAt).toBeUndefined();
      expect(result.expiresAt).toBeUndefined();
      expect(result.credentialUrl).toBeUndefined();
    });
  });

  describe('project round-trip', () => {
    it('converts project to values and back', () => {
      const values = projectToValues({
        rkey: 'p1',
        name: 'Sifa',
        description: 'Professional network',
        url: 'https://sifa.id',
      });
      const result = valuesToProject(values);
      expect(result.name).toBe('Sifa');
      expect(result.description).toBe('Professional network');
      expect(result.url).toBe('https://sifa.id');
      expect(result.startedAt).toBeUndefined();
    });
  });

  describe('publication round-trip', () => {
    it('converts publication to values and back', () => {
      const values = publicationToValues({
        rkey: 'pub1',
        title: 'My Paper',
        publisher: 'ACM',
        date: '2024-06',
      });
      const result = valuesToPublication(values);
      expect(result.title).toBe('My Paper');
      expect(result.publisher).toBe('ACM');
      expect(result.url).toBeUndefined();
    });
  });

  describe('volunteering round-trip', () => {
    it('converts volunteering to values and back', () => {
      const values = volunteeringToValues({
        rkey: 'v1',
        organization: 'Red Cross',
        role: 'Volunteer',
        cause: 'Humanitarian',
      });
      const result = valuesToVolunteering(values);
      expect(result.organization).toBe('Red Cross');
      expect(result.role).toBe('Volunteer');
      expect(result.cause).toBe('Humanitarian');
      expect(result.description).toBeUndefined();
    });
  });

  describe('honor round-trip', () => {
    it('converts honor to values and back', () => {
      const values = honorToValues({
        rkey: 'h1',
        title: 'Best Paper Award',
        issuer: 'IEEE',
        date: '2023-11',
      });
      const result = valuesToHonor(values);
      expect(result.title).toBe('Best Paper Award');
      expect(result.issuer).toBe('IEEE');
      expect(result.description).toBeUndefined();
    });
  });

  describe('language with proficiency', () => {
    it('converts language to values and back', () => {
      const values = languageToValues({
        rkey: 'l1',
        language: 'Dutch',
        proficiency: 'native',
      });
      expect(values.language).toBe('Dutch');
      expect(values.proficiency).toBe('native');

      const result = valuesToLanguage(values);
      expect(result.name).toBe('Dutch');
      expect(result.language).toBe('Dutch');
      expect(result.proficiency).toBe('native');
    });

    it('converts empty proficiency to undefined', () => {
      const result = valuesToLanguage({ language: 'English', proficiency: '' });
      expect(result.proficiency).toBeUndefined();
    });
  });

  describe('course round-trip', () => {
    it('converts course to values and back', () => {
      const values = courseToValues({
        rkey: 'co1',
        name: 'Distributed Systems',
        institution: 'MIT',
        number: 'CS-601',
      });
      const result = valuesToCourse(values);
      expect(result.name).toBe('Distributed Systems');
      expect(result.institution).toBe('MIT');
      expect(result.number).toBe('CS-601');
    });
  });
});
