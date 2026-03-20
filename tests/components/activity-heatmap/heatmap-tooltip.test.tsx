import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeatmapTooltip } from '../../../src/components/activity-heatmap/heatmap-tooltip';

describe('HeatmapTooltip', () => {
  it('renders formatted date and per-app breakdown', () => {
    render(
      <HeatmapTooltip
        date="2026-03-14"
        total={8}
        apps={[
          { appId: 'bluesky', count: 5 },
          { appId: 'tangled', count: 3 },
        ]}
      />,
    );

    // Date should be formatted as full weekday, month day, year
    expect(screen.getByText(/Saturday, March 14, 2026/)).toBeDefined();
    // App names with counts
    expect(screen.getByText('Bluesky')).toBeDefined();
    expect(screen.getByText('5')).toBeDefined();
    expect(screen.getByText('Tangled')).toBeDefined();
    expect(screen.getByText('3')).toBeDefined();
    // Total footer
    expect(screen.getByText('8 total')).toBeDefined();
  });

  it('renders no-activity state', () => {
    render(<HeatmapTooltip date="2026-03-10" total={0} apps={[]} />);

    expect(screen.getByText(/Tuesday, March 10, 2026/)).toBeDefined();
    expect(screen.getByText('No activity')).toBeDefined();
  });
});
