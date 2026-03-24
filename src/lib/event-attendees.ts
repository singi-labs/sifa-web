const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3100';

interface EventAttendeesResponse {
  eventSlug: string;
  count: number;
  attendees: { did: string; rsvpAt: string }[];
}

/**
 * Fetches attendee DIDs for an event from the sifa-api.
 * The API returns DIDs sourced from the Jetstream firehose (community.lexicon.calendar.rsvp).
 */
export async function fetchEventAttendees(slug: string): Promise<string[]> {
  try {
    const res = await fetch(`${API_URL}/api/events/${encodeURIComponent(slug)}/attendees`, {
      next: { revalidate: 300, tags: ['event-attendees'] },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      console.error(`Event attendees fetch failed: ${res.status} ${res.statusText}`);
      return [];
    }

    const data: EventAttendeesResponse = await res.json();
    return data.attendees.map((a) => a.did);
  } catch (error) {
    console.error('Failed to fetch event attendees:', error);
    return [];
  }
}
