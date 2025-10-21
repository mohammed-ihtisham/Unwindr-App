/**
 * QualityRanking API Service
 * Handles place quality metrics and recommendations
 */

import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import type {
  UpdateMetricsRequest,
  UpdateMetricsResponse,
  CalculateQualityScoreRequest,
  CalculateQualityScoreResponse,
  SetRankingPreferencesRequest,
  SetRankingPreferencesResponse,
  GetRecommendedPlacesRequest,
  GetRecommendedPlacesResponse,
  ID,
} from '../types';

export const qualityRankingService = {
  /**
   * Update metrics for a place
   */
  async updateMetrics(data: UpdateMetricsRequest): Promise<UpdateMetricsResponse> {
    return apiClient.post<UpdateMetricsResponse>(API_ENDPOINTS.qualityRanking.updateMetrics, data);
  },

  /**
   * Calculate quality score for a place
   */
  async calculateQualityScore(placeId: ID): Promise<CalculateQualityScoreResponse> {
    return apiClient.post<CalculateQualityScoreResponse>(
      API_ENDPOINTS.qualityRanking.calculateQualityScore,
      { placeId }
    );
  },

  /**
   * Set user's ranking preferences
   */
  async setPreferences(
    userId: ID,
    prefersEmergent: boolean,
    radius: number
  ): Promise<SetRankingPreferencesResponse> {
    return apiClient.post<SetRankingPreferencesResponse>(
      API_ENDPOINTS.qualityRanking.setPreferences,
      {
        userId,
        prefersEmergent,
        radius,
      }
    );
  },

  /**
   * Get recommended places for user
   */
  async getRecommendedPlaces(
    userId: ID,
    centerLat: number,
    centerLng: number
  ): Promise<ID[]> {
    const response = await apiClient.post<GetRecommendedPlacesResponse[]>(
      API_ENDPOINTS.qualityRanking.getRecommendedPlaces,
      {
        userId,
        centerLat,
        centerLng,
      }
    );
    // Query endpoints return arrays of results, map to place IDs
    return response.map((item) => item.place);
  },
};

