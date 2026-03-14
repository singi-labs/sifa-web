'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { MagnifyingGlass, X, MapPin } from '@phosphor-icons/react';
import { COUNTRIES } from '@/lib/countries';
import type { LocationValue } from '@/lib/types';
import { formatLocation } from '@/lib/location-utils';

// Re-export for backward compatibility
export type { LocationValue } from '@/lib/types';
export { formatLocation, parseLocationString } from '@/lib/location-utils';

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
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = `${id ?? 'location'}-listbox`;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const searchApi = useCallback(async (q: string, searchMode: SearchMode) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/location/search?q=${encodeURIComponent(q)}&mode=${searchMode}`);
      if (!res.ok) throw new Error('API error');
      const data = (await res.json()) as {
        results: SearchResultItem[];
        error?: string;
      };
      if (data.error === 'geonames_unavailable') throw new Error('GeoNames unavailable');
      setResults(data.results);
      setIsOpen(data.results.length > 0);
      setActiveIndex(-1);
      setApiFailed(false);
    } catch {
      setApiFailed(true);
      // For country mode, fall back to local list immediately
      if (searchMode === 'country') {
        const q2 = q.toLowerCase();
        const localResults = COUNTRIES.filter((c) => c.name.toLowerCase().includes(q2))
          .slice(0, 8)
          .map((c) => ({
            country: c.name,
            countryCode: c.code,
            label: c.name,
          }));
        setResults(localResults);
        setIsOpen(localResults.length > 0);
        setActiveIndex(-1);
      } else {
        setResults([]);
        setIsOpen(false);
      }
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

    // If API already failed and we're in country mode, use local results
    if (apiFailed && mode === 'country') {
      const q2 = q.toLowerCase();
      const localResults = COUNTRIES.filter((c) => c.name.toLowerCase().includes(q2))
        .slice(0, 8)
        .map((c) => ({
          country: c.name,
          countryCode: c.code,
          label: c.name,
        }));
      setResults(localResults);
      setIsOpen(localResults.length > 0);
      setActiveIndex(-1);
      return;
    }

    debounceRef.current = setTimeout(() => {
      void searchApi(q, mode);
    }, 300);
  };

  const handleSelect = (item: SearchResultItem) => {
    const loc: LocationValue = {
      ...(item.city ? { city: item.city } : {}),
      ...(item.region ? { region: item.region } : {}),
      country: item.country,
      ...(item.countryCode ? { countryCode: item.countryCode } : {}),
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
  };

  const handleModeChange = (newMode: SearchMode) => {
    setMode(newMode);
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setActiveIndex(-1);
    // Reset API failure when switching to country mode (local fallback available)
    if (newMode === 'country') {
      setApiFailed(false);
    }
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

  // When API failed for city/postal modes, show message + suggest country tab
  if (apiFailed && mode !== 'country') {
    return (
      <div>
        {modeTabs}
        <p className="mb-1 text-xs text-amber-600 dark:text-amber-400">
          {t('locationApiFailedWithFallback')}
        </p>
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
