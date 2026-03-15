'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { MagnifyingGlass, X } from '@phosphor-icons/react';
import { searchSkills } from '@/lib/profile-api';
import type { ProfileSkill, SkillSuggestion } from '@/lib/types';

interface SkillComboboxProps {
  value: string;
  category: string;
  onChange: (skillName: string, category: string) => void;
  /** Fires only on explicit selection (dropdown click or Enter). */
  onSelect?: (skillName: string, category: string) => void;
  /** User's own profile skills — shown instantly as "Your skills" layer. */
  profileSkills?: ProfileSkill[];
  id?: string;
}

/** Case-insensitive substring match for client-side filtering. */
function matchesQuery(skillName: string, q: string): boolean {
  const lower = q.toLowerCase();
  return skillName.toLowerCase().includes(lower);
}

export function SkillCombobox({
  value,
  category,
  onChange,
  onSelect,
  profileSkills,
  id,
}: SkillComboboxProps) {
  const t = useTranslations('sections');
  const [query, setQuery] = useState(value);
  const [apiResults, setApiResults] = useState<SkillSuggestion[]>([]);
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

  // Layer 1: filter profile skills client-side (instant, no debounce)
  const profileMatches = useMemo(() => {
    if (!profileSkills || query.trim().length < 2) return [];
    return profileSkills.filter((s) => matchesQuery(s.skillName, query.trim()));
  }, [profileSkills, query]);

  // Layer 2: API results, deduplicated against profile matches
  const globalSuggestions = useMemo(() => {
    const profileNames = new Set(profileMatches.map((s) => s.skillName.toLowerCase()));
    return apiResults.filter((s) => !profileNames.has(s.canonicalName.toLowerCase()));
  }, [apiResults, profileMatches]);

  // Build flat option list for keyboard navigation
  const hasExactMatch =
    profileMatches.some((s) => s.skillName.toLowerCase() === query.trim().toLowerCase()) ||
    globalSuggestions.some((r) => r.canonicalName.toLowerCase() === query.trim().toLowerCase());
  const showAddNew = query.trim().length >= 2 && !hasExactMatch;
  const totalOptions = profileMatches.length + globalSuggestions.length + (showAddNew ? 1 : 0);

  const performSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setApiResults([]);
      return;
    }
    setLoading(true);
    try {
      const suggestions = await searchSkills(q);
      setApiResults(Array.isArray(suggestions) ? suggestions : []);
    } catch {
      setApiResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleQueryChange = (q: string) => {
    setQuery(q);
    onChange(q, category);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (q.trim().length < 2) {
      setApiResults([]);
      setIsOpen(false);
      return;
    }

    // Open immediately for profile matches (instant)
    setIsOpen(true);
    setActiveIndex(-1);

    debounceRef.current = setTimeout(() => {
      void performSearch(q);
    }, 300);
  };

  const handleSelectProfileSkill = (skill: ProfileSkill) => {
    setQuery(skill.skillName);
    onChange(skill.skillName, skill.category ?? '');
    onSelect?.(skill.skillName, skill.category ?? '');
    setApiResults([]);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleSelectSuggestion = (suggestion: SkillSuggestion) => {
    setQuery(suggestion.canonicalName);
    onChange(suggestion.canonicalName, suggestion.category);
    onSelect?.(suggestion.canonicalName, suggestion.category);
    setApiResults([]);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleSelectFreeText = () => {
    onChange(query, category);
    onSelect?.(query, category);
    setApiResults([]);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleClear = () => {
    setQuery('');
    onChange('', '');
    setApiResults([]);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const selectByIndex = (index: number) => {
    if (index < profileMatches.length) {
      handleSelectProfileSkill(profileMatches[index]!);
    } else if (index < profileMatches.length + globalSuggestions.length) {
      handleSelectSuggestion(globalSuggestions[index - profileMatches.length]!);
    } else {
      handleSelectFreeText();
    }
  };

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
      selectByIndex(activeIndex);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  // Running index counter for flat option IDs
  let optionIndex = 0;

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
          {profileMatches.length > 0 && (
            <>
              <div className="px-3 py-1 text-xs font-medium text-muted-foreground">
                Your skills
              </div>
              {profileMatches.map((skill) => {
                const i = optionIndex++;
                return (
                  <div
                    key={`profile-${skill.rkey}`}
                    id={`${listboxId}-option-${i}`}
                    role="option"
                    aria-selected={i === activeIndex}
                    className={`w-full cursor-pointer px-3 py-2 text-left text-sm hover:bg-accent ${
                      i === activeIndex ? 'bg-accent' : ''
                    }`}
                    onClick={() => handleSelectProfileSkill(skill)}
                    onKeyDown={() => {}} // keyboard handled by combobox input
                    tabIndex={-1}
                  >
                    <span className="font-medium">{skill.skillName}</span>
                    {skill.category && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        {skill.category}
                      </span>
                    )}
                  </div>
                );
              })}
            </>
          )}
          {globalSuggestions.length > 0 && (
            <>
              <div
                className={`px-3 py-1 text-xs font-medium text-muted-foreground${profileMatches.length > 0 ? ' border-t border-border' : ''}`}
              >
                Suggestions
              </div>
              {globalSuggestions.map((suggestion) => {
                const i = optionIndex++;
                return (
                  <div
                    key={suggestion.slug}
                    id={`${listboxId}-option-${i}`}
                    role="option"
                    aria-selected={i === activeIndex}
                    className={`w-full cursor-pointer px-3 py-2 text-left text-sm hover:bg-accent ${
                      i === activeIndex ? 'bg-accent' : ''
                    }`}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    onKeyDown={() => {}} // keyboard handled by combobox input
                    tabIndex={-1}
                  >
                    <span className="font-medium">{suggestion.canonicalName}</span>
                    {suggestion.category && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        {suggestion.category}
                      </span>
                    )}
                  </div>
                );
              })}
            </>
          )}
          {showAddNew && (() => {
            const i = optionIndex++;
            return (
              <div
                id={`${listboxId}-option-${i}`}
                role="option"
                aria-selected={i === activeIndex}
                className={`w-full cursor-pointer border-t border-border px-3 py-2 text-left text-sm hover:bg-accent ${
                  i === activeIndex ? 'bg-accent' : ''
                }`}
                onClick={handleSelectFreeText}
                onKeyDown={() => {}} // keyboard handled by combobox input
                tabIndex={-1}
              >
                Add &lsquo;{query.trim()}&rsquo; as new skill
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
