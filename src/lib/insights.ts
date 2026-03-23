export interface EventInsightsData {
  slug: string;
  generatedAt: string;
  attendeeCount: number;
  pdsDistribution: PdsDistributionEntry[];
  didMethodSplit: DidMethodEntry[];
  accountAgeDistribution: AccountAgeBucket[];
  ecosystemRoles: EcosystemRoleEntry[];
  connectionGraph: ConnectionGraphData;
  postTimeline: PostTimelineBucket[];
  clientDiversity: ClientDiversityEntry[];
  summary: InsightsSummary;
}

export interface PdsDistributionEntry {
  host: string;
  count: number;
  isSelfHosted: boolean;
}

export interface DidMethodEntry {
  method: string;
  count: number;
}

export interface AccountAgeBucket {
  label: string;
  count: number;
}

export interface EcosystemRoleEntry {
  role: string;
  count: number;
}

export interface ConnectionGraphData {
  nodes: ConnectionNode[];
  edges: ConnectionEdge[];
}

export interface ConnectionNode {
  did: string;
  handle: string;
  displayName: string;
  avatar: string | null;
  degree: number;
}

export interface ConnectionEdge {
  source: string;
  target: string;
  mutual: boolean;
}

export interface PostTimelineBucket {
  timestamp: string;
  posts: number;
  replies: number;
  reposts: number;
}

export interface ClientDiversityEntry {
  client: string;
  count: number;
}

export interface InsightsSummary {
  attendeesTracked: number;
  pdsProviderCount: number;
  totalPosts: number;
  connectedPercentage: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.sifa.id';

export async function fetchEventInsights(slug: string): Promise<EventInsightsData | null> {
  try {
    const res = await fetch(`${API_URL}/api/events/${slug}/insights`, {
      next: { revalidate: 3600, tags: [`event-insights-${slug}`] },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    return (await res.json()) as EventInsightsData;
  } catch {
    return null;
  }
}
