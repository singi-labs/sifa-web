export interface ExpertTopic {
  slug: string;
  label: string;
  description: string;
}

export const BEACHHEAD_TOPICS: ExpertTopic[] = [
  { slug: 'atproto', label: 'AT Protocol', description: 'Developers building on the AT Protocol' },
  {
    slug: 'devrel',
    label: 'Developer Relations',
    description: 'DevRel professionals and advocates',
  },
  {
    slug: 'open-source',
    label: 'Open Source',
    description: 'Open source contributors and maintainers',
  },
  { slug: 'typescript', label: 'TypeScript', description: 'TypeScript developers and experts' },
  { slug: 'react', label: 'React', description: 'React and frontend engineers' },
];
