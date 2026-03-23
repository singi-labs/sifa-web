/**
 * Fetches attendee handles from a Smoke Signal event page.
 * Parses the HTML to extract @handle links from both "going" and "interested" sections.
 */
export async function fetchSmokeSignalAttendees(smokesignalUrl: string): Promise<string[]> {
  const attendeesUrl = smokesignalUrl.endsWith('/attendees')
    ? smokesignalUrl
    : `${smokesignalUrl}/attendees`;

  try {
    const res = await fetch(attendeesUrl, {
      next: { revalidate: 3600, tags: ['smoke-signal-attendees'] },
      headers: {
        'User-Agent': 'Sifa/1.0 (https://sifa.id)',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      console.error(`Smoke Signal fetch failed: ${res.status} ${res.statusText}`);
      return [];
    }

    const html = await res.text();
    return parseHandlesFromHtml(html);
  } catch (error) {
    console.error('Failed to fetch Smoke Signal attendees:', error);
    return [];
  }
}

/**
 * Extract AT Protocol handles from Smoke Signal HTML.
 * Handles appear as @handle text in anchor tags linking to profile pages.
 */
function parseHandlesFromHtml(html: string): string[] {
  const handles = new Set<string>();

  // Match @handle patterns in anchor tags (e.g., <a href="...">@pfrazee.com</a>)
  const anchorRegex = /@([\w.-]+(?:\.[\w.-]+)+)/g;
  let match;
  while ((match = anchorRegex.exec(html)) !== null) {
    const handle = match[1]!;
    // Basic validation: must have at least one dot and no consecutive dots
    if (
      handle.includes('.') &&
      !handle.includes('..') &&
      !handle.startsWith('.') &&
      !handle.endsWith('.')
    ) {
      handles.add(handle);
    }
  }

  return Array.from(handles);
}
