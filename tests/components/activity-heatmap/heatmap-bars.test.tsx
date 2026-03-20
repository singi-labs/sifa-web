import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { HeatmapDayData } from '../../../src/components/activity-heatmap/heatmap-colors';
import { HeatmapBars } from '../../../src/components/activity-heatmap/heatmap-bars';

function makeDay(date: string, apps: { appId: string; count: number }[]): HeatmapDayData {
  const total = apps.reduce((s, a) => s + a.count, 0);
  return {
    date,
    total,
    apps,
    dominantApp: apps.length > 0 ? apps[0]!.appId : null,
    level: total > 0 ? 1 : 0,
    secondaryApp: null,
  };
}

describe('HeatmapBars', () => {
  it('renders one bar per month with correct totals', () => {
    const days: HeatmapDayData[] = [
      // March 2026 - 2 days
      makeDay('2026-03-01', [{ appId: 'bluesky', count: 3 }]),
      makeDay('2026-03-02', [{ appId: 'tangled', count: 2 }]),
      // February 2026 - 1 day
      makeDay('2026-02-15', [{ appId: 'bluesky', count: 7 }]),
    ];

    const { container } = render(<HeatmapBars days={days} />);

    // Should show month labels
    expect(screen.getByText('Mar')).toBeDefined();
    expect(screen.getByText('Feb')).toBeDefined();

    // Should show totals
    expect(screen.getByText('5')).toBeDefined(); // March: 3 + 2
    expect(screen.getByText('7')).toBeDefined(); // February: 7

    // Newest month first: Mar before Feb
    const labels = container.querySelectorAll('[data-testid="bar-label"]');
    expect(labels.length).toBe(2);
    expect(labels[0]!.textContent).toBe('Mar');
    expect(labels[1]!.textContent).toBe('Feb');
  });

  it('renders nothing when no days', () => {
    const { container } = render(<HeatmapBars days={[]} />);
    expect(container.innerHTML).toBe('');
  });
});
