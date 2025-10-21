/**
 * Available interest tags for places
 */
export type Tag =
  | "quiet_spaces"
  | "waterfront_views"
  | "nature_walks"
  | "sunset_spots"
  | "not_crowded"
  | "short_drive"
  | "instagram_worthy"
  | "lively_nightlife"
  | "live_music"
  | "historic_charms"
  | "family_friendly"
  | "coffee_nooks"
  | "scenic_overlook";

export const INTERESTS: Tag[] = [
  "quiet_spaces",
  "waterfront_views", 
  "nature_walks",
  "sunset_spots",
  "not_crowded",
  "short_drive",
  "instagram_worthy",
  "lively_nightlife",
  "live_music",
  "historic_charms",
  "family_friendly",
  "coffee_nooks",
  "scenic_overlook"
];

export type InterestTag = Tag;

/**
 * Distance filter options in miles
 */
export const DISTANCE_OPTIONS = [5, 10, 25, 50] as const;

