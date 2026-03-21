import { describe, it, expect } from 'vitest';
import {
  getDominantApp,
  getSecondaryApp,
  countToLevel,
  transformHeatmapData,
} from '../../../src/components/activity-heatmap/heatmap-colors';

describe('getDominantApp', () => {
  it('returns the app with highest count', () => {
    const apps = [
      { appId: 'tangled', count: 2 },
      { appId: 'bluesky', count: 5 },
      { appId: 'frontpage', count: 1 },
    ];
    expect(getDominantApp(apps)).toBe('bluesky');
  });

  it('breaks ties alphabetically', () => {
    const apps = [
      { appId: 'tangled', count: 3 },
      { appId: 'bluesky', count: 3 },
    ];
    expect(getDominantApp(apps)).toBe('bluesky');
  });

  it('returns null for empty array', () => {
    expect(getDominantApp([])).toBeNull();
  });
});

describe('getSecondaryApp', () => {
  it('returns the second most active app', () => {
    const apps = [
      { appId: 'bluesky', count: 5 },
      { appId: 'tangled', count: 3 },
    ];
    expect(getSecondaryApp(apps)).toBe('tangled');
  });

  it('returns null for single app', () => {
    expect(getSecondaryApp([{ appId: 'bluesky', count: 5 }])).toBeNull();
  });

  it('returns null for empty array', () => {
    expect(getSecondaryApp([])).toBeNull();
  });
});

describe('countToLevel', () => {
  const thresholds: [number, number, number, number] = [2, 5, 10, 20];

  it('returns 0 for count 0', () => {
    expect(countToLevel(0, thresholds)).toBe(0);
  });

  it('returns 1 for count <= first threshold', () => {
    expect(countToLevel(1, thresholds)).toBe(1);
    expect(countToLevel(2, thresholds)).toBe(1);
  });

  it('returns 2 for count <= second threshold', () => {
    expect(countToLevel(3, thresholds)).toBe(2);
    expect(countToLevel(5, thresholds)).toBe(2);
  });

  it('returns 3 for count <= third threshold', () => {
    expect(countToLevel(6, thresholds)).toBe(3);
    expect(countToLevel(10, thresholds)).toBe(3);
  });

  it('returns 4 for count above third threshold', () => {
    expect(countToLevel(11, thresholds)).toBe(4);
    expect(countToLevel(100, thresholds)).toBe(4);
  });
});

describe('transformHeatmapData', () => {
  it('transforms API response days into HeatmapDayData', () => {
    const days = [
      {
        date: '2026-03-15',
        total: 8,
        apps: [
          { appId: 'bluesky', count: 5 },
          { appId: 'tangled', count: 3 },
        ],
      },
    ];
    const thresholds: [number, number, number, number] = [2, 5, 10, 20];
    const result = transformHeatmapData(days, thresholds);

    expect(result).toHaveLength(1);
    expect(result[0]!.dominantApp).toBe('bluesky');
    expect(result[0]!.secondaryApp).toBe('tangled');
    expect(result[0]!.level).toBe(3); // 8 <= 10
  });
});
