import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeatmapLegend } from '../../../src/components/activity-heatmap/heatmap-legend';

const appTotals = [
  { appId: 'bluesky', appName: 'Bluesky', total: 42 },
  { appId: 'tangled', appName: 'Tangled', total: 18 },
  { appId: 'frontpage', appName: 'Frontpage', total: 5 },
];

describe('HeatmapLegend', () => {
  it('renders Less and More labels for intensity scale', () => {
    render(<HeatmapLegend appTotals={appTotals} showAppKey={false} />);

    expect(screen.getByText('Less')).toBeDefined();
    expect(screen.getByText('More')).toBeDefined();
  });

  it('renders app names when showAppKey is true', () => {
    render(<HeatmapLegend appTotals={appTotals} showAppKey={true} />);

    expect(screen.getByText('Bluesky')).toBeDefined();
    expect(screen.getByText('Tangled')).toBeDefined();
    expect(screen.getByText('Frontpage')).toBeDefined();
  });

  it('hides app names when showAppKey is false', () => {
    render(<HeatmapLegend appTotals={appTotals} showAppKey={false} />);

    expect(screen.queryByText('Bluesky')).toBeNull();
    expect(screen.queryByText('Tangled')).toBeNull();
    expect(screen.queryByText('Frontpage')).toBeNull();
  });
});
