import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { EndorsementList } from '@/components/endorsement-list';
import type { Endorsement } from '@/lib/types';

const sampleEndorsements: Endorsement[] = [
  {
    endorserDid: 'did:plc:alice',
    endorserHandle: 'alice.bsky.social',
    endorserDisplayName: 'Alice Smith',
    endorserAvatar: undefined,
    comment: '[worked_together: Stripe] Great TypeScript skills',
    relationshipContext: '[worked_together: Stripe]',
    createdAt: '2026-03-10T00:00:00Z',
  },
  {
    endorserDid: 'did:plc:bob',
    endorserHandle: 'bob.bsky.social',
    endorserDisplayName: 'Bob Jones',
    endorserAvatar: undefined,
    comment: 'Excellent problem solver',
    relationshipContext: undefined,
    createdAt: '2026-03-11T00:00:00Z',
  },
  {
    endorserDid: 'did:plc:carol',
    endorserHandle: 'carol.bsky.social',
    endorserDisplayName: undefined,
    endorserAvatar: undefined,
    comment: '[co_authored] Published research together',
    relationshipContext: '[co_authored]',
    createdAt: '2026-03-12T00:00:00Z',
  },
];

describe('EndorsementList', () => {
  it('renders each endorsement individually by name', () => {
    render(<EndorsementList endorsements={sampleEndorsements} />);

    expect(screen.getByText('Alice Smith')).toBeDefined();
    expect(screen.getByText('Bob Jones')).toBeDefined();
    // Carol has no displayName, falls back to handle
    expect(screen.getByText('carol.bsky.social')).toBeDefined();
  });

  it('shows relationship context as a tag', () => {
    render(<EndorsementList endorsements={sampleEndorsements} />);

    expect(screen.getByText('Worked together at Stripe')).toBeDefined();
    expect(screen.getByText('Co-authored')).toBeDefined();
  });

  it('shows comment text without context prefix', () => {
    render(<EndorsementList endorsements={sampleEndorsements} />);

    expect(screen.getByText('Great TypeScript skills')).toBeDefined();
    expect(screen.getByText('Excellent problem solver')).toBeDefined();
    expect(screen.getByText('Published research together')).toBeDefined();
  });

  it('never displays aggregated counts', () => {
    render(<EndorsementList endorsements={sampleEndorsements} />);

    const text = document.body.textContent ?? '';
    // Should not contain "3 endorsements" or similar count aggregation
    expect(text).not.toMatch(/\d+\s*endorsement/i);
  });

  it('does not display any "endorse back" prompts', () => {
    render(<EndorsementList endorsements={sampleEndorsements} />);

    const text = document.body.textContent ?? '';
    expect(text).not.toContain('endorse back');
    expect(text).not.toContain('Endorse back');
  });

  it('returns null for empty endorsements', () => {
    const { container } = render(<EndorsementList endorsements={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders avatar initial when no avatar URL', () => {
    render(<EndorsementList endorsements={[sampleEndorsements[0]!]} />);

    expect(screen.getByText('A')).toBeDefined();
  });

  it('passes axe accessibility audit', async () => {
    const { container } = render(<EndorsementList endorsements={sampleEndorsements} />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  }, 15_000);
});
