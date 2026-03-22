'use client';

import { useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { UserLocationMapInnerProps } from './user-location-map';

function radiusForCount(count: number, maxCount: number): number {
  const minRadius = 6;
  const maxRadius = 40;
  if (maxCount <= 1) return minRadius;
  const ratio = count / maxCount;
  return minRadius + Math.sqrt(ratio) * (maxRadius - minRadius);
}

export default function UserLocationMapInner({ locations }: UserLocationMapInnerProps) {
  const maxCount = useMemo(() => Math.max(...locations.map((l) => l.count), 1), [locations]);

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <MapContainer
        center={[30, 10]}
        zoom={2}
        minZoom={2}
        maxZoom={12}
        scrollWheelZoom={true}
        style={{ height: '500px', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((loc) => (
          <CircleMarker
            key={`${loc.lat}-${loc.lng}-${loc.label}`}
            center={[loc.lat, loc.lng]}
            radius={radiusForCount(loc.count, maxCount)}
            pathOptions={{
              fillColor: '#4b5563',
              fillOpacity: 0.6,
              color: '#4b5563',
              weight: 1,
              opacity: 0.8,
            }}
          >
            <Tooltip direction="top" offset={[0, -8]}>
              <span className="font-medium">{loc.label}</span>
              <br />
              <span>
                {loc.count} {loc.count === 1 ? 'user' : 'users'}
              </span>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
