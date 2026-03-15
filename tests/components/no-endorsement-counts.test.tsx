import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfileEditProvider } from '@/components/profile-edit-provider';
import { SkillsSection } from '@/components/profile-sections/skills-section';
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

describe('No endorsement counts displayed', () => {
  it('does not render endorsementCount in skills section', () => {
    const skills = [
      { rkey: '1', skillName: 'TypeScript', endorsementCount: 42 },
      { rkey: '2', skillName: 'React', endorsementCount: 15 },
      { rkey: '3', skillName: 'Node.js', endorsementCount: 0 },
    ];
    withProvider(<SkillsSection skills={skills} />, { skills });

    // Skill names should be present
    expect(screen.getByText('TypeScript')).toBeDefined();
    expect(screen.getByText('React')).toBeDefined();
    expect(screen.getByText('Node.js')).toBeDefined();

    // Endorsement counts should NOT be rendered
    expect(screen.queryByText('42')).toBeNull();
    expect(screen.queryByText('15')).toBeNull();
  });

  it('does not render any numeric endorsement indicators on skill badges', () => {
    const skills = [{ rkey: '1', skillName: 'Python', endorsementCount: 100 }];
    withProvider(<SkillsSection skills={skills} />, { skills });

    // The number 100 should not appear anywhere
    expect(screen.queryByText('100')).toBeNull();
  });
});
