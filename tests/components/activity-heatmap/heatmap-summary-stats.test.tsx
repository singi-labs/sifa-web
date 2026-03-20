import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeatmapSummaryStats } from '../../../src/components/activity-heatmap/heatmap-summary-stats';

describe('HeatmapSummaryStats', () => {
  it('renders all three stats', () => {
    render(
      <HeatmapSummaryStats
        totalActions={127}
        months={6}
        mostActiveApp="Bluesky"
        appCount={4}
      />,
    );

    expect(screen.getByText('127 actions in 6 months')).toBeDefined();
    expect(screen.getByText('Most active: Bluesky')).toBeDefined();
    expect(screen.getByText('4 apps active')).toBeDefined();
  });

  it('omits most active app when null', () => {
    render(
      <HeatmapSummaryStats totalActions={0} months={6} mostActiveApp={null} appCount={0} />,
    );

    expect(screen.getByText('0 actions in 6 months')).toBeDefined();
    expect(screen.queryByText(/Most active/)).toBeNull();
    expect(screen.getByText('0 apps active')).toBeDefined();
  });
});
