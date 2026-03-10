import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AboutSection } from '@/components/about-section';

describe('AboutSection', () => {
  it('renders about text', () => {
    render(<AboutSection about="Hello world" />);
    expect(screen.getByText('Hello world')).toBeDefined();
  });

  it('returns null when no about and not own profile', () => {
    const { container } = render(<AboutSection about="" />);
    expect(container.innerHTML).toBe('');
  });

  it('shows prompt for own profile when empty', () => {
    render(<AboutSection about="" isOwnProfile={true} />);
    expect(screen.getByText('Add a professional summary')).toBeDefined();
  });

  it('collapses long text with read more button', () => {
    const longText = 'A'.repeat(400);
    render(<AboutSection about={longText} />);

    expect(screen.getByText(/A{100,}\.\.\.$/)).toBeDefined();
    expect(screen.getByRole('button', { name: 'Read more' })).toBeDefined();
  });

  it('expands text on read more click', async () => {
    const user = userEvent.setup();
    const longText = 'A'.repeat(400);
    render(<AboutSection about={longText} />);

    await user.click(screen.getByRole('button', { name: 'Read more' }));

    expect(screen.getByRole('button', { name: 'Read less' })).toBeDefined();
    // Full text should not end with ...
    expect(screen.getByText(longText)).toBeDefined();
  });

  it('does not show read more for short text', () => {
    render(<AboutSection about="Short text" />);
    expect(screen.queryByRole('button', { name: 'Read more' })).toBeNull();
  });
});
