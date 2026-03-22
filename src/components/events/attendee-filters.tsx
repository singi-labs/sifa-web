'use client';

import { MagnifyingGlass } from '@phosphor-icons/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

export type RoleFilter = 'all' | 'speakers' | 'attendees';
export type ConnectionFilter = 'all' | 'mutual' | 'following' | 'followedBy' | 'new';
export type SortOption = 'connections' | 'alphabetical' | 'speakers';

interface AttendeeFiltersProps {
  onSearchChange: (query: string) => void;
  onRoleFilterChange: (filter: RoleFilter) => void;
  onConnectionFilterChange: (filter: ConnectionFilter) => void;
  onSortChange: (sort: SortOption) => void;
  roleFilter?: RoleFilter;
  connectionFilter?: ConnectionFilter;
  sort?: SortOption;
  isLoggedIn: boolean;
  resultCount: number;
  totalCount: number;
  loginUrl?: string;
}

const ROLE_CHIPS: Array<{ label: string; value: RoleFilter }> = [
  { label: 'All', value: 'all' },
  { label: 'Speakers', value: 'speakers' },
  { label: 'Attendees', value: 'attendees' },
];

const CONNECTION_CHIPS: Array<{ label: string; value: ConnectionFilter }> = [
  { label: 'All', value: 'all' },
  { label: 'Mutual', value: 'mutual' },
  { label: 'Following', value: 'following' },
  { label: 'Follows you', value: 'followedBy' },
  { label: 'New to you', value: 'new' },
];

const DEBOUNCE_MS = 150;

const chipBase =
  'rounded-full px-3 py-1.5 text-sm font-medium min-h-[44px] transition-colors cursor-pointer';
const chipActive = 'bg-primary text-primary-foreground';
const chipInactive = 'bg-muted text-muted-foreground hover:bg-accent';

function FilterChip({
  label,
  pressed,
  onClick,
}: {
  label: string;
  pressed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(chipBase, pressed ? chipActive : chipInactive)}
    >
      {label}
    </button>
  );
}

function AttendeeFilters({
  onSearchChange,
  onRoleFilterChange,
  onConnectionFilterChange,
  onSortChange,
  roleFilter = 'all',
  connectionFilter = 'all',
  sort,
  isLoggedIn,
  resultCount,
  totalCount,
}: AttendeeFiltersProps) {
  const [searchValue, setSearchValue] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchValue(value);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        onSearchChange(value);
      }, DEBOUNCE_MS);
    },
    [onSearchChange],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const isFiltered = resultCount !== totalCount;
  const statusText = isFiltered
    ? `Showing ${resultCount} of ${totalCount}`
    : `${totalCount} attendees`;

  return (
    <div className="flex flex-col gap-3">
      {/* Search input */}
      <div className="sticky top-0 z-10 bg-background">
        <div className="relative">
          <MagnifyingGlass
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchValue}
            onChange={handleSearchInput}
            placeholder="Search by name or handle..."
            aria-label="Search attendees by name or handle"
            className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Filter chips row */}
      <div className="flex flex-wrap items-center gap-2">
        {ROLE_CHIPS.map((chip) => (
          <FilterChip
            key={chip.value}
            label={chip.label}
            pressed={roleFilter === chip.value}
            onClick={() => onRoleFilterChange(chip.value)}
          />
        ))}

        {isLoggedIn && (
          <>
            <span className="mx-1 text-muted-foreground" aria-hidden="true">
              |
            </span>
            {CONNECTION_CHIPS.map((chip) => (
              <FilterChip
                key={chip.value}
                label={chip.label}
                pressed={connectionFilter === chip.value}
                onClick={() => onConnectionFilterChange(chip.value)}
              />
            ))}
          </>
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span role="status" aria-live="polite" aria-atomic="true">
          {statusText}
        </span>

        <label className="flex items-center gap-2">
          <span className="sr-only">Sort attendees</span>
          <select
            value={sort ?? (isLoggedIn ? 'connections' : 'speakers')}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="rounded-md border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {isLoggedIn && <option value="connections">Connections first</option>}
            <option value="speakers">Speakers first</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </label>
      </div>
    </div>
  );
}

export { AttendeeFilters };
