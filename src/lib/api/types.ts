/**
 * API Types
 * TypeScript interfaces for all API requests and responses
 */

// ============================================================================
// Common Types
// ============================================================================

export type ID = string;

export interface ApiError {
  error: string;
}

// ============================================================================
// UserAuth Types
// ============================================================================

export interface RegisterUserRequest {
  username: string;
  password: string;
}

export interface RegisterUserResponse {
  userId?: ID;
  error?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  sessionToken?: string;
  error?: string;
}

export interface LogoutRequest {
  sessionToken: string;
}

export interface LogoutResponse {
  success: boolean;
}

export interface GetAuthenticatedUserRequest {
  sessionToken: string;
}

export interface UserProfile {
  userId: ID;
  username: string;
  canModerate: boolean;
}

export interface GetAuthenticatedUserResponse {
  userProfile?: UserProfile | null;
  error?: string;
}

export interface ChangePasswordRequest {
  sessionToken: string;
  oldPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
}

export interface GrantModeratorRequest {
  targetUserId: ID;
  adminSessionToken: string;
}

export interface GrantModeratorResponse {
  success: boolean;
}

export interface RevokeModeratorRequest {
  targetUserId: ID;
  adminSessionToken: string;
}

export interface RevokeModeratorResponse {
  success: boolean;
}

export interface GetUserDetailsRequest {
  userId: ID;
}

export interface UserDetails {
  username: string;
  canModerate: boolean;
}

export interface GetUserDetailsResponse {
  user: UserDetails;
}

export interface IsModeratorRequest {
  userId: ID;
}

export interface IsModeratorResponse {
  isModerator: boolean;
}

// ============================================================================
// PlaceCatalog Types
// ============================================================================

export interface SeedPlacesRequest {
  centerLat: number;
  centerLng: number;
  radius: number;
}

export interface SeedPlacesResponse {}

export interface AddPlaceRequest {
  userId: ID;
  name: string;
  address: string;
  category: string;
  lat: number;
  lng: number;
}

export interface AddPlaceResponse {
  placeId: ID;
}

export interface SetPlaceVerificationStatusRequest {
  placeId: ID;
  moderatorId: ID;
  isVerified: boolean;
}

export interface SetPlaceVerificationStatusResponse {}

export interface UpdatePlaceRequest {
  placeId: ID;
  name: string;
  address: string;
  userId: ID;
}

export interface UpdatePlaceResponse {}

export interface GetPlacesInAreaRequest {
  centerLat: number;
  centerLng: number;
  radius: number;
}

export interface GetPlacesInAreaResponse {
  places: ID[];
}

export interface GetPlacesInViewportRequest {
  southLat: number;
  westLng: number;
  northLat: number;
  eastLng: number;
}

export interface ViewportPlace {
  id: ID;
  name: string;
  category: string;
  lat: number;
  lng: number;
}

export interface GetPlacesInViewportResponse extends Array<ViewportPlace> {}

export interface GetPlaceDetailsRequest {
  placeId: ID;
}

export interface PlaceDetails {
  id: ID;
  name: string;
  address: string;
  category: string;
  verified: boolean;
  addedBy: ID;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  source: string;
}

export interface GetPlaceDetailsResponse {
  place: PlaceDetails;
}

// ============================================================================
// MediaLibrary Types
// ============================================================================

export interface SeedMediaRequest {
  placeId: ID;
  urls: string[];
}

export interface SeedMediaResponse {
  count: number;
}

export interface AddMediaRequest {
  userId: ID;
  placeId: ID;
  imageUrl: string;
}

export interface AddMediaResponse {
  mediaId: ID;
}

export interface DeleteMediaRequest {
  userId: ID;
  mediaId: ID;
}

export interface DeleteMediaResponse {
  success: boolean;
}

export interface GetMediaByPlaceRequest {
  placeId: ID;
}

export interface GetMediaByPlaceResponse {
  mediaIds: ID;
}

export interface GetMediaItemsByPlaceRequest {
  placeId: ID;
}

export interface MediaItem {
  _id: ID;
  placeId: ID;
  contributorId: ID | null;
  createdAt: string;
  imageUrl: string;
  source: string;
}

export interface GetMediaItemsByPlaceResponse extends Array<MediaItem> {}

export interface GetPreviewImagesForPlacesRequest {
  placeIds: ID[];
}

export interface PlacePreviewImage {
  placeId: ID;
  previewImage: string | null;
}

export interface GetPreviewImagesForPlacesResponse extends Array<PlacePreviewImage> {}

// ============================================================================
// MediaAnalytics Types
// ============================================================================

export interface RecordInteractionRequest {
  userId: ID;
  mediaItemId: ID;
  interactionType: string;
}

export interface RecordInteractionResponse {}

export interface GetEngagementRequest {
  mediaItemId: ID;
}

export interface GetEngagementResponse {
  score: number;
}

export interface RecomputeScoresForPlaceRequest {
  placeId: ID;
  mediaItemIds: ID[];
}

export interface RecomputeScoresForPlaceResponse {}

// ============================================================================
// QualityRanking Types
// ============================================================================

export interface UpdateMetricsRequest {
  placeId: ID;
  visits: number;
  engagement: number;
}

export interface UpdateMetricsResponse {}

export interface CalculateQualityScoreRequest {
  placeId: ID;
}

export interface CalculateQualityScoreResponse {
  score: number;
}

export interface SetRankingPreferencesRequest {
  userId: ID;
  prefersEmergent: boolean;
  radius: number;
}

export interface SetRankingPreferencesResponse {}

export interface GetRecommendedPlacesRequest {
  userId: ID;
  centerLat: number;
  centerLng: number;
}

export interface GetRecommendedPlacesResponse {
  place: ID;
}

// ============================================================================
// InterestFilter Types
// ============================================================================

export interface SetInterestPreferencesRequest {
  userId: ID;
  tags: string[];
}

export interface SetInterestPreferencesResponse {}

export interface InferPreferencesFromTextRequest {
  userId: ID;
  text: string;
  radius?: number;
  locationHint?: string;
}

export interface InferPreferencesFromTextResponse {
  tags: string[];
  exclusions: string[];
  confidence: number;
  rationale: string;
  warnings: string[];
  needsConfirmation?: boolean;
}

export interface TagPlaceRequest {
  placeId: ID;
  tag: string;
}

export interface TagPlaceResponse {}

export interface ClearPreferencesRequest {
  userId: ID;
}

export interface ClearPreferencesResponse {}

export interface GetMatchingPlacesRequest {
  userId: ID;
  places: ID[];
}

export interface GetMatchingPlacesResponse {
  matches: ID[];
}

export interface GetAvailableTagsRequest {}

export interface TagOption {
  tag: string;
  description: string;
}

export interface GetAvailableTagsResponse {
  tags: TagOption[];
}

