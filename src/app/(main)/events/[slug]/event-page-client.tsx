'use client';

import { useMemo, useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useAttendeeConnections } from '@/hooks/use-attendee-connections';
import {
  AttendeeFilters,
  type ConnectionFilter,
  type RoleFilter,
  type SortOption,
} from '@/components/events/attendee-filters';
import { ConnectionSummary, type ConnectionPerson } from '@/components/events/connection-summary';
import { PrivacyDisclosure } from '@/components/events/privacy-disclosure';
import { EventCardGrid, type EventEntry } from './event-card-grid';

interface EventPageClientProps {
  entries: EventEntry[];
  speakerCount: number;
  attendeeCount: number;
  eventSlug: string;
}

function getConnectionSortOrder(type: string | undefined): number {
  switch (type) {
    case 'mutual':
      return 0;
    case 'following':
      return 1;
    case 'followedBy':
      return 2;
    default:
      return 3;
  }
}

function getName(entry: EventEntry): string {
  return (entry.profile.displayName ?? entry.profile.handle).toLowerCase();
}

export function EventPageClient({
  entries,
  speakerCount,
  attendeeCount,
  eventSlug,
}: EventPageClientProps) {
  const { session } = useAuth();
  const isLoggedIn = session !== null;

  const attendeeDids = useMemo(() => entries.map((e) => e.profile.did), [entries]);
  const { connections, isLoading } = useAttendeeConnections(attendeeDids);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [connectionFilter, setConnectionFilter] = useState<ConnectionFilter>('all');
  const [sort, setSort] = useState<SortOption | undefined>(undefined);

  const effectiveSort = sort ?? (isLoggedIn ? 'connections' : 'speakers');

  // Filter entries
  const filtered = useMemo(() => {
    return entries.filter((entry) => {
      // Text search
      if (search) {
        const query = search.toLowerCase();
        const name = (entry.profile.displayName ?? '').toLowerCase();
        const handle = entry.profile.handle.toLowerCase();
        if (!name.includes(query) && !handle.includes(query)) {
          return false;
        }
      }

      // Role filter
      if (roleFilter === 'speakers' && !entry.isSpeaker) return false;
      if (roleFilter === 'attendees' && entry.isSpeaker) return false;

      // Connection filter (only when logged in)
      if (isLoggedIn && connectionFilter !== 'all') {
        const connType = connections.get(entry.profile.did);
        if (connectionFilter === 'new') {
          if (connType !== undefined) return false;
        } else {
          if (connType !== connectionFilter) return false;
        }
      }

      return true;
    });
  }, [entries, search, roleFilter, connectionFilter, isLoggedIn, connections]);

  // Sort entries
  const sorted = useMemo(() => {
    const copy = [...filtered];

    switch (effectiveSort) {
      case 'connections':
        copy.sort((a, b) => {
          const orderA = getConnectionSortOrder(connections.get(a.profile.did));
          const orderB = getConnectionSortOrder(connections.get(b.profile.did));
          if (orderA !== orderB) return orderA - orderB;
          return getName(a).localeCompare(getName(b));
        });
        break;
      case 'speakers':
        copy.sort((a, b) => {
          if (a.isSpeaker && !b.isSpeaker) return -1;
          if (!a.isSpeaker && b.isSpeaker) return 1;
          return getName(a).localeCompare(getName(b));
        });
        break;
      case 'alphabetical':
        copy.sort((a, b) => getName(a).localeCompare(getName(b)));
        break;
    }

    return copy;
  }, [filtered, effectiveSort, connections]);

  // Build connection people for the summary banner
  const connectionPeople = useMemo<ConnectionPerson[]>(() => {
    const people: ConnectionPerson[] = [];
    for (const entry of entries) {
      if (connections.has(entry.profile.did)) {
        people.push({
          did: entry.profile.did,
          displayName: entry.profile.displayName,
          avatar: entry.profile.avatar,
        });
      }
    }
    return people;
  }, [entries, connections]);

  const loginUrl = `/login?returnTo=/events/${eventSlug}`;

  return (
    <div className="flex flex-col gap-6">
      {/* Connection summary banner */}
      <ConnectionSummary
        isLoggedIn={isLoggedIn}
        isLoading={isLoading}
        connections={connectionPeople}
        loginUrl={loginUrl}
      />

      {/* Privacy disclosure */}
      <PrivacyDisclosure />

      {/* Filters */}
      <AttendeeFilters
        onSearchChange={setSearch}
        onRoleFilterChange={setRoleFilter}
        onConnectionFilterChange={setConnectionFilter}
        onSortChange={setSort}
        roleFilter={roleFilter}
        connectionFilter={connectionFilter}
        sort={effectiveSort}
        isLoggedIn={isLoggedIn}
        resultCount={sorted.length}
        totalCount={entries.length}
        loginUrl={loginUrl}
      />

      {/* Card grid */}
      <EventCardGrid
        entries={sorted}
        speakerCount={speakerCount}
        attendeeCount={attendeeCount}
        connections={connections}
      />
    </div>
  );
}
