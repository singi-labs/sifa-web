'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { MagnifyingGlass, X, MapPin } from '@phosphor-icons/react';

export interface LocationValue {
  city?: string;
  region?: string;
  country: string;
  postalCode?: string;
  geonameId?: number;
}

/** Format a LocationValue for display */
export function formatLocation(loc: LocationValue | null): string {
  if (!loc) return '';
  const parts = [loc.city, loc.region, loc.country].filter(Boolean);
  if (loc.postalCode && !loc.city) {
    return `${loc.postalCode}, ${loc.country}`;
  }
  return parts.join(', ');
}

/** Parse a display string back into a LocationValue (best-effort for legacy data) */
export function parseLocationString(str: string): LocationValue | null {
  if (!str.trim()) return null;
  const parts = str
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length >= 3) {
    return {
      city: parts[0],
      region: parts[1],
      country: parts[parts.length - 1]!,
    };
  }
  if (parts.length === 2) {
    return {
      city: parts[0],
      country: parts[1]!,
    };
  }
  return { country: parts[0]! };
}

const GEONAMES_BASE = 'https://secure.geonames.org';
const GEONAMES_USER = 'gxjansen';

interface GeoNameResult {
  geonameId: number;
  name: string;
  adminName1?: string;
  countryName: string;
  countryCode: string;
}

interface PostalCodeResult {
  postalCode: string;
  placeName: string;
  adminName1?: string;
  countryCode: string;
}

type SearchMode = 'city' | 'postal' | 'country';

interface SearchResultItem extends LocationValue {
  label: string;
}

interface LocationSearchProps {
  value: LocationValue | null;
  onChange: (value: LocationValue | null) => void;
  id?: string;
}

