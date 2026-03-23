import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DataTransparencyCard } from '@/components/data-transparency-card';

vi.mock('@/components/profile-edit-provider', () => ({
  useProfileEdit: () => ({
    profile: { isOwnProfile: true },
    isActualOwner: true,
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
