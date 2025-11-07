/**
 * PlaceCatalog API Service
 * Handles place discovery, management, and verification
 */

import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import type {
  AddPlaceRequest,
  AddPlaceResponse,
  GetPlacesInViewportRequest,
  GetPlacesInViewportResponse,
  GetPlaceDetailsRequest,
  GetPlaceDetailsResponse,
  ID,
} from '../types';

export const placeCatalogService = {
  /**
   * Add a new user-contributed place
   */
  async addPlace(data: AddPlaceRequest): Promise<AddPlaceResponse> {
    return apiClient.post<AddPlaceResponse>(API_ENDPOINTS.placeCatalog.addPlace, data);
  },

  /**
   * Get full details of a specific place
   */
  async getPlaceDetails(placeId: ID): Promise<GetPlaceDetailsResponse> {
    const response = await apiClient.post<GetPlaceDetailsResponse>(
      API_ENDPOINTS.placeCatalog.getPlaceDetails,
      { placeId }
    );
    // API returns the response directly, not in an array
    return response;
  },

  /**
   * Get places in viewport (optimized for viewport-based lazy loading)
   */
  async getPlacesInViewport(data: GetPlacesInViewportRequest): Promise<GetPlacesInViewportResponse> {
    const response = await apiClient.post<GetPlacesInViewportResponse>(
      API_ENDPOINTS.placeCatalog.getPlacesInViewport,
      data
    );
    return response;
  },

  /**
   * Get details for multiple places
   */
  async getMultiplePlaceDetails(placeIds: ID[]): Promise<GetPlaceDetailsResponse[]> {
    const promises = placeIds.map((placeId) => this.getPlaceDetails(placeId));
    return Promise.all(promises);
  },
};

