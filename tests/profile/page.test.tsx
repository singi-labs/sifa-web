import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfileHeader } from '@/app/(main)/p/[handle]/components/profile-header';
import { ExperienceSection } from '@/app/(main)/p/[handle]/components/experience-section';
import { EducationSection } from '@/app/(main)/p/[handle]/components/education-section';
import { SkillsSection } from '@/app/(main)/p/[handle]/components/skills-section';

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

  it('ExperienceSection renders positions', async () => {
    const jsx = await ExperienceSection({
      positions: [
        {
          companyName: 'Acme',
          title: 'Engineer',
          startDate: '2020-01',
          current: true,
        },
      ],
    });
    render(jsx);
    expect(screen.getByText('Experience')).toBeDefined();
    expect(screen.getByText('Engineer')).toBeDefined();
    expect(screen.getByText('Acme')).toBeDefined();
  });

  it('ExperienceSection returns null when empty', async () => {
    const jsx = await ExperienceSection({ positions: [] });
    expect(jsx).toBeNull();
  });

  it('EducationSection renders education entries', async () => {
    const jsx = await EducationSection({
      education: [
        {
          institution: 'MIT',
          degree: 'BSc',
          fieldOfStudy: 'Computer Science',
          startDate: '2016',
          endDate: '2020',
        },
      ],
    });
    render(jsx);
    expect(screen.getByText('Education')).toBeDefined();
    expect(screen.getByText('MIT')).toBeDefined();
    expect(screen.getByText('BSc, Computer Science')).toBeDefined();
  });

  it('EducationSection returns null when empty', async () => {
    const jsx = await EducationSection({ education: [] });
    expect(jsx).toBeNull();
  });

  it('SkillsSection renders skills as badges', async () => {
    const jsx = await SkillsSection({
      skills: [{ skillName: 'TypeScript' }, { skillName: 'React' }],
    });
    render(jsx);
    expect(screen.getByText('TypeScript')).toBeDefined();
    expect(screen.getByText('React')).toBeDefined();
  });

  it('SkillsSection returns null when empty', async () => {
    const jsx = await SkillsSection({ skills: [] });
    expect(jsx).toBeNull();
  });
});
