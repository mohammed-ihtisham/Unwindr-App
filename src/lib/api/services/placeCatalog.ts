/**
 * PlaceCatalog API Service
 * Handles place discovery, management, and verification
 */

import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import type {
  SeedPlacesRequest,
  SeedPlacesResponse,
  AddPlaceRequest,
  AddPlaceResponse,
  SetPlaceVerificationStatusRequest,
  SetPlaceVerificationStatusResponse,
  UpdatePlaceRequest,
  UpdatePlaceResponse,
  GetPlacesInAreaRequest,
  GetPlacesInAreaResponse,
  GetPlaceDetailsRequest,
  GetPlaceDetailsResponse,
  ID,
} from '../types';

export const placeCatalogService = {
  /**
   * Seed places from provider within specified area
   */
  async seedPlaces(data: SeedPlacesRequest): Promise<SeedPlacesResponse> {
    return apiClient.post<SeedPlacesResponse>(API_ENDPOINTS.placeCatalog.seedPlaces, data);
  },

  /**
   * Add a new user-contributed place
   */
  async addPlace(data: AddPlaceRequest): Promise<AddPlaceResponse> {
    return apiClient.post<AddPlaceResponse>(API_ENDPOINTS.placeCatalog.addPlace, data);
  },

  /**
   * Set verification status of a place (moderator only)
   */
  async setPlaceVerificationStatus(
    data: SetPlaceVerificationStatusRequest
  ): Promise<SetPlaceVerificationStatusResponse> {
    return apiClient.post<SetPlaceVerificationStatusResponse>(
      API_ENDPOINTS.placeCatalog.setPlaceVerificationStatus,
      data
    );
  },

  /**
   * Update place information
   */
  async updatePlace(data: UpdatePlaceRequest): Promise<UpdatePlaceResponse> {
    return apiClient.post<UpdatePlaceResponse>(API_ENDPOINTS.placeCatalog.updatePlace, data);
  },

  /**
   * Get places within a circular area
   */
  async getPlacesInArea(data: GetPlacesInAreaRequest): Promise<ID[]> {
    const response = await apiClient.post<GetPlacesInAreaResponse>(
      API_ENDPOINTS.placeCatalog.getPlacesInArea,
      data
    );
    return response.places || [];
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
   * Get details for multiple places
   */
  async getMultiplePlaceDetails(placeIds: ID[]): Promise<GetPlaceDetailsResponse[]> {
    const promises = placeIds.map((placeId) => this.getPlaceDetails(placeId));
    return Promise.all(promises);
  },
};

