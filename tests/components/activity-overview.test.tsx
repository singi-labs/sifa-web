import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActivityOverview } from '@/components/activity-overview';

describe('ActivityOverview', () => {
  it('renders title and coming soon message', () => {
    render(<ActivityOverview handle="alice.bsky.social" />);

    expect(screen.getByText('Activity')).toBeDefined();
    expect(screen.getByText(/coming soon/i)).toBeDefined();
  });

  it('links to full activity page', () => {
    render(<ActivityOverview handle="alice.bsky.social" />);

    const link = screen.getByRole('link', { name: /View full activity/ });
    expect(link.getAttribute('href')).toBe('/p/alice.bsky.social/activity');
  });
});
