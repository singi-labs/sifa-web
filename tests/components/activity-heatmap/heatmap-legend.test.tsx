import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeatmapLegend } from '../../../src/components/activity-heatmap/heatmap-legend';

const appTotals = [
  { appId: 'bluesky', appName: 'Bluesky', total: 42 },
  { appId: 'tangled', appName: 'Tangled', total: 18 },
  { appId: 'frontpage', appName: 'Frontpage', total: 5 },
];

describe('HeatmapLegend', () => {
  it('renders app names when showAppKey is true', () => {
    render(<HeatmapLegend appTotals={appTotals} showAppKey={true} />);

    expect(screen.getByText('Bluesky')).toBeDefined();
    expect(screen.getByText('Tangled')).toBeDefined();
    expect(screen.getByText('Frontpage')).toBeDefined();
  });

  it('renders nothing when showAppKey is false', () => {
    const { container } = render(<HeatmapLegend appTotals={appTotals} showAppKey={false} />);

    expect(container.innerHTML).toBe('');
  });

  it('renders nothing when appTotals is empty', () => {
    const { container } = render(<HeatmapLegend appTotals={[]} showAppKey={true} />);

    expect(container.innerHTML).toBe('');
  });
});
