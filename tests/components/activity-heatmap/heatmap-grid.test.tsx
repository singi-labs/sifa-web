import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeatmapGrid } from '../../../src/components/activity-heatmap/heatmap-grid';
import type { HeatmapDayData } from '../../../src/components/activity-heatmap/heatmap-colors';

// Mock ResizeObserver for test environment
globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

vi.mock('react-activity-calendar', () => ({
  default: function MockActivityCalendar(props: { data: unknown[] }) {
    return <div data-testid="mock-activity-calendar">{String(props.data?.length)}</div>;
  },
}));

const sampleDays: HeatmapDayData[] = [
  {
    date: '2026-03-15',
    total: 5,
    apps: [{ appId: 'bluesky', count: 5 }],
    dominantApp: 'bluesky',
    level: 2,
    secondaryApp: null,
  },
  {
    date: '2026-03-16',
    total: 0,
    apps: [],
    dominantApp: null,
    level: 0,
    secondaryApp: null,
  },
];

describe('HeatmapGrid', () => {
  it('renders with data-testid', () => {
    render(
      <HeatmapGrid days={sampleDays} daysBack={180} onSelectDate={undefined} selectedDate={null} />,
    );
    expect(screen.getByTestId('heatmap-grid')).toBeDefined();
  });

  it('renders with empty days array', () => {
    render(<HeatmapGrid days={[]} daysBack={180} onSelectDate={undefined} selectedDate={null} />);
    expect(screen.getByTestId('heatmap-grid')).toBeDefined();
  });

  it('passes data to ActivityCalendar', () => {
    render(
      <HeatmapGrid days={sampleDays} daysBack={180} onSelectDate={undefined} selectedDate={null} />,
    );
    const calendar = screen.getByTestId('mock-activity-calendar');
    expect(calendar).toBeDefined();
    // Data length should be > 2 since we fill in all dates for the 6-month range
    const count = Number(calendar.textContent);
    expect(count).toBeGreaterThan(2);
  });
});
