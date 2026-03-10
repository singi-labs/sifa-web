import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TrackRecord } from '@/components/track-record';

describe('TrackRecord', () => {
  it('renders title and public cards', () => {
    render(<TrackRecord />);

    expect(screen.getByText('Track Record')).toBeDefined();
    expect(screen.getByText('Endorsements')).toBeDefined();
    expect(screen.getByText('Verified Accounts')).toBeDefined();
    expect(screen.getByText('Reactions Received')).toBeDefined();
    expect(screen.getByText('Community Presence')).toBeDefined();
  });

  it('hides auth-only cards for unauthenticated viewers', () => {
    render(<TrackRecord isAuthenticated={false} />);

    expect(screen.queryByText('Mutual Connections')).toBeNull();
    expect(screen.queryByText('Shared History')).toBeNull();
  });

  it('shows auth-only cards for authenticated viewers', () => {
    render(<TrackRecord isAuthenticated={true} />);

    expect(screen.getByText('Mutual Connections')).toBeDefined();
    expect(screen.getByText('Shared History')).toBeDefined();
  });

  it('renders all 6 cards when authenticated', () => {
    render(<TrackRecord isAuthenticated={true} />);

    const cards = screen.getAllByText(
      /Endorsements|Verified Accounts|Reactions Received|Community Presence|Mutual Connections|Shared History/,
    );
    expect(cards).toHaveLength(6);
  });
});
