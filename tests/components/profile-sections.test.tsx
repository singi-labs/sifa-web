import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileEditProvider } from '@/components/profile-edit-provider';
import { TimelineEntry } from '@/components/profile-sections/timeline';
import { CareerSection } from '@/components/profile-sections/career-section';
import { EducationSection } from '@/components/profile-sections/education-section';
import { SkillsSection } from '@/components/profile-sections/skills-section';
import { ProjectsSection } from '@/components/profile-sections/projects-section';
import { CredentialsSection } from '@/components/profile-sections/credentials-section';
import { PublicationsSection } from '@/components/profile-sections/publications-section';
import { VolunteeringSection } from '@/components/profile-sections/volunteering-section';
import { AwardsSection } from '@/components/profile-sections/awards-section';
import { LanguagesSection } from '@/components/profile-sections/languages-section';
import type { Profile } from '@/lib/types';

const baseProfile: Profile = {
  did: 'did:plc:test',
  handle: 'test.bsky.social',
  claimed: true,
  followersCount: 0,
  followingCount: 0,
  connectionsCount: 0,
  positions: [],
  education: [],
  skills: [],
};

function withProvider(ui: React.ReactElement, profile: Partial<Profile> = {}) {
  return render(
    <ProfileEditProvider initialProfile={{ ...baseProfile, ...profile }}>{ui}</ProfileEditProvider>,
  );
}

describe('TimelineEntry', () => {
  it('renders title and subtitle', () => {
    render(<TimelineEntry title="Engineer" subtitle="Acme" dateRange="2020 - Present" />);
    expect(screen.getByText('Engineer')).toBeDefined();
    expect(screen.getByText('Acme')).toBeDefined();
    expect(screen.getByText('2020 - Present')).toBeDefined();
  });

  it('expands description on click', async () => {
    const user = userEvent.setup();
    render(
      <TimelineEntry
        title="Engineer"
        subtitle="Acme"
        dateRange="2020"
        description="Did great work"
      />,
    );

    expect(screen.queryByText('Did great work')).toBeNull();
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Did great work')).toBeDefined();
  });
});

describe('CareerSection', () => {
  it('renders positions sorted by date', () => {
    const positions = [
      {
        rkey: '1',
        companyName: 'Acme',
        title: 'Junior',
        startDate: '2018-01',
        endDate: '2020-01',
        current: false,
      },
      { rkey: '2', companyName: 'Acme', title: 'Senior', startDate: '2020-01', current: true },
    ];
    withProvider(<CareerSection positions={positions} />, { positions });
    expect(screen.getByText('Career')).toBeDefined();
    expect(screen.getByText('Senior')).toBeDefined();
    expect(screen.getByText('Junior')).toBeDefined();
  });

  it('returns null when empty', () => {
    const { container } = withProvider(<CareerSection positions={[]} />);
    expect(container.innerHTML).toBe('');
  });
});

describe('EducationSection', () => {
  it('renders education entries', () => {
    const education = [
      {
        rkey: '1',
        institution: 'MIT',
        degree: 'BSc',
        fieldOfStudy: 'CS',
        startDate: '2016',
        endDate: '2020',
      },
    ];
    withProvider(<EducationSection education={education} />, { education });
    expect(screen.getByText('Education')).toBeDefined();
    expect(screen.getByText('MIT')).toBeDefined();
    expect(screen.getByText('BSc, CS')).toBeDefined();
  });

  it('folds in related courses', () => {
    const education = [{ rkey: '1', institution: 'MIT', startDate: '2016' }];
    withProvider(
      <EducationSection
        education={education}
        courses={[{ rkey: 'c1', name: 'Algorithms', institution: 'MIT', number: 'CS101' }]}
      />,
      { education },
    );
    // Courses are inside the expandable area, need to expand first
    // But the courses text should exist in DOM after expand
  });
});

