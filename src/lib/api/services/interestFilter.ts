/**
 * InterestFilter API Service
 * Handles user interest preferences and place filtering
 */

import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import type {
  SetInterestPreferencesRequest,
  SetInterestPreferencesResponse,
  InferPreferencesFromTextRequest,
  InferPreferencesFromTextResponse,
  TagPlaceRequest,
  TagPlaceResponse,
  ClearPreferencesRequest,
  ClearPreferencesResponse,
  GetMatchingPlacesRequest,
  GetMatchingPlacesResponse,
  ID,
} from '../types';

export const interestFilterService = {
  /**
   * Set user's manual interest preferences
   */
  async setPreferences(userId: ID, tags: string[]): Promise<SetInterestPreferencesResponse> {
    return apiClient.post<SetInterestPreferencesResponse>(
      API_ENDPOINTS.interestFilter.setPreferences,
      { userId, tags }
    );
  },

  /**
   * Infer preferences from natural language text
   */
  async inferPreferencesFromText(
    data: InferPreferencesFromTextRequest
  ): Promise<InferPreferencesFromTextResponse> {
    return apiClient.post<InferPreferencesFromTextResponse>(
      API_ENDPOINTS.interestFilter.inferPreferencesFromText,
      data
    );
  },

  /**
   * Tag a place with a specific interest tag
   */
  async tagPlace(placeId: ID, tag: string): Promise<TagPlaceResponse> {
    return apiClient.post<TagPlaceResponse>(API_ENDPOINTS.interestFilter.tagPlace, {
      placeId,
      tag,
    });
  },

  /**
   * Clear all preferences for a user
   */
  async clearPreferences(userId: ID): Promise<ClearPreferencesResponse> {
    return apiClient.post<ClearPreferencesResponse>(API_ENDPOINTS.interestFilter.clearPreferences, {
      userId,
    });
  },

  /**
   * Get places that match user's preferences
   */
  async getMatchingPlaces(userId: ID, places: ID[]): Promise<ID[]> {
    const response = await apiClient.post<GetMatchingPlacesResponse>(
      API_ENDPOINTS.interestFilter.getMatchingPlaces,
      { userId, places }
    );
    return response.matches;
  },
};

