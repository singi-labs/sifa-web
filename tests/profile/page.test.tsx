import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfileHeader } from '@/app/profile/[handle]/components/profile-header';
import { ExperienceSection } from '@/app/profile/[handle]/components/experience-section';
import { EducationSection } from '@/app/profile/[handle]/components/education-section';
import { SkillsSection } from '@/app/profile/[handle]/components/skills-section';

describe('Profile page components', () => {
  it('ProfileHeader renders handle and headline', () => {
    render(
      <ProfileHeader
        profile={{
          handle: 'alice.bsky.social',
          headline: 'Engineer',
          followersCount: 10,
          followingCount: 5,
          connectionsCount: 3,
        }}
      />,
    );
    expect(screen.getByText('alice.bsky.social')).toBeDefined();
    expect(screen.getByText('Engineer')).toBeDefined();
    expect(screen.getByText('10 followers')).toBeDefined();
  });

  it('ProfileHeader renders without headline', () => {
    render(
      <ProfileHeader
        profile={{
          handle: 'bob.bsky.social',
          followersCount: 0,
          followingCount: 0,
          connectionsCount: 0,
        }}
      />,
    );
    expect(screen.getByText('bob.bsky.social')).toBeDefined();
    expect(screen.getByText('0 followers')).toBeDefined();
  });

  it('ExperienceSection renders positions', () => {
    render(
      <ExperienceSection
        positions={[
          {
            companyName: 'Acme',
            title: 'Engineer',
            startDate: '2020-01',
            current: true,
          },
        ]}
      />,
    );
    expect(screen.getByText('Experience')).toBeDefined();
    expect(screen.getByText('Engineer')).toBeDefined();
    expect(screen.getByText('Acme')).toBeDefined();
  });

  it('ExperienceSection returns null when empty', () => {
    const { container } = render(<ExperienceSection positions={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('EducationSection renders education entries', () => {
    render(
      <EducationSection
        education={[
          {
            institution: 'MIT',
            degree: 'BSc',
            fieldOfStudy: 'Computer Science',
            startDate: '2016',
            endDate: '2020',
          },
        ]}
      />,
    );
    expect(screen.getByText('Education')).toBeDefined();
    expect(screen.getByText('MIT')).toBeDefined();
    expect(screen.getByText('BSc, Computer Science')).toBeDefined();
  });

  it('EducationSection returns null when empty', () => {
    const { container } = render(<EducationSection education={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('SkillsSection renders skills as badges', () => {
    render(
      <SkillsSection skills={[{ skillName: 'TypeScript' }, { skillName: 'React' }]} />,
    );
    expect(screen.getByText('TypeScript')).toBeDefined();
    expect(screen.getByText('React')).toBeDefined();
  });

  it('SkillsSection returns null when empty', () => {
    const { container } = render(<SkillsSection skills={[]} />);
    expect(container.innerHTML).toBe('');
  });
});
