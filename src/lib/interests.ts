/**
 * Available interest tags for places
 */
export const INTERESTS = [
  'coffee',
  'parks',
  'restaurants',
  'art',
  'music',
  'history',
  'shopping',
  'nightlife',
  'outdoors',
  'family',
] as const;

export type InterestTag = (typeof INTERESTS)[number];

/**
 * Distance filter options in miles
 */
export const DISTANCE_OPTIONS = [5, 10, 25, 50] as const;

