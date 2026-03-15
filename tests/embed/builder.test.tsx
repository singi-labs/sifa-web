import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmbedBuilder } from '@/components/embed-builder';

// Mock auth-provider
vi.mock('@/components/auth-provider', () => ({
  useAuth: () => ({ session: null, isLoading: false, refresh: vi.fn() }),
}));

// Mock clipboard
Object.assign(navigator, {
  clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
});

describe('EmbedBuilder', () => {
  it('renders identifier input field', () => {
    render(<EmbedBuilder />);
    expect(screen.getByLabelText('Handle or DID')).toBeDefined();
  });

  it('generates script tag with data-handle for handle input', () => {
    render(<EmbedBuilder />);
    fireEvent.change(screen.getByLabelText('Handle or DID'), {
      target: { value: 'alice.bsky.social' },
    });

    const code = screen.getByTestId('embed-code');
    expect(code.textContent).toContain('data-handle="alice.bsky.social"');
    expect(code.textContent).toContain('sifa.id/embed.js');
  });

  it('generates script tag with data-did for DID input', () => {
    render(<EmbedBuilder />);
    fireEvent.change(screen.getByLabelText('Handle or DID'), {
      target: { value: 'did:plc:abc123' },
    });

    const code = screen.getByTestId('embed-code');
    expect(code.textContent).toContain('data-did="did:plc:abc123"');
  });

  it('does not include data-theme in embed code', () => {
    render(<EmbedBuilder />);
    fireEvent.change(screen.getByLabelText('Handle or DID'), {
      target: { value: 'alice.bsky.social' },
    });

    const code = screen.getByTestId('embed-code');
    expect(code.textContent).not.toContain('data-theme');
  });

  it('does not show code block when no identifier entered', () => {
    render(<EmbedBuilder />);
    expect(screen.queryByTestId('embed-code')).toBeNull();
  });

  it('shows placeholder when no identifier', () => {
    render(<EmbedBuilder />);
    expect(screen.getByText('Enter a handle or DID to see a preview')).toBeDefined();
  });

  it('shows theme auto-adaptation note', () => {
    render(<EmbedBuilder />);
    expect(screen.getByText(/automatically adjusts between light and dark/)).toBeDefined();
  });

  it('copies code to clipboard on button click', () => {
    render(<EmbedBuilder />);
    fireEvent.change(screen.getByLabelText('Handle or DID'), {
      target: { value: 'alice.bsky.social' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });
});
