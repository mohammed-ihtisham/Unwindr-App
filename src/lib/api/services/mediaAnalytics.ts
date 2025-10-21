/**
 * MediaAnalytics API Service
 * Handles media engagement tracking and analytics
 */

import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import type {
  RecordInteractionRequest,
  RecordInteractionResponse,
  GetEngagementRequest,
  GetEngagementResponse,
  RecomputeScoresForPlaceRequest,
  RecomputeScoresForPlaceResponse,
  ID,
} from '../types';

export const mediaAnalyticsService = {
  /**
   * Record a user interaction with media
   */
  async recordInteraction(
    userId: ID,
    mediaItemId: ID,
    interactionType: string
  ): Promise<RecordInteractionResponse> {
    return apiClient.post<RecordInteractionResponse>(
      API_ENDPOINTS.mediaAnalytics.recordInteraction,
      {
        userId,
        mediaItemId,
        interactionType,
      }
    );
  },

  /**
   * Get engagement score for a media item
   */
  async getEngagement(mediaItemId: ID): Promise<number> {
    const response = await apiClient.post<GetEngagementResponse[]>(
      API_ENDPOINTS.mediaAnalytics.getEngagement,
      { mediaItemId }
    );
    // Query endpoints return arrays, take first result
    return response[0]?.score || 0;
  },

  /**
   * Recompute scores for all media in a place
   */
  async recomputeScoresForPlace(
    placeId: ID,
    mediaItemIds: ID[]
  ): Promise<RecomputeScoresForPlaceResponse> {
    return apiClient.post<RecomputeScoresForPlaceResponse>(
      API_ENDPOINTS.mediaAnalytics.recomputeScoresForPlace,
      {
        placeId,
        mediaItemIds,
      }
    );
  },
};

