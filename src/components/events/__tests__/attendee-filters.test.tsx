import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AttendeeFilters } from '../attendee-filters';

function renderFilters(overrides: Partial<Parameters<typeof AttendeeFilters>[0]> = {}) {
  const defaults = {
    onSearchChange: vi.fn(),
    onRoleFilterChange: vi.fn(),
    onConnectionFilterChange: vi.fn(),
    onSortChange: vi.fn(),
    isLoggedIn: false,
    resultCount: 42,
    totalCount: 250,
  };
  const props = { ...defaults, ...overrides };
  return { ...render(<AttendeeFilters {...props} />), props };
}

describe('AttendeeFilters', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders search input', () => {
    renderFilters();

    const input = screen.getByRole('searchbox');
    expect(input).toBeDefined();
    expect(input.getAttribute('placeholder')).toBe('Search by name or handle...');
  });

  it('renders role filter chips (All, Speakers, Attendees)', () => {
    renderFilters();

    expect(screen.getByRole('button', { name: 'All' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Speakers' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Attendees' })).toBeDefined();
  });

  it('does NOT render connection filters when logged out', () => {
    renderFilters({ isLoggedIn: false });

    expect(screen.queryByRole('button', { name: 'Mutual' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Following' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Follows you' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'New to you' })).toBeNull();
  });

  it('renders connection filters when logged in', () => {
    renderFilters({ isLoggedIn: true });

    const connectionChips = ['Mutual', 'Following', 'Follows you', 'New to you'];
    for (const label of connectionChips) {
      expect(screen.getByRole('button', { name: label })).toBeDefined();
    }
  });

  it('live region shows result count', () => {
    renderFilters({ resultCount: 42, totalCount: 250 });

    const status = screen.getByRole('status');
    expect(status.textContent).toContain('Showing 42 of 250');
  });

  it('shows unfiltered count when result equals total', () => {
    renderFilters({ resultCount: 250, totalCount: 250 });

    const status = screen.getByRole('status');
    expect(status.textContent).toContain('250 attendees');
  });

  it('calls onSearchChange with debounced value on input', () => {
    const onSearchChange = vi.fn();
    renderFilters({ onSearchChange });

    const input = screen.getByRole('searchbox');

    fireEvent.change(input, { target: { value: 'alice' } });

    // Should not have called yet (debounced)
    expect(onSearchChange).not.toHaveBeenCalled();

    // Advance past debounce
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(onSearchChange).toHaveBeenCalledWith('alice');
  });

  it('calls onRoleFilterChange when clicking role chip', () => {
    const onRoleFilterChange = vi.fn();
    renderFilters({ onRoleFilterChange });

    const button = screen.getByRole('button', { name: 'Speakers' });
    act(() => {
      button.click();
    });

    expect(onRoleFilterChange).toHaveBeenCalledWith('speakers');
  });

  it('calls onConnectionFilterChange when clicking connection chip (logged in)', () => {
    const onConnectionFilterChange = vi.fn();
    renderFilters({ isLoggedIn: true, onConnectionFilterChange });

    const button = screen.getByRole('button', { name: 'Mutual' });
    act(() => {
      button.click();
    });

    expect(onConnectionFilterChange).toHaveBeenCalledWith('mutual');
  });

  it('sort dropdown shows "Connections first" option only when logged in', () => {
    // Logged out: no "Connections first"
    const { unmount } = renderFilters({ isLoggedIn: false, resultCount: 10, totalCount: 10 });

    const select = screen.getByRole('combobox');
    const options = within(select).getAllByRole('option');
    const optionTexts = options.map((o) => o.textContent);

    expect(optionTexts).not.toContain('Connections first');
    expect(optionTexts).toContain('Speakers first');
    expect(optionTexts).toContain('Alphabetical');

    unmount();

    // Logged in: has "Connections first"
    renderFilters({ isLoggedIn: true, resultCount: 10, totalCount: 10 });

    const selectLoggedIn = screen.getByRole('combobox');
    const loggedInOptions = within(selectLoggedIn).getAllByRole('option');
    const loggedInTexts = loggedInOptions.map((o) => o.textContent);

    expect(loggedInTexts).toContain('Connections first');
  });

  it('role filter chips have aria-pressed attribute', () => {
    renderFilters({ roleFilter: 'speakers' });

    expect(screen.getByRole('button', { name: 'Speakers' }).getAttribute('aria-pressed')).toBe(
      'true',
    );
    expect(screen.getByRole('button', { name: 'All' }).getAttribute('aria-pressed')).toBe('false');
  });
});
