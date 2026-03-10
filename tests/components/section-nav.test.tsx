import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SectionNav } from '@/components/section-nav';

// Mock IntersectionObserver
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();

beforeEach(() => {
  mockObserve.mockClear();
  mockDisconnect.mockClear();
  vi.stubGlobal(
    'IntersectionObserver',
    vi.fn(function (this: Record<string, unknown>) {
      this.observe = mockObserve;
      this.disconnect = mockDisconnect;
      this.unobserve = vi.fn();
    }),
  );
});

const threeSections = [
  { id: 'career', label: 'Career' },
  { id: 'education', label: 'Education' },
  { id: 'skills', label: 'Skills' },
];

const twoSections = [
  { id: 'career', label: 'Career' },
  { id: 'education', label: 'Education' },
];

describe('SectionNav', () => {
  it('renders nothing when fewer than 3 sections', () => {
    const { container } = render(<SectionNav sections={twoSections} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders nav with section links when 3+ sections', () => {
    render(<SectionNav sections={threeSections} />);
    const navs = screen.getAllByRole('navigation', { name: 'Profile sections' });
    expect(navs.length).toBe(2); // desktop + mobile
    expect(screen.getAllByText('Career').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('Education').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('Skills').length).toBeGreaterThanOrEqual(2);
  });

  it('sets up IntersectionObserver for scroll spy', () => {
    // Create elements for the observer to find
    for (const s of threeSections) {
      const el = document.createElement('div');
      el.id = s.id;
      document.body.appendChild(el);
    }

    render(<SectionNav sections={threeSections} />);
    expect(IntersectionObserver).toHaveBeenCalled();
    expect(mockObserve).toHaveBeenCalledTimes(3);

    // Cleanup
    for (const s of threeSections) {
      document.getElementById(s.id)?.remove();
    }
  });

  it('scrolls to section on click', async () => {
    const user = userEvent.setup();
    const scrollIntoView = vi.fn();

    const el = document.createElement('div');
    el.id = 'career';
    el.scrollIntoView = scrollIntoView;
    document.body.appendChild(el);

    render(<SectionNav sections={threeSections} />);

    const buttons = screen.getAllByRole('button', { name: 'Career' });
    const firstButton = buttons[0];
    expect(firstButton).toBeDefined();
    await user.click(firstButton!);
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });

    el.remove();
  });
});
