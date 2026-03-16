import { describe, it, expect } from 'vitest';
import {
  sortByDateDesc,
  dateRangeExtractor,
  singleDateExtractor,
  certDateExtractor,
} from '@/lib/sort-by-date';

describe('sortByDateDesc', () => {
  it('sorts by end date descending', () => {
    const items = [
      { rkey: '1', startDate: '2018-01', endDate: '2020-01' },
      { rkey: '2', startDate: '2020-01', endDate: '2023-06' },
      { rkey: '3', startDate: '2015-01', endDate: '2018-01' },
    ];
    const sorted = sortByDateDesc(items, dateRangeExtractor);
    expect(sorted.map((i) => i.rkey)).toEqual(['2', '1', '3']);
  });

  it('sorts current/ongoing items to the top', () => {
    const items = [
      { rkey: '1', startDate: '2018-01', endDate: '2020-01' },
      { rkey: '2', startDate: '2020-01', current: true },
      { rkey: '3', startDate: '2022-01', endDate: '2023-06' },
    ];
    const sorted = sortByDateDesc(items, dateRangeExtractor);
    expect(sorted.map((i) => i.rkey)).toEqual(['2', '3', '1']);
  });

  it('uses start date as tiebreaker when end dates match', () => {
    const items = [
      { rkey: '1', startDate: '2018-01', endDate: '2023-06' },
      { rkey: '2', startDate: '2020-01', endDate: '2023-06' },
    ];
    const sorted = sortByDateDesc(items, dateRangeExtractor);
    expect(sorted.map((i) => i.rkey)).toEqual(['2', '1']);
  });

  it('puts items with no dates at the bottom', () => {
    const items = [
      { rkey: '1' },
      { rkey: '2', startDate: '2020-01', endDate: '2023-06' },
      { rkey: '3' },
    ];
    const sorted = sortByDateDesc(items, dateRangeExtractor);
    expect(sorted[0]!.rkey).toBe('2');
  });

  it('handles items with only start date', () => {
    const items = [
      { rkey: '1', startDate: '2018-01' },
      { rkey: '2', startDate: '2023-01' },
    ];
    const sorted = sortByDateDesc(items, dateRangeExtractor);
    expect(sorted.map((i) => i.rkey)).toEqual(['2', '1']);
  });

  it('does not mutate the original array', () => {
    const items = [
      { rkey: '1', startDate: '2023-01' },
      { rkey: '2', startDate: '2018-01' },
    ];
    const original = [...items];
    sortByDateDesc(items, dateRangeExtractor);
    expect(items).toEqual(original);
  });
});

describe('singleDateExtractor', () => {
  it('sorts by single date descending', () => {
    const items = [
      { rkey: '1', date: '2020' },
      { rkey: '2', date: '2023' },
      { rkey: '3', date: '2018' },
    ];
    const sorted = sortByDateDesc(items, singleDateExtractor);
    expect(sorted.map((i) => i.rkey)).toEqual(['2', '1', '3']);
  });
});

describe('certDateExtractor', () => {
  it('sorts by expiry date then issue date', () => {
    const items = [
      { rkey: '1', issueDate: '2020-01', expiryDate: '2023-01' },
      { rkey: '2', issueDate: '2022-06', expiryDate: '2025-06' },
      { rkey: '3', issueDate: '2021-01' },
    ];
    const sorted = sortByDateDesc(items, certDateExtractor);
    expect(sorted.map((i) => i.rkey)).toEqual(['2', '1', '3']);
  });

  it('falls back to issueDate when no expiryDate', () => {
    const items = [
      { rkey: '1', issueDate: '2020-01' },
      { rkey: '2', issueDate: '2023-01' },
    ];
    const sorted = sortByDateDesc(items, certDateExtractor);
    expect(sorted.map((i) => i.rkey)).toEqual(['2', '1']);
  });
});
