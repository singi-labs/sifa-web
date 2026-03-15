'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { MagnifyingGlass, X } from '@phosphor-icons/react';
import { searchSkills } from '@/lib/profile-api';
import type { SkillSuggestion } from '@/lib/types';

interface SkillComboboxProps {
  value: string;
  category: string;
  onChange: (skillName: string, category: string) => void;
  /** Fires only on explicit selection (dropdown click or Enter). */
  onSelect?: (skillName: string, category: string) => void;
  id?: string;
}

export function SkillCombobox({ value, category, onChange, onSelect, id }: SkillComboboxProps) {
  const t = useTranslations('sections');
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<SkillSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = `${id ?? 'skill'}-listbox`;

  // Sync external value changes
  useEffect(() => {
    setQuery(value);
  }, [value]);

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

  const performSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    setLoading(true);
    try {
      const suggestions = await searchSkills(q);
      setResults(suggestions);
      setIsOpen(true);
      setActiveIndex(-1);
    } catch {
      // Graceful fallback: keep dropdown closed, allow free text
      setResults([]);
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleQueryChange = (q: string) => {
    setQuery(q);
    // Also update the parent with the typed text (free text entry)
    onChange(q, category);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      void performSearch(q);
    }, 300);
  };

  const handleSelect = (suggestion: SkillSuggestion) => {
    setQuery(suggestion.canonicalName);
    onChange(suggestion.canonicalName, suggestion.category);
    onSelect?.(suggestion.canonicalName, suggestion.category);
    setResults([]);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleSelectFreeText = () => {
    // Use the current query as-is
    onChange(query, category);
    onSelect?.(query, category);
    setResults([]);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleClear = () => {
    setQuery('');
    onChange('', '');
    setResults([]);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  // Total options: results + possible "Add as new" option
  const hasExactMatch = results.some(
    (r) => r.canonicalName.toLowerCase() === query.trim().toLowerCase(),
  );
  const showAddNew = query.trim().length >= 2 && !hasExactMatch;
  const totalOptions = results.length + (showAddNew ? 1 : 0);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || totalOptions === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < totalOptions - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : totalOptions - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      if (activeIndex < results.length) {
        handleSelect(results[activeIndex]!);
      } else {
        handleSelectFreeText();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
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
          aria-label={t('skills')}
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="TypeScript, React, Project Management..."
          className="pl-9 pr-8"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:text-foreground"
            onClick={handleClear}
            aria-label="Clear skill search"
          >
            <X className="h-3.5 w-3.5" weight="bold" aria-hidden="true" />
          </button>
        )}
        {loading && (
          <span
            className="absolute right-8 top-1/2 -translate-y-1/2 text-xs text-muted-foreground"
            aria-live="polite"
          >
            ...
          </span>
        )}
      </div>
      {isOpen && totalOptions > 0 && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute z-[100] mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-border bg-popover shadow-lg"
        >
          {results.map((suggestion, i) => (
            <div
              key={suggestion.slug}
              id={`${listboxId}-option-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              className={`w-full cursor-pointer px-3 py-2 text-left text-sm hover:bg-accent ${
                i === activeIndex ? 'bg-accent' : ''
              }`}
              onClick={() => handleSelect(suggestion)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelect(suggestion);
                }
              }}
              tabIndex={-1}
            >
              <span className="font-medium">{suggestion.canonicalName}</span>
              {suggestion.category && (
                <span className="ml-2 text-xs text-muted-foreground">{suggestion.category}</span>
              )}
            </div>
          ))}
          {showAddNew && (
            <div
              id={`${listboxId}-option-${results.length}`}
              role="option"
              aria-selected={activeIndex === results.length}
              className={`w-full cursor-pointer border-t border-border px-3 py-2 text-left text-sm hover:bg-accent ${
                activeIndex === results.length ? 'bg-accent' : ''
              }`}
              onClick={handleSelectFreeText}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelectFreeText();
                }
              }}
              tabIndex={-1}
            >
              Add &lsquo;{query.trim()}&rsquo; as new skill
            </div>
          )}
        </div>
      )}
    </div>
  );
}
