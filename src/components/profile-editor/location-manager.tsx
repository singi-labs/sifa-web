'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { LocationSearch } from '@/components/location-search';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Plus, Trash, Star } from '@phosphor-icons/react';
import type { LocationValue, ProfileLocation } from '@/lib/types';
import {
  createProfileLocation,
  updateProfileLocation,
  deleteProfileLocation,
} from '@/lib/profile-api';

const LOCATION_TYPES = [
  { value: 'id.sifa.defs#locationPrimary', label: 'Residential' },
  { value: 'id.sifa.defs#locationBusiness', label: 'Business' },
  { value: 'id.sifa.defs#locationTravel', label: 'Travel' },
] as const;

function typeLabel(type: string): string {
  return LOCATION_TYPES.find((t) => t.value === type)?.label ?? 'Location';
}

interface LocationManagerProps {
  locations: ProfileLocation[];
  onChange: (locations: ProfileLocation[]) => void;
  disabled?: boolean;
}

export function LocationManager({ locations, onChange, disabled }: LocationManagerProps) {
  const t = useTranslations('profileEdit');
  const [adding, setAdding] = useState(false);
  const [newLocation, setNewLocation] = useState<LocationValue | null>(null);
  const [newType, setNewType] = useState<string>(LOCATION_TYPES[0].value);
  const [newLabel, setNewLabel] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = useCallback(async () => {
    if (!newLocation) return;
    setSaving(true);
    setError(null);

    const isPrimary = locations.length === 0;
    const result = await createProfileLocation({
      address: {
        country: newLocation.country,
        countryCode: newLocation.countryCode,
        region: newLocation.region,
        city: newLocation.city,
      },
      type: newType,
      label: newLabel || undefined,
      isPrimary,
    });

    setSaving(false);

    if (!result.success) {
      setError(result.error ?? 'Failed to add location');
      return;
    }

    const parts = [newLocation.city, newLocation.region, newLocation.country].filter(Boolean);
    const added: ProfileLocation = {
      rkey: result.rkey!,
      type: newType,
      label: newLabel || null,
      isPrimary,
      locationCountry: newLocation.country,
      locationRegion: newLocation.region ?? null,
      locationCity: newLocation.city ?? null,
      countryCode: newLocation.countryCode ?? null,
      location: parts.join(', '),
    };

    const updated = isPrimary
      ? [added, ...locations.map((l) => ({ ...l, isPrimary: false }))]
      : [...locations, added];
    onChange(updated);

    setAdding(false);
    setNewLocation(null);
    setNewType(LOCATION_TYPES[0].value);
    setNewLabel('');
  }, [newLocation, newType, newLabel, locations, onChange]);

  const handleDelete = useCallback(
    async (rkey: string) => {
      const result = await deleteProfileLocation(rkey);
      if (!result.success) return;

      const remaining = locations.filter((l) => l.rkey !== rkey);
      const deleted = locations.find((l) => l.rkey === rkey);

      // Auto-promote oldest if primary was deleted
      if (deleted?.isPrimary && remaining.length > 0 && remaining[0]) {
        remaining[0] = { ...remaining[0], isPrimary: true };
      }

      onChange(remaining);
    },
    [locations, onChange],
  );

  const handleSetPrimary = useCallback(
    async (rkey: string) => {
      const loc = locations.find((l) => l.rkey === rkey);
      if (!loc || loc.isPrimary) return;

      const result = await updateProfileLocation(rkey, {
        address: {
          country: loc.locationCountry ?? '',
          countryCode: loc.countryCode ?? undefined,
          region: loc.locationRegion ?? undefined,
          city: loc.locationCity ?? undefined,
        },
        type: loc.type,
        label: loc.label ?? undefined,
        isPrimary: true,
      });

      if (!result.success) return;

      onChange(
        locations.map((l) => ({
          ...l,
          isPrimary: l.rkey === rkey,
        })),
      );
    },
    [locations, onChange],
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{t('location')}</span>
        {locations.length < 5 && !adding && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setAdding(true)}
            disabled={disabled}
          >
            <Plus size={14} className="mr-1" />
            Add
          </Button>
        )}
      </div>

      {/* Existing locations */}
      {locations.map((loc) => (
        <div
          key={loc.rkey}
          className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2"
        >
          <MapPin size={16} className="shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-sm">{loc.location}</span>
              {loc.isPrimary && (
                <span className="inline-flex items-center gap-0.5 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                  <Star size={10} weight="fill" />
                  Primary
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {typeLabel(loc.type)}
              {loc.label ? ` \u2014 ${loc.label}` : ''}
            </span>
          </div>
          {!loc.isPrimary && (
            <button
              type="button"
              onClick={() => handleSetPrimary(loc.rkey)}
              className="text-muted-foreground hover:text-primary"
              title="Set as primary"
              disabled={disabled}
            >
              <Star size={14} />
            </button>
          )}
          <button
            type="button"
            onClick={() => handleDelete(loc.rkey)}
            className="text-muted-foreground hover:text-destructive"
            title="Remove"
            disabled={disabled}
          >
            <Trash size={14} />
          </button>
        </div>
      ))}

      {/* Add new location form */}
      {adding && (
        <div className="space-y-2 rounded-md border border-border p-3">
          <LocationSearch id="new-location" value={newLocation} onChange={setNewLocation} />
          <div className="flex gap-2">
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
            >
              {LOCATION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <Input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Label (optional)"
              className="text-sm"
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={handleAdd} disabled={!newLocation || saving}>
              {saving ? 'Saving...' : 'Add Location'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setAdding(false);
                setNewLocation(null);
                setError(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {locations.length === 0 && !adding && (
        <p className="text-sm text-muted-foreground">No locations added yet.</p>
      )}
    </div>
  );
}
