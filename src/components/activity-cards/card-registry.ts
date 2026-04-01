import type { ComponentType } from 'react';
import type { ActivityCardProps } from './types';
import { BlueskyPostCard } from './bluesky-post-card';
import { EventRsvpCard } from './event-rsvp-card';
import { TangledCard } from './tangled-card';
import { KeytraceCard } from './keytrace-card';
import { KipClipCard } from './kipclip-card';
import { PopfeedCard } from './popfeed-card';
import { SembleCard } from './semble-card';
import { YouAndMeCard } from './youandme-card';
import { GrainGalleryCard } from './grain-gallery-card';

const CARD_REGISTRY = new Map<string, ComponentType<ActivityCardProps>>();

export function getCardComponent(collection: string): ComponentType<ActivityCardProps> | null {
  // Exact match
  if (CARD_REGISTRY.has(collection)) return CARD_REGISTRY.get(collection)!;
  // Prefix match (entries ending with *)
  for (const [key, component] of CARD_REGISTRY.entries()) {
    if (key.endsWith('*') && collection.startsWith(key.slice(0, -1))) {
      return component;
    }
  }
  return null; // caller falls back to GenericActivityCard
}

export function registerCard(collection: string, component: ComponentType<ActivityCardProps>) {
  CARD_REGISTRY.set(collection, component);
}

// Register custom cards
registerCard('app.bsky.feed.post', BlueskyPostCard);
registerCard('sh.tangled.*', TangledCard);
registerCard('community.lexicon.calendar.rsvp', EventRsvpCard);
registerCard('dev.keytrace.claim', KeytraceCard);
registerCard('community.lexicon.bookmarks.bookmark', KipClipCard);
registerCard('social.popfeed.feed.*', PopfeedCard);
registerCard('app.sidetrail.*', SembleCard);
registerCard('network.cosmik.card', SembleCard);
registerCard('at.youandme.connection', YouAndMeCard);
registerCard('social.grain.gallery', GrainGalleryCard);