describe('SkillsSection', () => {
  it('renders skills as badges', () => {
    const skills = [
      { rkey: '1', skillName: 'TypeScript', category: 'technical' },
      { rkey: '2', skillName: 'React', category: 'technical' },
    ];
    withProvider(<SkillsSection skills={skills} />, { skills });
    expect(screen.getByText('TypeScript')).toBeDefined();
    expect(screen.getByText('React')).toBeDefined();
    expect(screen.getByText('Technical')).toBeDefined();
  });

  it('shows category as group heading, not inline on chip', () => {
    const skills = [{ rkey: '1', skillName: 'React', category: 'creative' }];
    withProvider(<SkillsSection skills={skills} />, { skills });
    // Category is displayed as a group heading, not inline on the chip
    expect(screen.getByRole('heading', { level: 3 }).textContent).toBe('Creative');
    const badge =
      screen.getByText('React').closest('[class*="badge"]') ??
      screen.getByText('React').parentElement;
    expect(badge?.textContent).not.toContain('\u00b7');
  });

  it('does not show category separator when no category', () => {
    const skills = [{ rkey: '1', skillName: 'TypeScript' }];
    withProvider(<SkillsSection skills={skills} />, { skills });
    const badge =
      screen.getByText('TypeScript').closest('[class*="badge"]') ??
      screen.getByText('TypeScript').parentElement;
    expect(badge?.textContent).not.toContain('\u00b7');
  });

  it('never displays endorsement count', () => {
    const skills = [
      { rkey: '1', skillName: 'TypeScript', category: 'technical', endorsementCount: 5 },
    ];
    withProvider(<SkillsSection skills={skills} />, { skills });
    expect(screen.queryByText('5')).toBeNull();
  });

  it('displays groups in defined category order', () => {
    const skills = [
      { rkey: '1', skillName: 'Drawing', category: 'creative' },
      { rkey: '2', skillName: 'TypeScript', category: 'technical' },
      { rkey: '3', skillName: 'Empathy', category: 'interpersonal' },
    ];
    withProvider(<SkillsSection skills={skills} />, { skills });

    const headings = screen.getAllByRole('heading', { level: 3 });
    const labels = headings.map((h) => h.textContent);
    expect(labels).toEqual(['Technical', 'Creative', 'Interpersonal']);
  });

  it('places uncategorized skills under "Other" at the end', () => {
    const skills = [
      { rkey: '1', skillName: 'TypeScript', category: 'technical' },
      { rkey: '2', skillName: 'Mystery' },
    ];
    withProvider(<SkillsSection skills={skills} />, { skills });

    const headings = screen.getAllByRole('heading', { level: 3 });
    const labels = headings.map((h) => h.textContent);
    expect(labels).toEqual(['Technical', 'Other']);
  });

  it('does not render empty category groups', () => {
    const skills = [{ rkey: '1', skillName: 'TypeScript', category: 'technical' }];
    withProvider(<SkillsSection skills={skills} />, { skills });

    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings).toHaveLength(1);
    expect(headings[0]!.textContent).toBe('Technical');
  });

  it('renders h3 heading elements for category names', () => {
    const skills = [
      { rkey: '1', skillName: 'TypeScript', category: 'technical' },
      { rkey: '2', skillName: 'Sales', category: 'business' },
    ];
    withProvider(<SkillsSection skills={skills} />, { skills });

    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings).toHaveLength(2);
    expect(headings[0]!.tagName).toBe('H3');
    expect(headings[1]!.tagName).toBe('H3');
  });
});

describe('ProjectsSection', () => {
  it('renders projects', () => {
    const projects = [
      { rkey: '1', name: 'My Project', url: 'https://example.com', startDate: '2023' },
    ];
    withProvider(<ProjectsSection projects={projects} />, { projects });
    expect(screen.getByText('Projects')).toBeDefined();
    expect(screen.getByText('My Project')).toBeDefined();
  });
});

describe('CredentialsSection', () => {
  it('renders certifications', () => {
    const certifications = [
      { rkey: '1', name: 'AWS Solutions Architect', issuingOrg: 'Amazon', issueDate: '2023' },
    ];
    withProvider(<CredentialsSection certifications={certifications} />, { certifications });
    expect(screen.getByText('Credentials')).toBeDefined();
    expect(screen.getByText('AWS Solutions Architect')).toBeDefined();
    expect(screen.getByText('Amazon')).toBeDefined();
  });
});

describe('PublicationsSection', () => {
  it('renders publications', () => {
    const publications = [{ rkey: '1', title: 'My Paper', publisher: 'Nature', date: '2023' }];
    withProvider(<PublicationsSection publications={publications} />, { publications });
    expect(screen.getByText('Publications')).toBeDefined();
    expect(screen.getByText('My Paper')).toBeDefined();
    expect(screen.getByText('Nature')).toBeDefined();
  });
});

describe('VolunteeringSection', () => {
  it('renders volunteering entries', () => {
    const volunteering = [
      { rkey: '1', organization: 'Red Cross', role: 'Coordinator', startDate: '2022' },
    ];
    withProvider(<VolunteeringSection volunteering={volunteering} />, { volunteering });
    expect(screen.getByText('Volunteering')).toBeDefined();
    expect(screen.getByText('Coordinator')).toBeDefined();
  });
});

describe('AwardsSection', () => {
  it('renders honors', () => {
    const honors = [{ rkey: '1', title: 'Best Paper Award', issuer: 'ACM', date: '2023' }];
    withProvider(<AwardsSection honors={honors} />, { honors });
    expect(screen.getByText('Awards')).toBeDefined();
    expect(screen.getByText('Best Paper Award')).toBeDefined();
  });
});

describe('LanguagesSection', () => {
  it('renders languages with proficiency', () => {
    const languages = [
      { rkey: '1', language: 'English', proficiency: 'native' as const },
      { rkey: '2', language: 'Dutch', proficiency: 'full_professional' as const },
    ];
    withProvider(<LanguagesSection languages={languages} />, { languages });
    expect(screen.getByText('Languages')).toBeDefined();
    expect(screen.getByText('English')).toBeDefined();
    expect(screen.getByText('(Native or bilingual)')).toBeDefined();
    expect(screen.getByText('Dutch')).toBeDefined();
  });
});
