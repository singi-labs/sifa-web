import { describe, expect, it } from 'vitest';
import { formatLocation, countryCodeToFlag, parseLocationString } from '@/lib/location-utils';

describe('formatLocation', () => {
  it('returns empty string for null', () => {
    expect(formatLocation(null)).toBe('');
  });

  it('formats city, region, country', () => {
    expect(
      formatLocation({ city: 'Amsterdam', region: 'North Holland', country: 'Netherlands' }),
    ).toBe('Amsterdam, North Holland, Netherlands');
  });

  it('formats city, country (no region)', () => {
    expect(formatLocation({ city: 'Berlin', country: 'Germany' })).toBe('Berlin, Germany');
  });

  it('formats country only', () => {
    expect(formatLocation({ country: 'Japan' })).toBe('Japan');
  });

  it('formats postalCode fallback when no city', () => {
    expect(formatLocation({ postalCode: '1234AB', country: 'Netherlands' })).toBe(
      '1234AB, Netherlands',
    );
  });
});

describe('countryCodeToFlag', () => {
  it('converts NL to Dutch flag', () => {
    expect(countryCodeToFlag('NL')).toBe('\u{1F1F3}\u{1F1F1}');
  });

  it('converts US to US flag', () => {
    expect(countryCodeToFlag('US')).toBe('\u{1F1FA}\u{1F1F8}');
  });

  it('handles lowercase input', () => {
    expect(countryCodeToFlag('nl')).toBe('\u{1F1F3}\u{1F1F1}');
  });

  it('returns empty string for undefined', () => {
    expect(countryCodeToFlag(undefined)).toBe('');
  });

  it('returns empty string for invalid code', () => {
    expect(countryCodeToFlag('X')).toBe('');
  });
});

describe('parseLocationString', () => {
  it('returns null for empty string', () => {
    expect(parseLocationString('')).toBeNull();
  });

  it('parses "City, Country"', () => {
    expect(parseLocationString('Berlin, Germany')).toEqual({
      city: 'Berlin',
      country: 'Germany',
    });
  });

  it('parses "City, Region, Country"', () => {
    expect(parseLocationString('Amsterdam, North Holland, Netherlands')).toEqual({
      city: 'Amsterdam',
      region: 'North Holland',
      country: 'Netherlands',
    });
  });

  it('parses single value as country', () => {
    expect(parseLocationString('Japan')).toEqual({ country: 'Japan' });
  });
});
