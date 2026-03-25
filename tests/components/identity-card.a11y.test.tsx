import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { IdentityCard } from '@/components/identity-card';

Object.assign(navigator, { clipboard: { writeText: vi.fn() } });

vi.mock('@/components/profile-edit-provider', () => ({
  useProfileEdit: () => ({
    profile: { isOwnProfile: false },
    isActualOwner: false,
    previewMode: false,
    togglePreview: vi.fn(),
    updateProfile: vi.fn(),
    addItem: vi.fn(),
    updateItem: vi.fn(),
    removeItem: vi.fn(),
    editRequest: null,
    requestEdit: vi.fn(),
    clearEditRequest: vi.fn(),
  }),
}));

describe('IdentityCard accessibility', () => {
  it('has no a11y violations', async () => {
    const { container } = render(
      <IdentityCard
        did="did:plc:abc123"
        handle="alice.bsky.social"
        displayName="Alice Smith"
        headline="Senior Engineer"
        location={{ country: 'Amsterdam' }}
        claimed={true}
        trustStats={[
          { key: 'connections', label: 'Connections', value: 10 },
          { key: 'endorsements', label: 'Endorsements', value: 5 },
          { key: 'reactions', label: 'Reactions', value: 20 },
        ]}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations for own profile', async () => {
    const { container } = render(
      <IdentityCard
        did="did:plc:abc123"
        handle="alice.bsky.social"
        displayName="Alice Smith"
        claimed={true}
        isOwnProfile={true}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations for embed variant', async () => {
    const { container } = render(
      <IdentityCard
        did="did:plc:abc123"
        handle="alice.bsky.social"
        displayName="Alice Smith"
        headline="Senior Engineer"
        claimed={true}
        variant="embed"
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations with featured skills', async () => {
    const { container } = render(
      <IdentityCard
        did="did:plc:abc123"
        handle="alice.bsky.social"
        displayName="Alice Smith"
        headline="Senior Engineer"
        claimed={true}
        featuredSkills={[
          { rkey: 's1', name: 'TypeScript' },
          { rkey: 's2', name: 'React' },
        ]}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations for embed with availability', async () => {
    const { container } = render(
      <IdentityCard
        did="did:plc:abc123"
        handle="alice.bsky.social"
        displayName="Alice Smith"
        headline="Senior Engineer"
        claimed={true}
        variant="embed"
        openTo={['id.sifa.defs#fullTimeRoles']}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
