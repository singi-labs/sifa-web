'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

interface LocationPoint {
  lat: number;
  lng: number;
  count: number;
  label: string;
}

interface UserLocationMapInnerProps {
  locations: LocationPoint[];
}

const MapInner = dynamic(() => import('./user-location-map-inner'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[500px] items-center justify-center rounded-lg bg-muted">
      <p className="text-sm text-muted-foreground">Loading map...</p>
    </div>
  ),
});

interface UserLocationMapProps {
  apiUrl: string;
}

export function UserLocationMap({ apiUrl }: UserLocationMapProps) {
  const [locations, setLocations] = useState<LocationPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchLocations() {
      try {
        const res = await fetch(`${apiUrl}/api/admin/stats/user-locations`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const json = await res.json();
        setLocations(json.locations);
      } catch (err) {
        console.error('Failed to fetch user locations:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    void fetchLocations();
  }, [apiUrl]);

  if (loading) {
    return <div className="h-[500px] animate-pulse rounded-lg bg-muted" />;
  }

  if (error) {
    return <p className="text-muted-foreground">Failed to load user locations.</p>;
  }

  if (locations.length === 0) {
    return <p className="text-sm text-muted-foreground">No location data available.</p>;
  }

  return <MapInner locations={locations} />;
}

export type { UserLocationMapInnerProps };
