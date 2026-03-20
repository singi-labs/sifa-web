export interface ActivityCardProps {
  record: Record<string, unknown>;
  collection: string;
  uri: string;
  rkey: string;
  authorDid: string;
  authorHandle?: string;
  authorAvatar?: string;
  showAuthor: boolean;
  compact: boolean;
}