export function LocationSearch({ value, onChange, id }: LocationSearchProps) {
  const t = useTranslations('profileEdit');
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<SearchMode>('city');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiFailed, setApiFailed] = useState(false);
  const [fallbackText, setFallbackText] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = `${id ?? 'location'}-listbox`;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const searchCities = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${GEONAMES_BASE}/searchJSON?q=${encodeURIComponent(q)}&maxRows=8&featureClass=P&style=medium&username=${GEONAMES_USER}`,
      );
      if (!res.ok) throw new Error('GeoNames API error');
      const data = (await res.json()) as { geonames: GeoNameResult[] };
      const items: SearchResultItem[] = (data.geonames ?? []).map((g) => ({
        city: g.name,
        region: g.adminName1 || undefined,
        country: g.countryName,
        geonameId: g.geonameId,
        label: [g.name, g.adminName1, g.countryName].filter(Boolean).join(', '),
      }));
      setResults(items);
      setIsOpen(items.length > 0);
      setActiveIndex(-1);
      setApiFailed(false);
    } catch {
      setApiFailed(true);
      setResults([]);
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchPostalCodes = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${GEONAMES_BASE}/postalCodeSearchJSON?postalcode=${encodeURIComponent(q)}&maxRows=8&username=${GEONAMES_USER}`,
      );
      if (!res.ok) throw new Error('GeoNames API error');
      const data = (await res.json()) as { postalCodes: PostalCodeResult[] };
      const items: SearchResultItem[] = (data.postalCodes ?? []).map((p) => ({
        postalCode: p.postalCode,
        city: p.placeName || undefined,
        region: p.adminName1 || undefined,
        country: p.countryCode,
        label: [p.postalCode, p.placeName, p.adminName1, p.countryCode]
          .filter(Boolean)
          .join(', '),
      }));
      setResults(items);
      setIsOpen(items.length > 0);
      setActiveIndex(-1);
      setApiFailed(false);
    } catch {
      setApiFailed(true);
      setResults([]);
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchCountries = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${GEONAMES_BASE}/searchJSON?q=${encodeURIComponent(q)}&maxRows=8&featureCode=PCLI&style=medium&username=${GEONAMES_USER}`,
      );
      if (!res.ok) throw new Error('GeoNames API error');
      const data = (await res.json()) as { geonames: GeoNameResult[] };
      const items: SearchResultItem[] = (data.geonames ?? []).map((g) => ({
        country: g.countryName || g.name,
        label: g.countryName || g.name,
      }));
      setResults(items);
      setIsOpen(items.length > 0);
      setActiveIndex(-1);
      setApiFailed(false);
    } catch {
      setApiFailed(true);
      setResults([]);
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleQueryChange = (q: string) => {
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      if (mode === 'city') void searchCities(q);
      else if (mode === 'postal') void searchPostalCodes(q);
      else void searchCountries(q);
    }, 300);
  };

  const handleSelect = (item: SearchResultItem) => {
    const loc: LocationValue = {
      ...(item.city ? { city: item.city } : {}),
      ...(item.region ? { region: item.region } : {}),
      country: item.country,
      ...(item.postalCode ? { postalCode: item.postalCode } : {}),
      ...(item.geonameId ? { geonameId: item.geonameId } : {}),
    };
    onChange(loc);
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleClear = () => {
    onChange(null);
    setQuery('');
    setFallbackText('');
  };

  const handleModeChange = (newMode: SearchMode) => {
    setMode(newMode);
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(results[activeIndex]!);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  const placeholderForMode = () => {
    if (mode === 'city') return t('locationCityPlaceholder');
    if (mode === 'postal') return t('locationPostalPlaceholder');
    return t('locationCountryPlaceholder');
  };

  const modeTabs = (
    <div className="mb-2 flex gap-1" role="tablist" aria-label={t('location')}>
      {(['city', 'postal', 'country'] as const).map((m) => (
        <button
          key={m}
          type="button"
          role="tab"
          aria-selected={mode === m}
          onClick={() => {
            if (apiFailed) setApiFailed(false);
            handleModeChange(m);
          }}
          className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
            mode === m
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-accent'
          }`}
        >
          {t(`locationMode_${m}`)}
        </button>
      ))}
    </div>
  );

  // Fallback mode: plain text input when API fails
  if (apiFailed) {
    return (
      <div>
        {modeTabs}
        <p className="mb-1 text-xs text-amber-600 dark:text-amber-400">
          {t('locationApiFailed')}
        </p>
        <Input
          id={id}
          type="text"
          value={fallbackText}
          onChange={(e) => {
            setFallbackText(e.target.value);
            const parsed = parseLocationString(e.target.value);
            if (parsed) onChange(parsed);
          }}
          placeholder={t('locationPlaceholder')}
        />
      </div>
    );
  }

  // Selected value display
  if (value) {
    return (
      <div>
        {modeTabs}
        <div className="flex items-center gap-2 rounded-md border border-border bg-muted px-3 py-2 text-sm">
          <MapPin
            className="h-4 w-4 shrink-0 text-muted-foreground"
            weight="bold"
            aria-hidden="true"
          />
          <span className="flex-1">{formatLocation(value)}</span>
          <button
            type="button"
            onClick={handleClear}
            className="shrink-0 rounded-full p-0.5 text-muted-foreground hover:text-foreground"
            aria-label={t('locationClear')}
          >
            <X className="h-3.5 w-3.5" weight="bold" aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  }

  // Search input with typeahead dropdown
  return (
    <div>
      {modeTabs}
      <div ref={containerRef} className="relative">
        <div className="relative">
          <MagnifyingGlass
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            weight="bold"
            aria-hidden="true"
          />
          <Input
            id={id}
            type="text"
            role="combobox"
            aria-expanded={isOpen}
            aria-controls={listboxId}
            aria-activedescendant={
              activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
            }
            aria-autocomplete="list"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholderForMode()}
            className="pl-9"
            autoComplete="off"
          />
          {loading && (
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground"
              aria-live="polite"
            >
              ...
            </span>
          )}
        </div>
        {isOpen && results.length > 0 && (
          <div
            id={listboxId}
            role="listbox"
            className="absolute z-[100] mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-border bg-popover shadow-lg"
          >
            {results.map((item, i) => (
              <div
                key={`${item.label}-${i}`}
                id={`${listboxId}-option-${i}`}
                role="option"
                aria-selected={i === activeIndex}
                className={`w-full cursor-pointer px-3 py-2 text-left text-sm hover:bg-accent ${
                  i === activeIndex ? 'bg-accent' : ''
                }`}
                onClick={() => handleSelect(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelect(item);
                  }
                }}
                tabIndex={-1}
              >
                {item.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
