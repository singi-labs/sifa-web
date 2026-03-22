import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { ActivityHeatmap } from '../../../src/components/activity-heatmap/activity-heatmap';

// Mock ResizeObserver for test environment
globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

vi.mock('react-activity-calendar', () => ({
  default: function MockActivityCalendar() {
    return <div data-testid="mock-activity-calendar" />;
  },
}));

const mockFetchHeatmapData = vi.fn();

vi.mock('@/lib/api', () => ({
  fetchHeatmapData: (...args: unknown[]) => mockFetchHeatmapData(...args),
}));

const sampleResponse = {
  days: [
    { date: '2026-03-15', total: 5, apps: [{ appId: 'bluesky', count: 5 }] },
    { date: '2026-03-16', total: 3, apps: [{ appId: 'tangled', count: 3 }] },
  ],
  appTotals: [
    { appId: 'bluesky', appName: 'Bluesky', total: 5 },
    { appId: 'tangled', appName: 'Tangled', total: 3 },
  ],
  thresholds: [2, 5, 10, 20] as [number, number, number, number],
};

describe('ActivityHeatmap', () => {
  beforeEach(() => {
    mockFetchHeatmapData.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders loading text initially', () => {
    mockFetchHeatmapData.mockReturnValue(new Promise(() => {})); // never resolves
    render(<ActivityHeatmap handle="test.bsky.social" days={180} variant="compact" />);
    expect(screen.getByRole('status')).toBeDefined();
    expect(screen.getByText('Loading activity...')).toBeDefined();
  });

  it('shows slow-loading message after 3 seconds', async () => {
    vi.useFakeTimers();
    mockFetchHeatmapData.mockReturnValue(new Promise(() => {})); // never resolves
    render(<ActivityHeatmap handle="test.bsky.social" days={180} variant="compact" />);

    expect(screen.getByText('Loading activity...')).toBeDefined();

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByText("Dang, that's a lot of activity! Hold on...")).toBeDefined();
    vi.useRealTimers();
  });

  it('renders content after data loads', async () => {
    mockFetchHeatmapData.mockResolvedValue(sampleResponse);
    render(<ActivityHeatmap handle="test.bsky.social" days={180} variant="full" />);

    await waitFor(() => {
      expect(screen.getByTestId('heatmap-grid')).toBeDefined();
    });
  });

  it('renders empty state when API returns null', async () => {
    mockFetchHeatmapData.mockResolvedValue(null);
    render(<ActivityHeatmap handle="test.bsky.social" days={180} variant="compact" />);

    await waitFor(() => {
      expect(screen.getByText('Activity across the ATmosphere will appear here.')).toBeDefined();
    });
  });

  it('renders empty state when days array is empty', async () => {
    mockFetchHeatmapData.mockResolvedValue({
      days: [],
      appTotals: [],
      thresholds: [2, 5, 10, 20],
    });
    render(<ActivityHeatmap handle="test.bsky.social" days={180} variant="compact" />);

    await waitFor(() => {
      expect(screen.getByText('Activity across the ATmosphere will appear here.')).toBeDefined();
    });
  });
});
