import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DataTransparencyCard } from '@/components/data-transparency-card';

describe('DataTransparencyCard', () => {
  it('renders explainer text and link with correct DID', () => {
    render(<DataTransparencyCard did="did:plc:abc123" />);

    expect(screen.getByText('Your data on the AT Protocol')).toBeDefined();

    const link = screen.getByRole('link', { name: /view your raw data/i });
    expect(link).toBeDefined();
    expect(link.getAttribute('href')).toBe('https://atproto.at/viewer?uri=did:plc:abc123');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('renders explainer body text about data portability', () => {
    render(<DataTransparencyCard did="did:plc:abc123" />);

    expect(
      screen.getByText(/your professional profile is stored in your Personal Data Server/i),
    ).toBeDefined();
  });

  it('has accessible section landmark', () => {
    render(<DataTransparencyCard did="did:plc:abc123" />);

    expect(screen.getByRole('region', { name: 'Your data on the AT Protocol' })).toBeDefined();
  });
});
